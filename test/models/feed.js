var helper     = require('../../support/spec_helper')
  , Feed       = helper.model('feed')
  , request    = require('request')
  , feedparser = require('feedparser')
  , expect     = require('chai').expect
;

describe("Feed model", function() {
  describe(".fetch", function() {
    beforeEach(function() {
      this.sinon.stub(request, 'get', function(url, done){
        done(null, 'fake response', 'fake body');
      });

      this.sinon.stub(feedparser, 'parseString', function(url, done){
        done(null, 'fake meta', 'fake articles');
      });
    });

    it("fetches the provided url", function(done) {
      Feed.fetch('http://a.example.com', function(err, meta, articles){
        expect(err).to.not.exist;

        expect(request.get).to.have.been.called;
        var args = {
          url: 'http://a.example.com'
          , jar: false
        };
        expect(request.get).to.have.been.calledWith(args);

        done(err);
      });
    });

    it("returns the parsed feed file", function(done) {
      Feed.fetch('http://b.example.com', function(err, meta, articles){
        expect(err).to.not.exist;

        expect(feedparser.parseString).to.have.been.called;
        expect(feedparser.parseString).to.have.been.calledWith('fake body');

        expect(meta).to.equal('fake meta');
        expect(articles).to.equal('fake articles');

        done();
      });
    });
  });
});
