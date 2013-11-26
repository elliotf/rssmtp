var passport       = require('passport')
  , User           = require('../models').User
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
;

module.exports = function AuthMiddleware(app) {
  var secret   = process.env.GOOGLE_OAUTH_SECRET || '';
  var clientId = process.env.GOOGLE_OAUTH_ID     || '';
  var redirect = process.env.GOOGLE_OAUTH_FQDN   || '';
  redirect = redirect + "/auth/google/callback";

  passport.use(new GoogleStrategy({
      clientSecret:  secret
      , clientID:    clientId
      , callbackURL: redirect
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOrCreateFromOAUTH(profile, function(err, user){
        if (err) return done(err);

        done(null, user);
      });
    }
  ));

  passport.serializeUser(function(user, done){
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done){
    User.find(id).done(done);
  });

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(function(req, res, next){
    res.locals.user = req.user;
    next();
  });
};

module.exports.loginRequired = function(req, res, next) {
  if (req.isAuthenticated()) return next();

  // FIXME:: store something in the session to record where they were trying to go

  res.redirect('/');
};
