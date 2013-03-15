var helper = require('../../support/spec_helper')
  , expect = require('chai').expect
  , User   = helper.model('user')
;

describe("User model", function() {
  describe(".getOrCreateByProviderId", function() {
    beforeEach(function() {
      this.sinon.stub(User, 'create', function(args, done){
        done(null, {fake: "user"});
      });
    });

    describe("when a user exists with that provider/id", function() {
      beforeEach(function(done) {
        this.user.accounts = [
          { provider: 'google', id: '8675309' }
        ];
        this.user.save(done);
      });

      it("returns that user", function(done) {
        var self = this;
        User.getOrCreateByProviderId('google', '8675309', function(err, user){
          expect(err).to.not.exist;
          expect(user).to.exist;
          expect(user.id).to.be.like(this.user.id);
          expect(User.create).to.not.have.been.called;

          done();
        }.bind(this));
      });
    });

    describe("when a user does not exist with that provider/id", function() {
      it("creates a new user", function(done) {
        var self = this;
        User.getOrCreateByProviderId('google', '1234567', function(err, user){
          expect(User.create).to.have.been.calledWith({
            accounts: [
              { provider: 'google', id: '1234567' }
            ]
          });
          expect(err).to.not.exist;
          expect(user).to.be.like({fake: "user"});

          done();
        });
      });
    });
  });
});
