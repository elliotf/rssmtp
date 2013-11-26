var User = require('../models').User
  , _    = require('lodash')
;

function req_to_data(req) {
  var data = {};

  _.extend(data, req.session, { _csrfToken: req.csrfToken()});

  return data;
}

module.exports = function(app) {
  app.namespace('/test', function(){
    app.get('/session', function (req, res, next) {
      var userId = req.param('userId');

      User.find(userId).done(function(err, user) {
        if (err) return next(err);

        if (user) {
          req.logIn(user, function(err){
            res.json(req_to_data(req));
          });
        } else {
          res.json(req_to_data(req));
        }
      });
    });
  });
};
