'use strict';

var db = require('../db');

var Article = db.BaseModel.extend({
  tableName: 'articles',
  defaults:  function defaults() {
    return {
      link:        null,
      description: null,
      title:       'untitled article'
    }
  }
}, {
});

module.exports = Article;
