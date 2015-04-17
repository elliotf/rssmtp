var _       = require('lodash');
var app     = require('../app');
var async   = require('async');
var chai    = require('chai');
var cheerio = require('cheerio');
var config  = require('config');
var db      = require('../db');
var models  = require('../models');
var Promise = require('../lib/promise');
var request = require('supertest');
var expect  = chai.expect;

require('mocha-sinon');

// chai setup
chai.Assertion.includeStack = true;
//chai.use(require('dirty-chai'));
chai.use(require('chai-fuzzy'));
chai.use(require('sinon-chai'));

exports.setupRequestSpec = function(done) {
  this.request = request(app);

  ['del', 'get', 'post', 'put'].forEach(function(method){
    var orig = this.request[method];
    this.request[method] = function(){
      var request = orig.apply(request, arguments);
      if (this._csrfToken)   request.set('X-CSRF-Token', this._csrfToken);
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
        this._csrfToken   = res.body._csrfToken;

        done(err);
      }.bind(this));
  };

  done();
};

exports.$ = function(html){
  return cheerio.load(html);
};

exports.models = models;
exports.model = function(model) {
  return require('../models/' + model);
};

before(function(done) {
  this.timeout(30 * 1000);

  db.knex.migrate
    .latest(config.database)
    .exec(function(err) {
      expect(err).to.not.exist;

      setTimeout(done, 20);
    });
});

beforeEach(function(done) {
  var tables_to_clear = ['articles', 'feeds', 'feedsusers', 'users'];

  Promise
    .map(tables_to_clear, function(table_name) {
      return db
        .knex(table_name)
        .del();
    })
    .exec(function(err) {
      expect(err).to.not.exist;

      done();
    });
});

/*
beforeEach(function(done) {
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
*/

beforeEach(function(done) {
  var self = this
    , todo = []
  ;

  todo.push(function(done){
    models.User
      .create({
        email: 'default_user@example.com'
      })
      .error(done)
      .success(function(user){
        self.user = user;
        done();
      });
  });

  todo.push(function(done){
    models.User
      .create({
        email: 'other_user@example.com'
      })
      .error(done)
      .success(function(user){
        self.other_user = user;
        done();
      });
  });

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
