var helper = require('../../support/spec_helper')
  , expect = require('chai').expect
;

describe("Test routes", function() {
  beforeEach(helper.setupRequestSpec);

  describe("GET /test/session", function() {
    it("generates an anonymous session", function(done) {
      this.request
        .get('/test/session')
        .end(function(err, res){
          expect(err).to.not.exist;

          expect(res.status).to.equal(200);
          expect(res.body).to.include.keys(['passport', '_csrfToken', 'cookie']);
          expect(res.body._csrfToken).to.match(/^\S+$/);
          expect(res.body.passport).to.be.like({});

          done();
        }.bind(this));
    });

    describe("when provided a valid userId", function() {
      it("generates a valid session for that user", function(done) {
        this.request
          .get('/test/session')
          .send({userId: this.user._id})
          .end(function(err, res){
            expect(err).to.not.exist;

            expect(res.status).to.equal(200);
            expect(res.body).to.include.keys(['passport', '_csrfToken', 'cookie']);
            expect(res.body._csrfToken).to.match(/^\S+$/);
            expect(res.body.passport).to.be.like({
              user: this.user._id + ""
            });

            done();
          }.bind(this));
      });
    });
  });
});
