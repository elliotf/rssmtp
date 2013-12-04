var request    = require('request')
  , feedparser = require('../lib/feedparser')
  , moment     = require('moment')
  , async      = require('async')
  , _          = require('lodash')
;

function init(Sequelize, sequelize, name, models) {
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
    , last_fetched: {
      type: Sequelize.DATE
      , allowNull: false
      , defaultValue: function() { return moment(0).toDate(); }
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

  statics.getOrCreateFromURL = function(url, done){
    var self = this;
    self.fetch(url, function(err, meta, articles){
      if (err) return done(err);

      var attrs = {
        name: meta.title || 'untitled feed'
        , url: url
      };

      self
        .findOrCreate(attrs)
        .done(function(err, feed, created){
          done(err, feed, created, meta, articles);
        });
    });
  };

  statics.getOutdated = function(done) {
    var interval  = moment.duration(2, 'hours');
    var threshold = moment().utc().subtract(interval);

    this
      .findAll({where: ["last_fetched < ?", threshold.toDate()], order: 'last_fetched ASC', limit: 1})
      .done(function(err, feeds){
        done(err, (feeds || [])[0]);
      });
  };

  methods.merge = function(articlesData, done) {
    var todo        = []
      , newArticles = []
    ;

    articlesData.forEach(function(attrs){
      attrs.feed_id = this.id;

      todo.push(function(done){
        models.Article
          .findOrCreateFromData(attrs, function(err, article, created){
            if (err) return done(err);

            if (created) newArticles.push(article);

            done();
          });
      });
    }.bind(this));

    async.parallel(todo, function(err){
      done(err, newArticles);
    });
  };

  methods.pull = function(done) {
    var self = this;

    Klass.fetch(self.url, function(fetchErr, meta, articles){
      self
        .touch(function(err) {
          if (fetchErr) return done(fetchErr, []);
          if (err) return done(err, []);

          self.merge(articles, done);
        });
    });
  };

  methods.publish = function(done){
    var self = this;

    this
      .getUsers()
      .error(done)
      .success(function(users){
        if (!users.length) return this.touch(done);

        var emails = _.pluck(users, 'email');

        this.pull(function(err, newArticles){
          if (err) return done(err);

          var todo   = []
            , mailer = new models.mailer()
          ;

          newArticles.forEach(function(article){
            todo.push(function(done){
              mailer.sendMail(article.asEmailOptions(self, emails), done);
            })
          });

          async.parallel(todo, function(err){
            done(err, self, newArticles);
          });
        });
      }.bind(this));
  };

  methods.touch = function(done){
    this.last_fetched = moment().toDate();

    this.save().done(done);
  };

  var Klass = sequelize.define(
    name
    , attrs
    , {
      tableName: 'feeds'
      , instanceMethods: methods
      , classMethods: statics
    }
  );

  return Klass;
};

init.relate = function(self, models) {
}

module.exports = init;



