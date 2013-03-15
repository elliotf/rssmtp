var helper = require('../../support/spec_helper')
  , expect = require('chai').expect
;

describe("Main routes", function() {
  describe("GET /", function() {
    beforeEach(helper.setupRequestSpec);

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
});
