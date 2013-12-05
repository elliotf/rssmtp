var helper = require('../support/spec_helper')
  , http   = require('http')
  , models = require('../models')
  , Poller = models.poller
  , app    = require('../app')
  , expect = require('chai').expect
  , server = require('../server')
;

describe("Server", function() {
  beforeEach(function() {
    var fakeServer = this.fakeServer = {
      listen: this.sinon.stub().callsArg(2)
    };

    this.sinon.stub(http, 'createServer', function(app){
      return fakeServer;
    });

    var fakeMailer = this.fakeMailer = new models.mailer();
    this.sinon.stub(models, 'mailer', function() {
      return fakeMailer;
    });

    this.sinon.stub(Poller.prototype, 'start', function(){});
    this.sinon.spy(models, 'poller');
  });

  it("starts up services", function(done) {
    server(function(err){
      expect(err).to.not.exist;

      expect(http.createServer).to.have.been.calledWith(app);
      expect(this.fakeServer.listen).to.have.been.calledWith(3000, '127.0.0.1');

      expect(models.poller).to.have.been.calledWith({
        FeedClass: models.Feed
        , mailer:  this.fakeMailer
      });
      expect(Poller.prototype.start).to.have.been.called;

      done();
    }.bind(this));
  });
});
