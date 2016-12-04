const mongoose    = require('mongoose');
const config      = require('../../config/environment');
const Event    = require('./event.model');
const request     = require('supertest');
const should      = require('should');
const app         = require('../../app');
const populate    = require('../../populate');

describe('Event API', _ => {

  beforeEach(done => {
      populate.removeEvents()
        .then(_ => done())
        .catch(done);
  });

  it('should respond with JSON with correct status on GET /api/events', done => {
    request(app)
      .get('/api/events')
      .expect(200)
      .expect('Content-type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.be.instanceof(Array);
        res.body.should.have.length(0);
        done(err);
      });
  });

  describe('Retrieving events', _ =>  {
    beforeEach(done => {
      Promise.all(populate.saveEvents())
        .then(_ => done())
        .catch(done);
    });

    afterEach(done => {
      populate.removeEvents()
        .then(_ => done())
        .catch(done);
    });

    it('should retreive populated events', done => {
      request(app)
        .get('/api/events')
        .expect(200)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.be.instanceof(Array);
          // 10 events were populated
          res.body.should.have.length(10);
          done(err);
        });
    });

  });

});
