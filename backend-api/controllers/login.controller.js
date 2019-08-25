
let models = require('../db/models'),
  passport = require('passport'),
  auth = require('../utils/auth.util'),
  randtoken = require('rand-token'),
  config = require('config'),
  logger = require('tracer').colorConsole();

function authenticate(req, res) {
  passport.authenticate('local', {
    session: false
  }, (err, user, info) => {
    if (err || !user) {
      logger.error(err);
      return res.status(401).json({
        success: false,
        error: err
      });
    }
    req.login(user, {
      session: false
    }, async (err) => {
      if (err) {
        res.send(err);
      }

      var refreshToken = randtoken.uid(128);

      await models.users.update({
        refreshToken: refreshToken
      }, {
        where: {
          id: user.id
        }
      });

      return res.json({
        token: auth.generateJwt(user),
        refreshToken: refreshToken
      });
    });
  })(req, res);
}

async function refreshToken(req, res) {
  try {
    let user = await models.users.findOne({
      where: {
        refreshToken: req.body.refreshToken
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Refresh token is invalid or expired '
      });
    }

    req.login(user, {
      session: false
    }, (err) => {
      if (err) {
        res.send(err);
      }

      return res.json({
        token: auth.generateJwt(user)
      });
    });
  } catch (err) {
    logger.error(err);
    return res.status(400).json({
      error: err.message || err
    })
  }
}

module.exports = {
  authenticate,
  refreshToken
};
