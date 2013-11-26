var helper = require('../../support/spec_helper')
  , expect = require('chai').expect
  , Feed   = helper.models.Feed
  , User   = helper.models.User
;

describe("Feed routes", function() {
  beforeEach(helper.setupRequestSpec);

  describe("GET /feed/:feed", function() {
    describe("when logged in", function() {
      beforeEach(function(done) {
        this.loginAs(this.user, done);
      });

      describe("when the provided feed exists", function() {
        beforeEach(function(done) {
          var self = this;

          this.sinon.spy(Feed, 'find');

          Feed
            .create({
              name: 'GET /feed/:feed feed name'
              , url: 'http://r.example.com/rss'
            })
            .error(done)
            .success(function(feed){
              self.feed = feed;

              done();
            });
        });

        it("has a form to unsubscribe", function(done) {
          this.request
            .get('/feed/' + this.feed.id)
            .end(function(err, res){
              expect(err).to.not.exist;

              expect(res.status).to.equal(200);

              expect(Feed.find).to.have.been.calledWith(this.feed.id + "");

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
      beforeEach(function(done) {
        var self = this;

        Feed
          .create({
            name: 'GET /feed/:feed feed name'
            , url: 'http://r.example.com/rss'
          })
          .error(done)
          .success(function(feed){
            self.feed = feed;

            done();
          });

        this.sinon.spy(Feed, 'find');
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
          var self = this;

          Feed
            .create({
              name: 'DEL /feed/:feed'
              , url: 'http://s.example.com'
            })
            .error(done)
            .success(function(feed){
              self.feed = feed;

              self.user.addFeed(feed).done(done);
            });
        });

        it("removes the feed from the user", function(done) {
          var self = this;

          self.request
            .del('/feed/' + self.feed.id)
            .expect(302)
            .expect('location', '/')
            .end(function(err, res){
              expect(err).to.not.exist;

              self.user
                .getFeeds()
                .error(done)
                .success(function(feeds){
                  expect(feeds).to.have.length(0);

                  done();
                });
            });
        });
      });
    });
  });
});
