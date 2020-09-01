require('dotenv').config();
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');

const { DEFAULT_EMAIL_SENDER } = process.env;
const SMTP_USERNAME = process.env.SENDGRID_USER;
const SMTP_PASSWORD = process.env.SENDGRID_PASSWORD;

const MailController = {};

const readHTMLFile = function (argPath, callback) {
  fs.readFile(path.join(__dirname, argPath), { encoding: 'utf-8' }, function (
    err,
    html
  ) {
    if (err) {
      throw err;
      callback(err);
    } else {
      callback(null, html);
    }
  });
};

MailController.sendTemplatedMail = async function (
  templateName = null,
  data = {},
  recipient = null,
  subject = null
) {
  const options = {
    auth: {
      api_user: process.env.SENDGRID_USER,
      api_key: process.env.SENDGRID_PASSWORD,
    },
  };

  readHTMLFile('../public/emailtemplates/header.html', function (
    err,
    headerHtml
  ) {
    const header = headerHtml;

    readHTMLFile('../public/emailtemplates/footer.html', function (
      err,
      footerHtml
    ) {
      const footer = footerHtml;

      readHTMLFile(`../public/emailtemplates/${templateName}`, async function (
        err,
        html
      ) {
        const template = handlebars.compile(header + html + footer);
        const replacements = data;
        const htmlToSend = template(replacements);
        const mailer = nodemailer.createTransport(sgTransport(options));
        const mailOptions = {
          from: `African Travel Club <${DEFAULT_EMAIL_SENDER}>`,
          to: recipient,
          subject,
          html: htmlToSend,
        };

        // NEW WAY VIA SENDGRID
        await mailer.sendMail(mailOptions, (err, response) => {
          if (err) {
            return err;
          }
          return response;
        });
      });
    });
  });
};
module.exports = MailController;
