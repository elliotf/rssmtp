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
  beforeEach(function() {
    this.fakeHttpErr      = null; //{fake: 'HttpErr'};
    this.fakeHttpResponse = {fake: 'HttpResponse'};
    this.fakeHttpBody     = {fake: 'HttpBody'};
    this.fakeRssString    = [
      '<rss version="2.0"><channel><title>a title</title></channel></rss>'
    ].join('');

    this.sinon.stub(request, 'get', function(args, done){
      done(this.fakeHttpErr, this.fakeHttpResponse, this.fakeHttpBody);
    }.bind(this));

    this.sinon.spy(feedparser, 'parseString');
  });

  describe(".fetch", function() {
    it("is a wrapper around 'request' and 'feedparser'", function(done) {
      this.fakeHttpBody = this.fakeRssString;

      Feed.fetch('http://example.com/rss.xml', function(err, meta, articles){
        expect(err).to.not.exist;
        expect(request.get).to.have.been.calledWith('http://example.com/rss.xml');

        expect(feedparser.parseString).to.have.been.calledWith(this.fakeRssString);
        expect(meta.title).to.equal('a title');
        expect(articles).to.be.like([]);

        done();
      }.bind(this));
    });
  });

  it("can be saved", function(done) {
    Feed.create({
      url: "http://example.com"
      , name: "an example feed"
    }).done(done);
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

