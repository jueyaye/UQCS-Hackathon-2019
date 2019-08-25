const models = require('../db/models');
const {
  RateLimiterPostgres
} = require('rate-limiter-flexible');
const logger = require('tracer').colorConsole();

const ready = (err) => {
  if (err) {
    // log or/and process exit
    logger.warn(err);
  } else {
    // table checked/created
  }
};

const rateLimiter = new RateLimiterPostgres({
  storeClient: models.sequelize,
  keyPrefix: 'rate_limiter',
  points: 100, // 10 requests
  duration: 30, // per 30 second by IP
}, ready);

const rateLimiterMiddleware = (req, res, next) => {
  rateLimiter.consume(req.ip, 1)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).send('Too Many Requests');
    });
};

module.exports = rateLimiterMiddleware;
