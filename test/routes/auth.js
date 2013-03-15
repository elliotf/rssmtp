var helper = require('../../support/spec_helper')
  , expect = require('chai').expect
;

describe("Auth routes", function() {
  beforeEach(helper.setupRequestSpec);

  describe("DELETE /session", function() {
    it("does untested things, but is there", function(done) {
      this.request
        .del('/session')
        .expect(302)
        .expect('location', '/', done);
    });
  });
});
