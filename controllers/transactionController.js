const { Op } = require("sequelize");
const config = require("../config/env");
const { sequelize, Product, Transaction } = require("../models");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");
const { parsePagination, buildMeta } = require("../utils/pagination");
const { validateTransaction, escapeLike } = require("../utils/validators");
const { startOfDay, addDays, isDateString } = require("../utils/dates");

const withProduct = (extra = {}) => ({
  model: Product,
  as: "produk",
  attributes: ["id", "nama_produk", "harga"],
  ...extra,
});

// GET /transactions?page=1&limit=10&search=kopi&start_date=2026-09-01&end_date=2026-09-30
exports.getAll = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const search = String(req.query.search || "").trim();
  const { start_date: start, end_date: end } = req.query;

  const where = {};
  if (start) {
    if (!isDateString(start))
      throw new HttpError(400, "Format start_date harus YYYY-MM-DD");
    where.tanggal_transaksi = {
      ...where.tanggal_transaksi,
      [Op.gte]: startOfDay(start, config.timezone),
    };
  }
  if (end) {
    if (!isDateString(end))
      throw new HttpError(400, "Format end_date harus YYYY-MM-DD");
    where.tanggal_transaksi = {
      ...where.tanggal_transaksi,
      [Op.lt]: startOfDay(addDays(end, 1), config.timezone),
    };
  }

  const include = search
    ? withProduct({
        required: true,
        where: { nama_produk: { [Op.iLike]: `%${escapeLike(search)}%` } },
      })
    : withProduct();

  const { rows, count } = await Transaction.findAndCountAll({
    where,
    include: [include],
    order: [
      ["tanggal_transaksi", "DESC"],
      ["id", "DESC"],
    ],
    limit,
    offset,
  });
  res.json({ data: rows, pagination: buildMeta(count, page, limit) });
});

// POST /transactions  { produk_id, qty, tanggal_transaksi? }
exports.create = asyncHandler(async (req, res) => {
  const { produk_id, qty, tanggal_transaksi } = validateTransaction(req.body);

  const id = await sequelize.transaction(async (t) => {
    // Kunci baris produk supaya dua transaksi bersamaan tidak membuat stok minus.
    const product = await Product.findByPk(produk_id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!product) throw new HttpError(404, "Produk tidak ditemukan");
    if (product.stok < qty) {
      throw new HttpError(400, "Stok tidak mencukupi", {
        qty: `Stok tersedia hanya ${product.stok}`,
      });
    }

    const hargaSatuan = Number(product.harga);
    const trx = await Transaction.create(
      {
        produk_id,
        qty,
        harga_satuan: hargaSatuan,
        total_harga: (Math.round(hargaSatuan * 100) * qty) / 100,
        tanggal_transaksi: tanggal_transaksi || new Date(),
      },
      { transaction: t },
    );
    await product.update({ stok: product.stok - qty }, { transaction: t });
    return trx.id;
  });

  res
    .status(201)
    .json(await Transaction.findByPk(id, { include: [withProduct()] }));
});
