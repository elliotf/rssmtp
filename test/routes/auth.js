var helper = require('../../support/spec_helper')
  , expect = require('chai').expect
;

describe("Auth routes", function() {
  beforeEach(helper.setupRequestSpec);

  describe("DELETE /session", function() {
    describe("when logged in", function() {
      beforeEach(function(done) {
        this.loginAs(this.user, done);
      });

      it("does untested things, but is there", function(done) {
        this.request
          .del('/session')
          .expect(302)
          .expect('location', '/')
          .end(function(err, res){
            expect(err).to.not.exist;

            done();
          });
      });
    });

    describe("when not logged in", function() {
      it("does untested things, but is there", function(done) {
        this.request
          .del('/session')
          .expect(302)
          .expect('location', '/')
          .end(function(err, res){
            expect(err).to.not.exist;

            done();
          });
      });
    });
  });
});
