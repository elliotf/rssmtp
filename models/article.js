var mongoose = require('mongoose')
  , Schema   = mongoose.Schema
  , mmh3     = require('murmurhash3')
  , _        = require('underscore')
;

var schema = new Schema({
  description: { type: String, required: true, 'default': '' }
  , title: { type: String, required: true, 'default': '' }
  , link: { type: String, required: true, 'default': '' }
  , date: { type: Date, 'default': Date.now }
  , hash: { type: String, required: true }
  , _feed: { type: Schema.Types.ObjectId, ref: 'Feed', required: true }
});

schema.statics.getOrCreate = function(attr, done){
  var toHash = [
    'title: ',  attr.title
    , 'desc: ', attr.description
    , 'feed: ', attr._feed
    , 'link: ', attr.link
  ].join("");

  mmh3.murmur128Hex(toHash, function(err, hash){
    if (err) return done(err);

    attr = _.extend({}, attr, { hash: hash });

    this.findOne({hash: hash}, function(err, article){
      if (err) return done(err);
      if (article) return done(err, article, false);

      this.create(attr, function(err, article){
        done(err, article, true);
      });
    }.bind(this));
  }.bind(this));
};

schema.methods.sendTo = function(users, done) {
  done();
};

var Article = module.exports = mongoose.model('Article', schema);
