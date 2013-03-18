var helper = require('../../support/spec_helper')
  , expect = require('chai').expect
  , Feed   = helper.model('feed')
;

describe("Feed routes", function() {
  beforeEach(helper.setupRequestSpec);

  describe("GET /feed/:feed", function() {
    describe("when logged in", function() {
      describe("when the provided feed exists", function() {
        beforeEach(function(done) {
          var feed;

          Feed.create({
            name: 'GET /feed/:feed feed name'
            , url: 'http://r.example.com/rss'
          }, function(err, model){
            feed = this.feed = model;
            done(err);
          }.bind(this));

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

              var csrf = form.find('input[name="_csrf"]');
              expect(csrf).to.have.length(1);

              var button = form.find('.button');
              expect(button.attr('type')).to.equal('submit');
              expect(button.text()).to.match(/unsub/i);

              done();
            }.bind(this));
        });
      });
    });
  });
});
