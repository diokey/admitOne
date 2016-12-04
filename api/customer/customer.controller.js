const Customer = require('./customer.model');

const index = (req, res) => {
  Customer.find()
    .then(customers => res.status(200).json(customers));
};

exports.index = index;
