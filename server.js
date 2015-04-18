var http = require('http');
var app  = require('./app');
var models = require('./models');
var agents = require('./agents');

function start(done) {
  http.createServer(app).listen(app.get('port'), app.get('bindip'), function(){
    console.log("Express server listening on port " + app.get('port'));

    var syncArgs = {};
    if ("development" === process.NODE_ENV) {
      syncArgs.force = true;
    }

    models._sequelize.sync(syncArgs).done(function(err){
      if (err) throw err;

      var poller = new agents.Poller({
        FeedClass: models.Feed
        , mailer:  new models.mailer()
      });
      poller.start();

      console.log("POLLING FEEDS");

      done();
    });
  });
}

module.exports = start;

if (module === require.main){
  start(function(){});
}
