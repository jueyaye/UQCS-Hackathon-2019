const passport = require("passport");
const passportJWT = require("passport-jwt");

const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;
const LocalStrategy = require("passport-local").Strategy;

const bcrypt = require("bcrypt");
const config = require("config");
const logger = require("tracer").colorConsole();
const models = require("../db/models");

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(
  new LocalStrategy(
    {
      // default user stratergy
      usernameField: "email",
      passwordField: "password"
    },
    function(email, password, cb) {
      return models.users
        .findOne({
          where: {
            email
          }
        })
        .then(async user => {
          if (user == null) return cb("Username or Password Invalid", false);
          // compare
          return bcrypt.compare(password, user.password, function(err, res) {
            if (res === false) {
              return cb("Username or Password Invalid", false);
            }
            if (!user.verifiedEmail) {
              return cb("You haven't confirmed your email address yet.", false);
            }
            return cb(null, user);
          });
        })
        .catch(err => {
          logger.error(err);
          return cb(err);
        });
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.jwt.jwtFromSecret
    },
    async function(jwtPayload, cb) {
      try {
        const user = await models.users.findOne({
          where: {
            id: jwtPayload.data.id
          }
        });

        return cb(null, user);
      } catch (err) {
        logger.error(err);
        return cb(err);
      }
    }
  )
);
