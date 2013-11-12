var helper  = require('../../support/spec_helper')
  , models  = require('../../models')
  , Feed    = models.Feed
  , Article = models.Article
  , expect  = require('chai').expect
  , async   = require('async')
  , _       = require('lodash')
;

describe("Article model (RDBMS)", function() {
  it("can be saved", function(done) {
    Article.create({
      link: 'http://example.com'
      , title: 'an article'
      , description: 'more details here'
      , date: Date.now()
      , guid: 'asdfasdf123'
    }).done(done);
  });
});


