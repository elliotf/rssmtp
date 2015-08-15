var _str = require('underscore.string');
var fs   = require('fs');
var path = require('path');

var files   = fs.readdirSync(__dirname);

files.forEach(function(file) {
  if (file === path.basename(__filename)) {
    return;
  }

  var class_name = _str.classify(path.basename(file, '.js'));

  var model = require('./' + file);

  module.exports[class_name] = model;
});
