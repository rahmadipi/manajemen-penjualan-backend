const HttpError = require("./httpError");

const MAX_MONEY = 9999999999999.99;
const MAX_INT = 1000000000;

const isBlank = (v) =>
  v === undefined || v === null || (typeof v === "string" && v.trim() === "");
const toNumber = (v) =>
  (typeof v === "number" || typeof v === "string") && !isBlank(v)
    ? Number(v)
    : NaN;

function finish(errors, value) {
  if (Object.keys(errors).length)
    throw new HttpError(400, "Data tidak valid", errors);
  return value;
}

function parseId(raw, label = "ID") {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1)
    throw new HttpError(400, `${label} tidak valid`);
  return n;
}

// Hanya field yang dikenal yang dikembalikan, sehingga aman dari mass assignment.
function validateProduct(body = {}, { partial = false } = {}) {
  const errors = {};
  const value = {};

  if (!partial || body.nama_produk !== undefined) {
    const nama =
      typeof body.nama_produk === "string" ? body.nama_produk.trim() : "";
    if (!nama) errors.nama_produk = "Nama produk wajib diisi";
    else if (nama.length > 150)
      errors.nama_produk = "Nama produk maksimal 150 karakter";
    else value.nama_produk = nama;
  }
  if (!partial || body.harga !== undefined) {
    const harga = toNumber(body.harga);
    if (Number.isNaN(harga)) errors.harga = "Harga wajib diisi dengan angka";
    else if (harga < 0) errors.harga = "Harga tidak boleh negatif";
    else if (harga > MAX_MONEY) errors.harga = "Harga terlalu besar";
    else value.harga = Math.round(harga * 100) / 100;
  }
  if (!partial || body.stok !== undefined) {
    const stok = toNumber(body.stok);
    if (!Number.isInteger(stok))
      errors.stok = "Stok harus berupa bilangan bulat";
    else if (stok < 0) errors.stok = "Stok tidak boleh negatif";
    else if (stok > MAX_INT) errors.stok = "Stok terlalu besar";
    else value.stok = stok;
  }
  return finish(errors, value);
}

function validateTransaction(body = {}) {
  const errors = {};
  const value = {};

  const produkId = Number(body.produk_id);
  if (isBlank(body.produk_id) || !Number.isInteger(produkId) || produkId < 1) {
    errors.produk_id = "Pilih produk terlebih dahulu";
  } else value.produk_id = produkId;

  const qty = toNumber(body.qty);
  if (!Number.isInteger(qty) || qty < 1)
    errors.qty = "Qty harus bilangan bulat minimal 1";
  else if (qty > MAX_INT) errors.qty = "Qty terlalu besar";
  else value.qty = qty;

  if (!isBlank(body.tanggal_transaksi)) {
    const d = new Date(body.tanggal_transaksi);
    if (Number.isNaN(d.getTime()))
      errors.tanggal_transaksi = "Tanggal transaksi tidak valid";
    else if (d.getTime() > Date.now() + 5 * 60 * 1000)
      errors.tanggal_transaksi = "Tanggal transaksi tidak boleh di masa depan";
    else value.tanggal_transaksi = d;
  }
  return finish(errors, value);
}

function validateLogin(body = {}) {
  const errors = {};
  const username =
    typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!username) errors.username = "Username wajib diisi";
  else if (username.length > 100) errors.username = "Username terlalu panjang";
  if (!password) errors.password = "Password wajib diisi";
  else if (password.length > 200) errors.password = "Password terlalu panjang";
  return finish(errors, { username, password });
}

// Escape karakter khusus LIKE agar input "%" atau "_" dianggap teks biasa.
const escapeLike = (s) => String(s).replace(/[\\%_]/g, (c) => `\\${c}`);

module.exports = {
  parseId,
  validateProduct,
  validateTransaction,
  validateLogin,
  escapeLike,
};
