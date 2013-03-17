var helper = require('../support/spec_helper')
  , http   = require('http')
  , Poller = require('../models/poller')
  , app    = require('../app')
  , expect = require('chai').expect
;

describe("Server", function() {
  beforeEach(function() {
    var fakeServer = this.fakeServer = {
      listen: this.sinon.spy()
    };

    this.sinon.stub(http, 'createServer', function(app){
      return fakeServer;
    });

    this.sinon.stub(Poller.prototype, 'start', function(){});
  });

  it("starts up services", function(done) {
    var server = require('../server');

    expect(http.createServer).to.have.been.calledWith(app);
    expect(this.fakeServer.listen).to.have.been.calledWith(3000);

    expect(Poller.prototype.start).to.have.been.called;

    done();
  });
});
