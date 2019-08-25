
let nodemailer = require('nodemailer'),
  config = require('config');

let transporter = nodemailer.createTransport({
  service:'gmail',
  auth: {
    user: config.mail.email,
    pass: config.mail.password
  }
});

module.exports = transporter;