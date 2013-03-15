var app     = require('../app')
  , request = require('supertest')
  , cheerio = require('cheerio')
;

exports.setupRequestSpec = function(done) {
  this.request = request(app);

  done();
};

exports.$ = function(html){
  return cheerio.load(html);
};

exports.model = function(model) {
  return require('../models/' + model);
};
