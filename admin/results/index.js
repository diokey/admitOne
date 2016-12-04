const Order = require('../../api/orders/order.model');
module.exports = function (app) {
  app.route('/')
      .get((req, res) => {
        res.render('index');
      });

  app.route('/results')
    .post((req, res) => {

      let {startEventId, endEventId} = req.body;
      let errors = [];

      startEventId = +startEventId;
      endEventId = +endEventId;


      if (!startEventId) {
        errors.push('Invalid Event Start Id');
      }

      if (!endEventId) {
        errors.push('Invalid Event End Id');
      }

      if (startEventId > endEventId) {
        errors.push('Start event Id can not be greater than end event ID');
      }

      if (errors.length > 0) {
        res.render('index', { errors });
        return;
      }

      Order.find()
      .where('canceled').equals(false)
      .populate('customer')
      .populate({
        path: 'event',
        match: { eventId: { $gte: startEventId, $lte: endEventId } }
      })
      .then(results => {
        //group event from the same customer.
        // no group by in mongodb :(
        results = results.filter(res => res.event !== null);
        let orders = {};

        results.forEach(order => {
          let key = order.event.eventId + '-' + order.customer.email;
          if (orders[key]) {
            let tmp = orders[key];
            order.tickets += tmp.tickets;
            orders[key] = order;
          } else {
            orders[key] = order;
          }
        });

        const agregated = Object.keys(orders).map(key => orders[key]);

        res.render('results', { results: agregated });
      }).catch(err => res.render('results'));

    });

};


