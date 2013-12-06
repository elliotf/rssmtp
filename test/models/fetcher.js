var models  = require('../../models')
  , expect  = require('chai').expect
  , request = require('request')
;

describe("Fetcher model", function() {
  beforeEach(function() {
    this.fetcher = new models.fetcher();

    this.fakeHttpErr      = null; //{fake: 'HttpErr'};
    this.fakeHttpResponse = {fake: 'HttpResponse'};
    this.fakeHttpBody     = [
      '<?xml version="1.0" encoding="utf-8"?>'
      , '<feed xmlns="http://www.w3.org/2005/Atom">'
        , '<title>a title</title>'
      , '</feed>'
    ].join('');

    this.sinon.stub(request, 'get', function(args, done){
      done(this.fakeHttpErr, this.fakeHttpResponse, this.fakeHttpBody);
    }.bind(this));
  });

  it("can be instantiated", function() {
    expect(this.fetcher).to.be.an.instanceof(models.fetcher);
  });

  describe("#updateFeed", function() {
    beforeEach(function() {
      this.feed = models.Feed.build({
        name: 'Feed methods feed'
        , url: 'http://example.com/feed_methods'
      });

      this.sinon.stub(this.feed, 'asRequestOptions', function() {
        return {
          fake: 'requestOptions'
          , url: 'http://fakeRequestOptions.example.com'
          , headers: {
            'Last-Modified': 'fakeLastModified'
          }
        }
      });
    });

    it("adds a user agent to the request options", function(done) {
      this.fetcher.updateFeed(this.feed, function(err, meta, articles){
        expect(err).to.not.exist;

        expect(this.feed.asRequestOptions).to.have.been.called;
        expect(request.get).to.have.been.called;

        var options = request.get.args[0][0];

        expect(options.headers['User-Agent']).to.exist;
        expect(options.headers['User-Agent']).to.contain('RSSMTP');
        expect(options.headers['User-Agent']).to.contain('https://github.com/elliotf/rssmtp');
        expect(options.headers['User-Agent']).to.contain('http://testing-fqdn.rssmtp.example.com');

        done();
      }.bind(this));
    });
  });
});
