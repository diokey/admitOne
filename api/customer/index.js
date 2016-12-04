const CustomerController = require('./customer.controller');
const RestUtils = require('../../utils/restUtils');

module.exports = app => {

  app.route('/api/customers')
    .get(CustomerController.index)
    .all(RestUtils.notImplemented);

};
