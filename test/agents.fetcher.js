'use strict';

var _          = require('lodash');
var request    = require('request');
var expect     = require('chai').expect;
var helper     = require('../support/spec_helper');
var agents     = require('../agents');
var feedparser = require('../lib/feedparser');
var models     = require('../bookmodels');

describe("agents.Fetcher", function() {
  var fetcher;
  var feed_title;
  var fake_http_err;
  var fake_http_response;
  var fake_http_body;

  beforeEach(function() {
    fetcher = new agents.Fetcher();

    feed_title = 'a title';

    fake_http_err      = null; //{fake: 'HttpErr'};
    fake_http_response = {fake: 'HttpResponse'};
    fake_http_body     = [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<feed xmlns="http://www.w3.org/2005/Atom">',
        '<title>a title</title>',
      '</feed>'
    ].join('');

    this.sinon.stub(request, 'get')
      .yields(fake_http_err, fake_http_response, fake_http_body);

    this.sinon.spy(feedparser, 'parseString');
  });

  describe('.fetchFeed', function() {
    var feed;

    beforeEach(function(done) {
      var attrs = {
        url:          'http://example.com/rss.xml',
        name:         'an fake feed',
        last_fetched: new Date('2010-01-01T00:00:00.000Z')
      };

      models.Feed
        .forge(attrs)
        .save()
        .exec(function(err, result) {
          expect(err).to.not.exist;

          feed = result;

          done();
        });
    });

    it('updates the `last_fetched` timestamp', function(done) {
      var now = new Date();
      now.setMilliseconds(0);
      var clock = this.sinon.useFakeTimers(now.valueOf());
      agents.Fetcher.fetchFeed(feed, function(err, updated, articles) {
        clock.restore();
        expect(err).to.not.exist;

        models.Feed.fetchAll().exec(function(err, feeds) {
          expect(err).to.not.exist;

          expect(feed.get('last_fetched')).to.deep.equal(now);

          var expected = feed.toJSON();
          expected.last_fetched = now;
          expect(feeds.toJSON()).to.deep.equal([expected]);

          done();
        });
      });
    });

    it('fetches the feed\'s url', function(done) {
      agents.Fetcher.fetchFeed(feed, function(err, updated, articles) {
        expect(err).to.not.exist;

        expect(request.get).to.have.been.calledOnce;
        expect(request.get).to.have.been.calledWith('http://example.com/rss.xml');

        done();
      });
    });

    context.skip('when there are articles', function() {
      context('and some are new', function() {
        it('publishes them', function(done) {
        });
      });

      context('and none are new', function() {
      });
    });

    context.skip('when the feed\'s url has changed', function() {
      it('updates the feed\'s url', function(done) {
      });
    });
  });

  describe.skip('#getAvailableFeeds', function() {
    context('when the url contains pointers to feeds', function() {
      it('returns an array of available feeds', function(done) {
      });
    });

    context('when the url contains no feeds', function() {
    });

    context('when the url is not HTML', function() {
      context('but is a feed', function() {
        it('returns the feed data', function(done) {
        });
      });
    });
  });
});
