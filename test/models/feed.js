var helper     = require('../../support/spec_helper')
  , Feed       = helper.model('feed')
  , request    = require('request')
  , feedparser = require('feedparser')
  , expect     = require('chai').expect
  , _          = require('underscore')
  , async      = require('async')
  , moment     = require('moment')
;

describe("Feed model", function() {
  beforeEach(function() {
    this.sinon.stub(request, 'get', function(url, done){
      done(null, 'fake response', 'fake body');
    });
  });

  describe(".fetch", function() {
    beforeEach(function() {
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

  describe("#getLock", function() {
    beforeEach(function(done) {
      Feed.create({
        name: '#getLock'
        , url: 'http://j.example.com'
      }, function(err, feed){
        this.feed = feed;
        done(err);
      }.bind(this));
    });

    it("marks a feed as locked", function(done) {
      var prevLockExpire = this.feed.lockExpire;

      expect(prevLockExpire).to.exist;
      expect(prevLockExpire).to.be.above(0);
      expect(prevLockExpire).to.be.below(Date.now());

      this.feed.getLock(6000, function(err, haveLock, feed){
        expect(err).to.not.exist;

        expect(haveLock).to.be.true;
        expect(feed.lockExpire).to.be.above(prevLockExpire);

        done();
      }.bind(this));
    });

    describe("when another process already has the lock", function() {
      it("does not allow another process to lock it", function(done) {
        this.feed.getLock(6000, function(err, locked){
          expect(err).to.not.exist;

          expect(locked).to.be.true;

          setTimeout(function(){
            Feed.findById(this.feed.id, function(err, feed){
              expect(err).to.not.exist;

              feed.getLock(6000, function(err, locked){
                expect(err).to.not.exist;

                expect(locked).to.be.false;

                done();
              });
            });
          }.bind(this), 2);
        }.bind(this));
      });
    });

    describe("when the lock has expired", function() {
      it("allows another process to lock it", function(done) {
        this.feed.getLock(1, function(err, locked){
          expect(err).to.not.exist;

          expect(locked).to.be.true;

          setTimeout(function(){
            Feed.findById(this.feed.id, function(err, feed){
              expect(err).to.not.exist;

              feed.getLock(1, function(err, locked){
                expect(err).to.not.exist;

                expect(locked).to.be.true;

                done();
              });
            });
          }.bind(this), 2);
        }.bind(this));
      });
    });

    describe("when multiple processes attempt to lock at the same time", function() {
      it("should give the lock to only one", function(done) {
        var todo = [];
        var feeds = [];

        var numWorkers = 8;
        for (var i = 0; i < numWorkers; ++i) {
          todo.push(function(done){
            Feed.findById(this.feed.id, function(err, feed){
              expect(err).to.not.exist;

              feeds.push(feed);

              done(err);
            });
          }.bind(this));
        }

        async.parallel(todo, function(err){
          var todo = [];
          var numLocked = 0;

          feeds.forEach(function(feed){
            todo.push(function(done){
              feed.getLock(6000, function(err, haveLock){
                expect(err).to.not.exist;

                if (haveLock) numLocked++;

                done();
              });
            });
          });

          async.parallel(todo, function(err){
            expect(numLocked).to.equal(1);

            done();
          });
        });
      });
    });
  });

  describe(".getOutdated", function() {
    beforeEach(function(done) {
      var todo = [];

      todo.push(function(done){
        Feed.create({
          name: 'is up-to-date'
          , url: 'http://k.example.com'
          , lastPublished: new Date()
        }, function(err, feed){
          expect(err).to.not.exist;

          this.uptodate = feed;

          done();
        }.bind(this));
      }.bind(this));

      todo.push(function(done){
        Feed.create({
          name: 'needs an update 2'
          , url: 'http://l.example.com'
          , lastPublished: moment(86400).toDate()
        }, function(err, feed){
          expect(err).to.not.exist;

          this.outdated = feed;

          done();
        }.bind(this));
      }.bind(this));

      todo.push(function(done){
        Feed.create({
          name: 'needs an update 1'
          , url: 'http://l.example.com'
        }, function(err, feed){
          expect(err).to.not.exist;

          this.outdated = feed;

          done();
        }.bind(this));
      }.bind(this));

      async.parallel(todo, done);
    });

    it("returns the most outdated field", function(done) {
      Feed.getOutdated(function(err, feed){
        expect(err).to.not.exist;

        expect(feed).to.exist;
        expect(feed.name).to.be.equal('needs an update 1');

        done();
      }.bind(this));
    });
  });

  describe("#fetch", function() {
    beforeEach(function(done) {
      this.meta = {};
      this.articles = [];

      var self = this;
      this.sinon.stub(feedparser, 'parseString', function(url, done){
        done(null, self.meta, self.articles);
      });

      Feed.create({
        name: '#fetch'
        , url: 'http://l.example.com'
      }, function(err, feed){
        this.feed = feed;

        done(err);
      }.bind(this));
    });

    it("returns the current feed contents", function(done) {
      this.meta     = {fake: 'meta'};
      this.articles = [{fake: 'article'}];

      this.feed.fetch(function(err, meta, articles){
        expect(request.get).to.have.been.calledWith({
          jar: false
          , url: 'http://l.example.com'
        });

        expect(err).to.not.exist;

        expect(meta).to.be.like({ fake: 'meta' });
        expect(articles).to.be.like([{ fake: 'article' }]);

        done();
      });
    });
  });

  describe.skip("#merge", function() {
    it("records new articles", function() {
    });

    it("mails new articles", function() {
    });

    it("does not re-mail previously mailed articles", function() {
    });
  });

  describe("#pull", function() {
    beforeEach(function() {
      this.feed = new Feed({
      });

      this.sinon.stub(this.feed, 'fetch', function(done){
        done(null, 'fake meta', 'fake articles');
      });

      this.sinon.stub(this.feed, 'merge', function(meta, articles, done){
        done(null);
      });
    });

    it("calls fetch and merge", function(done) {
      this.feed.pull(function(err){
        expect(this.feed.fetch).to.have.been.called;
        expect(this.feed.merge).to.have.been.calledWith('fake meta', 'fake articles');

        done();
      }.bind(this));
    });
  });
});
