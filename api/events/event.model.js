const mongoose        = require('mongoose');
const uniqueValiator  = require('mongoose-unique-validator');
const Schema          =  mongoose.Schema;

const EventSchema = new Schema({
  eventId: {
    type: Number,
    unique: true,
    index: true,
    required: 'Event Id is required'
  },
  name: {
    type: String,
    required: 'Event name is required'
  },
  description: {
    type: String
  },
  ticketPrice: {
    type: Number,
  },
  date: {
    type: Date,
    default: Date.now
  }
});

EventSchema.plugin(uniqueValiator);

module.exports = mongoose.model('Event', EventSchema);
