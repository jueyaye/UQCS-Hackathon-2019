const config = require("config");
const logger = require("tracer").colorConsole();

module.exports = { dialect: "postgres", ...config.get("dbConfig") };
logger.log(`Sequelize config for ${process.env.NODE_ENV}:`);
console.dir(module.exports);
