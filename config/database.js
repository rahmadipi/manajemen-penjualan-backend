const { Sequelize } = require("sequelize");
const config = require("./env");

module.exports = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: "postgres",
    logging: false,
  },
);
