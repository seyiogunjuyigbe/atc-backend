const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose
//= ============================================================================
/**
 * user Schema
 */
//= ============================================================================
const userSchema = new Schema({
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
  facebookId: {
    type: String
  },
  googleId: {
    type: String
  },
  lastLoginAt: {
    type: Date
  },
  stripeCustomerId: String,
  memberships: [{ type: Schema.Types.ObjectId, ref: "Membership" }],
  role: {
    type: String,
    enum: ['admin', 'vendor', 'customer']
  },
  bankAccount: {
    type: Schema.Types.ObjectId,
    ref: "BankAccount"
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

userSchema.methods.comparePassword = function (password, cb) {
  if (!this.password && cb) {
    return cb(new Error('Registration not complete'), false);
  }

  if (!cb && this.password) {
    return bcrypt.compareSync(password, this.password);
  }

  if (cb) {
    bcrypt.compare(password, this.password, (err, isMatch) => {
      cb(err, isMatch);
    });
  }
}
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
