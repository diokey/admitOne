const mongoose  = require('mongoose');
const should    = require('should');
const Event      = require('./event.model');
const config    = require('../../config/environment');

mongoose.Promise = global.Promise;

let event;

describe('Event Model', function () {

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
    Event.remove().exec().then(_ => {
      event = new Event({
        eventId: 1,
        name: 'Event name',
        description: 'Description of the event',
        ticketPrice: 100,
        date: new Date()
      });
      done();
    }).catch(done);
  });

  it('should begin with no event', done => {
    Event.find({}).exec().then(events => {
      events.should.have.length(0);
      done();
    }).catch(done);
  });

  describe('Saving an event', _ => {
    it('should save an event', done => {
      event.save().then(e => {
        should.exist(e);
        done();
      }).catch(done);
    });

    it('should fail when saving without an name', done => {
      event.name = '';
      event.save().catch(err => {
        should.exist(err);
        done();
      });
    });

    it('should fail when saving without event id', done => {
      event.eventId = '';
      event.save().catch(err => {
        should.exist(err);
        done();
      });
    });

    it('should  fail when saving a duplicate username for event', done => {
      event.save()
        .then(savedEvent => {
          const newEvent = new Event({
            eventId: savedEvent.eventId,
            name: 'Event name',
            description: 'Description of the event',
            ticketPrice: 100,
            date: new Date()
          });
          return newEvent.save();
        })
        .then(newSavedEvent => {
          // shouldn't save
          done(new Error('should fail when saving a duplicate username'));
        })
        .catch(e => {
          should.exist(e);
          expectedErrorMessage = 'Event validation failed';
          expectedErrorMessage.should.equal(e.message);
          done();
        });
    });

  });

  describe('Retrieving events', _ => {

    let events = [];
    beforeEach( done => {
      events = [
        new Event({
          eventId: 2,
          name: 'Event 2',
          description: 'Description of event 2',
          ticketPrice: 100,
          date: new Date()
        }) ,
        new Event({
          eventId: 3,
          name: 'Event 3',
          description: 'Description of event 3',
          ticketPrice: 100,
          date: new Date()
        })
      ];
      done();
    });

    it('should retrieve all events', done => {
      const eventsPromise = events.map(event => event.save());

      Promise.all(eventsPromise).then(savedEvents => {
        Event.find().then(retrievedEvents => {
          retrievedEvents.length.should.equal(savedEvents.length);
          done();
        }).catch(done);
      }).catch(done);
    });

    it('should retrieve an event', done => {
      const eventsPromise = events.map(event => event.save().catch(done));

      Promise.all(eventsPromise).then(savedEvents => {
        const event1 = savedEvents[0];
        Event.findOne({ eventId: event1.eventId }).then(retrievedEvent => {
          retrievedEvent.should.be.Object();
          retrievedEvent.should.be.instanceOf(Event);
          event1._id.toString().should.equal(retrievedEvent._id.toString());
          event1.name.toString().should.equal(retrievedEvent.name.toString());
          done();
        }).catch(done);
      }).catch(done);
    });

  });

});



