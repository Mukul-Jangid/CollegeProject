const mongoose = require('mongoose');

// Define the schema for the Inventory collection
const inventorySchema = new mongoose.Schema({
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retailer',
    required: true
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  buyingPrice: {
    type: Number,
    required: true
  },
  sellingPrice: {
    type: Number
  },
  quantity: {
    type: Number,
    required: true
  }
});

// Create the Inventory model
const Inventory = mongoose.model('Inventory', inventorySchema);

// Export the model
module.exports = Inventory;
