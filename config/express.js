/**
 * Express config
 */
const express         = require('express');
const exphbs          = require('express-handlebars');
const bodyParser      = require('body-parser');
const methodOverride  = require('method-override');
const cookieParser    = require('cookie-parser');
const session         = require('express-session');
const errorHandler    = require('errorhandler');
const morgan          = require('morgan');
const config          = require('./environment');

module.exports = app => {
  const env = app.get('env');

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(methodOverride());
  app.use(session({
    secret: config.secrets.session,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  }));

  // Use handlebars templating system
  app.engine('handlebars', exphbs({
    layoutsDir: config.client + '/layouts/',
    defaultLayout: 'main',
    partialsDir: [config.client + '/partials/']
  }));
  app.set('views', config.client);
  app.set('view engine', 'handlebars');

  // serve static files
  app.use(express.static(config.root + '/public'));

  if (env === 'development' || env === 'test') {
    app.use(morgan('dev'));
    app.use(errorHandler());
  }

};
