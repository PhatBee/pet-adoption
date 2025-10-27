const { verifyAccessToken } = require("../services/tokenService");

const authenticate = (req, res, next) => {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.substring(7) : null;

    if (!token) return res.status(401).json({ message: "Thiếu access token" });;

    try {
        const userData = verifyAccessToken(token);
        req.user = userData;
        console.log('Token payload:', userData); // Để debug

        return next();
    } catch (error) {
        return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
}

module.exports = { authenticate };