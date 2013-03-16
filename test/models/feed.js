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

  describe(".getOrCreateFromURL", function() {
    beforeEach(function() {
      this.sinon.stub(Feed, 'createFromURL', function(url, done){
        done();
      });
    });

    describe("when a feed with that url exists", function() {
      beforeEach(function(done) {
        Feed.create({
          url: 'http://c.example.com/rss'
        }, done);
      });

      it("returns the existing feed", function(done) {
        Feed.getOrCreateFromURL('http://c.example.com/rss', function(err, feed){
          expect(Feed.createFromURL).not.to.have.been.called;

          expect(feed).to.exist;
          expect(feed.url).to.equal('http://c.example.com/rss');

          done();
        });
      });
    });

    describe("when a feed with that url does not exist", function() {
      it("creates a new feed", function(done) {
        Feed.getOrCreateFromURL('http://c.example.com/rss', function(err, feed){
          expect(err).to.not.exist;

          expect(Feed.createFromURL).to.have.been.calledWith('http://c.example.com/rss');

          done();
        });
      });
    });
  });

  describe(".createFromURL", function() {
    beforeEach(function() {
      this.sinon.stub(Feed, 'fetch', function(url, done){
        done(null, this.feedMetadata, this.feedArticles);
      }.bind(this));

      this.sinon.spy(Feed, 'create');

      this.feedMetadata = {};
      this.feedArticles = [];
    });

    it("creates a feed based on the contents of the url", function(done) {
      this.feedMetadata.title  = 'A <i>fake</i> feed';
      this.feedMetadata.xmlUrl = 'https://redirected.example.com';

      Feed.createFromURL('http://d.example.com', function(err, feed){
        expect(err).to.not.exist;

        expect(Feed.create).to.have.been.calledWith({
          url: 'https://redirected.example.com'
          , name: 'A <i>fake</i> feed'
        });

        expect(feed).to.exist;
        expect(feed.url).to.equal('https://redirected.example.com');
        expect(feed.name).to.equal('A <i>fake</i> feed');

        done();
      });
    });
  });
});
