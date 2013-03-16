var loginRequired = require('../middleware/auth').loginRequired
  , Feed          = require('../models/feed')
;

module.exports = function register(app){
  app.get('/', function(req, res, next){
    res.render('index', { title: 'rss-email-gw' });
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
