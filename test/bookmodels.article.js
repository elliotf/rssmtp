'use strict';

var expect = require('chai').expect;
var models = require('../bookmodels');
var helper = require('../support/spec_helper');

describe("models.Article (bookshelf)", function() {
  var minimum_attrs;

  beforeEach(function() {
    minimum_attrs = {
      feed_id: 0,
      date:    new Date('2010-01-01T00:00:00.000Z'),
      guid:    'a fake guid'
    };
  });

  describe('#save', function() {
    context('when a date is not provided', function() {
      it('yields an error', function(done) {
        delete minimum_attrs.date;

        models.Article
          .forge(minimum_attrs)
          .save()
          .exec(function(err, article) {
            expect(err).to.exist;

            done();
          });
      });
    });
  });

  describe('#defaults', function() {
    context('when some attributes are not provided', function() {
      it('generates attribute values', function(done) {
        var now = new Date();
        now.setMilliseconds(0);
        var clock = this.sinon.useFakeTimers(now.valueOf());
        models.Article
          .forge(minimum_attrs)
          .save()
          .exec(function(err, article) {
            clock.restore();

            expect(err).to.not.exist;

            var actual = article.toJSON();
            expect(actual.id).to.be.a('number').above(0);
            delete actual.id;

            expect(actual).to.deep.equal({
              feed_id:     0,
              date:        new Date('2010-01-01T00:00:00.000Z'),
              guid:        'a fake guid',
              link:        null,
              title:       'untitled article',
              description: null,
              created_at:  now,
              updated_at:  now,
            });

            var actual = article.toJSON();
            expect(actual.id).to.be.a('number').above(0);
            delete actual.id;

            models.Article
              .fetchAll()
              .exec(function(err, articles) {
                expect(err).to.not.exist;

                expect(articles.toJSON()).to.deep.equal([article.toJSON()]);

                done();
              });
          });
      });
    });

    context.skip('when there is no guid', function() {
      it('generates one via hashing the article attributes', function(done) {
      });
    });
  });
});
