var helper  = require('../../support/spec_helper')
  , models  = require('../../models')
  , User    = models.User
  , Feed    = models.Feed
  , Article = models.Article
  , expect  = require('chai').expect
  , async   = require('async')
  , _       = require('lodash')
  , mmh3    = require('murmurhash3')
;

describe("Article model (RDBMS)", function() {
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
    this.data = {
      title: "article title here: with <brackets & such>"
      , description: "<p>article content here, with <brackets> and &'s</p>"
      , link: 'http://example.com/an_article'
      , date: new Date(2010,0)
      , guid: 'a guid here'
      , feed_id: this.feed.id
    }
  });

  it("can be saved", function(done) {
    Article.create(this.data).done(done);
  });

  it("cannot be created with an invalid feed_id ", function(done) {
    this.data.feed_id = 9000000;
    Article.create(this.data).done(function(err, article){
      expect(err).to.exist;
      expect(err).to.match(/foreign key constraint/i);

      done();
    });
  });

  it("cannot be created without a feed_id", function(done) {
    delete this.data.feed_id;
    Article.create(this.data).done(function(err, article){
      expect(err).to.exist;
      expect(err).to.match(/null/i);
      expect(err).to.match(/feed_id/i);

      done();
    });
  });

  describe(".cleanAttrs", function() {
    it("strips out unsupported attributes", function() {
      this.data.discarded = 'this will be thrown away';
      expect(Article.cleanAttrs(this.data)).to.not.have.key('discarded');
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
      this.sinon.spy(Article, 'cleanAttrs');
      this.sinon.spy(mmh3, 'murmur128Hex');
    });

    it("cleans the input before hashing", function(done) {
      Article.setGUID(this.data, function(err, attrs){
        expect(err).to.not.exist;

        expect(Article.cleanAttrs).to.have.been.calledWith(this.data);

        expect(attrs).to.be.ok;
        expect(attrs).to.not.equal(this.data);

        done();
      }.bind(this));
    });

    describe("when the input already has a guid", function() {
      it("does not overwrite it", function(done) {
        Article.setGUID(this.data, function(err, attrs){
          expect(err).to.not.exist;

          expect(attrs.guid).to.equal('a guid here');
          expect(mmh3.murmur128Hex).to.not.have.been.called;

          done();
        });
      });
    });

    describe("when the input does not have a guid", function() {
      beforeEach(function() {
        delete this.data['guid'];
      });

      it("generates a guid", function(done) {
        Article.setGUID(this.data, function(err, attrs){
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

      Article.findOrCreateFromData(this.data, function(err, article, created){
        expect(err).to.not.exist;

        expect(Article.findOrCreate).to.have.been.called;

        expect(created).to.be.true;
        expect(article).to.be.ok;
        expect(article.title).to.equal(this.data.title);

        done();
      }.bind(this));
    });
  });

  describe("#asEmailOptions", function() {
    describe("when there is content", function() {
      beforeEach(function(done) {
        var self = this
          , todo = []
        ;

        todo.push(function(done){
          Article
            .create(self.data)
            .error(done)
            .success(function(article){
              self.article = article;
              done();
            });
        });

        self.users = [];
        ['default_user@localhost', 'other_user@localhost'].forEach(function(email){
          todo.push(function(done){
            User
              .create({
                email: "default_user@localhost"
              })
              .error(done)
              .success(function(user){
                self.users.push(user);
                done();
              });
          });
        });

        async.parallel(todo, done);
      });

      it("generates a nodemailer-ready message", function() {
        var users = [this.user, this.other_user];

        var emailData = this.article.asEmailOptions(this.feed, users);

        expect(emailData).to.exist;

        var expectedHTML = [
          "<h1><a href=\"http://example.com/an_article\">article title here&colon; with &lt;brackets &amp; such&gt;</a></h1>",
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
          , date:  this.data.date
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


