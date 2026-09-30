const { Op } = require("sequelize");
const config = require("../config/env");
const { Product, Transaction } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { buildDailySeries, DAY_MS } = require("../utils/dates");

const CHART_DAYS = 7;

exports.summary = asyncHandler(async (req, res) => {
  const lowStock = { stok: { [Op.lte]: config.lowStockThreshold } };
  const since = new Date(Date.now() - CHART_DAYS * DAY_MS);

  const [
    totalProduk,
    totalTransaksi,
    totalPendapatan,
    jumlahStokMenipis,
    stokMenipis,
    transaksiTerbaru,
    recentRows,
  ] = await Promise.all([
    Product.count(),
    Transaction.count(),
    Transaction.sum("total_harga"),
    Product.count({ where: lowStock }),
    Product.findAll({
      where: lowStock,
      order: [
        ["stok", "ASC"],
        ["id", "ASC"],
      ],
      limit: 5,
    }),
    Transaction.findAll({
      include: [
        { model: Product, as: "produk", attributes: ["id", "nama_produk"] },
      ],
      order: [
        ["tanggal_transaksi", "DESC"],
        ["id", "DESC"],
      ],
      limit: 5,
    }),
    Transaction.findAll({
      attributes: ["tanggal_transaksi", "total_harga"],
      where: { tanggal_transaksi: { [Op.gte]: since } },
      raw: true,
    }),
  ]);

  res.json({
    totalProduk,
    totalTransaksi,
    totalPendapatan: Number(totalPendapatan) || 0,
    jumlahStokMenipis,
    batasStokMenipis: config.lowStockThreshold,
    stokMenipis,
    transaksiTerbaru,
    penjualanHarian: buildDailySeries(recentRows, CHART_DAYS, config.timezone),
  });
});
