const mongoose = require('mongoose');

// Define the schema for the Sales collection
const orderSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retailer',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retailer',
    required: true
  },
  status: {
    type: String,
    default: 'active',
    enum: ['inactive', 'active']
  },
  products: [{
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch'
    },
    batchNo: {
        type: String
    },
    quantity: {
        type: Number
    }
  }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
});

// Create the Sales model
const Order = mongoose.model('Order', orderSchema);

// Export the model
module.exports = Order;
