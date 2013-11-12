function init(Sequelize, sequelize, name) {
  return sequelize.define(name, {
    email: Sequelize.STRING(2048)
    , oauth_provider: Sequelize.STRING(2048)
    , oauth_id: Sequelize.STRING(2048)
  }, {
    tableName: 'users'
    , instanceMethods: {
    }
    , classMethods: {
      findOrCreateFromOAUTH: function(oauth, done) {
        var self = this;

        var data = {
          oauth_provider: oauth.provider
          , oauth_id: oauth.id
        };
        this.find({
          where: data
        })
          .error(done)
          .success(function(model){
            if (model) {
              return done(null, model, false);
            }
            data.email = oauth.emails[0].value;
            self
              .create(data)
              .error(done)
              .success(function(model){
                done(null, model, true);
              })
          })
      }
    }
  });
};

init.relate = function(self, models) {
  self.hasMany(models.Feed);
  models.Feed.hasMany(self);
}

module.exports = init;


