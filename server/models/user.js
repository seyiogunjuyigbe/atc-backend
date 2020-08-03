const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
//= ============================================================================
/**
 * user Schema
 */
//= ============================================================================
const userSchema = mongoose.Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  email: {
    type: String
  },
  phoneNo: {
    type: String
  },
  token: {
    type: String
  },
  city: {
    type: String
  },
  password: String,
  country: {
    type: String
  },
  isActive: {
    type: String
  },
  stripeCustomerId: String,
  role: {
    type: String,
    enum: ['admin', 'vendor', 'customer']
  },
  passwordResetExpires: {
    type: String
  },
},
  {
    timestamps: true,
  });

userSchema.statics.comparePassword = async (password, userPassword) => await bcrypt.compare(password, userPassword);

//= ============================================================================
userSchema.options.toJSON = {
  transform: function (doc, ret, options) {
    delete ret.password
    return ret;
  }
}

userSchema.pre('save', function saveHook(next) {
  if (!this.isModified('password')) return next();
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(this.password, salt);
  this.password = hash;
  return next();
});
/**
 * Compile to Model
 */
//= ============================================================================
const userModel = mongoose.model('User', userSchema);

//= ============================================================================
/**
 * Export userModel
 */
//= ============================================================================
module.exports = userModel;
//= ============================================================================
