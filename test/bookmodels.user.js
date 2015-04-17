var helper = require('../support/spec_helper')
  , models = require('../bookmodels')
  , expect = require('chai').expect
  , async  = require('async')
  , _      = require('lodash')
;

describe("models.User (bookshelf)", function() {
  var minimum_attrs;

  beforeEach(function() {
    minimum_attrs = {
    };
  });

  it('can be saved', function(done) {
    var now = new Date();
    now.setMilliseconds(0);
    var clock = this.sinon.useFakeTimers(now.valueOf());
    models.User
      .forge(minimum_attrs)
      .save()
      .exec(function(err, user) {
        clock.restore();

        expect(err).to.not.exist;

        var actual = user.toJSON();
        expect(actual.id).to.be.a('number').above(0);
        delete actual.id;

        expect(actual).to.deep.equal({
          created_at: now,
          updated_at: now,
        });

        done();
      });
  });
});

