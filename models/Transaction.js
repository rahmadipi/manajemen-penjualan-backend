const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define(
  "Transaction",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tanggal_transaksi: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    produk_id: { type: DataTypes.INTEGER, allowNull: false },
    qty: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    // Harga produk saat transaksi terjadi, supaya riwayat tidak berubah bila harga produk diubah.
    harga_satuan: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    total_harga: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  },
  {
    tableName: "transactions",
    timestamps: false,
    indexes: [{ fields: ["tanggal_transaksi"] }, { fields: ["produk_id"] }],
  },
);
