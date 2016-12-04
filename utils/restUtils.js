const notImplemented = (req, res) => {
  return res.status(501).json({
    code : 501,
    message : 'Not Implemented',
    description : 'The server does not support the functionality required to fulfill the request.'
  });
};

exports.notImplemented = notImplemented;
