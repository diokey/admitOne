const mongoose  = require('mongoose');
const should    = require('should');
const Customer  = require('./customer.model');
const config    = require('../../config/environment');

mongoose.Promise = global.Promise;

let customer;

describe('Customer Model', function () {

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
    Customer.remove().exec().then(_ => {
      customer = new Customer({
        email: 'test@test.com',
        username: 'test',
        firstName: 'test',
        lastName: 'test',
        phoneNumber: 1234567890
      });
      done();
    }).catch(done);
  });

  it('should begin with no customer', done => {
    Customer.find({}).exec().then(customers => {
      customers.should.have.length(0);
      done();
    }).catch(done);
  });

  describe('Saving a customer', _ => {
    it('should save a customer', done => {
      customer.save().then(e => {
        should.exist(e);
        done();
      }).catch(done);
    });

    it('should fail when saving without a username', done => {
      customer.username = '';
      customer.save().catch(err => {
        should.exist(err);
        done();
      });
    });

    it('should fail when saving without an email', done => {
      customer.email = '';
      customer.save().catch(err => {
        should.exist(err);
        done();
      });
    });

    it('should  fail when saving a duplicate username for customer', done => {
      customer.save()
        .then(savedCustomer => {
          const newCustomer = new Customer({
            email: 'abc@test.com',
            username: savedCustomer.username,
            firstName: 'abc',
            lastName: 'abc',
            phoneNumber: 1234567890
          });
          return newCustomer.save();
        })
        .then(newSavedCustomer => {
          // shouldn't save
          done(new Error('should fail when saving a duplicate username'));
        })
        .catch(e => {
          should.exist(e);
          expectedErrorMessage = 'Customer validation failed';
          expectedErrorMessage.should.equal(e.message);
          done();
        });
    });

    it('should  fail when saving a duplicate email for customer', done => {
      customer.save()
        .then(savedCustomer => {
          const newCustomer = new Customer({
            email: savedCustomer.email,
            username: 'abc',
            firstName: 'abc',
            lastName: 'abc',
            phoneNumber: 1234567890
          });
          return newCustomer.save();
        })
        .then(newSavedCustomer => {
          // shouldn't save
          done(new Error('should fail when saving a duplicate username'));
        })
        .catch(e => {
          should.exist(e);
          expectedErrorMessage = 'Customer validation failed';
          expectedErrorMessage.should.equal(e.message);
          done();
        });
    });

  });


  describe('Retrieving customers', _ => {

    let customers = [];
    beforeEach( done => {
      customers = [
        new Customer({
          email: 'test2@test.com',
          username: 'test2',
          firstName: 'test2',
          lastName: 'test',
          phoneNumber: 2234567890
        }) ,
        new Customer({
          email: 'test3@test.com',
          username: 'test3',
          firstName: 'test3',
          lastName: 'test',
          phoneNumber: 3234567890
        })
      ];
      done();
    });

    it('should retrieve all customers', done => {
      const customersPromise = customers.map(customer => customer.save());

      Promise.all(customersPromise).then(savedCustomers => {
        Customer.find().then(retrievedCustomers => {
          retrievedCustomers.length.should.equal(savedCustomers.length);
          done();
        });
      }).catch(done);
    });

    it('should retrieve a customer', done => {
      const customersPromise = customers.map(customer => customer.save().catch(done));

      Promise.all(customersPromise).then(savedCustomers => {
        const customer1 = savedCustomers[0];
        Customer.findOne({ email: customer1.email }).then(retrievedCustomer => {
          retrievedCustomer.should.be.Object();
          retrievedCustomer.should.be.instanceOf(Customer);
          customer1._id.toString().should.equal(retrievedCustomer._id.toString());
          customer1.email.toString().should.equal(retrievedCustomer.email.toString());
          done();
        }).catch(done);
      }).catch(done);
    });

  });

});



