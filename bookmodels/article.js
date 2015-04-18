'use strict';

var db = require('../db');

var Article = db.BaseModel.extend({
  tableName: 'articles'
}, {
});

module.exports = Article;
