const mongoose = require('mongoose')
const { Schema } = mongoose;

var min = [1, 'Amount is too less'];
var max = [1000000,'Amount is too high'];
const transactionSchema = new Schema({
    retailer: {
        type: Schema.Types.ObjectId,
        ref: 'Retailer'
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer'
    },
    itemName: {
        type: String,
        maxLength: [30, 'Item name should not be more than 30 characters']
    },
    amount: {
        type: Number,
        min: min,
        max: max,
        required: true
    },
    paid: {
        type: Number,
        max: max,
        default: 0,
        required: true
    },
    due: {
        type: Number,
        max: max,
        default: 0,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const transaction = mongoose.model("Transaction", transactionSchema);

module.exports=transaction