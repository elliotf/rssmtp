'use strict';

var expect = require('chai').expect;
var models = require('../bookmodels');
var helper = require('../support/spec_helper');

describe("models.User (bookshelf)", function() {
  var minimum_attrs;

  beforeEach(function() {
    minimum_attrs = {
      email:          'fake@example.com',
      oauth_provider: 'fake oauth_provider',
      oauth_id:       'fake oauth_id'
    };
  });

  it('can be saved', function(done) {
    var now = new Date();
    now.setMilliseconds(0);
    var clock = this.sinon.useFakeTimers(now.valueOf());
    models.User
      .forge(minimum_attrs)
      .save()
      .exec(function(err, user) {
        clock.restore();

        expect(err).to.not.exist;

        var actual = user.toJSON();
        expect(actual.id).to.be.a('number').above(0);
        delete actual.id;

        expect(actual).to.deep.equal({
          email:          'fake@example.com',
          oauth_provider: 'fake oauth_provider',
          oauth_id:       'fake oauth_id',
          created_at:     now,
          updated_at:     now,
        });

        done();
      });
  });

  describe("findOrCreateFromOAUTH", function() {
    var dummyProfileData;
    var user;

    beforeEach(function() {
      dummyProfileData = {
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

    context("when the specified user *does not* exist", function() {
      it("creates the user", function(done) {
        models.User.findOrCreateFromOAUTH(dummyProfileData, function(err, user, created) {
          expect(err).to.not.exist;

          expect(created).to.be.true;
          expect(user.pick('email', 'oauth_provider', 'oauth_id')).to.deep.equal({
            email:          'bob.foster@example.com',
            oauth_provider: 'oauth_provider_here',
            oauth_id:       'oauth_id_here'
          });

          done();
        });
      });
    });

    context("when the specified user *does* exist", function() {
      beforeEach(function(done) {
        models.User.forge({
          email: 'bob@example.com'
          , oauth_provider: 'oauth_provider_here'
          , oauth_id: 'oauth_id_here'
        })
        .save()
        .exec(function(err, result){
          expect(err).to.not.exist;
          user = result;
          done();
        });
      });

      it("returns the existing user", function(done) {
        models.User.findOrCreateFromOAUTH(dummyProfileData, function(err, user, created) {
          expect(err).to.not.exist;

          expect(created).to.be.false;
          expect(user.get('email')).to.equal("bob@example.com");
          done();
        });
      });
    });
  });
});
