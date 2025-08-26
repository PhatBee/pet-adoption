const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// Thư mục lưu avatar
const AVATAR_DIR = path.join(process.cwd(), "uploads", "avatars");

// Storage disk: lưu vào uploads/avatars
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, AVATAR_DIR);
  },
  filename: function (req, file, cb) {
    // Tạo tên file an toàn: <userId>-<random>-timestamp.ext
    const ext = path.extname(file.originalname);
    const random = crypto.randomBytes(6).toString("hex");
    const userId = req.user?.sub || "anon";
    cb(null, `${userId}-${Date.now()}-${random}${ext}`);
  },
});

// filter chỉ cho phép jpeg/png/webp
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Chỉ chấp nhận ảnh .jpeg .png .webp"), false);
};

const limits = { fileSize: 2 * 1024 * 1024 }; // 2 MB

const upload = multer({ storage, fileFilter, limits });

module.exports = upload;
