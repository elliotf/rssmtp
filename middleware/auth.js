var passport       = require('passport')
  , User           = require('../models/user')
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
;

module.exports = function AuthMiddleware(options) {
  var google = {
    clientId: process.env.GOOGLE_OAUTH_ID
    , secret: process.env.GOOGLE_OAUTH_SECRET
    , fqdn:   process.env.GOOGLE_OAUTH_FQDN
  };
  var app = options.app;

  passport.use(new GoogleStrategy({
      clientID:     google.clientId,
      clientSecret: google.secret,
      callbackURL:  google.fqdn + "/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      User.getOrCreateByProfileData(profile, function(err, user){
        if (err) return done(err);

        done(null, user);
      });
    }
  ));

  passport.serializeUser(function(user, done){
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done){
    User.findById(id).populate('_pools').exec(done);
  });

  app.use(passport.initialize());
  app.use(passport.session());

  return function(req, res, next){
    res.locals.user = req.user;
    next();
  };
};

module.exports.loginRequired = function(req, res, next) {
  if (req.isAuthenticated()) return next();

  // FIXME:: store something in the session to record where they were trying to go

  res.redirect('/login');
};
