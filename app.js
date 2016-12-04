const express   = require('express');
const http      = require('http');
const mongoose  = require('mongoose');
const config    = require('./config/environment');


let app;
let server;

app = express();
server = http.createServer(app);

// connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);
// Tell mongoose to use native promises
mongoose.Promise = global.Promise;

// load express configuration
require('./config/express')(app);
// load routes
require('./routes')(app);

function startServer () {
  const server = http.createServer(app);

  server.listen(config.port, _ => {
    console.log('Express server listening on %d in %s mode', config.port, app.get('env'));
  });

  return server;
}

function stopServer () {
  //close any open connection before stoping the server
  mongoose.connection.close( _ => {
    console.log('closing database connection...');
    process.exit(0);
  });
}


app.startServer = startServer;
app.stopServer = stopServer;

exports = module.exports = app;
