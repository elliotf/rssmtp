var helper  = require('../../support/spec_helper')
  , models  = require('../../models')
  , Feed    = models.Feed
  , Article = models.Article
  , expect  = require('chai').expect
  , async   = require('async')
  , _       = require('lodash')
;

describe("Article model (RDBMS)", function() {
  beforeEach(function(done) {
    Feed.create({
      url: "http://example.com/article.rss"
    })
    .error(done)
    .success(function(feed) {
      this.feed = feed;
      done();
    }.bind(this));
  });

  beforeEach(function() {
    this.data = {
      description: 'article description here'
      , title: 'article title here'
      , link: 'http://example.com/whatever'
      , date: new Date(86400 * 1000)
      , guid: 'a guid'
      , discarded: 'this will be thrown away'
    }
  });

  it("can be saved", function(done) {
    Article.create({
      link: 'http://example.com'
      , title: 'an article'
      , description: 'more details here'
      , date: Date.now()
      , guid: 'asdfasdf123'
    }).done(done);
  });

  describe(".cleanAttrs", function() {
    it("strips out unsupported attributes", function() {
      expect(Article.cleanAttrs(this.data)).to.not.have.key('discarded');
    });
  });

  describe(".attrStringToHash", function() {
    it("concatenates attr key/value, sorted by key", function() {
      var expected = 'a: apple & c: capybara & z: zebra';
      expect(Article.attrStringToHash({z: 'zebra', a: 'apple', c: 'capybara'})).to.equal(expected);
    });
  });
});


