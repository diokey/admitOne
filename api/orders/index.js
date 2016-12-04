const OrderController = require('./order.controller');
const RestUtils = require('../../utils/restUtils');

module.exports = app => {
  app.route('/api/orders')
    .post(OrderController.purchase)
    .all(RestUtils.notImplemented);

  app.route('/api/orders/:orderId')
    .patch(OrderController.cancelation)
    .put(OrderController.exchange)
    .all(RestUtils.notImplemented);
};
