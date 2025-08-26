const bcrypt = require("bcrypt");
const User = require("../models/User");
const Otp = require("../models/Otp");
const RefreshToken = require("../models/RefreshToken");
const { sendEmail, sendPasswordResetOtpEmail } = require("../services/emailService");
const { comparePassword, hashPassword } = require("../services/passwordService");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getExpiryDateFromJwt,
} = require("../services/tokenService");
const e = require("express");

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// API: Register
const register = async (req, res) => {
    try {
        const {name, email, password} = req.body;

        // Kiểm tra trùng email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo người dùng mới
        await User.create({ name, email, password: hashedPassword });

        // Gửi email xác thực
        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP hết hạn sau 5 phút

        // Lưu OTP vào cơ sở dữ liệu
        const otpEntry = new Otp({ email, otp, expiresAt });
        await otpEntry.save();

        // Gửi Email
        await sendEmail(email, "Pet Adoption - OTP Verification", `Mã OTP của bạn là: ${otp}`);

        return res.status(201).json({ message: "User registered successfully. Please check your email for OTP." });
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// API: Verify OTP
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Kiểm tra OTP
        const otpEntry = await Otp.findOne({ email, otp });
        if (!otpEntry) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Kiểm tra hết hạn
        if (otpEntry.expiresAt < Date.now()) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        // Cập nhật user thành verified
        await User.updateOne({ email }, { isVerified: true });

        // Xóa OTP đã sử dụng
        await Otp.deleteOne({ _id: otpEntry._id });

        res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

//APi Resend OTP
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Kiểm tra user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Tài khoản đã xác thực, không cần OTP" });
    }

    // 2. Tìm OTP gần nhất
    const lastOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (lastOtp) {
      const now = new Date();
      const diffSeconds = Math.floor((now - lastOtp.createdAt) / 1000);

      if (diffSeconds < 30) {
        return res.status(429).json({ 
          message: `Vui lòng chờ ${30 - diffSeconds} giây nữa trước khi yêu cầu OTP mới` 
        });
      }

      // Xóa OTP cũ để tránh trùng
      await Otp.deleteMany({ email });
    }

    // 3. Tạo OTP mới
    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // hết hạn sau 5 phút

    await Otp.create({ email, otp: otpCode, expiresAt });

    // 4. Gửi OTP qua email
    await sendEmail(email, "Pet Adoption - Resend OTP", `Mã OTP mới của bạn là: ${otpCode}`);

    return res.status(200).json({ message: "OTP mới đã được gửi qua email" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// API Login (email + password --> AccessToken + refreshToken)
const login = async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    const { password } = req.body;

    // 1. Kiểm tra user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Không tìm thấy tài khoản" });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: "Tài khoản chưa được xác thực" });
    }

    // 2. Kiểm tra mật khẩu
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Email hoặc Mật khẩu không đúng" });
    }

    // // 3. Tạo và gửi token
    // const payload = { sub: user._id.toString(), email: user.email, name: user.name };
    // const accessToken = signAccessToken(payload);
    // const refreshToken = signRefreshToken({ sub: user._id.toString() });

    // // Lưu refresh token vào database (để có thể revoke)
    // const expiresAt = getExpiryDateFromJwt(refreshToken);
    // await RefreshToken.create({ userId: user._id, token: refreshToken, expiresAt });

    // return res.status(200).json({
    //   message: "Đăng nhập thành công",
    //   user: {
    //     id: user._id,
    //     email: user.email,
    //     name: user.name
    //   },
    //   accessToken,
    //   refreshToken
    // });

     // Tạo tokens
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    
    // Gửi refresh token bằng HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,    // không cho JS đọc
      secure: false,     // true nếu dùng HTTPS
      sameSite: "strict", 
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return res.json({
      message: "Đăng nhập thành công",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
      },
      refreshToken,
      accessToken,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

// REFRESH: nhận refreshToken => cấp accessToken mới
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "Không có refresh token" });

    const decoded = verifyRefreshToken(token);
     // Tạo access token mới
    const newAccessToken = signAccessToken({
      id: decoded.id,
      email: decoded.email,
      name: decoded.name
    });

    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: "Refresh token không hợp lệ", error: error.message });
  }
};

// LOGOUT: nhận refreshToken => revoke
const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    
    // Xóa cookie ngay cả khi không có token
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict'
    });

    if (!token) {
      return res.status(200).json({ message: "Đăng xuất thành công" });
    }

    try {
      // Thử xóa token từ database nếu có
      await RefreshToken.deleteOne({ token });
    } catch (error) {
      console.error("Error deleting refresh token:", error);
    }

    return res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
// API Forgot password (request)
const requestPasswordResetOtp = async (req, res) => {
  try{
    const email = (req.body.email || "").toLowerCase().trim();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Không tìm thấy tài khoản" });
    }

    // Tạo OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút sau

    // Lưu OTP vào database
    await Otp.create({ email, otp, expiresAt });

    // Gửi email
    await sendPasswordResetOtpEmail(email, otp, 10);

    return res.status(200).json({ message: "Đã gửi OTP qua email" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// API: Forgot Password (reset)
const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Kiểm tra OTP
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "OTP không hợp lệ" });
    }

    // Kiểm tra thời gian hết hạn
    if (otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP đã hết hạn" });
    }

    // Cập nhật mật khẩu
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Không tìm thấy tài khoản" });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    // Xoá OTP đã sử dụng
    await Otp.deleteOne({ email, otp });
    await RefreshToken.deleteMany({ userId: user._id });

    return res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


module.exports = {
    register,
    verifyOtp,
    resendOtp,
    login,
    refreshToken,
    logout,
    requestPasswordResetOtp,
    resetPasswordWithOtp
};