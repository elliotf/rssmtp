'use strict';

var db = require('../db');

var Feed = db.BaseModel.extend({
  tableName: 'feeds'
}, {
});

module.exports = Feed;
