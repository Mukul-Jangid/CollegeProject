const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'Retailer',
    enum: ['Retailer', 'Customer']
  },
  isValid: {
    type: Boolean,
    default: false
  },
  uniqueString: {
    type: String,
    unique: true
  }
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
      return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
})


userSchema.methods.validatePassoword = async function (usersendpassword) {
  return bcrypt.compare(usersendpassword, this.password);
}

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {

      expiresIn: `${process.env.JWT_EXPIRY}`
  });
}

const User = mongoose.model('User', userSchema);

module.exports = User;
