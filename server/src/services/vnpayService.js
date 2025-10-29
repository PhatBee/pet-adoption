const querystring = require('qs');
const crypto = require("crypto");
const moment = require('moment');
const Order = require('../models/Order'); // Import Order model
const { cancelPendingOrderAndRestoreStock } = require('./orderService');
const notificationService = require('./notificationService'); // 1. Import


// Lấy config từ .env (đã được load bởi server.js)
const vnp_TmnCode = process.env.vnp_TmnCode;
const vnp_HashSecret = process.env.vnp_HashSecret;
const vnp_Url = process.env.vnp_Url;
const vnp_ReturnUrl = process.env.vnp_ReturnUrl; // Sẽ là http://localhost:5000/api/orders/vnpay_return

/**
 * Hàm tạo URL thanh toán VNPAY
 * @param {string} ipAddr - Địa chỉ IP của client
 * @param {number} amount - Tổng số tiền (VND)
 * @param {string} orderId - Mã đơn hàng của bạn (ví dụ: 65f..._id)
 * @param {string} orderInfo - Thông tin đơn hàng
 * @returns {string} URL thanh toán VNPAY
 */
function createPaymentUrl(ipAddr, amount, orderId, orderInfo = 'Thanh toan don hang') {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
    vnp_Params['vnp_Amount'] = amount * 100; // VNPAY yêu cầu nhân 100
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId; // Mã đơn hàng
    vnp_Params['vnp_OrderInfo'] = orderInfo + ' ' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    vnp_Params['vnp_Locale'] = 'vn';

    // Sắp xếp các tham số theo thứ tự alphabet
    vnp_Params = sortObject(vnp_Params);

    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", vnp_HashSecret);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;

    let paymentUrl = vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false });

    return paymentUrl;
}

/**
 * Hàm xử lý IPN (Instant Payment Notification) từ VNPAY
 * @param {object} vnp_Params - Query params từ VNPAY
 * @returns {Promise<{RspCode: string, Message: string}>}
 */
async function processIpn(vnp_Params) {
    let secureHash = vnp_Params['vnp_SecureHash'];

    const paramsCopy = Object.assign({}, vnp_Params);


    // Xóa vnp_SecureHash và vnp_SecureHashType (nếu có) để kiểm tra chữ ký
    delete paramsCopy['vnp_SecureHash'];
    delete paramsCopy['vnp_SecureHashType'];



    const sorted_params = sortObject(paramsCopy);
    
    let signData = querystring.stringify(sorted_params, { encode: false });
    let hmac = crypto.createHmac("sha512", vnp_HashSecret);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        const orderId = vnp_Params['vnp_TxnRef'];
        const amount = Number(vnp_Params['vnp_Amount']) / 100;
        const rspCode = vnp_Params['vnp_ResponseCode'];
        const vnpTranNo = vnp_Params['vnp_TransactionNo']; // Mã GD VNPAY

        try {
            // 1. Kiểm tra đơn hàng (orderId)
            const order = await Order.findById(orderId);
            if (!order) {
                return { RspCode: '01', Message: 'Order not found' };
            }

            // 2. Kiểm tra số tiền (amount)
            if (order.total !== amount) {
                return { RspCode: '04', Message: 'Amount invalid' };
            }

            // 3. Kiểm tra trạng thái đơn hàng (chỉ xử lý nếu là 'pending')
            if (order.status !== 'pending') {
                return { RspCode: '02', Message: 'Order already confirmed' };
            }

            // 2. CẬP NHẬT LOGIC
            if (rspCode === '00') {
                // Giao dịch thành công
                order.status = 'confirmed';
                order.isPaid = true;
                order.paidAt = new Date();
                order.paymentInfo = {
                    vnpTranNo: vnpTranNo,
                    vnpBankCode: vnp_Params['vnp_BankCode'],
                    vnpPayDate: vnp_Params['vnp_PayDate'],
                };
                order.orderStatusHistory.push({ status: "confirmed", changedAt: new Date() });
                await order.save(); // Lưu thay đổi

                // --- 2. GỬI THÔNG BÁO THÀNH CÔNG ---
                await notificationService.createAndSendNotification(
                    order.user,
                    {
                        title: 'Thanh toán thành công!',
                        message: `Đơn hàng #${orderId.toString().slice(-6)} đã được thanh toán thành công qua VNPAY.`,
                        link: `/orders/${orderId}`
                    }
                );
            } else {
                // Giao dịch thất bại
                // 3. Gọi hàm hủy đơn và hoàn kho
                await cancelPendingOrderAndRestoreStock(order, `Thanh toán VNPAY thất bại. Mã lỗi: ${rspCode}`);

                // --- 3. GỬI THÔNG BÁO THẤT BẠI ---
                await notificationService.createAndSendNotification(
                    order.user,
                    {
                        title: 'Thanh toán thất bại',
                        message: `Thanh toán VNPAY cho đơn hàng #${orderId.toString().slice(-6)} đã thất bại. Đơn hàng đã được huỷ.`,
                        link: `/orders/${orderId}`
                    }
                );
            }

            return { RspCode: '00', Message: 'Success' };

        } catch (error) {
            console.error("Lỗi khi xử lý IPN:", error);
            return { RspCode: '99', Message: 'Unknown error' };
        }
    } else {
        return { RspCode: '97', Message: 'Checksum failed' };
    }
}

/**
 * Hàm xử lý VNPAY Return URL
 * @param {object} vnp_Params - Query params từ VNPAY
 * @returns {{isValid: boolean, params: object}}
 */
function processReturnUrl(vnp_Params) {
    let secureHash = vnp_Params['vnp_SecureHash'];

    const paramsCopy = Object.assign({}, vnp_Params);


    delete paramsCopy['vnp_SecureHash'];
    delete paramsCopy['vnp_SecureHashType'];

    const sortedParams = sortObject(paramsCopy);
    
    let signData = querystring.stringify(sortedParams, { encode: false });
    let hmac = crypto.createHmac("sha512", vnp_HashSecret);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

    return { isValid: secureHash === signed, params: sortedParams };
}

// Hàm helper sort object (lấy từ VNPAY demo)
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

module.exports = {
    createPaymentUrl,
    processIpn,
    processReturnUrl
};