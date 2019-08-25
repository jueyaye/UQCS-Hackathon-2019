const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Cryptr = require("cryptr");
const config = require("config");

const cryptr = new Cryptr(config.auth.secret);

function generateJwt(user) {
  const token = jwt.sign(
    {
      data: user
    },
    config.jwt.jwtSecret,
    {
      expiresIn: "3h"
    }
  );
  return token;
}

function encrypt(plainString) {
  return cryptr.encrypt(plainString);
}

function decrypt(encryptedString) {
  return cryptr.decrypt(encryptedString);
}

function hashPassword(password) {
  return bcrypt.hash(password, config.auth.saltRounds);
}

function comparePassword(current, newPassword) {
  return bcrypt.compare(newPassword, current);
}

module.exports = {
  generateJwt,
  encrypt,
  decrypt,
  hashPassword,
  comparePassword
};
