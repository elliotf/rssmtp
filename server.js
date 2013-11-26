var http = require('http')
  , app  = require('./app')
  , models = require('./models')
;

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var poller = new models.poller(models.Feed);
poller.start();
