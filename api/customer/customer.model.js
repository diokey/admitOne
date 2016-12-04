const mongoose        = require('mongoose');
const uniqueValiator  = require('mongoose-unique-validator');
const Schema          =  mongoose.Schema;

const CustomerSchema = new Schema({
  email: {
    type: String,
    index: true,
    required: 'An email is required',
    unique: true
  },
  username: {
    type: String,
    index: true,
    required: 'Username is required',
    unique: true
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  phoneNumber: {
    type: String
  }
});

CustomerSchema.plugin(uniqueValiator);

module.exports = mongoose.model('Customer', CustomerSchema);
