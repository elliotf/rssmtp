var _         = require('lodash');
var Bookshelf = require('bookshelf');
var config    = require('config');
var Knex      = require('knex');

var db_config = _.cloneDeep(config.database);
if (db_config.client.match(/^mysql/)) {
  // make mysql pay attention to schema and not "just go with it"
  db_config.pool = {
    afterCreate: function(connection, callback) {
      connection.query("SET sql_MODE='STRICT_ALL_TABLES';", function(err) {
        callback(err, connection);
      });
    }
  };
}

var knex      = Knex(db_config);
var bookshelf = Bookshelf.initialize(knex);

bookshelf.plugin('registry');
var Parent = bookshelf.Model;
var BaseModel = Parent.extend({
  initialize: function initialize(attrs, options) {
    Parent.prototype.initialize.call(this, attrs, options);

    this.on('saving', this.onSaving);
  },
  parse: function parse(input, options) {
    var attrs = Parent.prototype.parse.call(this, input, options);

    (this.dateColumns || []).forEach(function(column) {
      if (null != attrs[column]) {
        attrs[column] = new Date(attrs[column]);
      }
    });

    return attrs;
  },
  onSaving: function onSaving(model, attrs, options) {
    trim_milliseconds = this.trimMilliseconds;

    (this.dateColumns || []).forEach(function(column) {
      if (null != attrs[column]) {
        attrs[column] = new Date(attrs[column]);

        if (trim_milliseconds) {
          attrs[column].setMilliseconds(0);
          model.set(column, attrs[column]);
        }
      }
    });
  },
  dateColumns:      ['created_at', 'updated_at', 'last_fetched'],
  trimMilliseconds: true,
  hasTimestamps:    true,
}, {
});

module.exports.knex      = knex;
module.exports.bookshelf = bookshelf;
module.exports.BaseModel = BaseModel;
