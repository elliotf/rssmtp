var User = require('../models/user')
;

module.exports = function(app) {
  app.namespace('/test', function(){
    app.get('/session', function (req, res, next) {
      var userId = req.param('userId');

      User.findById(userId, function(err, user) {
        if (err) return next(err);

        if (user) {
          req.logIn(user, function(err){
            res.json(req.session);
          });
        } else {
          res.json(req.session);
        }
      });
    });
  });
};
