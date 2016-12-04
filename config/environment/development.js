module.exports = {
  // MongoDB connection options
  mongo: {
    uri: process.env.MONGODB_DEV_URL || 'mongodb://localhost/admitOne-dev',
    options: {
      db: {
        safe: true
      }
    }
  },
  populateDB: true
};
