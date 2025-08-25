const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

// Tự xoá khi quá hạn
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Tối ưu truy vấn OTP gần nhất
otpSchema.index({ email: 1, type: 1, createdAt: -1 });

const Otp = mongoose.model("Otp", otpSchema);

module.exports = Otp;
