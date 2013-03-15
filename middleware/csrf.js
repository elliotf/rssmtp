var express = require('express')
;

module.exports = function(options) {
  var app = options.app;
  app.use(express.csrf());

  return function(req, res, next){
    var token = req.session._csrf;

    function csrf_form_tag(){
      return '<input type="hidden" name="_csrf" value="' + token + '">';
    }
    res.locals.csrf_form_tag = function() { return csrf_form_tag(); };

    next();
  };
};
