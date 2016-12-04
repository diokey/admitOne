const mongoose  = require('mongoose');
const Schema    =  mongoose.Schema;

const OrderSchema = new Schema({
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: 'Event is required'
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: 'Customer is required'
  },
  tickets: {
    type: Number
  },
  soldAt: {
    type: Date,
    default: Date.now
  },
  canceled: {
    type: Boolean,
    default: false
  }
});

OrderSchema.statics.createOrUpdate = function (eventId, customerId, order) {
  return this.findOneAndUpdate({event: eventId, customer: customerId}, order, {new: true, upsert: true});
};

module.exports = mongoose.model('Order', OrderSchema);
