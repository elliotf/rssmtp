var mongoose   = require('mongoose')
  , Schema     = mongoose.Schema
  , feedparser = require('feedparser')
  , request    = require('request')
  , nodemailer = require('nodemailer')
;

var schema = new Schema({
  url: { type: String }
});

schema.statics.fetch = function(url, done){
  var args = {
    url: url
    , jar: false
  };

  request.get(args, function(err, response, body){
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

      Feed.createFromURL(url, done);
    });
};

schema.statics.createFromURL = function(url, done){
  done();
};

var Feed = module.exports = mongoose.model('Feed', schema);
