const path = require('path');

function requireEnv (env = 'development') {
  return env;
}

// All configurations will extend these options
const all = {
  env: process.env.NODE_ENV || 'development',

  // Root path of server
  root: path.normalize(__dirname + '/../../'),

  // client path
  client: path.normalize(__dirname + '/../../client'),

  // Server port
  port: process.env.PORT || 9000,

  // populate the DB with sample data?
  populateDB: false,

  // Secret for session
  secrets: {
    session: 'sshhh!!!'
  }

};

// Export the config object based on the NODE_ENV
const override = require('./' + requireEnv(process.env.NODE_ENV) + '.js') || {};
const env = Object.assign(all, override);
module.exports = env;
