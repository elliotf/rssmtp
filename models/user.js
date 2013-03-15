var mongoose = require('mongoose')
  , Schema   = mongoose.Schema
;

var schema = new Schema({
  accounts: [{}]
  , email: { type: String }
});

var User = module.exports = mongoose.model('User', schema);
