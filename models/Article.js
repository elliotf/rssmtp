function init(Sequelize, sequelize, name) {
  return sequelize.define(name, {
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
  }, {
    tableName: 'articles'
    , instanceMethods: {
    }
    , classMethods: {
    }
  });
};

// unique key on feed,guid

init.relate = function(self, models) {
  // model.belongsTo(models.Feed);
  // models.Feed.hasMany(model);
}

module.exports = init;




