#!/usr/bin/env node

var feedparser = require('feedparser')
  , request    = require('request')
  , nodemailer = require('nodemailer')
  , async      = require('async')
  , _          = require('underscore')
;

function sendMail(article, done){
  var smtp = nodemailer.createTransport("SMTP", {
    service: "Gmail",
    auth: {
      user: process.env.DEV_SMTP_USER
      , pass: process.env.DEV_SMTP_PASS
    }
  });

  var parts = ['<a href="', article.link, '"><h2>', article.title, '</h2></a>'];
  parts.push(article.description);
  var message = parts.join('');

  var from = article.meta.title;
  from = from.replace(/[^\s\w_-]/, '_');

  var options = {
    from: [from, " <", process.env.DEV_SMTP_USER, ">"].join('')
    , to: "<efoster@firetaco.com>"
    , subject: article.title
    , date: article.pubDate
    , html: message
  };

  smtp.sendMail(options, function(err, response){
    if (err) return done(err);

    console.log("MESSAGE SENT: ", response);

    done(err, response);
  });
}

function rss2email(url, done) {
  var req = request.get(url, function (err, response, body) {
    if (err) return done(err);

    feedparser.parseString(body, function(err, meta, articles) {
      if (err) return done(err);
      var todo = [];

      console.log(articles[0]);

      articles.forEach(function(article){
        todo.push(function(done){
          sendMail(article, done);
        });
      });

      async.parallel(todo, done);
    });
  });
}

rss2email('https://github.com/blog.atom', function(err) {
  console.log("DONE");
});
