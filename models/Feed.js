function init(Sequelize, sequelize, name) {
  return sequelize.define(name, {
    url: Sequelize.STRING(2048)
  }, {
    tableName: 'feeds'
    , instanceMethods: {
    }
    , classMethods: {
    }
  });
};

init.relate = function(self, models) {
  self.hasMany(models.Article);
  models.Article.belongsTo(self);
}

module.exports = init;



