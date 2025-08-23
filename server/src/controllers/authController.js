const bcrypt = require("bcrypt");
const User = require("../models/User");
const Otp = require("../models/Otp");
const { sendEmail } = require("../services/emailService");

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
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });
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
        await User.updateOne({ email }, { verified: true });

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
    

module.exports = {
    register,
    verifyOtp,
    resendOtp
};