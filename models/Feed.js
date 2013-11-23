var instanceMethods = {};
var classMethods = {};

function init(Sequelize, sequelize, name) {
  var instanceMethods = {}
    , classMethods    = {}
  ;

  var attrs = {
    url: Sequelize.STRING(2048)
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



