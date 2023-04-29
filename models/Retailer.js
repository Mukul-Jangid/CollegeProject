const mongoose = require('mongoose');
const User = require('./User');

const retailerSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true
  },
  businessType: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessType'
  },
  taxId: {
    type: String,
    // required: true
  },
  totalSales: {
    type: String,
    default: 0
  },
  paymentId: {
    type: String
  }
});

const Retailer = User.discriminator('Retailer', retailerSchema);
module.exports = Retailer;
