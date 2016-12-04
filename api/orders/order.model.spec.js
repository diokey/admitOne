const mongoose  = require('mongoose');
const should    = require('should');
const Order     = require('./order.model');
const Event     = require('../events/event.model');
const Customer  = require('../customer/customer.model');
const config    = require('../../config/environment');

mongoose.Promise = global.Promise;

describe('Order Model', _ => {

  before(done => {
    mongoose.connect(config.mongo.uri, config.mongo.options);
    done();
  });

  after(done => {
    //work around for mocha -w. See https://github.com/Automattic/mongoose/issues/1251
    mongoose.models = {};
    mongoose.modelSchemas = {};
    mongoose.connection.close(done);
  });

  beforeEach(done => {
    Event.remove().exec()
      .then(_ => Customer.remove().exec())
      .then(_ => Order.remove().exec())
      .then(_ => done())
      .catch(done);
  });

  it('should begin with no users', done => {
    Order.find({}).exec().then(orders => {
      orders.should.have.length(0);
      done();
    }).catch(done);
  });

  describe('Saving an order', _ => {

    it('should save a customer', done => {
      let order;

      let savedEvent;
      let savedCustomer;

      const event = new Event({
        eventId: 1,
        name: 'Event name',
        description: 'Description of the event',
        ticketPrice: 100,
        date: new Date()
      });

      const customer = new Customer({
        email: 'test@test.com',
        username: 'test',
        firstName: 'test',
        lastName: 'test',
        phoneNumber: 1234567890
      });

      event.save().then(e => savedEvent = e)
      .then(_ => customer.save())
      .then(c => savedCustomer = c)
      .then(_ => {
        order = new Order({
          event: savedEvent._id,
          customer: savedCustomer._id,
          tickets: 2,
        });
        return order.save();
      })
      .then(savedOrder => {
        should.exist(savedOrder);
        savedOrder.should.be.Object();
        savedOrder.event.toString().should.equal(order.event.toString());
        done();
      })
      .catch(done);

    });

    it('should fail if no customer id', done => {
      const event = new Event({
        eventId: 1,
        name: 'Event name',
        description: 'Description of the event',
        ticketPrice: 100,
        date: new Date()
      });

      event.save().then(savedEvent => {
        let order = new Order({
          event: savedEvent._id,
          customer: null,
          tickets: 2,
        });

        return order.save()
          .then(saved => done(new Error('should fail if no customer id')))
          .catch(e => {
            should.exist(e);
            e.message.should.equal('Order validation failed');
            done();
          });
      })
      .catch(done);
    });

    it('should fail with wrong customer id', done => {
      const event = new Event({
        eventId: 1,
        name: 'Event name',
        description: 'Description of the event',
        ticketPrice: 100,
        date: new Date()
      });

      event.save().then(savedEvent => {
        let order = new Order({
          event: savedEvent._id,
          customer: 123,
          tickets: 2,
        });

        return order.save()
          .then(saved => done(new Error('should fail if no customer id')))
          .catch(e => {
            should.exist(e);
            e.message.should.equal('Order validation failed');
            done();
          });
      })
      .catch(done);
    });

    it('should fail if no event id', done => {
      const customer = new Customer({
        email: 'test@test.com',
        username: 'test',
        firstName: 'test',
        lastName: 'test',
        phoneNumber: 1234567890
      });

      customer.save().then(savedCustomer => {
        let order = new Order({
          event: null,
          customer: savedCustomer._id,
          tickets: 2,
        });

        return order.save()
          .then(saved => done(new Error('should fail if no event id')))
          .catch(e => {
            should.exist(e);
            e.message.should.equal('Order validation failed');
            done();
          });
      })
      .catch(done);
    });

    it('should fail with wrong event id', done => {
      const customer = new Customer({
        email: 'test@test.com',
        username: 'test',
        firstName: 'test',
        lastName: 'test',
        phoneNumber: 1234567890
      });

      customer.save().then(savedCustomer => {
        let order = new Order({
          event: 123,
          customer: savedCustomer._id,
          tickets: 2,
        });

        return order.save()
          .then(saved => done(new Error('should fail with wrong event id')))
          .catch(e => {
            should.exist(e);
            e.message.should.equal('Order validation failed');
            done();
          });
      })
      .catch(done);
    });

  });

  describe('Retrieving an order', _ => {

    it('should retrieve an order', done => {
      let order;

      let savedEvent;
      let savedCustomer;

      const event = new Event({
        eventId: 1,
        name: 'Event name',
        description: 'Description of the event',
        ticketPrice: 100,
        date: new Date()
      });

      const customer = new Customer({
        email: 'test@test.com',
        username: 'test',
        firstName: 'test',
        lastName: 'test',
        phoneNumber: 1234567890
      });

      event.save().then(e => savedEvent = e)
      .then(_ => customer.save())
      .then(c => savedCustomer = c)
      .then(_ => {
        order = new Order({
          event: savedEvent._id,
          customer: savedCustomer._id,
          tickets: 2,
        });
        return order.save();
      })
      .then(_ => {
        return Order.find().then(retrievedOrders => {
          should.exist(retrievedOrders);
          retrievedOrders.should.be.Array();
          retrievedOrders.length.should.equal(1);
          const retrievedOrder = retrievedOrders[0];
          retrievedOrder.event.toString().should.equal(order.event.toString());
          retrievedOrder.customer.toString().should.equal(order.customer.toString());
          done();
        });
      })
      .catch(done);
    });

    it('can populate event and customer', done => {
      let order;

      let savedEvent;
      let savedCustomer;

      const event = new Event({
        eventId: 1,
        name: 'Event name',
        description: 'Description of the event',
        ticketPrice: 100,
        date: new Date()
      });

      const customer = new Customer({
        email: 'test@test.com',
        username: 'test',
        firstName: 'test',
        lastName: 'test',
        phoneNumber: 1234567890
      });

      event.save().then(e => savedEvent = e)
      .then(_ => customer.save())
      .then(c => savedCustomer = c)
      .then(_ => {
        order = new Order({
          event: savedEvent._id,
          customer: savedCustomer._id,
          tickets: 2,
        });
        return order.save();
      })
      .then(_ => {
        return Order
          .find()
          .populate('event customer')
          .then(retrievedOrders => {
            should.exist(retrievedOrders);
            retrievedOrders.should.be.Array();
            retrievedOrders.length.should.equal(1);
            const retrievedOrder = retrievedOrders[0];
            retrievedOrder.event._id.toString().should.equal(order.event.toString());
            retrievedOrder.customer._id.toString().should.equal(order.customer.toString());
            retrievedOrder.customer.email.should.equal(savedCustomer.email);
            retrievedOrder.event.name.should.equal(savedEvent.name);
            retrievedOrder.customer.toString().should.have.properties(Object.keys(savedCustomer.toString()));
            retrievedOrder.event.toString().should.have.properties(Object.keys(savedEvent.toString()));
            done();
          });
      })
      .catch(done);
    });

  });

  describe('createOrUpdate method', _ => {

    it('should create an order if it did not exist', done => {
      let order;

      let savedEvent;
      let savedCustomer;

      const event = new Event({
        eventId: 1,
        name: 'Event name',
        description: 'Description of the event',
        ticketPrice: 100,
        date: new Date()
      });

      const customer = new Customer({
        email: 'test@test.com',
        username: 'test',
        firstName: 'test',
        lastName: 'test',
        phoneNumber: 1234567890
      });

      event.save().then(e => savedEvent = e)
      .then(_ => customer.save())
      .then(c => savedCustomer = c)
      .then(_ => {
        order = new Order({
          event: savedEvent._id,
          customer: savedCustomer._id,
          tickets: 2,
        });
        return Order.createOrUpdate(savedEvent._id, savedCustomer._id, order);
      })
      .then(createdOrder => {
        should.exist(createdOrder);
        createdOrder.should.be.Object();
        order.event.toString().should.equal(createdOrder.event.toString());
        order.customer.toString().should.equal(createdOrder.customer.toString());
        createdOrder.should.have.properties(Object.keys(order));
        createdOrder.tickets.should.equal(2);
        done();
      })
      .catch(done);
    });

    it('should update an order if it already exist', done => {
      let order;

      let savedEvent;
      let savedCustomer;

      const event = new Event({
        eventId: 1,
        name: 'Event name',
        description: 'Description of the event',
        ticketPrice: 100,
        date: new Date()
      });

      const customer = new Customer({
        email: 'test@test.com',
        username: 'test',
        firstName: 'test',
        lastName: 'test',
        phoneNumber: 1234567890
      });

      event.save().then(e => savedEvent = e)
      .then(_ => customer.save())
      .then(c => savedCustomer = c)
      .then(_ => {
        order = new Order({
          event: savedEvent._id,
          customer: savedCustomer._id,
          tickets: 2,
        });
        return order.save();
      })
      .then(_ => {
        order.tickets = 5;
        return Order.createOrUpdate(savedEvent._id, savedCustomer._id, order);
      })
      .then(createdOrder => {
        should.exist(createdOrder);
        createdOrder.should.be.Object();
        order.event.toString().should.equal(createdOrder.event.toString());
        order.customer.toString().should.equal(createdOrder.customer.toString());
        createdOrder.should.have.properties(Object.keys(order));
        createdOrder.tickets.should.equal(5);
        done();
      })
      .catch(done);
    });

  });

});
