var Feed = require('./feed')
;

function Poller() {
}

Poller.prototype.updateOneFeed = function(done){
  Feed.getOutdated(function(err, feed){
    if (err) return done(err);

    if (!feed) {
      this.requeue(30 * 60 * 1000);
      return done();
    }

    feed.pull(function(err){
      this.requeue(0);

      done(err, feed);
    }.bind(this));
  }.bind(this));
};

Poller.prototype.requeue = function(delay) {
  global.setTimeout(function(){
    this.updateOneFeed(function(err, feed){
      if (err) { console.error("ERROR: ", err, " while updating feed: ", feed); }
    });
  }.bind(this), delay);
};

Poller.prototype.start = function() {
  this.requeue(0);
};

module.exports = Poller;
