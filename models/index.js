const sequelize = require("../config/database");
const User = require("./User");
const Product = require("./Product");
const Transaction = require("./Transaction");

// 1 Produk -> banyak Transaksi. Produk yang sudah dipakai transaksi tidak boleh dihapus.
const fk = {
  foreignKey: "produk_id",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
};
Product.hasMany(Transaction, { as: "transaksi", ...fk });
Transaction.belongsTo(Product, { as: "produk", ...fk });

module.exports = { sequelize, User, Product, Transaction };
