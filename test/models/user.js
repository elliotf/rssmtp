var helper = require('../../support/spec_helper')
  , User   = helper.model('user')
  , expect = require('chai').expect
;

describe("User model", function() {
  beforeEach(function() {
    this.model = new User({
      email: 'user@example.com'
      , accounts: [
        { provider: 'Ogle', id: 'fake id' }
      ]
    });

    expect(this.model.email).to.exist;
    expect(this.model.accounts).to.exist;
    expect(this.model.accounts).to.have.length(1);
  });

  it("has basic attributes", function() {

  });
});
