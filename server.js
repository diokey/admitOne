const app       = require('./app');
const populate  = require('./populate');
const config    = require('./config/environment');

process.on('SIGINT', app.stopServer)
       .on('SIGTERM', app.stopServer);

// Populate DB with sample data
if (config.populateDB) {
  populate.populate()
    .then( _ => app.startServer() )
    .catch(e => {
      //start the app anyway bug log the error
      console.log(e);
      app.startServer();
    });
} else {
  app.startServer();
}

