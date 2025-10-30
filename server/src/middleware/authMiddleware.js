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
/**
 * Middleware xác thực (TÙY CHỌN)
 * Nếu có token và hợp lệ -> Gắn req.user
 * Nếu không có token hoặc token không hợp lệ -> Bỏ qua, req.user = null, đi tiếp
 */
const authenticateOptional = (req, res, next) => {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.substring(7) : null;

    // 1. Nếu không có token, set req.user = null và đi tiếp
    if (!token) {
        req.user = null;
        return next();
    }

    // 2. Nếu có token, thử xác thực
    try {
        const userData = verifyAccessToken(token);
        req.user = userData; // Gắn user nếu token hợp lệ
        console.log('Token payload (optional):', userData); // Để debug
    } catch (error) {
        // 3. Nếu token không hợp lệ (hết hạn, sai),
        // KHÔNG ném lỗi, chỉ set req.user = null.
        req.user = null;
    }

    // 4. Luôn luôn đi tiếp
    return next();
}

module.exports = { authenticate, authenticateOptional };