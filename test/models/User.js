var helper = require('../../support/spec_helper')
  , models = require('../../models')
  , User   = models.User
  , Feed   = models.Feed
  , expect = require('chai').expect
  , async  = require('async')
  , _      = require('lodash')
;

describe("User model (RDBMS)", function() {
  it("can be saved", function(done) {
    User.create({
      email: "waffles@example.com"
    }).done(done);
  });

  describe("hasMany feeds", function() {
    beforeEach(function(done) {
      var self = this;

      async.parallel([
        function(done){
          User.create({
            email: "assoc@example.com"
          })
          .error(done)
          .success(function(user){
            self.user = user;
            done();
          });
        }
        , function(done){
          Feed.create({
            url: 'http://waffle'
          }).error(done)
          .success(function(feed){
            self.feed = feed;
            done();
          });
        }
      ], done);

    });

    it("can be added", function(done) {
      this.user.addFeed(this.feed).done(done);
    });
  });
});
