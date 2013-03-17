var mongoose   = require('mongoose')
  , Schema     = mongoose.Schema
  , feedparser = require('feedparser')
  , request    = require('request')
  , moment     = require('moment')
  , async      = require('async')
  , _          = require('underscore')
;

var schema = new Schema({
  name:  { type: String, 'default': '' }
  , url: { type: String, 'default': '' }
  , lockExpire: { type: Number, 'default': 100 }
  , lastPublished: { type: Date, required: true, 'default': function(){ return moment(0).toDate(); } }
});

schema.statics.fetch = function(url, done){
  var args = {
    url: url
    , jar: false
  };

  request.get(args, function(err, response, body){
    if (err) return done(err);

    feedparser.parseString(body, function(err, meta, articles){
      done(err, meta, articles);
    });
  });
};

schema.statics.getOrCreateFromURL = function(url, done){
  Feed
    .findOne({url: url})
    .exec(function(err, feed){
      if (err) return done(err);
      if (feed) return done(null, feed);

      this.createFromURL(url, done);
    }.bind(this));
};

schema.statics.createFromURL = function(url, done){
  this.fetch(url, function(err, metadata, articles){
    if (err) return done(err);

    var args = {
      name:  metadata.title
      , url: metadata.xmlUrl
    };

    this.create(args, done);
  }.bind(this));
};

schema.statics.getOutdated = function(done){
  var interval  = moment.duration(2, 'hours');
  var threshold = moment().utc().subtract(interval);

  this
    .where('lastPublished')
    .lte(threshold.toDate())
    .sort('lastPublished')
    .limit(1)
    .exec(function(err, feeds){
      done(err, feeds[0]);
    });
};

schema.methods.getLock = function(expireTime, done){
  var now = new Date().getTime();
  if (this.lockExpire >= now) return done(null, false, this);

  this.lockExpire = now + parseInt(expireTime, 10);
  this.increment();

  this.save(function(err, feed){
    if (err) {
      if (err.name == 'VersionError') return done(null, false, this);
      return done(err, false, this);
    }

    done(null, true, feed);
  });
};

schema.methods.fetch = function(done){
  var args = {
    url: this.url
    , jar: false
  };

  request.get(args, function(err, response, body){
    if (err) return done(err);

    feedparser.parseString(body, function(err, meta, articles){
      done(err, meta, articles);
    }.bind(this));
  }.bind(this));
};

schema.methods.merge = function(meta, articles, done){
  var todo = [];
  var newArticles = [];

  articles.forEach(function(data){
    data = _.extend({}, data, {_feed: this.id });
    todo.push(function(done){
      this.model('Article').getOrCreate(data, function(err, article, created){
        if (err) return done(err);

        if (created) newArticles.push(article);

        done();
      });
    }.bind(this));
  }.bind(this));

  async.parallel(todo, function(err){
    if (err) return done(err, []);

    done(err, newArticles);
  });
};

schema.methods.pull = function(done){
  this.fetch(function(err, meta, articles){
    if (err) return done(err);

    this.merge(meta, articles, function(err, newArticles){
      if (err) return done(err);

      this.publish(newArticles, done);
    }.bind(this));
  }.bind(this));
};

schema.methods.getUsers = function(done){
  this
    .model('User')
    .find({_feeds: this.id})
    .exec(done);
};

schema.methods.publish = function(articles, done){
  this.getUsers(function(err, users){
    if (err) return done(err);

    var todo = [];
    articles.forEach(function(article){
      todo.push(function(done){
        article.sendTo(this, users, done);
      }.bind(this));
    }.bind(this));

    async.parallel(todo, function(err){
      if (err) return done(err);

      this.lastPublished = Date.now();
      this.save(done);
    }.bind(this));
  }.bind(this));
};

var Feed = module.exports = mongoose.model('Feed', schema);
