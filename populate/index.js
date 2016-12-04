/*
 * Populate databse with sample data
 */
const Customer  = require('../api/customer/customer.model');
const Event     = require('../api/events/event.model');
const Order     = require('../api/orders/order.model');
const User      = require('../admin/user/user.model');

let customers = [];
let events    = [];
let users     = [];
let orders    = [];

//generate sample data
for (let i = 1; i <= 10; i++) {
  customers.push({
      email: 'customer'+i+'@test.com',
      username: 'customer' + i,
      firstName: 'customer ' + i,
      lastName: 'customer' + i,
      phoneNumber: 1234567890
    });

  events.push({
      eventId: i,
      name: 'Event name ' + i,
      description: 'Description of the event' + i,
      ticketPrice: 100,
      date: new Date()
    });

  users.push({
      username: 'test' + i,
      email: 'test'+i+'@test.com',
      password: 'password123'
    });
}


function resolve (promises) {
  return Promise.all(promises);
}

// customers
function removeCustomers () {
  return Customer.remove({});
}

function saveCustomer (customerObj) {
  const customer = new Customer(customerObj);
  return customer.save();
}

function saveCustomers () {
  return customers.map(saveCustomer);
}

// events
function removeEvents () {
  return Event.remove({});
}

function saveEvent (eventObj) {
  const event = new Event(eventObj);
  return event.save();
}

function saveEvents () {
  return events.map(saveEvent);
}

// users
function removeUsers () {
  return User.remove({});
}

function saveUser (userObj) {
  const event = new User(userObj);
  return event.save();
}

function saveUsers () {
  return users.map(saveUser);
}

// orders
function removeOrders () {
  return Order.remove({});
}

function saveOrder (orderObj) {
  const order = new Order(userObj);
  return order.save();
}

function saveOrders(savedEvents, savedCustomers) {

  let orderPromises = [];
  let radom;
  let nbTickets = 1;
  let event;
  let randomEvent;

  for (let i = 0; i < 10; i++) {
    random = Math.floor(Math.random() * 10);
    nbTickets = Math.ceil(Math.random() * 10);
    event = new Order({
      event: savedEvents[i]._id,
      customer: savedCustomers[i]._id,
      tickets: nbTickets
    });

    //have customers buy some rondom events
    nbTickets = Math.ceil(Math.random() * 10);
    let randomEvent = new Order({
      event: savedEvents[random]._id,
      customer: savedCustomers[nbTickets - 1]._id,
      tickets: nbTickets
    });

    orderPromises.push(event.save());
    orderPromises.push(randomEvent.save());
  }
  return orderPromises;
}

function populate () {
  console.log('Starting populating...');

  let savedEvents = [];
  let savedCustomers = [];

  return removeOrders()
    .then(removeCustomers)
    .then(removeEvents)
    .then(removeUsers)
    .then(saveUsers)
    .then(resolve)
    .then(saveEvents)
    .then(resolve)
    .then(saved => savedEvents = saved)
    .then(saveCustomers)
    .then(resolve)
    .then(saved => savedCustomers = saved)
    .then(_ => saveOrders(savedEvents, savedCustomers))
    .then(resolve)
    .catch(e => {
      throw new Error(e);
    });
}

module.exports.populate = populate;
module.exports.removeUsers = removeUsers;
module.exports.removeCustomers = removeCustomers;
module.exports.removeEvents = removeEvents;
module.exports.removeOrders = removeOrders;
module.exports.saveUsers = saveUsers;
module.exports.saveCustomers = saveCustomers;
module.exports.saveEvents = saveEvents;
module.exports.resolve = resolve;
