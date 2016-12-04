module.exports = {

  // Server port
  port: process.env.PORT || 8080,

  // MongoDB connection options
  mongo: {
    uri: process.env.MONGODB_URL || 'mongodb://localhost/admitOne',
    options: {
      db: {
        safe: true
      }
    }
  },
  populateDB: false
};
