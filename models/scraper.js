var _       = require('underscore')
  , request = require('request')
  , cheerio = require('cheerio')
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
  var self = this;

  this.fetcher.get(url, function(err, response, body){
    done(err, self.feedsInHTML(body));
  });
};

Scraper.prototype.feedsInHTML = function(input) {
  var $ = cheerio.load(input);

  var links = $('link[rel="alternate"]');
  var feeds = links.map(function(i,el) {
    return {
      title: this.attr('title')
      , href: this.attr('href')
    };
  });

  return feeds;
};

module.exports = Scraper;
