var http = require('http')
  , app  = require('./app')
  , models = require('./models')
;

function start(done) {
  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));

    var syncArgs = {};
    if ("development" === process.NODE_ENV) {
      syncArgs.force = true;
    }

    models._sequelize.sync(syncArgs).done(function(err){
      if (err) throw err;

      var poller = new models.poller(models.Feed);
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
