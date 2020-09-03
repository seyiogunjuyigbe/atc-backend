require('dotenv').config();
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');

const { DEFAULT_EMAIL_SENDER } = process.env;
// const SMTP_USERNAME = process.env.SENDGRID_USER;
// const SMTP_PASSWORD = process.env.SENDGRID_PASSWORD;

const MailController = {};

function readHTMLFile(argPath, callback) {
  fs.readFile(
    path.join(__dirname, argPath),
    { encoding: 'utf-8' },
    (err, html) => {
      if (err) {
        throw err;
      } else {
        callback(null, html);
      }
    }
  );
}

MailController.sendTemplatedMail = async (
  templateName = null,
  data = {},
  recipient = null,
  subject = null
) => {
  const options = {
    auth: {
      api_user: process.env.SENDGRID_USER,
      api_key: process.env.SENDGRID_PASSWORD,
    },
  };

  readHTMLFile('../public/emailtemplates/header.html', (err, headerHtml) => {
    const header = headerHtml;

    readHTMLFile('../public/emailtemplates/footer.html', (err1, footerHtml) => {
      const footer = footerHtml;

      readHTMLFile(
        `../public/emailtemplates/${templateName}`,
        async (err2, html) => {
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
          await mailer.sendMail(mailOptions, (err3, response) => {
            if (err3) {
              console.log(err3);
            }
            return response;
          });
        }
      );
    });
  });
};
module.exports = MailController;
