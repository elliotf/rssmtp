var helper = require('../../support/spec_helper')
  , expect = require('chai').expect
;

describe("GET /", function() {
  beforeEach(helper.setupRequestSpec);

  it("displays the site title", function(done) {
    this.request
      .get('/')
      .end(function(err, res){
        expect(res.status).to.equal(200);

        var $ = helper.$(res.text);

        expect($('h1').eq(0).text()).to.match(/rss.*email/);

        done();
      });
  });
});
