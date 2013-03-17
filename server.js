var http = require('http')
  , app  = require('./app')
  , Poller = require('./models/poller')
;

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var poller = new Poller();
poller.start();
