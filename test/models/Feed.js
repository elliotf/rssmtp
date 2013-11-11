var helper = require('../../support/spec_helper')
  , models = require('../../models')
  , Feed   = models.Feed
  , expect = require('chai').expect
  , async  = require('async')
  , _      = require('lodash')
;

describe("Feed model (RDBMS)", function() {
  it("can be saved", function(done) {
    Feed.create({
      url: "http://example.com"
    }).done(done);
  });
});

