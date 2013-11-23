function init(Sequelize, sequelize, name) {
  var instanceMethods = {}
    , classMethods    = {}
  ;

  var attrs = {
    url: Sequelize.STRING(2048)
    , name: {
      type: Sequelize.STRING(2048)
      , allowNull: false
      , defaultValue: 'unnamed feed'
    }
  }

  return sequelize.define(
    name
    , attrs
    , {
      tableName: 'feeds'
      , instanceMethods: instanceMethods
      , classMethods: classMethods
    }
  );
};

init.relate = function(self, models) {
}

module.exports = init;



