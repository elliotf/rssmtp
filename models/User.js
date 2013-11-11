function init(Sequelize, sequelize, name) {
  return sequelize.define(name, {
    email: Sequelize.STRING(2048)
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


