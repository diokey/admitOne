const mongoose  = require('mongoose');
const Order     = require('./order.model');
const Event     = require('../events/event.model');
const Customer  = require('../customer/customer.model');
const config    = require('../../config/environment');

function isValidMongooseId (id) {
  return mongoose.Types.ObjectId.isValid(id) && /^[a-fA-F0-9]{24}$/.test(id);
}

const purchase = (req, res) => {

  let {username, eventId, nbTickets} = req.body;

  //convert to number
  nbTickets= +nbTickets;

  let selectedCustomer;
  let selctedEvent;
  let badRequest = false;

  let error = {
    code : 400,
    message : 'Bad request',
    errors : []
  };

  function checkRequiredFields() {
    if (!username) {
      error.errors.push({username: 'Username is a required field'});
      badRequest = true;
    }

    if (!eventId) {
      error.errors.push({eventId: 'Event id is a required field'});
      badRequest = true;
    }

    if (isNaN(nbTickets) || nbTickets <= 0) {
      error.errors.push({nbTickets: 'Number of ticket must be > 0'});
      badRequest = true;
    }
  }

  function checkCustomer(selectedCustomer) {
    if (!selectedCustomer) {
      error.errors.push({username: 'Unkown username: ' + username});
      throw new Error('ValidationError');
    }
    return selectedCustomer;
  }

  function checkEvent(selectedEvent) {

    if (!selectedEvent) {
      error.errors.push({eventId: 'Invalid event Id: ' + eventId});
      throw new Error('ValidationError');
    }
    return selectedEvent;
  }

  function createOrder() {
    order = new Order({
      event: selectedEvent._id,
      customer: selectedCustomer._id,
      tickets: nbTickets
    });
    return order.save();
  }

  checkRequiredFields();

  if (badRequest) {
    return res.status(400).json(error);
  }

  Customer.findOne({username: username})
    //select customer
    .then(customer => selectedCustomer = customer)
    //check the selected customer
    .then(checkCustomer)
    .then(_ => Event.findOne({eventId: eventId}))
    //select the event
    .then(event => selectedEvent = event)
    //check the selected event
    .then(checkEvent)
    //create the oreder
    .then(createOrder)
    //return result
    .then(savedOrder => res.status(201).json(savedOrder))
    .catch(e => {
      if (e.message === 'ValidationError') {
        return res.status(400).json(error);
      } else {
        throw e;
      }
    })
    .catch(e => {
      //don't expose the exception in production
      const error = {
        code : 500,
        message : 'Internal Server error',
        description : config.env === 'production' ? '' : e.message
      };
      return res.status(500).json(error);
    });
};

const cancelation = (req, res) => {

  let orderId = req.params.orderId;
  let {username, eventId, nbTickets} = req.body;
  let badRequest = false;
  let selectedOrder;

  let error = {
    code : 400,
    message : 'Bad request',
    errors : []
  };

  function checkRequiredFields() {
    if (!isValidMongooseId(orderId)) {
      error.errors.push({orderId: 'Order id is invalid'});
      badRequest = true;
    }

    if (!username) {
      error.errors.push({username: 'Username is a required field'});
      badRequest = true;
    }

    if (!eventId) {
      error.errors.push({eventId: 'Event id is a required field'});
      badRequest = true;
    }

    if (isNaN(nbTickets) || nbTickets <= 0) {
      error.errors.push({nbTickets: 'Number of ticket must be > 0'});
      badRequest = true;
    }
  }

  function checkOrder(selectedOrder) {
    if (!selectedOrder) {
      error.errors.push({orderId: 'No order with id ' + orderId});
      badRequest = true;
      return res.status(400).json(error);
    }

    if (selectedOrder.customer.username !== username) {
      error.errors.push({username: 'The customer ' + username + ' does not own the order ' + orderId});
      badRequest = true;
    }

    if (selectedOrder.event.eventId !== eventId) {
      error.errors.push({eventId: 'No event ' + eventId + ' on the order ' + orderId});
      badRequest = true;
    }

    if (selectedOrder.tickets < nbTickets) {
      error.errors.push({nbTickets: 'Can not cancel more tickets than bought on the order ' + orderId});
      badRequest = true;
    }

    if (badRequest) {
      throw new Error('ValidationError');
    }
    return selectedOrder;
  }

  function cancelOder(selectedOrder) {
    selectedOrder.tickets -= nbTickets;
    if (selectedOrder.tickets === 0) {
      selectedOrder.canceled = true;
    }
    return selectedOrder.save();
  }

  checkRequiredFields();

  if (badRequest) {
    return res.status(400).json(error);
  }

  Order.findById(orderId)
    .populate('customer event')
    // check order
    .then(checkOrder)
    //cancel order
    .then(cancelOder)
    //return the result
    .then(updatedOrder => res.status(200).json(updatedOrder))
    .catch(e => {
      if (e.message === 'ValidationError') {
        return res.status(400).json(error);
      } else {
        throw e;
      }
    })
    .catch(e => {
      console.log(e);
      const error = {
        code : 500,
        message : 'Internal Server error',
        description : config.env === 'production' ? '' : e.message
      };
      return res.status(500).json(error);
    });

};


const exchange = (req, res) => {

  let orderId = req.params.orderId;
  let {username, originEventId, destEventId, nbTickets} = req.body;
  let badRequest = false;
  let originOrder;
  let destinationOrder;

  let error = {
    code : 400,
    message : 'Bad request',
    errors : []
  };

  function checkRequiredFields() {
    if (!isValidMongooseId(orderId)) {
      error.errors.push({orderId: 'Order id is invalid'});
      badRequest = true;
    }

    if (!username) {
      error.errors.push({username: 'Username is a required field'});
      badRequest = true;
    }

    if (!originEventId) {
      error.errors.push({originalEventId: 'The origin event id is a required field'});
      badRequest = true;
    }

    if (!destEventId) {
      error.errors.push({destEventId: 'The destination event id is a required field'});
      badRequest = true;
    }

    if (originEventId === destEventId) {
      error.errors.push({destEventId: 'The destination event id is the same as the origin'});
      badRequest = true;
    }

    if (isNaN(nbTickets) || nbTickets <= 0) {
      error.errors.push({nbTickets: 'Number of ticket must be > 0'});
      badRequest = true;
    }
  }

  function checkOriginOrder(retrievedOrder) {
    originOrder = retrievedOrder;
    if (!originOrder) {
      error.errors.push({orderId: 'No order with id ' + orderId});
      throw new Error('ValidationError');
    }

    if (originOrder.customer.username !== username) {
      error.errors.push({username: 'The customer ' + username + ' does not own the order ' + orderId});
      badRequest = true;
    }

    if (originOrder.event.eventId !== originEventId) {
      error.errors.push({originEventId: 'No event ' + originEventId + ' on the order ' + orderId});
      badRequest = true;
    }

    if (originOrder.tickets < nbTickets) {
      error.errors.push({nbTickets: 'Can not exchange more tickets than bought on the order ' + orderId});
      badRequest = true;
    }

    if (badRequest) {
      throw new Error('ValidationError');
    } else  {
      return originOrder;
    }
  }

  function checkDestEvent() {
    return Event.findOne({eventId: destEventId})
      .then(destEvent => {
        if (!destEvent) {
          error.errors.push({destEventId: 'Invalid event Id: ' + destEventId});
          throw new Error('ValidationError');
        } else  {
          return destEvent;
        }
      });
  }

  function findOrCreateDestOrder(destEvent) {
    destinationOrder = new Order({
      event: destEvent._id,
      customer: originOrder.customer._id,
      tickets: 0
    });

    return Order.findOne({event: destinationOrder.event, customer: destinationOrder.customer})
      .then(res => {
        if (!res) {
          return destinationOrder.save();
        } else {
          return res;
        }
      });
  }

  function exchangeOrder(updatedDestOrder) {
    originOrder.tickets -= nbTickets;
    if (originOrder.tickets === 0) {
      originOrder.canceled = true;
    }
    updatedDestOrder.tickets += nbTickets;
    return Promise.all([originOrder.save(), updatedDestOrder.save()]);
  }

  checkRequiredFields();

  if (badRequest) {
    return res.status(400).json(error);
  }

  return Order.findById(orderId)
    .populate('customer event')
    //validate data
    .then(checkOriginOrder)
    //make sure the eventId exists
    .then(checkDestEvent)
    //find or update the dest order
    .then(findOrCreateDestOrder)
    // apply the exchange and save
    .then(exchangeOrder)
    //render the response
    .then(updates => res.status(200).json(updates[0]))
    .catch(e => {
      if (e.message === 'ValidationError') {
        return res.status(400).json(error);
      } else {
        throw e;
      }
    })
    .catch(e => {
      console.log(e);
      const error = {
        code : 500,
        message : 'Internal Server error',
        description : config.env === 'production' ? '' : e.message
      };
      return res.status(500).json(error);
    });
};

module.exports.purchase = purchase;
module.exports.cancelation = cancelation;
module.exports.exchange = exchange ;
