var app     = require('../app')
  , request = require('supertest')
  , chai    = require('chai')
  , cheerio = require('cheerio')
  , async   = require('async')
  , _       = require('lodash')
  , models  = require('../models')
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

before(function(done){
  models._sequelize.sync({force: true}).done(done);
});

beforeEach(function(done) {
  //models._sequelize.sync({force: true}).done(done);
  var todo = [];

  _.forEach(models, function(model, name){
    if (model && 'function' === typeof model['destroy']) {
      todo.push(function(done){
        model.destroy().done(done);
      });
    }
  });

  async.parallel(todo, done);
});

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

exports.getSession = function(input) {
  if (typeof input === 'object') {
    if (input.hasOwnProperty('header')) {
      input = input.header['set-cookie'][0];
    }
  }

  var cookie = require('cookie');
  var utils  = require('connect').utils;

  var cookies = cookie.parse(input);
  var result = utils.parseSignedCookies(cookies, process.env.APP_SECRET);
  result = utils.parseJSONCookies(result);

  return result.sess;
};

exports.getFlash = function(input) {
  var session = exports.getSession(input);
  return session.flash;
};
