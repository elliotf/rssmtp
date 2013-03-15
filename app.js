var express  = require('express')
  , path     = require('path')
  , mongoose = require('mongoose')
;

var app = express();

if (!mongoose.connection.db) {
  var uri = 'mongodb://localhost/' + process.env.NODE_ENV;
  app.set('db uri', uri);
  console.log("Connecting to MongoDB at " + uri);
  mongoose.connect(uri, function(err){
    if (err) return console.log("Got an err trying to connect to mongoose: ", err);
  });
}

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.logger('dev'));
  app.use(express.errorHandler());
});

require('./routes/index.js')(app);

module.exports = app;
