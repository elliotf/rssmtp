var helper  = require('../../support/spec_helper')
  , request = require('request')
  , expect  = require('chai').expect
  , _       = require('underscore')
  , async   = require('async')
  , Scraper = helper.model('scraper')
;

describe("Scraper model", function() {
  beforeEach(function() {
    var self = this;

    this.sinon.stub(request, 'get', function(url, done){
      done(self.request_error, self.request_response, self.request_body);
    });

    self.request_error    = null;
    self.request_response = {
        fake: 'request response'
      , statusCode: 200
    };
    self.request_body     = '<html><head></head><body></body></html>';

    this.fakeRequest = {
      get: function(url, done) {
        done(self.request_error, self.request_response, self.request_body);
      }
    };
    this.sinon.spy(this.fakeRequest, 'get');
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

    it("looks for feeds in the response body", function(done) {
      this.sinon.spy(this.model, 'feedsInHTML');

      this.request_body = '#feedsForURL dummy request body';

      this.model.feedsForURL('http://example.com', function(err, feeds){
        expect(err).to.not.exist;

        expect(this.model.feedsInHTML).to.have.been.calledWith('#feedsForURL dummy request body');

        done();

      }.bind(this));
    });
  });

  describe("#feedsInHTML", function() {
    describe("when provided an HTML string", function() {
      beforeEach(function() {
        this.sampleHTML = '';
      });

      describe("with RSS alternate links", function() {
        beforeEach(function() {
          this.sampleHTML = [
            '<html>'
            , '<head>'
            , '<link rel="alternate" type="application/atom+xml" title="Atom comments feed" href="/feeds/comments.xml">'
            , '<link type="application/rss+xml" rel="alternate" title="RSS articles feed" href="/feeds/articles.xml">'
            , '<link rel="icon" href="/whatever.png">'
            , '</head>'
            , '<body>'
            , 'can haz body'
            , '</body></html>'
          ].join('');
        });

        it("returns an array of feeds", function() {
          var feeds = this.model.feedsInHTML(this.sampleHTML);

          expect(feeds).to.have.length(2);
          expect(_.pluck(feeds, 'title')).to.be.like(['Atom comments feed', 'RSS articles feed']);
          expect(_.pluck(feeds, 'href')).to.be.like(['/feeds/comments.xml', '/feeds/articles.xml']);
        });
      });
    });
  });
});
