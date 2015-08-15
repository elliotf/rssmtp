'use strict';

function Fetcher(getter) {
  this._getter = getter;
}

Fetcher.prototype.fetchFeed = function fetchFeed(feed, done) {
  var getter = this._getter;

  feed.set('last_fetched', new Date());
  feed
    .save()
    .exec(function(err) {
      if (err) {
        return done(err);
      }

      var url = feed.get('url');

      getter(url, function(err, response, body) {
        if (err) {
          return done(err);
        }

        done();
      });
    });
};

module.exports = Fetcher;
