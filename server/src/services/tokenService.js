const jwt = require("jsonwebtoken");

const signAccessToken = (payload) => {
  return jwt.sign({ id: payload._id, email: payload.email }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' });
};

const signRefreshToken = (payload) => {
  return jwt.sign({ id: payload._id, email: payload.email }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' });
};

const verifyAccessToken = (token) =>
    jwt.verify(token, process.env.JWT_ACCESS_SECRET);

const verifyRefreshToken = (token) =>
    jwt.verify(token, process.env.JWT_REFRESH_SECRET);

// Lấy thời điểm hết hạn từ JWT (ms)
const getExpiryDateFromJwt = (token) => {
    const decoded = jwt.decode(token);
    return decoded?.exp ? new Date(decoded.exp * 1000) : null;
};

module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    getExpiryDateFromJwt,
};
