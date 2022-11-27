const bcrypt = require('bcrypt');
const mongoose = require('mongoose')
const { Schema } = mongoose;

const customerSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        maxlength: [20, 'Should not exceed 20 char'],
    },
    phone: {
        type: String,
        required: [true, 'Please provide phone'],
        unique: true,
        maxlength: [10, 'Phone should be of more than 10 characters']
    },
    password: {
        type: String,
        required: [true, 'Please provide Password'],
        minlength: [6, 'password should be of 6 character'],
        select: false //does not return password field in object         
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})


customerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
})


customerSchema.methods.validatePassoword = async function (usersendpassword) {
    return bcrypt.compare(usersendpassword, this.password);
}
const customer = mongoose.model("Customer", customerSchema);

module.exports=customer