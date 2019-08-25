const router = require("express").Router();

const { celebrate, Joi } = require("celebrate");

const { body } = require("express-validator");

const register = require("../controllers/register.controller");

router.post(
  "/",
  celebrate({
    body: Joi.object().keys({
      firstName: Joi.string()
        .min(2)
        .max(30),
      lastName: Joi.string()
        .min(2)
        .max(30),
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string()
        .min(8)
        .max(60)
        .required()
    })
  }),
  [
    body("email")
      .isEmail()
      .normalizeEmail({
        gmail_remove_dots: false
      }),
    body("firstName")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body("lastName")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body("password")
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  register.addEmailPassword
);

module.exports = router;
