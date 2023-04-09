const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  maximumRetailPrice: {
    type: Number,
    required: true
  },
  sku: {
    type: String,
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
