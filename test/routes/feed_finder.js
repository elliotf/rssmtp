var helper = require('../../support/spec_helper')
  , expect = require('chai').expect
  , Feed   = helper.model('feed')
  , User   = helper.model('user')
;

describe.only("Feed Finder routes", function() {
  beforeEach(helper.setupRequestSpec);

  beforeEach(function(done) {
    this.loginAs(this.user, done);
  });

  describe("GET /find/*", function() {
    it("returns 200", function(done) {
      this.request
        .get('/find/waffles')
        .expect(200, done);
    });
  });
});

