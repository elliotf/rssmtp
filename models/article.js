var mongoose = require('mongoose')
  , Schema   = mongoose.Schema
;

var schema = new Schema({
});

var Article = module.exports = mongoose.model('Article', schema);
