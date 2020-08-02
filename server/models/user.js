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
userSchema.pre('save', function saveHook(next) {
  const user = this;
  if (!user.isModified('password')) return next();
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(user.password, salt);
  user.password = hash;
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
