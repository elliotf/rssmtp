var helper     = require('../../support/spec_helper')
  , models     = require('../../models')
  , Feed       = models.Feed
  , Article    = models.Article
  , expect     = require('chai').expect
  , async      = require('async')
  , _          = require('lodash')
  , request    = require('request')
  , feedparser = require('feedparser')
;

describe("Feed model (RDBMS)", function() {
  it("can be saved", function(done) {
    Feed.create({
      url: "http://example.com"
      , name: "an example feed"
    }).done(done);
  });

  beforeEach(function() {
    this.feedTitle = 'a title';

    this.fakeHttpErr      = null; //{fake: 'HttpErr'};
    this.fakeHttpResponse = {fake: 'HttpResponse'};
    this.fakeHttpBody     = [
      '<rss version="2.0"><channel><title>a title</title></channel></rss>'
    ].join('');

    this.sinon.stub(request, 'get', function(args, done){
      done(this.fakeHttpErr, this.fakeHttpResponse, this.fakeHttpBody);
    }.bind(this));

    this.sinon.spy(feedparser, 'parseString');
  });

  describe(".fetch", function() {
    it("is a wrapper around 'request' and 'feedparser'", function(done) {
      Feed.fetch('http://example.com/rss.xml', function(err, meta, articles){
        expect(err).to.not.exist;
        expect(request.get).to.have.been.calledWith('http://example.com/rss.xml');

        expect(feedparser.parseString).to.have.been.calledWith(this.fakeHttpBody);
        expect(meta.title).to.equal('a title');
        expect(articles).to.be.like([]);

        done();
      }.bind(this));
    });
  });

  describe(".createFromURL", function() {
    beforeEach(function() {
      this.sinon.spy(Feed, 'fetch');
      this.sinon.spy(Feed, 'create');
    });

    it("creates a feed based on the contents of the url", function(done) {
      Feed.createFromURL('a fake url', function(err, feed, meta, articles){
        expect(err).to.not.exist;

        expect(Feed.fetch).to.have.been.calledWith('a fake url');
        expect(Feed.create).to.have.been.calledWith({
          url: 'a fake url'
          , name: 'a title'
        });

        expect(meta.title).to.equal('a title');
        expect(articles).to.be.like([]);

        done();
      });
    });
  });

  describe("hasMany Articles", function() {
    beforeEach(function(done) {
      var todo = []
        , self = this
      ;

      Feed.create({
        url: "http://example.com"
      })
        .error(done)
        .success(function(model){
          self.feed = model;
          done();
        })
    });

    describe("#addArticle", function() {
      it("adds articles", function(done) {
        var self = this
        ;

        var article = Article.build({
          link: 'http://example.com'
          , title: 'an article'
          , description: 'more details here'
          , date: Date.now()
          , guid: 'asdfasdf123'
        });

        this.feed.addArticle(article)
          .error(done)
          .success(function(article){
            done();
          });
      });
    });
  });
});

