const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchNo:{
    type: String
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  MRP: {
    type: Number,
    required: true
  },
  mfgDate: {
    type: Date,
    require: true
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retailer',
    required: true
  }
});

module.exports = mongoose.model('Batch', batchSchema);
