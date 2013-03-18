var loginRequired = require('../middleware/auth').loginRequired
  , Feed          = require('../models/feed')
;

module.exports = function register(app){
  function loadFeed(req, res, next){
    Feed.findById(req.params.feed, function(err, feed){
      if (err) return next(err);

      res.locals.feed = feed;
      next();
    });
  }

  app.namespace('/feed', function(){
    app.namespace('/:feed', loadFeed, function(){
      app.get('/', function(req, res, next){
        res.render('feed/show.jade');
      });
    });
  });
};
