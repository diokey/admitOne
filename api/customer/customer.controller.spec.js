const mongoose    = require('mongoose');
const config      = require('../../config/environment');
const Customer    = require('./customer.model');
const request     = require('supertest');
const should      = require('should');
const app         = require('../../app');
const populate    = require('../../populate');

describe('Customer API', _ => {

  beforeEach(done => {
      populate.removeCustomers()
        .then(_ => done())
        .catch(done);
  });

  it('should respond with JSON with correct status on GET /api/customers', done => {
    request(app)
      .get('/api/customers')
      .expect(200)
      .expect('Content-type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.be.instanceof(Array);
        res.body.should.have.length(0);
        done(err);
      });
  });

  describe('Retrieving customers', _ =>  {
    beforeEach(done => {
      Promise.all(populate.saveCustomers())
        .then(_ => done())
        .catch(done);
    });

    afterEach(done => {
      populate.removeCustomers()
        .then(_ => done())
        .catch(done);
    });

    it('should retreive populated customers', done => {
      request(app)
        .get('/api/customers')
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.be.instanceof(Array);
          // 10 customers were populated
          res.body.should.have.length(10);
          done(err);
        });
    });

  });

});
