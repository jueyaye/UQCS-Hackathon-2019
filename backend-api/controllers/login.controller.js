const passport = require("passport");
const randtoken = require("rand-token");
const logger = require("tracer").colorConsole();
const auth = require("../utils/auth.util");
const models = require("../db/models");

function authenticate(req, res) {
  passport.authenticate(
    "local",
    {
      session: false
    },
    (err, user) => {
      if (err || !user) {
        logger.error(err);
        return res.status(401).json({
          success: false,
          error: err
        });
      }
      return req.login(
        user,
        {
          session: false
        },
        async error => {
          if (error) {
            res.send(error);
          }

          const refreshToken = randtoken.uid(128);

          await models.users.update(
            {
              refreshToken
            },
            {
              where: {
                id: user.id
              }
            }
          );

          return res.json({
            token: auth.generateJwt(user),
            refreshToken
          });
        }
      );
    }
  )(req, res);
}

async function refresh(req, res) {
  try {
    const user = await models.users.findOne({
      where: {
        refreshToken: req.body.refreshToken
      }
    });

    if (!user) {
      return res.status(401).json({
        error: "Refresh token is invalid or expired "
      });
    }

    return req.login(
      user,
      {
        session: false
      },
      err => {
        if (err) {
          res.send(err);
        }

        return res.json({
          token: auth.generateJwt(user)
        });
      }
    );
  } catch (err) {
    logger.error(err);
    return res.status(400).json({
      error: err.message || err
    });
  }
}

module.exports = {
  authenticate,
  refresh
};
