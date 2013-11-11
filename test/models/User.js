/*
*/
var helper = require('../../support/spec_helper')
  , models = require('../../models')
  , User   = models.User
  , expect = require('chai').expect
  , async  = require('async')
  , _      = require('lodash')
;

describe("User model (RDBMS)", function() {
  it("can be saved", function(done) {
    User.create({
      email: "waffles@example.com"
    }).done(done);
  });
});
