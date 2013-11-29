var models     = require('../models')
  , oldUser    = require('../models/user')
  , oldFeed    = require('../models/feed')
  , oldArticle = require('../models/article')
  , mongoose   = require('mongoose')
  , async      = require('async')
  , _          = require('lodash')
  , todo       = []
  , users      = {}
  , feeds      = {}
  , articles   = []
;

todo.push(function(done) {
  var uri = 'mongodb://localhost/rssmtp_' + process.env.NODE_ENV;
  if (process.env.DB_TOKEN) {
    uri = uri + '_' + process.env.DB_TOKEN;
  }
  mongoose.connect(uri, function(err){
    done(err);
  });
});

todo.push(function(done){
  var syncArgs = {};
  if ('development' === process.env.NODE_ENV) {
    syncArgs.force = true;
  }

  models._sequelize.sync(syncArgs).done(done);
});

todo.push(function(done){
  oldUser.find({}).limit(1).populate('_feeds').exec(function(err, results){
    if (err) return done(err);

    var todo = [];

    results.forEach(function(mongoUser){
      users[mongoUser._id] = {
        mongo: mongoUser
      };

      todo.push(function(done){
        models.User
          .findOrCreate({
            email: mongoUser.email
            , oauth_provider: mongoUser.accounts[0].provider
            , oauth_id: mongoUser.accounts[0].id
          })
          .error(done)
          .success(function(user){
            console.log("USER CREATED: ", user.email);
            users[mongoUser._id].sql = user;

            done();
          });
      });

      mongoUser._feeds.forEach(function(mongoFeed){
        /*
        if (_.keys(feeds).length > 3) {
          return;
        }
        */

        feeds[mongoFeed._id] = {
          mongo: mongoFeed
        };

        todo.push(function(done){
          models.Feed
            .findOrCreate({
              url: mongoFeed.url
              , name: mongoFeed.name
            })
            .error(done)
            .success(function(feed){
              console.log("FEED CREATED: ", feed.name);
              feeds[mongoFeed._id + ""].sql = feed;

              feed
                .addUser(users[mongoUser._id].sql)
                .done(done);
            });
        });
      });
    });

    async.series(todo, done);
  });
});

todo.push(function(done){
  var todo = [];

  var totalArticles = 0;
  var remainingArticles = 0;

  _(feeds).forEach(function(objs, mongoId){
    todo.push(function(done){
      var mongoFeed = objs.mongo;
      var feed      = objs.sql;

      oldArticle.find({_feed: mongoId}).exec(function(err, articles){
        if (err) return done(err);

        var feedArticles = [];

        articles.forEach(function(article){
          if (article.guid) {
            feedArticles.push(article);
          }
        });

        totalArticles = totalArticles + feedArticles.length;
        remainingArticles = remainingArticles + feedArticles.length;

        console.log("MERGING " + feedArticles.length + " ARTICLES INTO " + feed.name);
        feed.merge(feedArticles, function(err) {
          if (err) {
            console.log("MERGE ERR: ", err);
          } else {
            remainingArticles = remainingArticles - feedArticles.length;
            console.log(feed.name + ": " + feedArticles.length + " DONE, " + remainingArticles + "/" + totalArticles + " ARTICLES REMAINING");
          }

          done();
        });
      });
    });
  });

  async.parallel(todo, done);
});

async.series(todo, function(err){
  console.log("Migration finished, err: ", err);
  process.exit(0);
});
