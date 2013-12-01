var nodemailer = require('nodemailer')
;

function Mailer() {
  var settings = {
    secureConnection: process.env.APP_SMTP_SSL || ''
    , host: process.env.APP_SMTP_HOST || ''
    , port: process.env.APP_SMTP_PORT || ''
  };

  var auth = {
    user: process.env.APP_SMTP_FROM || ''
    , pass: process.env.APP_SMTP_PASS || ''
  };

  if (auth.user && auth.pass) {
    settings.auth = auth;
  }

  this._mailer = nodemailer.createTransport("SMTP", settings);

  return this;
}

Mailer.prototype.sendMail = function(data, done) {
  this._mailer.sendMail(data, done);
};

module.exports = Mailer;
