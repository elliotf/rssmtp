var mongoose = require('mongoose')
  , Schema   = mongoose.Schema
  , mmh3     = require('murmurhash3')
  , _        = require('underscore')
;

var schema = new Schema({
  description: { type: String, required: true }
  , title: { type: String, required: true }
  , hash: { type: String, required: true }
  , _feed: { type: Schema.Types.ObjectId, ref: 'Feed', required: true }
});

schema.statics.getOrCreate = function(attr, done){
  var toHash = ['desc: ', attr.description, 'title: ', attr.title, 'feed: ', attr._feed].join("");


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

var Article = module.exports = mongoose.model('Article', schema);
