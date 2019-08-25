
let path = require('path'),
  mailer = require('./mailer.util'),
  cons = require('consolidate'),
  mjml = require('mjml'),
  config = require('config'),
  logger = require('tracer').colorConsole();

async function sendTemplate(templateName, locals, to, subject){
  try {
    let error = await mailer.verify();
    if (!error) {
      logger.warn(error);
      throw 'Server is not ready to take messages';
    }

    logger.info("Sending email " + templateName + " to " + to + " for " + subject);
    var template = path.join(__dirname, '../mail/' + templateName, 'html.hbs');

    let html = await cons.handlebars(template, locals);

    var rendered = mjml(html);
    if (rendered.errors.length > 0) {
      logger.debug(rendered.errors);
      throw rendered.errors;
    }

    var mailOptions = {
      from: config.mail.title + ' <' + config.mail.from + '>',
      to: to,
      subject: config.mail.title + ' - ' + subject,
      html: rendered.html
    };

    let result = await mailer.sendMail(mailOptions);

    if (result.err) {
      logger.warn(result);
      throw result.err;
    }

    return result;
  } catch (e) {
    logger.error(e);
    throw e;
  }
};
  
module.exports = {
  sendTemplate
};