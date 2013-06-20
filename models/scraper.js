var _       = require('underscore')
  , request = require('request')
;

function Scraper(input) {
  var args  = input || {};
  var attrs = ['fetcher'];

  args = _.pick(args, attrs);

  _.defaults(args, {
    fetcher: request
  });

  _.defaults(this, args);
}

Scraper.prototype.feedsForURL = function(url, done) {
  this.fetcher.get(url, done);
};

module.exports = Scraper;
