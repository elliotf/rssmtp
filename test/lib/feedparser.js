var expect     = require('chai').expect
  , FeedParser  = require('../../lib/feedparser')
;

describe("FeedParser", function() {
  beforeEach(function() {
    this.feedStr = [
      '<?xml version="1.0" encoding="utf-8"?>'
      , '<feed xmlns="http://www.w3.org/2005/Atom">'
        , '<title>feed title</title>'
        , '<entry>'
          , '<id>article guid</id>'
          , '<title>article title</title>'
          , '<content>article content</content>'
          , '<updated>2013-11-24T00:00:00-08:00</updated>'
        , '</entry>'
        , '<entry>'
          , '<id>article 2 guid</id>'
          , '<title>article 2 title</title>'
          , '<content>article 2 content</content>'
          , '<updated>2013-11-25T00:00:00-08:00</updated>'
        , '</entry>'
      , '</feed>'
    ].join('');
  });

  it("returns metadata in feed XML", function(done) {
    FeedParser.parseString(this.feedStr, function(err, meta, articles){
      expect(err).to.not.exist;

      expect(meta.title).to.equal('feed title');

      done();
    });
  });

  it("returns articles in feed XML", function(done) {
    FeedParser.parseString(this.feedStr, function(err, meta, articles){
      expect(err).to.not.exist;

      expect(articles).to.be.a('Array');
      expect(articles).to.have.length(2);

      done();
    });
  });

  describe("when given garbage", function() {
    it("returns an error", function(done) {
      FeedParser.parseString('this is not a valid feed string', function(err, meta, articles){
        expect(err).to.exist;

        expect(meta).to.not.exist;

        expect(articles).to.be.a('Array');

        done();
      });
    });
  });
});

