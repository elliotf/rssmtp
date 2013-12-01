var express   = require('express')
  , path      = require('path')
  , namespace = require('express-namespace')
  , _         = require('underscore')
;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('bindip', process.env.BINDIP || '127.0.0.1');
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.cookieParser(process.env.APP_SECRET));
  app.use(express.cookieSession({
    key: 'sess'
    , cookie: {
      maxAge: 86400 * 90 * 1000
    }
  }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(require('connect-flash')());
  app.set('isDev', (process.env.NODE_ENV != 'production'));
  app.use(function(req, res, next){
    res.locals.isDev = (process.env.NODE_ENV != 'production');
    res.locals.googleAnalyticsID = process.env.GOOGLE_ANALYTICS_ID;
    res.locals.messages = function(){
      var messages = [];
      var flash = req.flash();
      _.each(flash, function(text, type){
        messages.push(flash[type].map(function(text){
          return {type: type, text: text};
        }));
      });
      var result = _.flatten(messages);
      return result;
    };
    next();
  });

  require('./middleware/csrf')(app);
  require('./middleware/auth')(app);
  require('./routes/index')(app);
  require('./routes/feed')(app);
  require('./routes/auth')(app);
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

  if (process.env.NODE_ENV == 'test') {
    require('./routes/test')(app);
  }
});

app.configure('development', function(){
  app.use(express.logger('dev'));
  app.use(express.errorHandler());
});

module.exports = app;
