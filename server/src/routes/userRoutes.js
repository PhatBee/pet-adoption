const express = require("express");
const { getProfile, updateProfile } = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// Lấy thông tin profile user hiện tại
//router.get("/profile", authenticate, getProfile);
router.get("/profile", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("fullName email avatarUrl");
    if (!user) return res.status(404).json({ message: "User không tồn tại" });
    res.json({ user }); // trả về JSON user
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Cập nhật thông tin profile
//router.put("/profile", authenticate, updateProfile);
router.put("/profile", authenticate, async (req, res) => {
  try {
    const { fullName, avatarUrl } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, avatarUrl },
      { new: true, select: "fullName email avatarUrl" }
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
