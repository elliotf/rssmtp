var helper  = require('../../support/spec_helper')
  , models  = require('../../models')
  , Feed    = models.Feed
  , Article = models.Article
  , expect  = require('chai').expect
  , async   = require('async')
  , _       = require('lodash')
;

describe("Feed model (RDBMS)", function() {
  it("can be saved", function(done) {
    Feed.create({
      url: "http://example.com"
    }).done(done);
  });

  describe("hasMany Articles", function() {
    beforeEach(function(done) {
      var todo = []
        , self = this
      ;

      Feed.create({
        url: "http://example.com"
      })
        .error(done)
        .success(function(model){
          self.feed = model;
          done();
        })
    });

    describe("#addArticle", function() {
      it("adds articles", function(done) {
        var self = this
        ;

        var article = Article.build({
          link: 'http://example.com'
          , title: 'an article'
          , description: 'more details here'
          , date: Date.now()
          , guid: 'asdfasdf123'
        });

        this.feed.addArticle(article)
          .error(done)
          .success(function(article){
            done();
          });
      });
    });
  });
});

