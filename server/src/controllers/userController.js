const userService = require("../services/userService");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;
const multer = require("multer"); // 1. Import multer để kiểm tra lỗi

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
    // --- 2. Cập nhật logic bắt lỗi ---
    // Bắt lỗi cụ thể từ multer (sai định dạng file, quá dung lượng)
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Lỗi tải file: ${err.message}` });
    }
    // Bắt lỗi từ fileFilter của bạn
    if (err.message === "Chỉ chấp nhận ảnh .jpeg .png .webp") {
      return res.status(400).json({ message: err.message });
    }

    const code = err.status || 500;
    return res.status(code).json({ message: err.message || "Lỗi server" });
  }
};

// POST /api/users/addresses
const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressData = req.body; // Dữ liệu địa chỉ mới từ client

    // Gọi service để thêm địa chỉ (chúng ta sẽ tạo hàm này ở bước sau)
    const updatedUser = await userService.addAddress(userId, addressData);
    
    // Trả về toàn bộ danh sách địa chỉ đã được cập nhật
    res.status(201).json({ 
      message: "Thêm địa chỉ thành công", 
      addresses: updatedUser.addresses 
    });
  } catch (err) {
    const code = err.status || 400; // Mặc định là lỗi 400 Bad Request
    return res.status(code).json({ message: err.message || "Lỗi khi thêm địa chỉ" });
  }
};

// PUT /api/users/addresses/:addressId
const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params; // Get the specific address ID from the URL
    const addressData = req.body; // Get the new address data from the request body

    const updatedUser = await userService.updateAddress(userId, addressId, addressData);

    res.json({
      message: "Cập nhật địa chỉ thành công",
      addresses: updatedUser.addresses
    });
  } catch (err) {
    const code = err.status || 400;
    return res.status(code).json({ message: err.message || "Lỗi khi cập nhật địa chỉ" });
  }
};

// DELETE /api/users/addresses/:addressId
const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params; // Get the address ID from the URL

    const updatedUser = await userService.deleteAddress(userId, addressId);

    res.json({
      message: "Xóa địa chỉ thành công",
      addresses: updatedUser.addresses
    });
  } catch (err) {
    const code = err.status || 400;
    return res.status(code).json({ message: err.message || "Lỗi khi xóa địa chỉ" });
  }
};

// PUT /api/users/password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng cung cấp mật khẩu cũ và mới." });
    }

    // Gọi service để xử lý logic
    await userService.changePassword(userId, oldPassword, newPassword);

    res.json({ message: "Đổi mật khẩu thành công!" });
  } catch (err) {
    const code = err.status || 400; // Mặc định là lỗi 400
    return res.status(code).json({ message: err.message || "Lỗi khi đổi mật khẩu" });
  }
};

// DELETE /api/users/profile
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Gọi service để xử lý logic xóa tài khoản
    await userService.deleteAccount(userId);

    // Xóa cookie refreshToken phía client
    res.clearCookie('refreshToken');

    res.json({ message: "Tài khoản của bạn đã được xóa thành công." });
  } catch (err) {
    const code = err.status || 500; // Mặc định là lỗi server
    return res.status(code).json({ message: err.message || "Lỗi khi xóa tài khoản" });
  }
};

module.exports = { getProfile, updateProfile, addAddress, updateAddress, deleteAddress, changePassword, deleteAccount };
