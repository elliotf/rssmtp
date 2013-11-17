var loginRequired = require('../middleware/auth').loginRequired
  , Feed          = require('../models/feed')
  , Article       = require('../models/article')
;

module.exports = function register(app){
  app.get('/', function(req, res, next){
    if (!req.isAuthenticated()) {
      return res.render('splash');
    }

    req.user.getFeeds().done(function(err, feeds){
      if (err) return next(err);

      res.locals.feeds = feeds;
      res.render('index');
    });
  });

  app.post('/', loginRequired, function(req, res, next){
    var url = req.body.url;

    function badInput(){
      req.flash('error',
        [
          "'", url, "' is not a valid feed URL."
        ].join('')
      );
      res.redirect('/');
    }

    Feed.getOrCreateFromURL(url, function(err, feed){
      if (err) {
        if ("Error: Not a feed" == err) {
          return badInput();
        }

        if (err.toString().match(/Error: Invalid URI/)) {
          return badInput();
        }

        return next(err);
      }

      req.user.addFeed(feed.id, function(err){
        if (err) return next(err);

        res.redirect('/');
      });
    });
  });
};
