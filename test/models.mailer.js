var helper     = require('../support/spec_helper')
  , models     = require('../models')
  , Mailer     = helper.model('mailer')
  , expect     = require('chai').expect
  , _          = require('lodash')
  , nodemailer = require('nodemailer')
;

describe("Mailer model", function() {
  beforeEach(function() {
    var mockedMailer = this.mockedMailer = nodemailer.createTransport();

    this.sinon.stub(nodemailer, 'createTransport', function(){
      return mockedMailer;
    });
  });

  it("is a wrapper around nodemailer", function() {
    var mailer = new Mailer();

    expect(nodemailer.createTransport).to.have.been.calledWith("SMTP", {
      host: "smtp.example.com"
      , secureConnection: "true"
      , port: "465"
      , auth: {
        user: "no-reply@example.com"
        , pass: "dummy password"
      }
    });
  });

  describe("#sendMail", function() {
    beforeEach(function() {
      this.mailer = new Mailer();
    });

    it("sends the given email via nodemailer", function(done) {
      this.sinon.stub(this.mockedMailer, 'sendMail', function(data, done){
        done();
      });

      var emailData = {fake: emailData};

      this.mailer.sendMail(emailData, function(err){
        expect(err).to.not.exist;

        expect(this.mockedMailer.sendMail).to.have.been.calledWith(emailData);
        done();
      }.bind(this));
    });
  });
});
