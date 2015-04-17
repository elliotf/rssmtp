'use strict';

var db = require('../db');

var User = db.BaseModel.extend({
  tableName: 'users'
}, {
});

module.exports = User;
