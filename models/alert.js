const mongoose = require('mongoose')
const { Schema } = mongoose;

const alertSchema = new Schema({
    transaction: {
        type: Schema.Types.ObjectId,
        ref: 'Transaction'
    },
    retailer: {
        type: Schema.Types.ObjectId,
        ref: 'Retailer'
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer'
    },
    message:{
        type: String,
        maxLength: [100, 'Message should be less than 100 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})