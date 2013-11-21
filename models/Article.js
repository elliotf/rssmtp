var mmh3 = require('murmurhash3')
  , _    = require('lodash')
;

function init(Sequelize, sequelize, name) {
  var attrs = {
    link: {
      type: Sequelize.STRING(2048)
    }
    , title: {
      type: Sequelize.STRING(2048)
      , allowNull: false
      , defaultValue: 'no title'
    }
    , description: {
      type: Sequelize.TEXT
      , allowNull: false
      , defaultValue: 'no description'
    }
    , date: {
      type: Sequelize.DATE
      , allowNull: false
      , defaultValue: Date.now
    }
    , guid: {
      type: Sequelize.STRING
      , allowNull: false
    }
  };

  var instanceMethods = {
  };

  var classMethods    = {
  };

  var model = sequelize.define(
    name
    , attrs
    , {
      tableName: 'articles'
      , instanceMethods: instanceMethods
      , classMethods: classMethods
    }
  );

  return model;
};

// unique key on feed_id,guid

init.relate = function(self, models) {
}

module.exports = init;




