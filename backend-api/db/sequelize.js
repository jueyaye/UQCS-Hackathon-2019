let config = require('config');
  logger = require('tracer').colorConsole();

module.exports = Object.assign({
  "dialect": "postgres"
}, config.get("dbConfig"));
logger.log('Sequelize config for ' + process.env.NODE_ENV + ':');
console.dir(module.exports);
