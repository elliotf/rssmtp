var request    = require('request')
  , feedparser = require('feedparser')
;

function init(Sequelize, sequelize, name) {
  var statics = {}
    , methods = {}
  ;

  var attrs = {
    url: Sequelize.STRING(2048)
    , name: {
      type: Sequelize.STRING(2048)
      , allowNull: false
      , defaultValue: 'unnamed feed'
    }
  }

  statics.fetch = function(url, done){
    request.get(url, function(err, response, body){
      if (err) return done(err);

      feedparser.parseString(body, function(err, meta, articles){
        done(err, meta, articles);
      });
    });
  };

  statics.createFromURL = function(url, done){
    var self = this;
    self.fetch(url, function(err, meta, articles){
      var attrs = {
        url: url
        , name: meta.title || 'untitled feed'
      };

      self
        .create(attrs)
        .done(function(err, feed){
          done(err, feed, meta, articles);
        });
    });
  };

  return sequelize.define(
    name
    , attrs
    , {
      tableName: 'feeds'
      , instanceMethods: methods
      , classMethods: statics
    }
  );
};

init.relate = function(self, models) {
}

module.exports = init;



