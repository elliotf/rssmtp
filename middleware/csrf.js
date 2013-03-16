var express = require('express')
;

module.exports = function(app) {
  app.use(express.csrf());

  app.use(function(req, res, next){
    var token = req.session._csrf;

    res.locals.csrf_form_tag = function() {
      return '<input type="hidden" name="_csrf" value="' + token + '">';
    };

    next();
  });
};
