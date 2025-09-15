const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true }, // tên người nhận
  phone: { type: String, required: true },    // số điện thoại
  street: { type: String, required: true },   // số nhà, tên đường
  ward: { type: String },                     // phường/xã
  district: { type: String },                 // quận/huyện
  city: { type: String, required: true },     // thành phố/tỉnh
  isDefault: { type: Boolean, default: false } // có phải địa chỉ mặc định không
}, { timestamps: true });



const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  avatarUrl: {
    type: String
  },
  role: { type: String, default: "user" },
  phone: { type: String, default: "" },
  addresses: [addressSchema]

}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;