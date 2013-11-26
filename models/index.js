var Sequelize = require('sequelize')
  , path      = require('path')
  , fs        = require('fs')
  , env       = process.env.NODE_ENV || 'development'
  , config    = require(__dirname + '/../config/config.json')[env]
  , _         = require('lodash')
;

var options = _.merge({}, config, {
  define: {
    underscored: true
    , freezeTableName: true
  }
  , logging: false
});

var sequelize = new Sequelize(config.database, config.username, config.password, options);

var files = fs.readdirSync(__dirname)
  .filter(function(filename){
    if (filename === 'index.js') return false;
    if ('.js' !== path.extname(filename)) return false;
    return true;
  })
  .map(function(filename){
    return path.basename(filename, path.extname(filename));
  })
;

var models    = {}
  , relations = {}
;

// load models
files.forEach(function(filename){
  var model = require('./' + filename);

  if ('function' === typeof model['relate']) {
    relations[filename] = model.relate;
  }

  if ('function' === typeof model && model.length === 4) {
    model = model(Sequelize, sequelize, filename, models);
  }

  models[filename] = model;
});

// now that we have models, relate them to one another
files.forEach(function(filename){
  var model = models[filename];

  if ('function' == typeof relations[filename]) {
    relations[filename](model, models);
  }
});

models._sequelize = sequelize;
module.exports = models;
