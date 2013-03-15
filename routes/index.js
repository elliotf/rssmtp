
module.exports = function register(app){
  app.get('/', function(req, res, next){
    res.render('index', { title: 'rss-email-gw' });
  });
};
