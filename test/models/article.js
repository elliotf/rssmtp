var helper     = require('../../support/spec_helper')
  , Article    = helper.model('article')
  , Feed       = helper.model('feed')
  , expect     = require('chai').expect
  , _          = require('underscore')
  , nodemailer = require('nodemailer')
;

describe("Article model", function() {
  describe("#getOrCreate", function() {
    beforeEach(function() {
      this.data = {
        description: 'desc here'
        , title: 'title here'
        , link: 'http://n.example.com'
        , date: new Date(86400 * 1000)
        , _feed: this.user.id
        , discarded: 'this will be thrown away'
      };

      this.sinon.spy(Article, 'create');
    });

    it("has basic attributes", function(done) {
      var attrs = _.extend({}, this.data, {
        hash: 'abc123'
      });

      Article.create(attrs, function(err, article){
        expect(err).to.not.exist;

        expect(article.discarded).to.not.exist;

        Article.findById(article.id, function(err, article){
          expect(err).to.not.exist;

          expect(article.description).to.equal('desc here');
          expect(article.title).to.equal('title here');
          expect(article.link).to.equal('http://n.example.com');
          expect(article._feed + "").to.be.like(this.user.id + "");

          expect(article.date).to.be.a('Date');
          expect(article.date.getTime()).to.equal(86400 * 1000);

          done();
        }.bind(this));
      }.bind(this));
    });

    describe("when a matching article does not exist", function() {
      it("creates a new article", function(done) {
        Article.getOrCreate(this.data, function(err, article, created){
          expect(err).to.not.exist;

          expect(article.title).to.equal('title here');
          expect(article.description).to.equal('desc here');
          expect(article.link).to.equal('http://n.example.com');
          expect(article.date.getTime()).to.equal(86400 * 1000);
          expect(article._feed).to.be.like(this.user._id);

          expect(created).to.be.true;

          done();
        }.bind(this));
      });
    });

    describe("when a matching article exists", function() {
      beforeEach(function(done) {
        Article.getOrCreate(this.data, done);
      });

      it("returns that article", function(done) {
        Article.create.reset();

        Article.getOrCreate(this.data, function(err, article, created){
          expect(err).to.not.exist;

          expect(Article.create).to.not.have.been.called;

          expect(article.title).to.equal('title here');
          expect(article.description).to.equal('desc here');
          expect(article.link).to.equal('http://n.example.com');
          expect(article.date.getTime()).to.equal(86400 * 1000);
          expect(article._feed).to.be.like(this.user._id);
          expect(created).to.be.false;

          done();
        }.bind(this));
      });
    });
  });

  describe("#asEmailOptions", function() {
    describe("when there is content", function() {
      beforeEach(function(done) {
        this.feed = Feed.create({
          name: 'feed name'
          , url: 'http://p.example.com'
        }, function(err, feed){
          this.feed = feed;

          done(err);
        }.bind(this));
      });

      beforeEach(function(done) {
        this.articleDate = new Date();
        this.article = Article.create({
          description: '<p>some content</p>'
          , title:     'my article title'
          , link:      'http://p.example.com/an_article'
          , hash:      'fake hash'
          , date:      this.articleDate
          , _feed:     this.feed.id
        }, function(err, article) {
          this.article = article;

          done(err);
        }.bind(this));
      });

      it("generates a nodemailer-ready message", function(done) {
        var users = [this.user, this.other_user];

        this.article.asEmailOptions(this.feed, users, function(err, email){
          expect(err).to.not.exist;

          expect(email).to.exist;

          expect(email).to.be.like({
            from: 'feed name <no-reply@example.com>'
            , to: 'feed name <no-reply@example.com>'
            , bcc: 'default_user@example.com,other_user@example.com'
            , subject: 'my article title'
            , date: this.articleDate
            , html: '<p>some content</p>'
          });

          done();
        }.bind(this));
      });
    });
  });
});
