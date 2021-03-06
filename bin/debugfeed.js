#!/usr/bin/env node

var args       = require('commander')
  , request    = require('request')
  , feedparser = require('feedparser')
  , prettyjson = require('prettyjson')
  , _          = require('lodash')
;
args
  .option('-u, --url <value>', 'Url to fetch')
  //.option('-a, --all', 'Show all attributes of feed')
  .option('-l, --limit <n>', 'Only show N articles', parseInt)
  .option('-f, --full', 'Show a raw dump of the feed object')
  .parse(process.argv)
;

if (!args.url)
  return args.help();

var url = args.url;

var attrs = {
  article: ['link', 'title', 'description']
  , feed:  ['link', 'title']
}

function dataFor(type, data) {
  //console.log("TYPE: ", type, " KEYS: ", attrs[type], " DATA: ", data);
  var filtered = _.pick(data, attrs[type]);

  var maxLength = 80;
  if ('article' == type) {
    filtered.description = (filtered.description || '').substr(0, maxLength);
  }

  return filtered;
}

request.get(url, function(err, response, body){
  if (err) {
    console.log("Problem fetching url '" + url + "': ", err);

    process.exit(1);
  }

  feedparser.parseString(body, function(err, meta, articles){
    if (err) {
      console.log("Problem parsing url '" + url + "': ", err);

      process.exit(1);
    }

    console.log("Feed metadata: \n\n", prettyjson.render(dataFor('feed', meta)), "\n");
    console.log("Feed articles: (" + articles.length + " total)", "\n");

    var maxArticles = args.limit || articles.length;

    for (var i = 0; i < maxArticles; ++i) {
      console.log(prettyjson.render(dataFor('article', articles[i])), "\n");
      if(args.full) {
        console.log("FULL DUMP: \n");
        console.log(articles[i], "\n");
      }
    }

    process.exit(0);
  });
});

// command-line app to dump data about a given feed
