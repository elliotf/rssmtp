var helper = require('../support/spec_helper')
  , models = require('../models')
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

  describe("findOrCreateFromOAUTH", function() {
    beforeEach(function() {
      this.dummyProfileData = {
        provider: 'oauth_provider_here'
        , id: 'oauth_id_here'
        , displayName: 'Bob Foster'
        , name: {
          givenName: 'Bob'
          , familyName: 'Foster'
        }
        , emails: [
          { value: 'bob.foster@example.com' }
        ]
      };
    });

    describe("when the specified user does NOT exist", function() {
      it("creates the user", function(done) {
        User.findOrCreateFromOAUTH(this.dummyProfileData, function(err, user, created) {
          expect(err).to.not.exist;

          expect(created).to.be.true;
          expect(user.email).to.equal("bob.foster@example.com");
          expect(user.oauth_id).to.equal('oauth_id_here');
          expect(user.oauth_provider).to.equal('oauth_provider_here');

          done();
        });
      });
    });

    describe("when the specified user EXISTS", function() {
      beforeEach(function(done) {
        User.create({
          email:            'bob@example.com'
          , oauth_provider: this.dummyProfileData.provider
          , oauth_id:       this.dummyProfileData.id
        })
        .error(done)
        .success(function(model){
          this.user = model;
          done();
        }.bind(this));
      });

      it("returns the existing user", function(done) {
        User.findOrCreateFromOAUTH(this.dummyProfileData, function(err, user, created) {
          expect(err).to.not.exist;

          expect(created).to.be.false;
          expect(user.email).to.equal("bob@example.com");
          done();
        });
      });
    });
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
