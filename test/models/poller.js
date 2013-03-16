var helper = require('../../support/spec_helper')
  , expect = require('chai').expect
  , Poller = helper.model('poller')
  , Feed   = helper.model('feed')
;

describe("Poller model", function() {
  beforeEach(function() {
    this.poller = new Poller();
    this.sinon.stub(this.poller, 'requeue', function(){});
  });

  describe("#updateOneFeed", function() {
    beforeEach(function() {
      this.feed = new Feed();

      this.sinon.stub(this.feed, 'pull', function(done){
        done();
      });

      this.sinon.stub(Feed, 'getOutdated', function(done){
        done(null, this.feed);
      }.bind(this));
    });

    it("calls publish on an outdated feed", function(done) {
      this.poller.updateOneFeed(function(err, feed){
        expect(err).to.not.exist;

        expect(Feed.getOutdated).to.have.been.called;
        expect(this.feed.pull).to.have.been.called;

        done();
      }.bind(this));
    });

    it("queues itself to run again", function(done) {
      this.poller.updateOneFeed(function(err, feed){
        expect(err).to.not.exist;

        expect(this.poller.requeue).to.have.been.calledWith(0);

        done();
      }.bind(this));
    });

    describe("when there are no outdated feeds", function() {
      beforeEach(function() {
        this.feed = null;
      });

      it("queues itself up to run again", function(done) {
        this.poller.updateOneFeed(function(err, feed){
          expect(err).to.not.exist;

          expect(this.poller.requeue).to.have.been.calledWith(30 * 60 * 1000);

          done();
        }.bind(this));
      });
    });
  });
});
