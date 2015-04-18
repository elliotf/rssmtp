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

      done();
    });
};

module.exports = Fetcher;
