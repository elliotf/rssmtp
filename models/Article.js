var mmh3       = require('murmurhash3')
  , _          = require('lodash')
  , nodemailer = require('nodemailer')
;

function init(Sequelize, sequelize, name, models) {
  var statics = {}
    , methods = {}
  ;

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

  methods.asEmailOptions = function(feed, emails) {
    var feedName = feed.name.replace(/[:<@>,]+/g, '_')
      , title = this.title || 'untitled article'
      , link  = this.link
      , description = this.description || 'this article does not have content'
      , senderAddress = ['RSS - ', feedName, " <", process.env.APP_SMTP_FROM, ">"].join('')
    ;

    var htmlBody = [
      "<h1><a href=\"", link, "\">", _.escape(title) , "</a></h1>",
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
  };

  statics.cleanAttrs = function(input) {
    var cleaned = _.pick(input, _.keys(attrs));
    delete cleaned['id'];

    _(input).each(function(v,k){
      if (!v) delete cleaned[k];
    });

    return cleaned;
  };

  statics.attrStringToHash = function(attrs) {
    return _.keys(attrs).sort().map(function(k){
      return [k, attrs[k]].join(': ');
    }).join(' & ');
  };

  statics.setGUID = function(input, done) {
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
  };

  statics.findOrCreateFromData = function(data, done) {
    this.setGUID(data, function(err, attrs){
      var findAttrs = {
        guid: attrs.guid
        , feed_id: attrs.feed_id
      };

      this.findOrCreate(findAttrs, attrs).done(done);
    }.bind(this));
  };

  var model = sequelize.define(
    name
    , attrs
    , {
      tableName: 'articles'
      , instanceMethods: methods
      , classMethods: statics
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




