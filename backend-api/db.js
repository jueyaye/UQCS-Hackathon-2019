'use strict';

// Singleton instance to connect to the postgres database

const config = require('config');

let environment = process.env.NODE_ENV,
  logger = require('tracer').colorConsole();

const Sentry = require('@sentry/node');

// to debug queries add options to pg-promise initializiation
var options = {
  query: (e) => {
    if (environment === 'development') logger.debug('QUERY:', e.query);
  },
  error: (err, e) => {
    logger.debug('QUERY:', e.query);
    if (environment === 'production') Sentry.captureException(err);
    if (e.params) {
      logger.debug('PARAMS:', e.params);
    }
    if (err) {
      logger.error(err);
    }
    if (e.ctx) {
      // occurred inside a task or transaction
    }
  }
};

// Load and initialize pg-promise:
const pgp = require('pg-promise')((!environment || environment === 'development') ? options : {});

// Create the database instance:
const db = pgp(config.get('dbConfig'));

module.exports = db;
