var helper     = require('../../support/spec_helper')
  , models     = require('../../models')
  , User       = models.User
  , Feed       = models.Feed
  , Article    = models.Article
  , expect     = require('chai').expect
  , async      = require('async')
  , _          = require('lodash')
  , request    = require('request')
  , feedparser = require('../../lib/feedparser')
  , moment     = require('moment')
;

describe("Feed model (RDBMS)", function() {
  beforeEach(function() {
    this.feedTitle = 'a title';

    this.fakeHttpErr      = null; //{fake: 'HttpErr'};
    this.fakeHttpResponse = {fake: 'HttpResponse'};
    this.fakeHttpBody     = [
      '<?xml version="1.0" encoding="utf-8"?>'
      , '<feed xmlns="http://www.w3.org/2005/Atom">'
        , '<title>a title</title>'
      , '</feed>'
    ].join('');

    this.sinon.stub(request, 'get', function(args, done){
      done(this.fakeHttpErr, this.fakeHttpResponse, this.fakeHttpBody);
    }.bind(this));

    this.sinon.spy(feedparser, 'parseString');
  });

  it("can be saved", function(done) {
    Feed
      .create({
        url: "http://example.com"
        , name: "an example feed"
      })
      .error(done)
      .success(function(feed){
        expect(feed.last_fetched).to.be.below(Date.now());

        done();
      });
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
    describe("when there are stale feeds", function() {
      beforeEach(function(done) {
        var todo = [];

        var updatedSecondsAgo = 5 * 1000;

        todo.push(function(done){
          Feed
            .create({
              name: "Updated more recently"
              , url: "http://example.com/more_recent"
              , last_fetched: (moment().subtract(updatedSecondsAgo).toDate())
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

      it("returns the least recently updated feed", function(done) {
        Feed
          .getOutdated(function(err, feed){
            expect(err).to.not.exist;

            expect(feed).to.be.ok;

            expect(feed.name).to.equal("Never been updated");

            done();
          });
      });
    });

    describe("when all feeds have been updated recently", function() {
      beforeEach(function(done) {
        Feed
          .create({
            name: "Never been updated"
            , url: "http://example.com/less_recent"
            , last_fetched: new Date()
          })
          .done(done);
      });

      it("does not return a feed", function(done) {
        Feed.getOutdated(function(err, feed){
          expect(err).to.not.exist;

          expect(feed).to.be.undefined;

          done();
        });
      });
    });
  });

  describe("methods", function() {
    beforeEach(function(done) {
      Feed
        .create({
          name: 'Feed methods feed'
          , url: 'http://example.com/feed_methods'
        })
        .error(done)
        .success(function(feed){
          this.feed = feed;
          done();
        }.bind(this));

      this.fakeHttpBody     = [
        '<?xml version="1.0" encoding="utf-8"?>'
        , '<feed xmlns="http://www.w3.org/2005/Atom">'
          , '<title>a title</title>'
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

    describe("#merge", function() {
      beforeEach(function(done) {
        this.articles = [
          {
            description: 'article exists description'
            , title: 'article exists title'
            , link: 'http://example.com/exists'
            , guid: 'article exists guid'
          }
          , {
            description: 'new article'
            , title: 'new article title'
            , link: 'http://example.com/new_article'
            , guid: 'new article guid'
          }
        ];

        var attrs = _.merge({}, this.articles[0], { feed_id: this.feed.id});

        Article
          .create(attrs)
          .done(done);
      });

      it("findOrCreate()s articles passed in, calling the callback with created articles", function(done) {
        this.feed.merge(this.articles, function(err, newArticles){
          expect(err).to.not.exist;
          expect(newArticles).to.be.ok;
          expect(newArticles).to.have.length(1);
          expect(newArticles[0].title).to.equal('new article title')

          done();
        });
      });
    });

    describe("#pull", function() {
      beforeEach(function() {
        this.sinon.spy(Feed, 'fetch');
        this.sinon.spy(this.feed, 'merge');
        this.sinon.spy(this.feed, 'touch')
      });

      it("fetches and merges", function(done) {
        this.feed.pull(function(err, articles){
          expect(err).to.not.exist;

          expect(Feed.fetch).to.have.been.calledWith('http://example.com/feed_methods');
          expect(this.feed.merge).to.have.been.called;

          expect(articles).to.have.length(2);
          done();
        }.bind(this));
      });

      it("touches itself", function(done) {
        var feed   = this.feed
          , before = feed.last_fetched
        ;

        feed.pull(function(err, articles){
          expect(err).to.not.exist;

          expect(feed.touch).to.have.been.called;

          done();
        });
      });

      describe("when there is a problem fetching", function() {
        it("still touches itself", function(done) {
          var feed   = this.feed
            , before = feed.last_fetched
          ;

          this.fakeHttpBody     = 'not valid rss or atom';

          feed.pull(function(err, articles){
            expect(err).to.exist;
            expect(articles).to.be.like([]);

            expect(feed.touch).to.have.been.called;

            done();
          });
        });
      });
    });

    describe("#publish", function() {
      beforeEach(function(done) {
        this.sinon.spy(this.feed, 'pull');

        User
          .create({
            email: 'default_user@example.com'
          })
          .done(function(err, user){
            this.user = user;
            done(err);
          }.bind(this));
      });

      describe("when users are subscribed", function() {
        beforeEach(function(done) {
          this.user.addFeed(this.feed).done(done);

          this.mailer = {
            sendMail: this.sinon.stub()
          };

          this.mailer.sendMail.callsArg(1);
        });

        it("sends new articles to subscribed users", function(done) {
          this.feed.publish(this.mailer, function(err, feed, articles){
            expect(err).to.not.exist;
            expect(this.feed.pull).to.have.been.called;

            expect(feed.name).to.equal(this.feed.name);

            expect(articles).to.be.a('array');
            expect(articles).to.have.length(2);
            expect(this.mailer.sendMail).to.have.been.calledTwice;
            expect(this.mailer.sendMail).to.have.been.calledWith(articles[0].asEmailOptions(this.feed, ['default_user@example.com']));
            expect(this.mailer.sendMail).to.have.been.calledWith(articles[1].asEmailOptions(this.feed, ['default_user@example.com']));

            done();
          }.bind(this));
        });
      });

      describe("when no users are subscribed", function() {
        it("does not pull", function(done) {
          this.feed.publish(this.mailer, function(err){
            expect(err).to.not.exist;
            expect(this.feed.pull).to.not.have.been.called;

            done();
          }.bind(this));
        });

        it("touches itself", function(done) {
          var feed = this.feed
          ;

          this.sinon.spy(feed, 'touch');

          feed.publish(this.mailer, function(err){
            expect(err).to.not.exist;

            expect(feed.touch).to.have.been.called;

            done();
          });
        });
      });
    });

    describe("#touch", function() {
      it("updates the last_fetched column", function(done) {
        var feed   = this.feed
          , before = feed.last_fetched
        ;

        feed.touch(function(err){
          expect(err).to.not.exist;

          expect(feed.last_fetched).to.be.above(before);

          feed
            .reload()
            .error(done)
            .success(function(){
            expect(feed.last_fetched).to.be.above(before);

            done();
          });
        });
      });
    });

    describe("#asRequestOptions", function() {
      it("returns a `request` ready options object", function() {
        var options = this.feed.asRequestOptions();

        expect(options).to.have.keys(['url', 'headers']);
        expect(options.url).to.equal('http://example.com/feed_methods');
        expect(options.headers).to.have.keys(['Last-Modified']);

        // This assertion is stupid.  The reason for this stupidity is due to timezone differences.
        expect(options.headers['Last-Modified']).to.match(/^\w{3}, \d{2} \w{3} \d{4} \d\d:\d\d:\d\d [-+]?\d{4}$/);
      });
    });
  });
});

