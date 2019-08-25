const fs = require("fs");
const path = require("path");

const basename = path.basename(__filename);
const config = require("config");

const db = {};

const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  config.dbConfig.database,
  config.dbConfig.username,
  config.dbConfig.password,
  {
    host: config.dbConfig.host,
    dialect: config.dbConfig.dialect,
    dialectOptions: config.dbConfig.dialectOptions
      ? config.dbConfig.dialectOptions
      : false,
    logging: false
    // benchmark: true
  }
);

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach(file => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
