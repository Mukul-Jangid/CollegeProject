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
        maxlength: [10, 'Phone should be of more than 10 characters']
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


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
})


userSchema.methods.validatePassword = async function (usersendpassword) {
    return bcrypt.compare(usersendpassword, this.password);
}
const user = mongoose.model("User", userSchema);

module.exports=user