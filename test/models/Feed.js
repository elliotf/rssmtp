var helper     = require('../../support/spec_helper')
  , models     = require('../../models')
  , Feed       = models.Feed
  , Article    = models.Article
  , expect     = require('chai').expect
  , async      = require('async')
  , _          = require('lodash')
  , request    = require('request')
  , feedparser = require('feedparser')
  , moment     = require('moment')
;

describe("Feed model (RDBMS)", function() {
  it("can be saved", function(done) {
    Feed
      .create({
        url: "http://example.com"
        , name: "an example feed"
      })
      .error(done)
      .success(function(feed){
        expect(feed.lastUpdated).to.be.below(Date.now());

        done();
      });
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

  describe(".getOrCreateFromURL", function() {
    beforeEach(function() {
      this.sinon.spy(Feed, 'fetch');
      this.sinon.spy(Feed, 'findOrCreate');
    });

    it("findsOrCreate()s a Feed based on the URL", function(done) {
      Feed.getOrCreateFromURL('a fake url', function(err, feed, created, meta, articles){
        expect(err).to.not.exist;

        expect(Feed.fetch).to.have.been.calledWith('a fake url');
        expect(Feed.findOrCreate).to.have.been.calledWith({
          name: 'a title'
          , url: 'a fake url'
        });

        expect(created).to.be.true;
        expect(meta.title).to.equal('a title');
        expect(articles).to.be.like([]);

        done();
      });
    });

    describe("when an invalid URL is provided", function() {
      it("returns an error", function(done) {
        request.get.restore();

        Feed.getOrCreateFromURL('an invalid format url', function(err, feed, created, meta, articles){
          expect(err).to.exist;

          done();
        });
      });
    });

    describe("when non-feed URL is provided", function() {
      it("returns an error", function(done) {
        this.fakeHttpBody = 'not a valid feed body';

        Feed.getOrCreateFromURL('http://example.com', function(err, feed, created, meta, articles){
          expect(err).to.exist;

          done();
        });
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

  describe(".getOutdated", function() {
    beforeEach(function(done) {
      var todo = [];

      var updatedSecondsAgo = 5 * 1000;

      todo.push(function(done){
        Feed
          .create({
            name: "Updated more recently"
            , url: "http://example.com/more_recent"
            , lastUpdated: (moment().subtract(updatedSecondsAgo).toDate())
          })
          .done(done);
      });

      todo.push(function(done){
        Feed
          .create({
            name: "Never been updated"
            , url: "http://example.com/less_recent"
          })
          .done(done);
      });

      async.series(todo, done);
    });

    it("returns the least recently updated N feeds in ascending updated order", function(done) {
      var numToGet = 2;

      Feed
        .getOutdated(numToGet, function(err, feeds){
          expect(err).to.not.exist;

          expect(feeds).to.have.length(numToGet);

          expect(feeds[0].name).to.equal("Never been updated");
          expect(feeds[1].name).to.equal("Updated more recently");

          done();
        });
    });
  });
});

