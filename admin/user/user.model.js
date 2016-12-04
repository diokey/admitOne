
const mongoose  = require('mongoose');
const crypto    = require('crypto');
const Schema    =  mongoose.Schema;
const uniqueValiator  = require('mongoose-unique-validator');

const UserSchema = new Schema({
  email: {
    type: String,
    required: 'A password is required',
    unique: true
  },
  username: {
    type: String,
    required: 'User name is required',
    unique: true
  },
  password: {
    type: String,
    required: 'Password is required'
  },
  created: {
    type: Date,
    default: Date.now
  }
});


UserSchema.pre('save', function (next) {
  if (this.password) {
    this.password = this.hashPassword(this.password);
  }
  next();
});

// methods
UserSchema.methods.hashPassword = password => crypto.pbkdf2Sync(password, 'salt', 100, 512, 'sha512').toString('base64');

UserSchema.methods.authenticate = function (password) {
  return this.password === this.hashPassword(password);
};

UserSchema.plugin(uniqueValiator);
module.exports = mongoose.model('User', UserSchema);
