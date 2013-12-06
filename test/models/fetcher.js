var models     = require('../../models')
  , expect     = require('chai').expect
;

describe("Fetcher model", function() {
  it("can be instantiated", function() {
    var fetcher = new models.fetcher();

    expect(fetcher).to.be.an.instanceof(models.fetcher);
  });
});
