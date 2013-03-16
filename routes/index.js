var loginRequired = require('../middleware/auth').loginRequired
  , Feed          = require('../models/feed')
;

module.exports = function register(app){
  app.get('/', function(req, res, next){
    if (!req.isAuthenticated()) {
      return res.render('splash');
    }

    req.user.getFeeds(function(err, feeds){
      if (err) return next(err);

      res.locals.feeds = feeds;
      res.render('index');
    });
  });

  app.post('/', loginRequired, function(req, res, next){
    var url = req.body.url;

    Feed.getOrCreateFromURL(url, function(err, feed){
      if (err) return next(err);

      req.user.addFeed(feed.id, function(err){
        if (err) return next(err);

        res.redirect('/');
      });
    });
  });
};
