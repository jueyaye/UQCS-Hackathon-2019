
let passport = require('passport'),
  passportJWT = require('passport-jwt'),
  ExtractJWT = passportJWT.ExtractJwt,
  JWTStrategy = passportJWT.Strategy,
  LocalStrategy = require('passport-local').Strategy;

let bcrypt = require('bcrypt'),
  config = require('config'),
  logger = require('tracer').colorConsole(),
  models = require('../db/models');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new LocalStrategy({                    // default user stratergy
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, cb) {
    return models.users.findOne({
      where: {
        email: email
      }
    })
    .then(async user => {
      if (user == null) return cb("Username or Password Invalid", false);
      // compare
      bcrypt.compare(password, user.password, function(err, res) {
        if (res === false) {
          return cb("Username or Password Invalid", false);
        } else {
          if (!user.verifiedEmail) {
            return cb("You haven't confirmed your email address yet.", false);
          }
          return cb(null, user);
        }
      })
    })
    .catch(err => {
      logger.error(err);
      return cb(err);
    });
  }
));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwt.jwtFromSecret
  },
  async function(jwtPayload, cb) {
    try {
      let user = await model.users.findOne({
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
));
