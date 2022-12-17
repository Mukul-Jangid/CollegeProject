const bcrypt = require('bcrypt');
const mongoose = require('mongoose')
const { Schema } = mongoose;

const userSchema = new Schema({
    shopName: {
        type: String,
        maxlength: [100, 'Should not exceed 100 char'],
    },
    name: {
        type: String,
        required: [true, 'Please provide name'],
        maxlength: [20, 'Should not exceed 100 char']
    },
    phone: {
        type: String,
        required: [true, 'Please provide phone'],
        unique: true,
        maxlength: [12, 'Phone should be of 12 digits']
    },
    role: {
        type:String,
        default: "Customer",
        enum: ["Customer","Retailer"]
    },
    password: {
        type: String,
        required: [true, 'Please provide Password'],
        minlength: [6, 'password should be of 6 character'],
        select: false //does not return password field in object         
    },
    address: {
        type: String,
        maxlength: [300, 'Address should not be more than 300 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})


const user = mongoose.model("User", userSchema);

module.exports=user