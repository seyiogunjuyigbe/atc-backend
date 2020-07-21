require('dotenv').config();
const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");
const handlebars = require('handlebars');
const fs = require('fs');
const DEFAULT_EMAIL_SENDER = process.env.DEFAULT_EMAIL_SENDER;
const SMTP_USERNAME = process.env.SENDGRID_USER;
const  SMTP_PASSWORD = process.env.SENDGRID_PASSWORD;
module.exports = {
  sendEmailToCompany: async (user, token) => {
    const options = {
      auth: {
        api_user:process.env.SENDGRID_USER,
        api_key: process.env.SENDGRID_PASSWORD
      }
    };
    const mailer = nodemailer.createTransport(sgTransport(options));
    const mailOptions = {
      to: user.email,
      from: process.env.DEFAULT_EMAIL_SENDER,
      subject: "Account verification - African Travel Club",
      text: `Hello,\n\nThis is a confirmation that you have successfully created your user on African Trade Club your password for this account is ${token}`
    };
    await mailer.sendMail(mailOptions, (err, response) => {
      if (err) {
        return err;
      } else {
        return response;
      }
    });
  },
sendTemplatedMail: async (templateName = null, data = {}, recipient = null,subject = null) => {
  const options = {
    auth: {
      api_user:process.env.SENDGRID_USER,
      api_key: process.env.SENDGRID_PASSWORD
    }
  };
    
    readHTMLFile('public/emailtemplates/header.html', function(err, headerHtml){
        let header = headerHtml;

        readHTMLFile('public/emailtemplates/footer.html', function(err, footerHtml){
            let footer = footerHtml;

            readHTMLFile(`public/emailtemplates/${templateName}`, async function(err, html) {
                let template = handlebars.compile(header + html + footer);
                let replacements = data;
                let htmlToSend = template(replacements);
                const mailer = nodemailer.createTransport(sgTransport(options));
                let mailOptions = {
                    from: `African Travel Club <${DEFAULT_EMAIL_SENDER}>`,
                    to : recipient,
                    subject : subject,
                    html : htmlToSend
                };

                //NEW WAY VIA SENDGRID
                await mailer.sendMail(mailOptions, (err, response) => {
                  if (err) {
                    return err;
                  } else {
                    return response;
                  }
                });


               


            });
        });
    });
}


};