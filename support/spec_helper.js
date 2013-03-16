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

  ['del', 'get', 'post', 'put'].forEach(function(method){
    var orig = this.request[method];
    this.request[method] = function(){
      var request = orig.apply(request, arguments);
      if (this._csrf)   request.set('X-CSRF-Token', this._csrf);
      if (this._cookie) request.set('Cookie',       this._cookie);
      return request;
    }.bind(this);
  }.bind(this));

  this.loginAs = function(user, done){
    this.request
      .get('/test/session/')
      .send({userId: user.id})
      .end(function(err, res){
        this._cookie = res.header['set-cookie'];
        this._csrf   = res.body._csrf;

        done(err);
      }.bind(this));
  };

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
