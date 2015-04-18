'use strict';

var request = require('request');

function Fetcher() {
}

Fetcher.fetchFeed = function fetchFeed(feed, done) {
  feed.set('last_fetched', new Date());
  feed
    .save()
    .exec(function(err) {
      if (err) {
        return done(err);
      }

      var url = feed.get('url');

      request.get(url, function(err, response, body) {
        if (err) {
          return done(err);
        }

        done();
      });
    });
};

module.exports = Fetcher;
