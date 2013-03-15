var mongoose   = require('mongoose')
  , Schema     = mongoose.Schema
  , feedparser = require('feedparser')
  , request    = require('request')
  , nodemailer = require('nodemailer')
;

var schema = new Schema({
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

module.exports = mongoose.model('Feed', schema);
