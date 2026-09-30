const { Op } = require("sequelize");
const { Product, Transaction } = require("../models");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");
const { parsePagination, buildMeta } = require("../utils/pagination");
const { parseId, validateProduct, escapeLike } = require("../utils/validators");

// GET /products?page=1&limit=10&search=kopi
exports.getAll = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const search = String(req.query.search || "").trim();
  const where = search
    ? { nama_produk: { [Op.iLike]: `%${escapeLike(search)}%` } }
    : {};

  const { rows, count } = await Product.findAndCountAll({
    where,
    order: [["id", "DESC"]],
    limit,
    offset,
  });
  res.json({ data: rows, pagination: buildMeta(count, page, limit) });
});

// GET /products/options -> daftar ringkas seluruh produk untuk dropdown transaksi
exports.options = asyncHandler(async (req, res) => {
  const rows = await Product.findAll({
    attributes: ["id", "nama_produk", "harga", "stok"],
    order: [["nama_produk", "ASC"]],
  });
  res.json(rows);
});

exports.create = asyncHandler(async (req, res) => {
  const product = await Product.create(validateProduct(req.body));
  res.status(201).json(product);
});

exports.update = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(parseId(req.params.id));
  if (!product) throw new HttpError(404, "Produk tidak ditemukan");
  const changes = validateProduct(req.body, { partial: true });
  if (!Object.keys(changes).length)
    throw new HttpError(400, "Tidak ada data yang diubah");
  await product.update(changes);
  res.json(product);
});

exports.remove = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const product = await Product.findByPk(id);
  if (!product) throw new HttpError(404, "Produk tidak ditemukan");

  const used = await Transaction.count({ where: { produk_id: id } });
  if (used > 0) {
    throw new HttpError(
      409,
      `Produk tidak dapat dihapus karena sudah dipakai pada ${used} transaksi`,
    );
  }
  await product.destroy();
  res.json({ message: "Produk berhasil dihapus" });
});
