var helper = require('../../support/spec_helper')
  , expect = require('chai').expect
  , Feed   = helper.model('feed')
  , User   = helper.model('user')
;

describe("Feed routes", function() {
  beforeEach(helper.setupRequestSpec);

  describe("GET /feed/:feed", function() {
    describe("when logged in", function() {
      beforeEach(function(done) {
        this.loginAs(this.user, done);
      });

      describe("when the provided feed exists", function() {
        beforeEach(function() {
          var feed = this.feed = new Feed({
            name: 'GET /feed/:feed feed name'
            , url: 'http://r.example.com/rss'
          });

          this.sinon.stub(Feed, 'findById', function(id, done){
            done(null, feed);
          });
        });

        it("has a form to unsubscribe", function(done) {
          this.request
            .get('/feed/' + this.feed.id)
            .end(function(err, res){
              expect(err).to.not.exist;

              expect(res.status).to.equal(200);

              expect(Feed.findById).to.have.been.calledWith(this.feed.id + "");

              var $ = helper.$(res.text);

              expect($('body').text()).to.contain('GET /feed/:feed feed name');

              var form = $('form.unsubscribe');
              expect(form).to.have.length(1);
              expect(form.attr('method')).to.equal('post');
              expect(form.attr('action')).to.equal('/feed/' + this.feed.id);

              var method = form.find('input[name="_method"]');
              expect(method).to.have.length(1);
              expect(method.attr('value')).to.equal('delete');
              expect(method.attr('type')).to.equal('hidden');

              var csrf = form.find('input[name="_csrf"]');
              expect(csrf).to.have.length(1);

              var button = form.find('.button');
              expect(button.attr('type')).to.equal('submit');
              expect(button.text()).to.match(/unsub/i);

              done();
            }.bind(this));
        });
      });

      describe("when the provided feed does not exist", function(done) {
        it("returns 404", function(done) {
          this.request
            .get('/feed/' + this.user.id)
            .expect(404, done);
        });
      });

      describe("when invalid input is provided", function() {
        it("returns 404", function(done) {
          this.request
            .get('/feed/waffles_fuck_yes')
            .expect(404, done);
        });
      });
    });

    describe("when not logged in", function() {
      beforeEach(function() {
        var feed = this.feed = new Feed({
          name: 'GET /feed/:feed feed name'
          , url: 'http://r.example.com/rss'
        });

        this.sinon.stub(Feed, 'findById', function(id, done){
          done(null, feed);
        });
      });

      it("redirects to the main page for login", function(done) {
        this.request
          .get('/feed/' + this.feed.id)
          .send('http://www.google.com')
          .expect(302)
          .expect('location', '/', done);
      });
    });
  });

  describe("DEL /feed/:feed", function() {
    describe("when logged in", function() {
      beforeEach(function(done) {
        this.loginAs(this.user, done);
      });

      describe("when the provided feed exists", function() {
        beforeEach(function(done) {
          var feed = this.feed = new Feed({
            name: 'DEL /feed/:feed'
            , url: 'http://s.example.com'
          });

          this.user.addFeed(this.feed.id, done);
        });

        it("removes the feed from the user", function(done) {
          this.request
            .del('/feed/' + this.feed.id)
            .expect(302)
            .expect('location', '/')
            .end(function(err, res){
              expect(err).to.not.exist;

              User.findById(this.user.id, function(err, user){
                expect(user._feeds).to.have.length(0);
              });

              done();
            }.bind(this));
        });
      });
    });
  });

  describe("GET /feed/:feed/refetch", function() {
    beforeEach(function(done) {
      this.loginAs(this.user, done);
    });

    beforeEach(function(done) {
      Feed.create({
        name: 'GET /feed/:feed'
        , url: 'http://t.example.com'
      }, function(err, feed){
        if (err) return done(err);

        this.feed = feed;

        this.user.addFeed(feed.id, done);
      }.bind(this));
    });

    beforeEach(function() {
      this.sinon.stub(Feed.prototype, 'pull', function(done){
        done();
      });
    });

    it("refetches the selected feed", function(done) {
      this.request
        .get('/feed/' + this.feed.id + '/refetch')
        .end(function(err, res){
          expect(err).to.not.exist;
          expect(res.status).to.equal(200);

          expect(Feed.prototype.pull).to.have.been.calledOnce;
          var feed = Feed.prototype.pull.thisValues[0];

          expect(feed.id).to.equal(this.feed.id);

          done();
        }.bind(this));
    });
  });
});
