let config = require('config');
const pgp = require('pg-promise')();
let db = pgp(config.get("dbConfig"));
module.exports = db;
