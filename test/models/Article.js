var helper  = require('../../support/spec_helper')
  , models  = require('../../models')
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
});


