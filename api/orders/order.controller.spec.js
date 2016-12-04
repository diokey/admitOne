const mongoose    = require('mongoose');
const config      = require('../../config/environment');
const Order       = require('./order.model');
const request     = require('supertest');
const should      = require('should');
const app         = require('../../app');
const populate    = require('../../populate');

describe('Order API', _ => {

  describe('Purchase API', _ =>  {
    let savedEvents = [];
    let savedCustomers = [];

    beforeEach(done => {
      Promise.resolve()
        .then(populate.saveEvents)
        .then(populate.resolve)
        .then(res => savedEvents = res)
        .then(populate.saveCustomers)
        .then(populate.resolve)
        .then(res => savedCustomers = res)
        .then(_ => done())
        .catch(done);
    });

    afterEach(done => {
      populate.removeOrders()
        .then(populate.removeCustomers)
        .then(populate.removeEvents)
        .then(_ => done())
        .catch(done);
    });

    it('should create a purchase', done => {
      const randomEventIndex = Math.floor(Math.random() * 10);
      const randomCustomerIndex = Math.floor(Math.random() * 10);
      const randomNbTickets = Math.ceil(Math.random() * 10);

      const randomEvent = savedEvents[randomEventIndex];
      const randomCustomer = savedCustomers[randomCustomerIndex];

      const order = {
        eventId: randomEvent.eventId,
        username: randomCustomer.username,
        nbTickets: randomNbTickets
      };
      request(app)
        .post('/api/orders')
        .send(order)
        .expect(201)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res.body);
          res.body.should.be.Object();
          res.body.should.have.properties(['customer', 'event', 'tickets']);
          done(err);
        });
    });

    it('should fail if nbTickets is not > 0', done => {
      const randomEventIndex = Math.floor(Math.random() * 10);
      const randomCustomerIndex = Math.floor(Math.random() * 10);

      const randomEvent = savedEvents[randomEventIndex];
      const randomCustomer = savedCustomers[randomCustomerIndex];

      const order = {
        eventId: randomEvent.eventId,
        username: randomCustomer.username,
        nbTickets: 0
      };
      request(app)
        .post('/api/orders')
        .send(order)
        .expect(400)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res.body);
          res.body.should.be.Object();
          res.body.should.have.properties(['code', 'message', 'errors']);
          const errors = res.body.errors;
          errors.should.be.Array();
          errors.should.have.length(1);
          const expectedErrorMessage = 'Number of ticket must be > 0';
          expectedErrorMessage.should.equal(errors[0].nbTickets);
          done(err);
        });
    });

    it('should fail if nbTickets is not a number', done => {
      const randomEventIndex = Math.floor(Math.random() * 10);
      const randomCustomerIndex = Math.floor(Math.random() * 10);

      const randomEvent = savedEvents[randomEventIndex];
      const randomCustomer = savedCustomers[randomCustomerIndex];

      const order = {
        eventId: randomEvent.eventId,
        username: randomCustomer.username,
        nbTickets: 'abc'
      };
      request(app)
        .post('/api/orders')
        .send(order)
        .expect(400)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res.body);
          res.body.should.be.Object();
          res.body.should.have.properties(['code', 'message', 'errors']);
          const errors = res.body.errors;
          errors.should.be.Array();
          errors.should.have.length(1);
          const expectedErrorMessage = 'Number of ticket must be > 0';
          expectedErrorMessage.should.equal(errors[0].nbTickets);
          done(err);
        });
    });

    it('should fail if no username is given', done => {

      const randomEventIndex = Math.floor(Math.random() * 10);
      const randomNbTickets = Math.ceil(Math.random() * 10);

      const randomEvent = savedEvents[randomEventIndex];

      const order = {
        eventId: randomEvent.eventId,
        username: '',
        nbTickets: randomNbTickets
      };

      request(app)
        .post('/api/orders')
        .send(order)
        .expect(400)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res.body);
          res.body.should.be.Object();
          res.body.should.have.properties(['code', 'message', 'errors']);
          const errors = res.body.errors;
          errors.should.be.Array();
          errors.should.have.length(1);
          const expectedErrorMessage = 'Username is a required field';
          expectedErrorMessage.should.equal(errors[0].username);
          done(err);
        });
    });

    it('should fail if wrong username is given', done => {

      const randomEventIndex = Math.floor(Math.random() * 10);
      const randomNbTickets = Math.ceil(Math.random() * 10);

      const randomEvent = savedEvents[randomEventIndex];

      const order = {
        eventId: randomEvent.eventId,
        username: 'john.smith',
        nbTickets: randomNbTickets
      };

      request(app)
        .post('/api/orders')
        .send(order)
        .expect(400)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res.body);
          res.body.should.be.Object();
          res.body.should.have.properties(['code', 'message', 'errors']);
          const errors = res.body.errors;
          errors.should.be.Array();
          errors.should.have.length(1);
          const expectedErrorMessage = 'Unkown username: ' + order.username;
          expectedErrorMessage.should.equal(errors[0].username);
          done(err);
        });
    });

    it('should fail if event Id is given', done => {

      const randomCustomerIndex = Math.floor(Math.random() * 10);
      const randomNbTickets = Math.ceil(Math.random() * 10);

      const randomCustomer = savedCustomers[randomCustomerIndex];

      const order = {
        eventId: '',
        username: randomCustomer.username,
        nbTickets: randomNbTickets
      };

      request(app)
        .post('/api/orders')
        .send(order)
        .expect(400)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res.body);
          res.body.should.be.Object();
          res.body.should.have.properties(['code', 'message', 'errors']);
          const errors = res.body.errors;
          errors.should.be.Array();
          errors.should.have.length(1);
          const expectedErrorMessage = 'Event id is a required field';
          expectedErrorMessage.should.equal(errors[0].eventId);
          done(err);
        });
    });

    it('should fail if wrong event Id is given', done => {

      const randomCustomerIndex = Math.floor(Math.random() * 10);
      const randomNbTickets = Math.ceil(Math.random() * 10);

      const randomCustomer = savedCustomers[randomCustomerIndex];

      const order = {
        eventId: 123456,
        username: randomCustomer.username,
        nbTickets: randomNbTickets
      };

      request(app)
        .post('/api/orders')
        .send(order)
        .expect(400)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res.body);
          res.body.should.be.Object();
          res.body.should.have.properties(['code', 'message', 'errors']);
          const errors = res.body.errors;
          errors.should.be.Array();
          errors.should.have.length(1);
          const expectedErrorMessage = 'Invalid event Id: ' + order.eventId;
          expectedErrorMessage.should.equal(errors[0].eventId);
          done(err);
        });
    });

  });

  describe('Cancellation API', _ =>  {
    let savedEvents = [];
    let savedCustomers = [];

    beforeEach(done => {
      Promise.resolve()
        .then(populate.saveEvents)
        .then(populate.resolve)
        .then(res => savedEvents = res)
        .then(populate.saveCustomers)
        .then(populate.resolve)
        .then(res => savedCustomers = res)
        .then(_ => done())
        .catch(done);
    });

    afterEach(done => {
      populate.removeOrders()
        .then(populate.removeCustomers)
        .then(populate.removeEvents)
        .then(_ => done())
        .catch(done);
    });


    it('should cancel tickets', done => {
      const randomEventIndex = Math.floor(Math.random() * 10);
      const randomCustomerIndex = Math.floor(Math.random() * 10);
      const randomNbTickets = Math.ceil(Math.random() * 10) + 1;

      const randomEvent = savedEvents[randomEventIndex];
      const randomCustomer = savedCustomers[randomCustomerIndex];

      const order = new Order({
        event: randomEvent._id,
        customer: randomCustomer._id,
        tickets: randomNbTickets
      });

      const cancelOrder = {
        eventId: randomEvent.eventId,
        username: randomCustomer.username,
        nbTickets: randomNbTickets - 1
      };

      order.save().then(savedOrder=> {
        request(app)
          .patch('/api/orders/' + savedOrder._id)
          .send(cancelOrder)
          .expect(200)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            should.exist(res.body);
            res.body.should.be.Object();
            res.body.should.have.properties(['customer', 'event', 'tickets']);
            res.body.tickets.should.equal(1);
            res.body.canceled.should.equal(false);
            done();
          });
      }).catch(done);

    });

    it('should cancel a purchase when ticket is 0', done => {
      const randomEventIndex = Math.floor(Math.random() * 10);
      const randomCustomerIndex = Math.floor(Math.random() * 10);
      const randomNbTickets = Math.ceil(Math.random() * 10) + 1;

      const randomEvent = savedEvents[randomEventIndex];
      const randomCustomer = savedCustomers[randomCustomerIndex];

      const order = new Order({
        event: randomEvent._id,
        customer: randomCustomer._id,
        tickets: randomNbTickets
      });

      const cancelOrder = {
        eventId: randomEvent.eventId,
        username: randomCustomer.username,
        nbTickets: randomNbTickets
      };

      order.save().then(savedOrder=> {
        request(app)
          .patch('/api/orders/' + savedOrder._id)
          .send(cancelOrder)
          .expect(200)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            should.exist(res.body);
            res.body.should.be.Object();
            res.body.should.have.properties(['customer', 'event', 'tickets']);
            res.body.tickets.should.equal(0);
            res.body.canceled.should.equal(true);
            done();
          });
      }).catch(done);

    });

    it('should fail when canceling more than purchashed', done => {
      const randomEventIndex = Math.floor(Math.random() * 10);
      const randomCustomerIndex = Math.floor(Math.random() * 10);
      const randomNbTickets = Math.ceil(Math.random() * 10) + 1;

      const randomEvent = savedEvents[randomEventIndex];
      const randomCustomer = savedCustomers[randomCustomerIndex];

      const order = new Order({
        event: randomEvent._id,
        customer: randomCustomer._id,
        tickets: randomNbTickets
      });

      const cancelOrder = {
        eventId: randomEvent.eventId,
        username: randomCustomer.username,
        nbTickets: randomNbTickets + 1
      };

      order.save().then(savedOrder=> {
        request(app)
          .patch('/api/orders/' + savedOrder._id)
          .send(cancelOrder)
          .expect(400)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            should.exist(res.body);
            res.body.should.be.Object();
            res.body.should.have.properties(['code', 'message', 'errors']);
            const errors = res.body.errors;
            errors.should.be.Array();
            errors.should.have.length(1);
            const expectedErrorMessage = 'Can not cancel more tickets than bought on the order ' + savedOrder._id;
            expectedErrorMessage.should.equal(errors[0].nbTickets);
            done(err);
          });
      }).catch(done);
    });

    it('should fail when given the wrong order id', done => {
      const randomEventIndex = Math.floor(Math.random() * 10);
      const randomCustomerIndex = Math.floor(Math.random() * 10);
      const randomNbTickets = Math.ceil(Math.random() * 10) + 1;

      const randomEvent = savedEvents[randomEventIndex];
      const randomCustomer = savedCustomers[randomCustomerIndex];

      const order = new Order({
        event: randomEvent._id,
        customer: randomCustomer._id,
        tickets: randomNbTickets
      });

      const cancelOrder = {
        eventId: randomEvent.eventId,
        username: randomCustomer.username,
        nbTickets: randomNbTickets
      };

      order.save().then(savedOrder=> {
        request(app)
          .patch('/api/orders/' + '12345')
          .send(cancelOrder)
          .expect(400)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            should.exist(res.body);
            res.body.should.be.Object();
            res.body.should.have.properties(['code', 'message', 'errors']);
            const errors = res.body.errors;
            errors.should.be.Array();
            errors.should.have.length(1);
            const expectedErrorMessage = 'Order id is invalid';
            expectedErrorMessage.should.equal(errors[0].orderId);
            done(err);
          });
      }).catch(done);
    });

    it('should fail when given the wrong event id', done => {
      const randomEventIndex = Math.floor(Math.random() * 10);
      const randomCustomerIndex = Math.floor(Math.random() * 10);
      const randomNbTickets = Math.ceil(Math.random() * 10) + 1;

      const randomEvent = savedEvents[randomEventIndex];
      const randomCustomer = savedCustomers[randomCustomerIndex];

      const order = new Order({
        event: randomEvent._id,
        customer: randomCustomer._id,
        tickets: randomNbTickets
      });

      const cancelOrder = {
        eventId: 12345,
        username: randomCustomer.username,
        nbTickets: randomNbTickets
      };

      order.save().then(savedOrder=> {
        request(app)
          .patch('/api/orders/' + savedOrder._id)
          .send(cancelOrder)
          .expect(400)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            should.exist(res.body);
            res.body.should.be.Object();
            res.body.should.have.properties(['code', 'message', 'errors']);
            const errors = res.body.errors;
            errors.should.be.Array();
            errors.should.have.length(1);
            const expectedErrorMessage = 'No event ' + cancelOrder.eventId + ' on the order ' + savedOrder._id;
            expectedErrorMessage.should.equal(errors[0].eventId);
            done(err);
          });
      }).catch(done);
    });

    it('should fail when given the wrong username', done => {
      const randomEventIndex = Math.floor(Math.random() * 10);
      const randomCustomerIndex = Math.floor(Math.random() * 10);
      const randomNbTickets = Math.ceil(Math.random() * 10) + 1;

      const randomEvent = savedEvents[randomEventIndex];
      const randomCustomer = savedCustomers[randomCustomerIndex];

      const order = new Order({
        event: randomEvent._id,
        customer: randomCustomer._id,
        tickets: randomNbTickets
      });

      const cancelOrder = {
        eventId: randomEvent.eventId,
        username: 'abcde',
        nbTickets: randomNbTickets
      };

      order.save().then(savedOrder=> {
        request(app)
          .patch('/api/orders/' + savedOrder._id)
          .send(cancelOrder)
          .expect(400)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            should.exist(res.body);
            res.body.should.be.Object();
            res.body.should.have.properties(['code', 'message', 'errors']);
            const errors = res.body.errors;
            errors.should.be.Array();
            errors.should.have.length(1);
            const expectedErrorMessage = 'The customer ' + cancelOrder.username + ' does not own the order ' + savedOrder._id;
            expectedErrorMessage.should.equal(errors[0].username);
            done(err);
          });
      }).catch(done);
    });

  });

  describe('Exchange API', _ =>  {
    let savedEvents = [];
    let savedCustomers = [];

    beforeEach(done => {
      Promise.resolve()
        .then(populate.saveEvents)
        .then(populate.resolve)
        .then(res => savedEvents = res)
        .then(populate.saveCustomers)
        .then(populate.resolve)
        .then(res => savedCustomers = res)
        .then(_ => done())
        .catch(done);
    });

    afterEach(done => {
      populate.removeOrders()
        .then(populate.removeCustomers)
        .then(populate.removeEvents)
        .then(_ => done())
        .catch(done);
    });

    it('should exchange tickets when there is an order for both events', done => {

      const eventA = savedEvents[0];
      const customerA = savedCustomers[0];

      const eventB = savedEvents[1];

      const firstOrder = new Order({
        event: eventA._id,
        customer: customerA._id,
        tickets: 5 //buy 5 tickets in event A
      });

      const secondOrder = new Order({
        event: eventB._id,
        customer: customerA._id,
        tickets: 2 //buy 2 tickets in event B
      });

      //echange 2 tickets from event A to B. Event A should now have 3 tickets and event B will have 4
      const exchangeOrder = {
        username: customerA.username,
        originEventId: eventA.eventId,
        destEventId: eventB.eventId,
        nbTickets: 2
      };

      Promise.all([firstOrder.save(), secondOrder.save()])
        .then(res => {
          let [orderA, orderB] = res;

          request(app)
            .put('/api/orders/' + orderA._id)
            .send(exchangeOrder)
            .expect(200)
            .expect('Content-type', /json/)
            .end(function (err, res) {
              should.not.exist(err);
              should.exist(res.body);
              res.body.should.be.Object();
              res.body.should.have.properties(['customer', 'event', 'tickets']);
              res.body._id.toString().should.equal(orderA._id.toString());
              res.body.tickets.should.equal(orderA.tickets - exchangeOrder.nbTickets);
              Order.findById(orderB._id).then(retrieved => {
                should.exist(retrieved);
                retrieved.should.be.Object();
                retrieved.tickets.should.equal(orderB.tickets + exchangeOrder.nbTickets);
                done(err);
              }).catch(done);
            });
        }).catch(done);
    });

    it('should create an new order if no order for both events', done => {

      const eventA = savedEvents[0];
      const customerA = savedCustomers[0];

      const eventB = savedEvents[1];

      const firstOrder = new Order({
        event: eventA._id,
        customer: customerA._id,
        tickets: 5 //buy 5 tickets in event A
      });

      //echange 2 tickets from event A to B. Event B does not yet any order yet. So, Event A should now have 3 tickets and event B will have 2
      const exchangeOrder = {
        username: customerA.username,
        originEventId: eventA.eventId,
        destEventId: eventB.eventId,
        nbTickets: 2
      };

      firstOrder.save()
        .then(res => {
          let orderA = res;

          request(app)
            .put('/api/orders/' + orderA._id)
            .send(exchangeOrder)
            .expect(200)
            .expect('Content-type', /json/)
            .end(function (err, res) {
              should.not.exist(err);
              should.exist(res.body);
              res.body.should.be.Object();
              res.body.should.have.properties(['customer', 'event', 'tickets']);
              res.body._id.toString().should.equal(orderA._id.toString());
              res.body.tickets.should.equal(orderA.tickets - exchangeOrder.nbTickets);
              Order.findOne({event: eventB._id}).then(retrieved => {
                should.exist(retrieved);
                retrieved.should.be.Object();
                retrieved.tickets.should.equal(exchangeOrder.nbTickets);
                done(err);
              }).catch(done);
            });
        }).catch(done);
    });

    it('should fail when given the wrong username', done => {
      const eventA = savedEvents[0];
      const customerA = savedCustomers[0];

      const eventB = savedEvents[1];
      const customerB = savedCustomers[1];

      const order = new Order({
        event: eventA._id,
        customer: customerA._id,
        tickets: 5 //buy 5 tickets in event A
      });

      const exchangeOrder = {
        username: customerB.username, //wrong user
        originEventId: eventA.eventId,
        destEventId: eventB.eventId,
        nbTickets: 2
      };

      order.save().then(savedOrder => {
        request(app)
          .put('/api/orders/' + savedOrder._id)
          .send(exchangeOrder)
          .expect(400)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            should.exist(res.body);
            res.body.should.be.Object();
            res.body.should.have.properties(['code', 'message', 'errors']);
            const errors = res.body.errors;
            errors.should.be.Array();
            errors.should.have.length(1);
            const expectedErrorMessage = 'The customer ' + exchangeOrder.username + ' does not own the order ' + savedOrder._id;
            expectedErrorMessage.should.equal(errors[0].username);
            done(err);
          });
      }).catch(done);
    });

    it('should fail when given the wrong event id', done => {
      const eventA = savedEvents[0];
      const customerA = savedCustomers[0];

      const eventB = savedEvents[1];
      const customerB = savedCustomers[1];

      const order = new Order({
        event: eventA._id,
        customer: customerA._id,
        tickets: 5 //buy 5 tickets in event A
      });

      const exchangeOrder = {
        username: customerA.username,
        originEventId: eventB.eventId, //org, dest are swapped
        destEventId: eventA.eventId,
        nbTickets: 2
      };

      order.save().then(savedOrder => {
        request(app)
          .put('/api/orders/' + savedOrder._id)
          .send(exchangeOrder)
          .expect(400)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            should.exist(res.body);
            res.body.should.be.Object();
            res.body.should.have.properties(['code', 'message', 'errors']);
            const errors = res.body.errors;
            errors.should.be.Array();
            errors.should.have.length(1);
            const expectedErrorMessage = 'No event ' + eventB.eventId + ' on the order ' + savedOrder._id;
            expectedErrorMessage.should.equal(errors[0].originEventId);
            done(err);
          });
      }).catch(done);
    });

    it('should fail when exchanging with the same event id', done => {
      const eventA = savedEvents[0];
      const customerA = savedCustomers[0];

      const eventB = savedEvents[1];
      const customerB = savedCustomers[1];

      const order = new Order({
        event: eventA._id,
        customer: customerA._id,
        tickets: 5 //buy 5 tickets in event A
      });

      const exchangeOrder = {
        username: customerA.username,
        originEventId: eventA.eventId,
        destEventId: eventA.eventId, //same event id
        nbTickets: 2
      };

      order.save().then(savedOrder => {
        request(app)
          .put('/api/orders/' + savedOrder._id)
          .send(exchangeOrder)
          .expect(400)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            should.exist(res.body);
            res.body.should.be.Object();
            res.body.should.have.properties(['code', 'message', 'errors']);
            const errors = res.body.errors;
            errors.should.be.Array();
            errors.should.have.length(1);
            const expectedErrorMessage = 'The destination event id is the same as the origin';
            expectedErrorMessage.should.equal(errors[0].destEventId);
            done(err);
          });
      }).catch(done);
    });

    it('should fail when exchanging more than available tickets', done => {
      const eventA = savedEvents[0];
      const customerA = savedCustomers[0];

      const eventB = savedEvents[1];
      const customerB = savedCustomers[1];

      const order = new Order({
        event: eventA._id,
        customer: customerA._id,
        tickets: 5 //buy 5 tickets in event A
      });

      const exchangeOrder = {
        username: customerA.username,
        originEventId: eventA.eventId,
        destEventId: eventB.eventId,
        nbTickets: 6 //exchange 6 tickets
      };

      order.save().then(savedOrder => {
        request(app)
          .put('/api/orders/' + savedOrder._id)
          .send(exchangeOrder)
          .expect(400)
          .expect('Content-type', /json/)
          .end(function (err, res) {
            should.not.exist(err);
            should.exist(res.body);
            res.body.should.be.Object();
            res.body.should.have.properties(['code', 'message', 'errors']);
            const errors = res.body.errors;
            errors.should.be.Array();
            errors.should.have.length(1);
            const expectedErrorMessage = 'Can not exchange more tickets than bought on the order ' + order._id;
            expectedErrorMessage.should.equal(errors[0].nbTickets);
            done(err);
          });
      }).catch(done);
    });

  });

});
