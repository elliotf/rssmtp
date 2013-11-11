function init(Sequelize, sequelize, name) {
  return sequelize.define(name, {
    url: Sequelize.STRING(2048)
  }, {
    instanceMethods: {
    }
    , classMethods: {
    }
  }, {
    tableName: 'users'
  });
};

init.relate = function(self, models) {
}

module.exports = init;



