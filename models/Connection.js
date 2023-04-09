const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retailer',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retailer',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  sourceType: {
    type: String
  },// requester can use this field to specify which connection can be used for which product sourcing
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Connection = mongoose.model('Connection', connectionSchema);

module.exports = Connection;
