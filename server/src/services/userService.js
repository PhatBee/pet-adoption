const User = require("../models/User");
const fs = require("fs").promises;
const path = require("path");

// Lấy thông tin user
const getUserById = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) {
    throw { status: 404, message: "Người dùng không tồn tại" };
  }
  return user;
};

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
const updateProfile = async (userId, { name, email, phone }) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw { status: 404, message: "Người dùng không tồn tại" };

    // Nếu email thay đổi -> kiểm tra unique
  if (email && email.toLowerCase().trim() !== user.email) {
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists)         
        throw { status: 400, message: "Email đã được sử dụng" };

    user.email = email.toLowerCase().trim();
  }
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;

  await user.save();
  return user.toObject();

  } catch (error) {
 if (error.status) throw error;
    throw { status: 500, message: error.message || "Lỗi cập nhật thông tin" };
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

module.exports = { getUserById, getProfile, updateProfile, removeFileIfExists, updateAvatar, clearAvatar };
