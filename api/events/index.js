const EventController = require('./event.controller');
const RestUtils = require('../../utils/restUtils');

module.exports = app => {

  // treat /api/events aka /api/shows
  app.route(/\/api\/(events|shows)/)
    .get(EventController.index)
    .all(RestUtils.notImplemented);
};
