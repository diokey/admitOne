const Event = require('./event.model');

const index = (req, res) => {
  Event.find()
    .then(events => res.status(200).json(events));
};

exports.index = index;
