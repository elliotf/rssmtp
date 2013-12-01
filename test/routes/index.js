var helper  = require('../../support/spec_helper')
  , expect  = require('chai').expect
  , Feed    = helper.models.Feed
  , User    = helper.models.User
  , request = require('request')
  , async   = require('async')
;

describe("Main routes", function() {
  beforeEach(helper.setupRequestSpec);

  describe("GET /", function() {
    describe("when signed in", function() {
      beforeEach(function(done) {
        var self = this
          , todo = []
        ;

        todo.push(function(done){
          self.loginAs(self.user, done);
        });

        self.feeds = [];
        ['feed_one', 'feed_two'].forEach(function(name){
          todo.push(function(done){
            Feed
            .create({
              url: 'http://example.com/' + name + '.xml'
              , name: name
            })
            .error(done)
            .success(function(feed){
              self.feeds.push(feed);
              self.user.addFeed(feed).done(done);
            });
          });
        });

        async.series(todo, done);
      });

      it("shows a list of the user's feeds", function(done) {
        this.request
          .get('/')
          .end(function(err, res){
            expect(res.status).to.equal(200);

            var $ = helper.$(res.text);

            var feeds = $('.feed.list .feed.item');
            expect(feeds).to.have.length(2);

            expect(feeds.eq(0).text()).to.match(/feed_one/);

            var link = feeds.find('a.manage-feed');
            expect(link).to.have.length(2);
            expect(link.eq(0).attr('href')).to.equal('/feed/' + this.feeds[0].id);

            done();
          }.bind(this));
      });

      it("has a form to add a new feed", function(done) {
        this.request
          .get('/')
          .end(function(err, res){
            expect(res.status).to.equal(200);

            var $ = helper.$(res.text);

            var form = $('form.new.feed');
            expect(form).to.have.length(1);

            expect(form.attr('action')).to.equal('/');
            expect(form.attr('method')).to.equal('post');

            var csrf = form.find('input[name="_csrf"]');
            expect(csrf).to.have.length(1);
            expect(csrf.attr("type")).to.equal("hidden");

            var input = form.find('input[name="url"]');
            expect(input).to.have.length(1);

            expect(form.find('button')).to.have.length(1);

            done();
          });
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

      it("does not show a form to add a feed", function(done) {
        this.request
          .get('/')
          .end(function(err, res){
            expect(res.status).to.equal(200);

            var $ = helper.$(res.text);

            expect($('.new.feed')).to.have.length(0);

            done();
          });
      });
    });
  });

  describe("POST /", function() {
    beforeEach(function(done) {
      var self = this;
      Feed
        .create({name: 'fake feed', url: 'fake url'})
        .error(done)
        .success(function(feed){
          self.fakeFeed = feed;
          done();
        });

      self.sinon.stub(Feed, 'getOrCreateFromURL', function(url, done){
        done(null, self.fakeFeed);
      });
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
              //expect(User.prototype.addFeed).to.have.been.calledWith(this.fakeFeed.id);

              done();
            }.bind(this));
        });
      });

      describe("with bad input", function() {
        beforeEach(function() {
          Feed.getOrCreateFromURL.restore();
        });

        describe("of a non-feed url", function() {
          beforeEach(function() {
            this.sinon.stub(request, 'get', function(url, done){
              done(null, 'fake response', 'fake body');
            });
          });

          it("provides feedback to enter a feed URL", function(done) {
            this.request
              .post('/')
              .send({url: 'http://r.example.com'})
              .expect(302)
              .expect('location', '/')
              .end(function(err, res){
                expect(err).to.not.exist;

                var flash = helper.getFlash(res);
                expect(flash).to.be.a('object');
                expect(flash.error[0]).to.contain('valid feed');

                var cookieWithFeedback = res.headers['set-cookie'];

                this.request
                  .get('/')
                  .set('Cookie', cookieWithFeedback)
                  .end(function(err, res){
                    expect(err).to.not.exist;
                    expect(res.status).to.equal(200);

                    var $ = helper.$(res.text);
                    var messages = $('.feedback .error.alert');
                    expect(messages).to.have.length(1);
                    expect(messages.text()).to.contain('valid feed');

                    done();
                  }.bind(this));
              }.bind(this));
          });
        });

        describe("of a non-url", function() {
          it("provides feedback to enter a feed URL", function(done) {
            this.request
              .post('/')
              .send({url: 'waffles are really awesome'})
              .expect(302)
              .expect('location', '/')
              .end(function(err, res){
                expect(err).to.not.exist;

                var flash = helper.getFlash(res);
                expect(flash).to.be.a('object');
                expect(flash.error[0]).to.contain('valid feed');

                done();
              });
          });
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
            //expect(User.prototype.addFeed).to.not.have.been.called;

            done();
          });
      });
    });
  });
});
