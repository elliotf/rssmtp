'use strict';

var expect = require('chai').expect;
var models = require('../bookmodels');
var helper = require('../support/spec_helper');

describe("models.Feed (bookshelf)", function() {
  var minimum_attrs;
  var now;

  beforeEach(function() {
    now = new Date();
    now.setMilliseconds(0);

    minimum_attrs = {
      url:          'http://example.com/rss.xml',
      name:         'fake feed name',
      last_fetched: now
    };
  });

  it('can be saved', function(done) {
    var clock = this.sinon.useFakeTimers(now.valueOf());
    models.Feed
      .forge(minimum_attrs)
      .save()
      .exec(function(err, user) {
        clock.restore();

        expect(err).to.not.exist;

        var actual = user.toJSON();
        expect(actual.id).to.be.a('number').above(0);
        delete actual.id;

        expect(actual).to.deep.equal({
          url:          'http://example.com/rss.xml',
          name:         'fake feed name',
          last_fetched: now,
          created_at:   now,
          updated_at:   now,
        });

        done();
      });
  });
});
