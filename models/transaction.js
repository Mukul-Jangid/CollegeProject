const mongoose = require('mongoose')
const { Schema } = mongoose;

var min = [1, 'Amount is too less'];
var max = [1000000,'Amount is too high'];
const transactionSchema = new Schema({
    transactionName: {
        type: String,
        required: true
    },
    retailer: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    customerName: {
        type: String
    },
    customerPhone: {
        type: Number
    },
    products: [
        {
        productName: {
            type: String,
        },
        productPrice: {
            type: Number
        }
       }
    ],
    note:{
        type: String,
        maxLength: [150, 'Note should be less then 150 characters']
    },
    amount: {
        type: Number,
        min: min,
        max: max,
        required: true
    },
    status: {
        type: String,
        default: "active",
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