var loginRequired = require('../middleware/auth').loginRequired
  , Feed          = require('../models/feed')
;

module.exports = function register(app){
  app.namespace('/find', loginRequired, function(){
    app.get('*', function(req, res, next){
      res.send("ok");
    });
  });
};

