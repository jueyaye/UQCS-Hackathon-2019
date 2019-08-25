'use strict';

let fs = require('fs'),
  path = require('path'),
  basename = path.basename(__filename),
  env = process.env.NODE_ENV || 'development',
  config = require('config'),
  db = {},
  sequelize;

const Sequelize = require('sequelize');

sequelize = new Sequelize(config.dbConfig.database, config.dbConfig.username, config.dbConfig.password, {
  host: config.dbConfig.host,
  dialect: config.dbConfig.dialect,
  dialectOptions: config.dbConfig.dialectOptions ? config.dbConfig.dialectOptions : false,
  logging: false
  // benchmark: true
});

fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    var model = sequelize['import'](path.join(__dirname, file));
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
