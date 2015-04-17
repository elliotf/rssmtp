'use strict';

var db = require('../db');

var User = db.BaseModel.extend({
  tableName: 'users'
}, {
  findOrCreateFromOAUTH: function findOrCreateFromOAUTH(oauth_data, done) {
    var attrs = {
      oauth_provider: oauth_data.provider,
      oauth_id:       oauth_data.id
    };

    var created = false;
    var user = User
      .forge(attrs)

    user
      .fetch()
      .then(function(result) {
        if (result) {
          return result;
        }

        created = true;
        user.set('email', oauth_data.emails[0].value);

        return user.save();
      })
      .exec(function(err, user) {
        if (err) {
          return done(err);
        }

        done(null, user, created);
      });
  }
});

module.exports = User;
