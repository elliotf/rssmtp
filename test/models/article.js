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

  describe("#sendTo", function() {
    beforeEach(function() {
      this.feed    = new Feed({});
      this.article = new Article({});
      this.users   = [{fake: 'user'}];

      var fakeMailer = this.mailer = nodemailer.createTransport("Gmail", {});
      this.sinon.stub(fakeMailer, 'sendMail', function(options, done){
        done();
      });

      this.sinon.stub(nodemailer, 'createTransport', function(type, options){
        return fakeMailer;
      });

      var fakeOptions = this.emailOptions = {fake: 'emailOptions'};
      this.sinon.stub(this.article, 'asEmailOptions', function(feed, users, done){
        done(null, fakeOptions);
      });
    });

    it("sends the article as an email", function(done) {
      this.article.sendTo(this.feed, this.users, function(err){
        expect(err).to.not.exist;

        expect(this.article.asEmailOptions).to.have.been.calledWith(this.feed, this.users);
        expect(nodemailer.createTransport).to.have.been.calledWith("SMTP", {
          host: "smtp.example.com"
          , secureConnection: "true"
          , port: "465"
          , auth: {
            user: "no-reply@example.com"
            , pass: "dummy password"
          }
        });
        expect(this.mailer.sendMail).to.have.been.calledWith(this.emailOptions);

        done();
      }.bind(this));
    });
  });

  describe("#asEmailOptions", function() {
    describe("when there is content", function() {
      beforeEach(function(done) {
        this.feed = Feed.create({
          name: "my: feed's name"
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
          , title:     "my: article's title"
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

          var expectedHTML = [
            "<h1><a href=\"http://p.example.com/an_article\">my: article's title</a></h1>",
            '<p>some content</p>',
            '<br><br>',
            '<a href="http://rssmtp.firetaco.com/feed/', this.feed.id, '">unsubscribe</a>'
          ].join('');

          expect(email).to.be.like({
            from: "RSS - my_ feed's name <no-reply@example.com>"
            , to: "RSS - my_ feed's name <no-reply@example.com>"
            , bcc: 'default_user@example.com,other_user@example.com'
            , subject: "my_ article's title"
            , date: this.articleDate
            , headers: {
              "List-ID": this.feed.id + '.rssmtp.firetaco.com'
              , "List-Unsubscribe": 'http://rssmtp.firetaco.com/feed/' + this.feed.id
              , "List-Subscribe": 'http://rssmtp.firetaco.com/feed/' + this.feed.id
            }
            , html: expectedHTML
            , generateTextFromHTML: true
          });

          done();
        }.bind(this));
      });
    });
  });
});
