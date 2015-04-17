var Bookshelf = require('bookshelf');
var config    = require('config');
var Knex      = require('knex');

var knex      = Knex(config.database);
var bookshelf = Bookshelf.initialize(knex);

bookshelf.plugin('registry');
var BaseModel = bookshelf.Model.extend({
  hasTimestamps: true
}, {
});

module.exports.knex      = knex;
module.exports.bookshelf = bookshelf;
module.exports.BaseModel = BaseModel;
