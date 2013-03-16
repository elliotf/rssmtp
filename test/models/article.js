var helper  = require('../../support/spec_helper')
  , Article = helper.model('article')
  , expect  = require('chai').expect
;

describe("Article model", function() {
  describe("#getOrCreate", function() {
    beforeEach(function() {
      this.data = {
        description: 'desc here'
        , title: 'title here'
        , link: 'http://n.example.com'
        , _feed: this.user.id
      };

      this.sinon.spy(Article, 'create');
    });

    describe("when a matching article does not exist", function() {
      it("creates a new article", function(done) {
        Article.getOrCreate(this.data, function(err, article, created){
          expect(err).to.not.exist;

          expect(article.title).to.equal('title here');
          expect(article.description).to.equal('desc here');
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
          expect(article._feed).to.be.like(this.user._id);
          expect(created).to.be.false;

          done();
        }.bind(this));
      });
    });
  });
});
