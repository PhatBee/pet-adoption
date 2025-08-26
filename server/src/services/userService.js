const User = require("../models/User");
const fs = require("fs").promises;
const path = require("path");

// Lấy thông tin user
const getUserById = (id) => User.findById(id).select("-password");

// Lấy thông tin profile user
const getProfile = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Cập nhật profile user
const updateProfile = async (userId, { name, email, phone }, res) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw { status: 404, message: "Người dùng không tồn tại" };

    // Nếu email thay đổi -> kiểm tra unique
  if (email && email.toLowerCase().trim() !== user.email) {
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) throw { status: 409, message: "Email đã được dùng bởi tài khoản khác" };

    user.email = email.toLowerCase().trim();
  }
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;

  await user.save();
  return user.toObject();

    // const user = await User.findByIdAndUpdate(
    //   userId,
    //   { name, email, phone, updatedAt: new Date() },
    //   { new: true, runValidators: true, select: "-password" }
    // );

    // if (!user) {
    //   return res.status(404).json({ message: "User not found" });
    // }

    // return res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Xoá file avatar cũ (helper)
const removeFileIfExists = async (filePath) => {
  try {
    if (!filePath) return;
    const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    await fs.stat(abs); // kiểm tra có tồn tại
    await fs.unlink(abs);
  } catch (err) {
    // nếu file không tồn tại -> bỏ qua
  }
};

// Cập nhật avatar: filePath là đường dẫn được lưu bởi multer (relative)
const updateAvatar = async (userId, fileRelativePath) => {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "Người dùng không tồn tại" };

  // Xoá avatar cũ (nếu có và không phải default)
  if (user.avatarUrl) {
    // nếu avatarUrl lưu dạng '/uploads/avatars/....'
    await removeFileIfExists(path.join("uploads", path.basename(user.avatarUrl)));
  }

  user.avatarUrl = fileRelativePath;
  await user.save();
  return user.toObject();
};

// Xóa avatar (nếu user muốn remove)
const clearAvatar = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "Người dùng không tồn tại" };
  if (user.avatarUrl) {
    await removeFileIfExists(path.join("uploads", path.basename(user.avatarUrl)));
    user.avatarUrl = null;
    await user.save();
  }
  return user.toObject();
}

module.exports = { getProfile, updateProfile, removeFileIfExists, updateAvatar, clearAvatar };
