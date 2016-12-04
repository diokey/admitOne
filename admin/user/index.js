const User = require('./user.model');

module.exports = function (app) {
  app.route('/login')
      .get((req, res) => {
        res.render('login', {
          title: 'AdmitOne'
        });
      })
      .post((req, res) => {
        const {username, password} = req.body;

        User.findOne({username: username})
          .then(user => {
            if (!user || ! user.authenticate(password)) {
              res.render('login', {
                title: 'AdmitOne',
                logInError: 'Invalid username and/or password'
              });
            } else {
              delete user.password;
              req.session.user = user;
              res.redirect('/');
            }
          })
          .catch(e => {
            console.log(e);
            const msg = env.environment == 'production' ? '' :  e.message;
            res.render('login', {
              title: 'AdmitOne',
              logInError: 'An error occured ' + msg
            });
          });
      });

};


