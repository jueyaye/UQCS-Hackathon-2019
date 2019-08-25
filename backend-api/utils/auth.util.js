
let jwt = require('jsonwebtoken'),
  bcrypt = require('bcrypt'),
  Cryptr = require('cryptr'),
  config = require('config');

const cryptr = new Cryptr(config.auth.secret);

function generateJwt(user) {
  const token = jwt.sign({
    data: user
  }, config.jwt.jwtSecret, {
    expiresIn: '3h'
  });
  return token;
}

function encrypt(plainString) {
  return cryptr.encrypt(plainString);
}

function decrypt(encryptedString) {
  return cryptr.decrypt(encryptedString);;
}

function generateSecureCode(len) {
  len = len || 7;
  let hash = crypto.createHash('sha1').update(new Date().toString()).digest("hex")
  return hash.substr(2, len);
}

async function hashPassword(password) {
  return await bcrypt.hash(password, config.auth.saltRounds);
}

async function comparePassword(current, newPassword) {
  return await bcrypt.compare(newPassword, current);
}

module.exports = {
  generateJwt,
  encrypt,
  decrypt,
  generateSecureCode,
  hashPassword,
  comparePassword
}