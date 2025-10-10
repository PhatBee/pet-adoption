const mongoose = require("mongoose");

// Model Pet
const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true // e.g., "Cats", "Birds"
  }
});
const Pet = mongoose.model("Pet", petSchema);

// Model Category
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true // e.g., "Đồ chơi", "Phụ kiện"
  }
});
const Category = mongoose.model("Category", categorySchema);

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  shortDescription: {
    type: String // Từ about_item_vi
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  compareAtPrice: { type: Number, default: 0, min: 0 },       // giá gốc (để tính %KM)
  images: { type: [String], default: [] }, // ['.../img1.jpg', ...]

  thumbnail: {
    type: String,
    default: null
  },
  stock: {
    type: Number,
    default: 0
  },
 category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true // Reference Category
  },
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true // Reference Pet
  },
  brand: {
    type: String // Từ brand
  },
  manufacturer: {
    type: String // Từ Manufacturer
  },
  country: {
    type: String // Từ Country
  },
  itemWeight: {
    type: String // Từ Item Weight
  },
  dimensions: {
    type: String // Từ Dimensions LxWxH
  },
  soldCount: {
    type: Number,
    default: 0,
    min: 0
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

productSchema.index({ createdAt: -1 });
productSchema.index({ viewCount: -1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ isActive: 1 });
productSchema.index({ pet: 1 }); // Index cho pet

module.exports = { Product, Pet, Category };