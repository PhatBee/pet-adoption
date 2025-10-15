const express = require("express");
const { getProfile, updateProfile, addAddress, deleteAddress, updateAddress, changePassword, deleteAccount } = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadAvatar"); // multer


const router = express.Router();
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, upload.single("avatar"), updateProfile);

// Thêm địa chỉ mới
router.post("/addresses", authenticate, addAddress);

// Cập nhật một địa chỉ cụ thể
router.put("/addresses/:addressId", authenticate, updateAddress);

// Xóa một địa chỉ cụ thể
router.delete("/addresses/:addressId", authenticate, deleteAddress);

// Đổi mật khẩu
router.put("/password", authenticate, changePassword);

// Xóa tài khoản
router.delete("/profile", authenticate, deleteAccount);


module.exports = router;
