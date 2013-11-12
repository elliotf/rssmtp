function init(Sequelize, sequelize, name) {
  return sequelize.define(name, {
    email: Sequelize.STRING(2048)
  }, {
    tableName: 'users'
    , instanceMethods: {
    }
    , classMethods: {
    }
  });
};

init.relate = function(self, models) {
  self.hasMany(models.Feed);
  models.Feed.hasMany(self);
}

module.exports = init;


