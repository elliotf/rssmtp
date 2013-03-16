var mongoose   = require('mongoose')
  , Schema     = mongoose.Schema
  , feedparser = require('feedparser')
  , request    = require('request')
  , nodemailer = require('nodemailer')
;

var schema = new Schema({
  name:  { type: String }
  , url: { type: String }
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

var Feed = module.exports = mongoose.model('Feed', schema);
