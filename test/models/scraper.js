var helper  = require('../../support/spec_helper')
  , request = require('request')
  , expect  = require('chai').expect
  , _       = require('underscore')
  , async   = require('async')
  , Scraper = helper.model('scraper')
;

describe.only("Scraper model", function() {
  beforeEach(function() {
    var self = this;

    this.sinon.stub(request, 'get', function(url, done){
      done(self.request_error, self.request_response, self.request_body);
    });

    self.scrape_error = null;
    self.scrape_feeds = [];

    this.fakeRequest = {
      get: this.sinon.stub().callsArgWith(1, self.scrape_error, self.scrape_feeds)
    };
  });

  beforeEach(function() {
    this.model = new Scraper({
      fetcher: this.fakeRequest
    });
  });

  it("can be instantiated", function() {
    expect(this.model).to.exist;
  });

  describe("when a fetcher is not provided", function() {
    it("defaults to 'request'", function() {
      var scraper = new Scraper();

      expect(scraper.fetcher).to.equal(request);
    });
  });

  describe("#feedsForURL", function() {
    it("exists", function() {
      expect(this.model.feedsForURL).to.be.a('function');
    });

    it("fetches the provided URL", function(done) {
      this.model.feedsForURL('http://example.com', function(err, feeds){
        expect(err).to.not.exist;

        expect(this.fakeRequest.get).to.have.been.calledWith('http://example.com');
        done();

      }.bind(this));
    });
  });
});
