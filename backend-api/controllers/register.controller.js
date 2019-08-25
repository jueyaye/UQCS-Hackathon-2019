const logger = require("tracer").colorConsole();
const models = require("../db/models");
const auth = require("../utils/auth.util");

async function addEmailPassword(req, res) {
  try {
    const count = await models.users.count({
      where: {
        email: req.body.email
      }
    });
    if (count > 0)
      return res.boom.badRequest(
        "This email is associated with an existing account."
      );

    if (
      !req.body.password.match(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
      )
    )
      return res.boom.badRequest(
        "The password needs to be at least 8 characters and must " +
          "contain at least 1 uppercase letter, 1 lowercase letter, and 1 number."
      );

    const user = await models.users.create({
      firstName: req.body.first_name,
      lastName: req.body.last_name,
      email: req.body.email,
      hash: await auth.verifyJwtToken(req.body.email),
      password: await auth.hashPassword(req.body.password)
    });
    return res.json(user);
  } catch (err) {
    logger.error(
      `POST ADD EMAIL ${req.path}:`,
      "error:",
      err,
      "input",
      req.body
    );
    return res.status(err.code ? err.code : 500).json(err);
  }
}

module.exports = {
  addEmailPassword
};
