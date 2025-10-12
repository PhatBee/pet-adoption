const { Pet, Category } = require('../models/Product');

// Lấy tất cả các tùy chọn cho bộ lọc
const getFilterOptions = async (req, res) => {
  try {
    // Chạy song song để tăng tốc độ
    const [pets, categories] = await Promise.all([
      Pet.find().lean(),
      Category.find().lean()
    ]);

    res.json({ pets, categories });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu bộ lọc' });
  }
};

module.exports = { getFilterOptions };