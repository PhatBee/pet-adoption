const mongoose = require("mongoose");

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
  type: String,
  required: true
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

  discount: {
    type: Number,
    default: 0
  } // %
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

productSchema.index({ createdAt: -1 });
productSchema.index({ viewCount: -1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ isActive: 1 });

module.exports = Product;
