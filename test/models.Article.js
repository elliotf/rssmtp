var helper     = require('../support/spec_helper');
var models     = require('../models');
var User       = models.User;
var Feed       = models.Feed;
var Article    = models.Article;
var expect     = require('chai').expect;
var async      = require('async');
var _          = require('lodash');
var mmh3       = require('murmurhash3');

describe("Article model (RDBMS)", function() {
  var data;

  beforeEach(function(done) {
    Feed.create({
      url: "http://example.com/article.rss"
      , name: "my: feed's <name>, plus shotguns"
    })
    .error(done)
    .success(function(feed) {
      this.feed = feed;
      done();
    }.bind(this));
  });

  beforeEach(function() {
    data = {
      title: "article title here: with <brackets & such>"
      , description: "<p>article content here, with <brackets> and &'s</p>"
      , link: 'http://example.com/an_article'
      , date: new Date(2010,0)
      , guid: 'a guid here'
      , feed_id: this.feed.id
    };
  });

  it("can be saved", function(done) {
    Article.create(data).done(done);
  });

  // I don't think we care about this at the moment
  it.skip("cannot be created with an invalid feed_id ", function(done) {
    data.feed_id = 9000000;
    Article.create(data).done(function(err, article){
      expect(err).to.exist;
      expect(err).to.match(/foreign key constraint/i);

      done();
    });
  });

  it("cannot be created without a feed_id", function(done) {
    data.feed_id = null;

    Article.create(data).done(function(err, article){
      expect(err).to.exist;
      expect(err).to.match(/null/i);
      expect(err).to.match(/feed_id/i);

      done();
    });
  });

  describe(".cleanAttrs", function() {
    it("strips out unsupported attributes", function() {
      data.id        = 'a non numeric key that will be discarded';
      data.discarded = 'this will be thrown away';

      var cleaned = Article.cleanAttrs(data);
      expect(_.keys(cleaned)).to.include('description');
      expect(_.keys(cleaned)).to.not.include('discarded');
      expect(_.keys(cleaned)).to.not.include('id');
    });

    it("removes empty attributes to allow defaults to be set", function() {
      data.title = '';

      var cleaned = Article.cleanAttrs(data);
      expect(_.keys(cleaned)).to.include('description');
      expect(_.keys(cleaned)).to.not.include('title');
    });
  });

  describe(".setDefaults", function() {
    describe("when there is no title", function() {
      beforeEach(function() {
        delete data['title'];
      });

      describe.skip("but there is content", function() {
        beforeEach(function() {
          data.description = "<p>Article's content&nbsp;<b>here</b> &amp; more will be truncated because it's too long";
        });

        it("sets the title to be the first N char of the content", function() {
          var defaulted = Article.setDefaults(data);

          expect(defaulted.title + '').to.equal("Article's content here & more will be truncated because it's(...)");
        });
      });

      describe("but there is a link", function() {
        it("sets the title to be the first N char of the content", function() {
          var defaulted = Article.setDefaults(data);

          expect(defaulted.title).to.equal(data.link);
        });
      });
    });

    it("does not modify pre-existing values", function() {
      var defaulted = Article.setDefaults(data);

      expect(defaulted === data).to.be.false;
      expect(defaulted).to.deep.equal(data);
    });

    it("cleans attributes before setting defaults", function() {
      var fakeCleaned = {fake: 'cleaned'};

      this.sinon.stub(Article, 'cleanAttrs', function() { return fakeCleaned});

      var defaulted = Article.setDefaults(data);

      expect(Article.cleanAttrs).to.have.been.calledWith(data);

      expect(defaulted.fake).to.equal('cleaned');
    });
  });

  describe(".attrStringToHash", function() {
    it("concatenates attr key/value, sorted by key", function() {
      var expected = 'a: apple & c: capybara & z: zebra';
      expect(Article.attrStringToHash({z: 'zebra', a: 'apple', c: 'capybara'})).to.equal(expected);
    });
  });

  describe(".setGUID", function() {
    beforeEach(function() {
      this.sinon.spy(mmh3, 'murmur128Hex');
    });

    it("cleans the input before hashing", function(done) {
      this.sinon.stub(Article, 'setDefaults', function(){ return { fake: 'defaulted' };});

      Article.setGUID(data, function(err, attrs){
        expect(err).to.not.exist;

        expect(Article.setDefaults).to.have.been.calledWith(data);
        expect(mmh3.murmur128Hex).to.have.been.calledWith('fake: defaulted');

        expect(attrs).to.be.ok;
        expect(attrs).to.not.equal(data);

        done();
      }.bind(this));
    });

    describe("when the input already has a guid", function() {
      it("does not overwrite it", function(done) {
        Article.setGUID(data, function(err, attrs){
          expect(err).to.not.exist;

          expect(attrs.guid).to.equal('a guid here');
          expect(mmh3.murmur128Hex).to.not.have.been.called;

          done();
        });
      });
    });

    describe("when the input does not have a guid", function() {
      beforeEach(function() {
        delete data['guid'];
      });

      it("generates a guid", function(done) {
        Article.setGUID(data, function(err, attrs){
          expect(err).to.not.exist;

          expect(attrs.guid).to.match(/[0-9a-f]{32}/);

          expect(mmh3.murmur128Hex).to.have.been.called;

          done();
        });
      });
    });
  });

  describe(".findOrCreateFromData", function() {
    it("calls sequelize's findOrCreate using processed input", function(done) {
      this.sinon.spy(Article, 'findOrCreate');

      Article.findOrCreateFromData(data, function(err, article, created){
        expect(err).to.not.exist;

        expect(Article.findOrCreate).to.have.been.calledWith({guid: data.guid, feed_id: data.feed_id}, data);

        expect(created).to.be.true;
        expect(article).to.be.ok;
        expect(article.title).to.equal(data.title);

        done();
      }.bind(this));
    });
  });

  describe("#asEmailOptions", function() {
    describe("when there is content", function() {
      var article;
      var emails;

      beforeEach(function(done) {
        var todo = [];

        todo.push(function(done){
          Article
            .create(data)
            .error(done)
            .success(function(result){
              article = result;
              done();
            });
        });

        emails = [
          'default_user@example.com'
          , 'other_user@example.com'
        ];

        async.parallel(todo, done);
      });

      it("generates a nodemailer-ready message", function() {
        var emailData = article.asEmailOptions(this.feed, emails);

        expect(emailData).to.exist;

        var expectedHTML = [
          "<h1><a href=\"http://example.com/an_article\">article title here: with &lt;brackets &amp; such&gt;</a></h1>",
          "<p>article content here, with <brackets> and &'s</p>",
          "<br><br>",
          "<a href=\"http://rssmtp.firetaco.com/feed/", this.feed.id, "\">unsubscribe</a>"
        ].join('');

        expect(emailData.bcc).to.have.length(2);
        emailData.bcc.sort();

        var expected = {
          from: "RSS - my_ feed's _name_ plus shotguns <no-reply@example.com>"
          , to: "RSS - my_ feed's _name_ plus shotguns <no-reply@example.com>"
          , bcc: ['default_user@example.com', 'other_user@example.com']
          , subject: "article title here: with <brackets & such>"
          , date:  data.date
          , headers: {
            "List-ID": this.feed.id + '.rssmtp.firetaco.com'
            , "List-Unsubscribe": 'http://rssmtp.firetaco.com/feed/' + this.feed.id
            , "List-Subscribe": 'http://rssmtp.firetaco.com/feed/' + this.feed.id
          }
          , html: expectedHTML
          , generateTextFromHTML: true
        }

        expect(emailData).to.be.like(expected);
      });
    });
  });
});


