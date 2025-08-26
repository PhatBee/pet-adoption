const User = require("../models/User");

// Lấy thông tin profile user
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Cập nhật profile user
const updateProfile = async (req, res) => {
  try {
    const { name, avatarUrl } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, avatarUrl, updatedAt: new Date() },
      { new: true, runValidators: true, select: "-password" }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getProfile, updateProfile };
