var app     = require('../app')
  , request = require('supertest')
  , chai    = require('chai')
  , cheerio = require('cheerio')
  , async   = require('async')
;

require('mocha-mongoose')(app.get('db uri'));
require('mocha-sinon');

// chai setup
chai.Assertion.includeStack = true;
chai.use(require('chai-fuzzy'));
chai.use(require('sinon-chai'));

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

beforeEach(function(done) {
  var todo = [];

  todo.push(function(done){
    exports.model('user').create({
      email: 'default_user@example.com'
    }, function(err, user){
      this.user = user;
      done(err);
    }.bind(this));
  }.bind(this));

  todo.push(function(done){
    exports.model('user').create({
      email: 'other_user@example.com'
    }, function(err, user){
      this.other_user = user;
      done(err);
    }.bind(this));
  }.bind(this));

  async.parallel(todo, done);
});
