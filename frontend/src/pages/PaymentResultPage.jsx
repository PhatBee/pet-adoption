import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

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

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
  const vnp_TxnRef = searchParams.get('vnp_TxnRef'); // Mã đơn hàng
  const vnp_Amount = searchParams.get('vnp_Amount');
  const vnp_PayDate = searchParams.get('vnp_PayDate');
  const vnp_BankCode = searchParams.get('vnp_BankCode');

  useEffect(() => {
    if (vnp_ResponseCode === '00') {
      setIsSuccess(true);
      setMessage(vnpayMessages['00'] || 'Giao dịch thành công');
    } else {
      setIsSuccess(false);
      setMessage(vnpayMessages[vnp_ResponseCode] || 'Giao dịch không thành công');
    }
  }, [vnp_ResponseCode]);

  // Định dạng ngày giờ
  const formatPayDate = (dateStr) => {
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
      ) : (
        <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
      )}
      
      <h1 className={`text-3xl font-bold mb-4 ${isSuccess ? 'text-gray-800' : 'text-red-600'}`}>
        {message}
      </h1>
      
      <p className="text-gray-600 mb-6">
        {isSuccess 
          ? 'Cảm ơn bạn đã hoàn tất thanh toán.' 
          : 'Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng kiểm tra lại.'}
      </p>

      {/* Hiển thị thông tin giao dịch */}
      <div className="text-left bg-gray-50 p-6 rounded-md border">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Thông tin giao dịch</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Mã đơn hàng:</span>
            <span className="font-medium text-gray-900">{vnp_TxnRef}</span>
          </div>
          {isSuccess && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-500">Số tiền:</span>
                <span className="font-medium text-gray-900">
                  {(Number(vnp_Amount) / 100).toLocaleString()} VNĐ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ngân hàng:</span>
                <span className="font-medium text-gray-900">{vnp_BankCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Thời gian:</span>
                <span className="font-medium text-gray-900">{formatPayDate(vnp_PayDate)}</span>
              </div>
            </>
          )}
          {!isSuccess && vnp_ResponseCode && (
            <div className="flex justify-between">
              <span className="text-gray-500">Mã lỗi VNPAY:</span>
              <span className="font-medium text-red-600">{vnp_ResponseCode}</span>
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
        <Link 
          to={`/orders/${vnp_TxnRef}`} 
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Xem chi tiết đơn hàng
        </Link>
      </div>
    </div>
  );
}