var mongoose = require('mongoose')
  , Schema   = mongoose.Schema
;

var schema = new Schema({
  accounts: [{provider: String, id: String}]
  , email: {type: String}
  , _feeds: [{ type: Schema.Types.ObjectId, ref: 'Feed' }]
}, {
  //autoIndex: false
});

schema.index({ _feeds: 1 });
schema.index({ 'accounts.provider': 1, 'accounts.id': 1 });

schema.methods.addFeed = function(feed, done) {
  this._feeds.addToSet(feed);
  this.save(done);
};

schema.methods.removeFeed = function(feed, done) {
  this._feeds.remove(feed);
  this.save(done);
};

schema.statics.getOrCreateByProfileData = function(data, done) {
  var provider = data.provider
    , id = data.id
  ;

  if (!provider || !id) return done('invalid provider profile data');

  this.getOrCreateByProviderId(provider, id, function(err, user){
    if (err) return done(err);

    var email = data.emails[0].value;

    if (user.email == email) return done(err, user);
    user.email = email;
    user.save(done);
  });
};

schema.statics.getOrCreateByProviderId = function(provider, id, done) {
  this
    .findOne({
      'accounts.provider': provider
      , 'accounts.id': id
    })
    .exec(function(err, user){
      if (err) return done(err);
      if (user) return done(null, user);

      this.create({
        accounts: [
          { provider: provider, id: id}
        ]
      }, done);
    }.bind(this));
};

schema.methods.getFeeds = function(done){
  User
    .findById(this.id)
    .populate('_feeds')
    .exec(function(err, user){
      done(err, user._feeds);
    }.bind(this));
};

var User = module.exports = mongoose.model('User', schema);
