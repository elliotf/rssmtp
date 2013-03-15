var mongoose = require('mongoose')
  , Schema   = mongoose.Schema
;

var schema = new Schema({
  accounts: [{provider: String, id: String}]
  , email: {type: String}
}, {
  autoIndex: false
});

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

var Model = module.exports = mongoose.model('User', schema);
