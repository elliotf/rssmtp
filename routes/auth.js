var passport       = require('passport')
;

module.exports = function(app) {
  app.del('/session', function(req, res, next){
    if (req.isAuthenticated()) {
      req.logout();
      delete req.session.user;
    }

    return res.redirect('/');
  });

  app.namespace('/auth', function(){
    app.namespace('/google', function(){
      app.get(
        '/'
        , passport.authenticate(
          'google', {
            scope: [
              'https://www.googleapis.com/auth/userinfo.profile'
              , 'https://www.googleapis.com/auth/userinfo.email'
            ]
          }
        )
      );

      app.get(
        '/callback'
        , passport.authenticate(
          'google', {
            failureRedirect: '/login'
          }
        ),
        function(req, res) {
          res.redirect('/');
        }
      );
    });
  });
};
