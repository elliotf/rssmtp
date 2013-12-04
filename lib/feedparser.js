var FeedParser = require('feedparser')
  , resumer     = require('resumer')
;

function parseString(str, done) {
  var parser = new FeedParser()
    , input  = resumer().queue(str).end()
    , error
    , metadata
    , articles = []
  ;

  input
    .pipe(parser)
    .on('error', function(result) {
      error = result;
    })
    .on('meta', function(result) {
      metadata = result;
    })
    .on('data', function(result){
      articles.push(result);
    })
    .on('end', function() {
      done(error, metadata, articles);
    })
  ;
}


exports.parseString = parseString;
