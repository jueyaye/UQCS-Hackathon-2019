
let models = require('../db/models'),
  auth = require('../utils/auth.util'),
  config = require('config'),
  logger = require('tracer').colorConsole();

async function addEmailPassword(req, res){
  try {
    let count = await models.users.count({
      where: {
        email: req.body.email
      }
    });
    if (count > 0)
      throw {
        code: 400,
        msg: 'This email is associated with an existing account.'
      }

    if (!req.body.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/))
      throw {
        code: 400,
        msg: 'The password needs to be at least 8 characters and must ' + 
          'contain at least 1 uppercase letter, 1 lowercase letter, and 1 number.'
      }
    
    let user = await models.users.create({
      firstName: req.body.first_name,
      lastName: req.body.last_name,
      email: req.body.email,
      hash: await auth.verifyJwtToken(req.body.email),
      password: await auth.hashPassword(req.body.password)
    });
    res.json(user);

  } catch(err) {
    logger.error("POST ADD EMAIL " + req.path + ":", 
      "error:", err, "input", req.body);
    res.status((err.code) ? err.code : 500).json(err);
  }
}

module.exports = {
  addEmailPassword
}