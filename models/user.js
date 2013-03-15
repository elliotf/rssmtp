var mongoose = require('mongoose')
  , Schema   = mongoose.Schema
;

var schema = new Schema({
  accounts: [{provider: String, id: String}]
}, {
  autoIndex: false
});

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
