var helper = require('../../support/spec_helper')
  , expect = require('chai').expect
  , Feed   = helper.model('feed')
  , User   = helper.model('user')
;

describe("Main routes", function() {
  beforeEach(helper.setupRequestSpec);

  describe("GET /", function() {

    it("displays the site title", function(done) {
      this.request
        .get('/')
        .end(function(err, res){
          expect(res.status).to.equal(200);

          var $ = helper.$(res.text);

          expect($('h1').eq(0).text()).to.match(/rss.*email/);

          done();
        });
    });

    describe("when signed in", function() {
      beforeEach(function(done) {
        this.loginAs(this.user, done);
      });

      it("has a link to sign out", function(done) {
        this.request
          .get('/')
          .end(function(err, res){
            expect(res.status).to.equal(200);

            var $ = helper.$(res.text);

            var form = $('form.session');
            expect(form).to.have.length(1);
            expect(form.attr('action')).to.equal('/session');
            expect(form.attr('method')).to.equal('post');
            expect(form.text()).to.equal('Sign out');

            var method = form.find('input[name="_method"]');
            expect(method.attr('type')).to.equal('hidden');
            expect(method.attr('value')).to.equal('delete');

            var csrf = form.find('input[name="_csrf"]');
            expect(csrf).to.have.length(1);

            done();
          });
      });
    });

    describe("when not signed in", function() {
      it("has a link to sign in", function(done) {
        this.request
          .get('/')
          .end(function(err, res){
            expect(res.status).to.equal(200);

            var $ = helper.$(res.text);

            var form = $('form.session');
            expect(form).to.have.length(1);
            expect(form.attr('action')).to.equal('/auth/google');
            expect(form.attr('method')).to.equal('get');
            expect(form.text()).to.equal('Sign in');

            expect(form.find('input[name="_method"]')).to.have.length(0);

            done();
          });
      });
    });
  });

  describe("POST /", function() {
    beforeEach(function() {
      this.fakeFeed = new Feed({name: 'fake feed', url: 'fake url'});

      this.sinon.stub(Feed, 'getOrCreateFromURL', function(url, done){
        done(null, this.fakeFeed);
      }.bind(this));

      this.sinon.stub(User.prototype, 'addFeed', function(feed, done){
        done();
      }.bind(this));
    });

    describe("when logged in", function() {
      beforeEach(function(done) {
        this.loginAs(this.user, done);
      });

      describe("and a url is provided", function() {
        it("creates that feed", function(done) {
          this.request
            .post('/')
            .send({url: 'http://e.example.com'})
            .expect(302)
            .expect('location', '/')
            .end(function(err, res){
              expect(err).to.not.exist;

              expect(Feed.getOrCreateFromURL).to.have.been.calledWith('http://e.example.com');
              expect(User.prototype.addFeed).to.have.been.calledWith(this.fakeFeed.id);

              done();
            }.bind(this));
        });
      });
    });

    describe("when not logged in", function() {
      it("redirects to the main page", function(done) {
        this.request
          .post('/')
          .send('http://www.google.com')
          .expect(302)
          .expect('location', '/')
          .end(function(err, res){
            expect(err).to.not.exist;

            expect(Feed.getOrCreateFromURL).to.not.have.been.called;
            expect(User.prototype.addFeed).to.not.have.been.called;

            done();
          });
      });
    });
  });
});
