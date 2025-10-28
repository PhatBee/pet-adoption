import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';

// Các mã lỗi cơ bản từ VNPAY (bạn có thể mở rộng)
const vnpayMessages = {
  '00': 'Giao dịch thành công',
  '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
  '09': 'Thẻ/Tài khoản chưa đăng ký InternetBanking tại Ngân hàng.',
  '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.',
  '11': 'Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại giao dịch.',
  '12': 'Thẻ/Tài khoản bị khóa.',
  '13': 'Bạn nhập sai mật khẩu xác thực giao dịch (OTP).',
  '24': 'Khách hàng hủy giao dịch.',
  '51': 'Tài khoản không đủ số dư để thực hiện giao dịch.',
  '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày.',
  '97': 'Chữ ký không hợp lệ (Checksum failed).',
  '99': 'Lỗi không xác định. Vui lòng liên hệ quản trị viên.',
};

// === THÊM MOMO MESSAGES ===
// Dựa trên file Danh Sách Result Codes _ MoMo Developers.html
const momoMessages = {
  0: 'Giao dịch thành công.',
  10: 'Hệ thống đang bảo trì.',
  11: 'Truy cập bị từ chối.',
  // ... (Thêm các mã lỗi quan trọng khác từ file HTML bạn cung cấp) ...
  1000: 'Giao dịch đang chờ xác nhận.', // Mã này quan trọng
  1001: 'Giao dịch thất bại do tài khoản không đủ tiền.',
  1003: 'Giao dịch bị hủy.',
  1004: 'Giao dịch thất bại do vượt quá hạn mức.',
  1005: 'Giao dịch thất bại do url hoặc QR code đã hết hạn.',
  1006: 'Giao dịch thất bại do người dùng từ chối xác nhận.',
  // ...
  9000: 'Giao dịch đã được xác nhận thành công.', // Đây cũng là thành công
  // Lỗi mặc định
  default: 'Giao dịch không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.',
  99: 'Lỗi không xác định. Vui lòng liên hệ hỗ trợ.', // Lỗi chung hoặc signature sai
};

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false); // Thêm trạng thái chờ
  const [details, setDetails] = useState({}); // Lưu trữ chi tiết giao dịch

  // Đọc source để biết là VNPAY hay MOMO
  const source = searchParams.get('source');

  useEffect(() => {
    let msg = '';
    let success = false;
    let pending = false;
    const extractedDetails = {};

    if (source === 'momo') {
      const resultCode = searchParams.get('resultCode');
      extractedDetails.orderId = searchParams.get('orderId');
      extractedDetails.amount = searchParams.get('amount');
      extractedDetails.transId = searchParams.get('transId'); // MoMo trans id
      extractedDetails.payType = searchParams.get('payType');
      extractedDetails.resultCode = resultCode;

      // ResultCode 0 hoặc 9000 là thành công
      if (resultCode === '0' || resultCode === '9000') {
        success = true;
        msg = momoMessages[resultCode] || momoMessages[0];
      } 
      // ResultCode 1000 là đang chờ
      else if (resultCode === '1000') {
          pending = true;
          msg = momoMessages[1000];
      }
      else {
        success = false;
        msg = momoMessages[resultCode] || momoMessages.default;
      }

    } else { // Mặc định là VNPAY
      const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
      extractedDetails.orderId = searchParams.get('vnp_TxnRef');
      extractedDetails.amount = searchParams.get('vnp_Amount');
      extractedDetails.vnpTranNo = searchParams.get('vnp_TransactionNo'); // VNPAY trans id
      extractedDetails.bankCode = searchParams.get('vnp_BankCode');
      extractedDetails.payDate = searchParams.get('vnp_PayDate');
      extractedDetails.responseCode = vnp_ResponseCode;

      if (vnp_ResponseCode === '00') {
        success = true;
        msg = vnpayMessages['00'];
      } else {
        success = false;
        msg = vnpayMessages[vnp_ResponseCode] || 'Giao dịch không thành công';
      }
    }

    setMessage(msg);
    setIsSuccess(success);
    setIsPending(pending);
    setDetails(extractedDetails);

  }, [searchParams, source]);

  // Định dạng ngày giờ
  const formatVnpayDate = (dateStr) => {
    if (!dateStr) return '';
    // 20231207170112 -> YYYYMMDDHHmmss
    try {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      const hour = dateStr.substring(8, 10);
      const minute = dateStr.substring(10, 12);
      return `${hour}h${minute} - ${day}/${month}/${year}`;
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="container mx-auto max-w-2xl text-center p-8 my-10 bg-white shadow-lg rounded-lg">
      {isSuccess ? (
        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
      ) : isPending ? (
          <FaInfoCircle className="text-yellow-500 text-6xl mx-auto mb-4" />
      ) : (
        <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
      )}
      
      <h1 className={`text-3xl font-bold mb-4 ${isSuccess ? 'text-gray-800' : isPending ? 'text-yellow-700' : 'text-red-600'}`}>
        {message}
      </h1>
      
      <p className="text-gray-600 mb-6">
        {isSuccess ? 'Cảm ơn bạn đã hoàn tất thanh toán.' : 
         isPending ? 'Giao dịch đang chờ xác nhận từ MoMo. Vui lòng đợi hoặc kiểm tra lại sau.' : 
         'Đã có lỗi xảy ra. Vui lòng kiểm tra lại.'}
      </p>

      {/* Hiển thị thông tin giao dịch */}
      <div className="text-left bg-gray-50 p-6 rounded-md border">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Thông tin giao dịch</h3>
        <div className="space-y-3">
          {details.orderId && (
            <div className="flex justify-between">
              <span className="text-gray-500">Mã đơn hàng:</span>
              <span className="font-medium text-gray-900">{details.orderId}</span>
            </div>
          )}
          {details.amount && (
             <div className="flex justify-between">
                <span className="text-gray-500">Số tiền:</span>
                <span className="font-medium text-gray-900">
                  {/* VNPAY amount * 100, MoMo thì không */}
                  {(Number(details.amount) / (source === 'momo' ? 1 : 100)).toLocaleString()} VNĐ
                </span>
              </div>
          )}
          {/* VNPAY Details */}
          {source !== 'momo' && details.bankCode && (
             <div className="flex justify-between">
                <span className="text-gray-500">Ngân hàng (VNPAY):</span>
                <span className="font-medium text-gray-900">{details.bankCode}</span>
              </div>
          )}
           {source !== 'momo' && details.vnpTranNo && (
             <div className="flex justify-between">
                <span className="text-gray-500">Mã GD VNPAY:</span>
                <span className="font-medium text-gray-900">{details.vnpTranNo}</span>
              </div>
          )}
          {source !== 'momo' && details.payDate && (
             <div className="flex justify-between">
                <span className="text-gray-500">Thời gian (VNPAY):</span>
                <span className="font-medium text-gray-900">{formatVnpayDate(details.payDate)}</span>
              </div>
          )}
           {/* MOMO Details */}
           {source === 'momo' && details.transId && (
             <div className="flex justify-between">
                <span className="text-gray-500">Mã GD MoMo:</span>
                <span className="font-medium text-gray-900">{details.transId}</span>
              </div>
          )}
           {source === 'momo' && details.payType && (
             <div className="flex justify-between">
                <span className="text-gray-500">Loại thanh toán (MoMo):</span>
                <span className="font-medium text-gray-900">{details.payType}</span>
              </div>
          )}
          {/* Mã lỗi */}
          {!isSuccess && !isPending && (details.resultCode || details.responseCode) && (
            <div className="flex justify-between">
              <span className="text-gray-500">Mã lỗi:</span>
              <span className="font-medium text-red-600">{details.resultCode || details.responseCode}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Link 
          to="/" 
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          Về trang chủ
        </Link>
         {/* Chỉ hiển thị nút xem đơn hàng nếu có orderId */}
         {details.orderId && (
            <Link 
            to={`/orders/${details.orderId}`} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
            Xem chi tiết đơn hàng
            </Link>
         )}
      </div>
    </div>
  );
}