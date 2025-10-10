
const errorHandlerMiddleware = (err, req, res, next) => {
  // Ghi lại lỗi ra console để debug (quan trọng khi ở môi trường development)
  console.error(err.stack);

  // Lấy statusCode từ lỗi nếu có, nếu không thì mặc định là 500 (Internal Server Error)
  const statusCode = err.statusCode || 500;

  // Lấy message từ lỗi, nếu không có thì gửi một thông báo chung chung
  const message = err.message || "Đã có lỗi xảy ra trên máy chủ";

  // Gửi về cho client một response lỗi dưới dạng JSON
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    stack: err.stack,
  });
};

module.exports = errorHandlerMiddleware;