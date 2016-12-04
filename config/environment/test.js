module.exports = {
  // MongoDB connection options
  mongo: {
    uri: process.env.MONGODB_TEST_URL || 'mongodb://localhost/admitOne-test',
    options: {
      db: {
        safe: true
      }
    }
  },
  populateDB: true,
  port: 7000
};
