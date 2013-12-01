var loginRequired = require('../middleware/auth').loginRequired
  , Feed          = require('../models').Feed
;

module.exports = function register(app){
  function loadFeed(req, res, next){
    function notfound() {
      res.status(404);
      res.render('404');
    }

    Feed.find(req.params.feed).done(function(err, feed){
      if (err) {
        if ('CastError' == err.name) return notfound();
        return next(err);
      }

      if (!feed) return notfound();

      res.locals.feed = feed;
      next();
    });
  }

  app.namespace('/feed/:feed', loginRequired, function(){
    app.get('/', loadFeed, function(req, res, next){
      res.render('feed/show.jade');
    });

    app.del('/', function(req, res, next){
      Feed
        .find(req.params.feed)
        .error(next)
        .success(function(feed){
          req.user.removeFeed(feed).done(function(err, user){
            if (err) return next(err);

            res.redirect('/');
          });
        });
    });
  });
};
