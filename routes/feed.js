var loginRequired = require('../middleware/auth').loginRequired
  , Feed          = require('../models/feed')
;

module.exports = function register(app){
  function loadFeed(req, res, next){
    function notfound() {
      res.status(404);
      res.render('404');
    }

    Feed.findById(req.params.feed, function(err, feed){
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
      req.user.removeFeed(req.params.feed, function(err, user){
        if (err) return next(err);

        res.redirect('/');
      });
    });

    if (app.get('isDev')) {
      app.get('/refetch', loadFeed, function(req, res, next){
        res.locals.feed.pull(function(err){
          if (err) return next(err);

          res.send('ok');
        });
      });
    }
  });
};
