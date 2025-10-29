const crypto = require('crypto');
const https = require('https');
const Order = require('../models/Order'); // Import Order model
const { cancelPendingOrderAndRestoreStock } = require('./orderService'); // Import hàm hủy đơn
const notificationService = require('./notificationService'); // 1. Import

// Lấy config từ .env
const partnerCode = process.env.MOMO_PARTNER_CODE;
const accessKey = process.env.MOMO_ACCESS_KEY;
const secretKey = process.env.MOMO_SECRET_KEY;
const apiEndpoint = process.env.MOMO_API_ENDPOINT;
const redirectUrl = process.env.MOMO_REDIRECT_URL; // Cần public URL khi test
const ipnUrl = process.env.MOMO_IPN_URL;           // Cần public URL khi test

/**
 * Tạo yêu cầu thanh toán MoMo
 * @param {string} orderId - Mã đơn hàng của bạn
 * @param {number} amount - Số tiền
 * @param {string} orderInfo - Thông tin đơn hàng
 * @param {string} requestId - Mã yêu cầu duy nhất (thường giống orderId)
 * @param {string} extraData - Dữ liệu thêm (base64 encoded, tùy chọn)
 * @returns {Promise<object>} Promise chứa kết quả từ MoMo API (payUrl, deeplink, ...)
 */
function createPaymentRequest(orderId, amount, orderInfo = "Thanh toán đơn hàng", requestId, extraData = "") {
    return new Promise((resolve, reject) => {
        const requestType = "payWithMethod"; // Hoặc "captureWallet"
        const lang = 'vi';

        // Dữ liệu cần ký tên
        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

        // Tạo chữ ký HMAC SHA256
        const signature = crypto.createHmac('sha256', secretKey)
                                .update(rawSignature)
                                .digest('hex');

        // Body của request gửi đến MoMo
        const requestBody = JSON.stringify({
            partnerCode: partnerCode,
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: redirectUrl,
            ipnUrl: ipnUrl,
            lang: lang,
            requestType: requestType,
            extraData: extraData,
            signature: signature,
            // Các trường khác nếu cần, ví dụ: orderGroupId, autoCapture...
            // items: [], // Nếu cần gửi chi tiết đơn hàng
        });

        // Cấu hình HTTPS request
        const options = {
            hostname: new URL(apiEndpoint).hostname, // Lấy hostname từ endpoint
            port: 443,
            path: new URL(apiEndpoint).pathname, // Lấy path từ endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody)
            }
        };

        // Gửi request
        const req = https.request(options, res => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const responseData = JSON.parse(body);
                    // Kiểm tra resultCode cơ bản
                    if (responseData.resultCode === 0) {
                        resolve(responseData); // Chứa payUrl, deeplink...
                    } else {
                        console.error("MoMo API Error:", responseData);
                        reject(new Error(responseData.message || `MoMo Error Code: ${responseData.resultCode}`));
                    }
                } catch (parseError) {
                    console.error("Error parsing MoMo response:", body);
                    reject(new Error("Không thể phân tích phản hồi từ MoMo."));
                }
            });
        });

        req.on('error', (e) => {
            console.error(`Problem with MoMo request: ${e.message}`);
            reject(new Error(`Lỗi khi gọi MoMo API: ${e.message}`));
        });

        // Ghi body và kết thúc request
        req.write(requestBody);
        req.end();
    });
}

/**
 * Xử lý MoMo IPN
 * @param {object} body - Request body từ MoMo
 * @returns {Promise<{resultCode: number, message: string}>} Phản hồi cho MoMo
 */
async function processIpn(body) {
    // Dữ liệu MoMo gửi về (không bao gồm chữ ký)
    const {
        partnerCode: resPartnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId, // Mã giao dịch MoMo
        resultCode, // Kết quả giao dịch
        message,
        payType,
        responseTime,
        extraData,
        signature: receivedSignature
    } = body;

    // Dữ liệu cần ký tên để xác thực (theo đúng thứ tự MoMo yêu cầu)
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${resPartnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const calculatedSignature = crypto.createHmac('sha256', secretKey)
                                      .update(rawSignature)
                                      .digest('hex');

    // 1. Xác thực chữ ký
    if (calculatedSignature !== receivedSignature) {
        console.error("MoMo IPN - Invalid Signature", { calculated: calculatedSignature, received: receivedSignature });
        // MoMo không quy định mã lỗi cụ thể cho chữ ký sai, trả 99 theo thông lệ
        return { resultCode: 99, message: "Invalid signature" };
    }

    // 2. Xác thực Partner Code (nếu cần)
    if (resPartnerCode !== partnerCode) {
         console.error("MoMo IPN - Invalid PartnerCode");
         return { resultCode: 99, message: "Invalid partner code" };
    }


    try {
        // 3. Tìm đơn hàng
        const order = await Order.findById(orderId);
        if (!order) {
            console.warn(`MoMo IPN - Order not found: ${orderId}`);
            return { resultCode: 1, message: "Order not found" }; // Trả lỗi nghiệp vụ
        }

        // 4. Kiểm tra số tiền
        if (order.total !== amount) {
             console.warn(`MoMo IPN - Amount invalid for order ${orderId}: Expected ${order.total}, Got ${amount}`);
            return { resultCode: 99, message: "Invalid amount" }; // Trả lỗi hệ thống
        }

        // 5. Kiểm tra trạng thái đơn hàng (chỉ xử lý nếu là 'pending')
        if (order.status !== 'pending') {
            console.log(`MoMo IPN - Order ${orderId} already processed. Status: ${order.status}`);
            return { resultCode: 0, message: "Order already confirmed" }; // Trả thành công vì đã xử lý rồi
        }

        // 6. Cập nhật trạng thái đơn hàng dựa trên resultCode
        if (resultCode === 0) {
            // Giao dịch thành công
            order.status = 'confirmed'; // Hoặc 'processing' tùy logic của bạn
            order.isPaid = true;
            order.paidAt = new Date(responseTime); // Dùng thời gian MoMo trả về
            order.paymentInfo = {
                ...order.paymentInfo, // Giữ lại thông tin VNPAY nếu có
                momoTransId: transId.toString(), // Lưu transId dạng string
                momoPayType: payType,
            };
            order.orderStatusHistory.push({ status: "confirmed", changedAt: new Date() });
            await order.save();

            // --- 2. GỬI THÔNG BÁO THÀNH CÔNG ---
            await notificationService.createAndSendNotification(
                order.user,
                {
                    title: 'Thanh toán thành công!',
                    message: `Đơn hàng #${orderId.toString().slice(-6)} đã được thanh toán thành công qua MOMO.`,
                    link: `/orders/${orderId}`
                }
            );
            console.log(`MoMo IPN - Order ${orderId} confirmed successfully.`);
        } else {
            // Giao dịch thất bại
            console.log(`MoMo IPN - Order ${orderId} failed. ResultCode: ${resultCode}, Message: ${message}`);
            await cancelPendingOrderAndRestoreStock(order, `Thanh toán MoMo thất bại. Mã lỗi: ${resultCode} - ${message}`);

            // --- 3. GỬI THÔNG BÁO THẤT BẠI ---
             await notificationService.createAndSendNotification(
                order.user,
                {
                    title: 'Thanh toán thất bại',
                    message: `Thanh toán MOMO cho đơn hàng #${orderId.toString().slice(-6)} đã thất bại. Đơn hàng đã được huỷ.`,
                    link: `/orders/${orderId}`
                }
            );
        }

        return { resultCode: 0, message: "Success" }; // Báo cho MoMo đã xử lý thành công

    } catch (error) {
        console.error(`MoMo IPN - Error processing order ${orderId}:`, error);
        return { resultCode: 99, message: "System error" }; // Lỗi server của bạn
    }
}

/**
 * Xác thực dữ liệu MoMo trả về trên Redirect URL
 * @param {object} queryParams - Query params từ MoMo
 * @returns {{isValid: boolean, params: object}}
 */
function verifyReturnUrl(queryParams) {
     const {
        partnerCode: resPartnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature: receivedSignature
    } = queryParams;

    console.log("verify return url: ", queryParams);

    // Dữ liệu cần ký tên để xác thực (theo đúng thứ tự MoMo yêu cầu)
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${resPartnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const calculatedSignature = crypto.createHmac('sha256', secretKey)
                                      .update(rawSignature)
                                      .digest('hex');

    const isValid = calculatedSignature === receivedSignature;
    if (!isValid) {
         console.warn("MoMo Return URL - Invalid Signature");
    }

    return { isValid, params: queryParams }; // Trả về params gốc
}


module.exports = {
    createPaymentRequest,
    processIpn,
    verifyReturnUrl
};