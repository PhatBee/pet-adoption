const userService = require("../services/userService");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;

// GET /api/users/me
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // giả sử authenticate đặt payload vào req.userId
    const user = await userService.getUserById(userId);
    return res.json({ user });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Lỗi server" });
  }
};

// PUT /api/users/me (multipart/form-data: fields + optional avatar file)
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    // fields: name, email, phone
    const { name, email, phone, removeAvatar } = req.body;

    // 1) nếu có avatar file (multer) -> xử lý resize và lưu đường dẫn
    let avatarRelativeUrl = null;
    if (req.file) {
      // tuỳ chọn: dùng sharp để resize trước khi lưu (ghi đè file hiện tại)
      const filePath = req.file.path; // absolute path
      const resizedPath = filePath; // ta có thể overwrite
      // resize to 256x256
      await sharp(filePath).resize(256, 256).toFile(resizedPath + "-tmp");
      // replace file
      await fs.rename(resizedPath + "-tmp", filePath);

      // lưu relative url (ví dụ: /uploads/avatars/<filename>)
      avatarRelativeUrl = `/uploads/avatars/${req.file.filename}`;
    }

    // 2) Cập nhật thông tin (không xử avatar ở đây)
    const updated = await userService.updateProfile(userId, {
      name, email, phone,
    });

    // 3) Nếu có avatarRelativeUrl -> update avatar field
    if (avatarRelativeUrl) {
      await userService.updateAvatar(userId, avatarRelativeUrl);
      updated.avatarUrl = avatarRelativeUrl;
    } else if (removeAvatar === "true") {
      // client có thể gửi removeAvatar=true để xoá avatar
      await userService.clearAvatar(userId);
      updated.avatarUrl = null;
    }

    // Trả về profile mới (loại bỏ password)
    const safe = await userService.getUserById(userId);
    return res.json({ message: "Cập nhật thành công", user: safe });
  } catch (err) {
    // Nếu multer ném lỗi file lớn / loại file -> trả 400
    if (err.message && err.message.includes("Chỉ chấp nhận ảnh")) {
      return res.status(400).json({ message: err.message });
    }
    const code = err.status || 500;
    return res.status(code).json({ message: err.message || "Lỗi server" });
  }
};

module.exports = { getProfile, updateProfile };
