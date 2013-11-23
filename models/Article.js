var mmh3 = require('murmurhash3')
  , _    = require('lodash')
  , ent  = require('ent')
;

function init(Sequelize, sequelize, name) {
  var attrs = {
    link: {
      type: Sequelize.STRING(2048)
    }
    , title: {
      type: Sequelize.STRING(2048)
      , allowNull: false
      , defaultValue: 'untitled article'
    }
    , description: {
      type: Sequelize.TEXT
      , allowNull: false
      , defaultValue: 'this article does not have content'
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
    , feed_id: {
      type: Sequelize.INTEGER
      , references: "feeds"
      , referencesKey: "id"
      , allowNull: false
    }
  };

  var instanceMethods = {};

  instanceMethods.asEmailOptions = function(feed, emails) {
    var feedName = feed.name.replace(/[:<@>,]+/g, '_')
      , title = this.title || 'untitled article'
      , link  = this.link
      , description = this.description || 'this article does not have content'
      , senderAddress = ['RSS - ', feedName, " <", process.env.APP_SMTP_FROM, ">"].join('')
    ;

    var htmlBody = [
      "<h1><a href=\"", link, "\">", ent.encode(title) , "</a></h1>",
      description,
      "<br><br><a href=\"http://", process.env.APP_FQDN, "/feed/", feed.id, "\">unsubscribe</a>"
    ].join('');

    var data = {
      from:      senderAddress
      , to:      senderAddress
      , bcc:     emails
      , subject: title
      , date:    this.date
      , headers: {
        "List-ID": [feed.id, process.env.APP_FQDN].join('.')
        , "List-Unsubscribe": ['http://', process.env.APP_FQDN, '/feed/', feed.id].join('')
        , "List-Subscribe": ['http://', process.env.APP_FQDN, '/feed/', feed.id].join('')
      }
      , html: htmlBody
      , generateTextFromHTML: true
    };

    return data;
  }

  var classMethods    = {
    cleanAttrs: function(input) {
      return _.pick(input, _.keys(attrs));
    }
    , attrStringToHash: function(attrs) {
      return _.keys(attrs).sort().map(function(k){
        return [k, attrs[k]].join(': ');
      }).join(' & ');
    }
    , setGUID: function(input, done) {
      var attrs = this.cleanAttrs(input);

      if (attrs.hasOwnProperty('guid')) {
        process.nextTick(function(){
          done(null, attrs);
        });
      } else {
        var toHash = this.attrStringToHash(attrs);
        mmh3.murmur128Hex(toHash, function(err, hash){
          attrs.guid = hash;
          done(err, attrs);
        });
      }
    }
    , findOrCreateFromData: function(data, done) {
      this.setGUID(data, function(err, attrs){
        this.findOrCreate(attrs).done(done);
      }.bind(this));
    }
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
  self.belongsTo(models.Feed);
  models.Feed.hasMany(self);
}

module.exports = init;




