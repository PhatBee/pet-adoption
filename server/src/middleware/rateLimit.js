const rareLimit = require("express-rate-limit");

// Giới hạn số lượng yêu cầu từ một IP trong một khoảng thời gian nhất định
const loginLimiter = rareLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100, // giới hạn mỗi IP 10 yêu cầu
    standardHeaders: true, // Gửi thông tin giới hạn trong header `RateLimit-*`
    legacyHeaders: false, // Không gửi thông tin giới hạn trong header `X-RateLimit-*`
    message: { message: "Quá nhiều yêu cầu từ IP của bạn, vui lòng thử lại sau." }
});

module.exports = { loginLimiter };