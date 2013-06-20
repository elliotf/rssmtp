var helper  = require('../../support/spec_helper')
  , request = require('request')
  , expect  = require('chai').expect
  , _       = require('underscore')
  , async   = require('async')
  , Scraper = helper.model('scraper')
;

describe.only("Scraper model", function() {
  beforeEach(function() {
    var self = this;

    this.sinon.stub(request, 'get', function(url, done){
      done(self.request_error, self.request_response, self.request_body);
    });
  });

  beforeEach(function() {
    this.model = new Scraper();
  });

  it("can be instantiated", function() {
    expect(this.model).to.exist;
  });
});
