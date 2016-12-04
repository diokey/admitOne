const fs      = require('fs');
const config  = require('./config/environment');

const ensureAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    res.redirect('/login');
    return;
  }
  next();
};

module.exports = function (app) {
  // automatically load api modules
  const apiUri  = config.root + 'api/';
  const modules = fs.readdirSync(apiUri);
  modules.forEach(module => require(apiUri + module)(app));

  require('./admin/user')(app);
  //protect admin pages
  app.use(ensureAuthenticated);
  require('./admin/results')(app);

  // all other routes not found
  app.route('/*')
    .all((req, res) => {
        res.send('not Found');
      });

};
