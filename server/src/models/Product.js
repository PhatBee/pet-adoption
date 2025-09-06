const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
},
  description: {
    type: String
},
  price: { 
    type: Number, 
    required: true 
},
  images: [String],
  stock: { 
    type: Number,
    default: 0
},
  category: {
    String
},
  sold: {
    type: Number,
    default: 0
},
  views: {
    type: Number,
    default: 0
},
  discount: {
    type: Number,
    default: 0
} // %
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
