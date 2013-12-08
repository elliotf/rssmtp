var request = require('request')
;

function Fetcher() {
}

Fetcher.prototype.updateFeed = function(feed, done) {
  var options = feed.asRequestOptions()
    , agent   = [
      'RSSMTP (https://github.com/elliotf/rssmtp; '
      , 'http://', process.env.APP_FQDN
      , ')'
    ].join('');
  ;

  options = {
    headers: {
      'User-Agent': ['RSSMTP (https://github.com/elliotf/rssmtp; http://', process.env.APP_FQDN, ')'].join('')
    }
  };

  request.get(options, function(err, whatever){
    done();
  });
};

module.exports = Fetcher;
