const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateProduct,
  validateTransaction,
  validateLogin,
  parseId,
  escapeLike,
} = require("../utils/validators");
const { parsePagination, buildMeta } = require("../utils/pagination");
const {
  startOfDay,
  addDays,
  isDateString,
  buildDailySeries,
  dayKey,
} = require("../utils/dates");
const rateLimit = require("../middlewares/rateLimit");

const errorsOf = (fn) => {
  try {
    fn();
  } catch (e) {
    return e.errors || { _: e.message };
  }
  return null;
};

test("validateProduct: data valid dibersihkan & dikonversi", () => {
  const v = validateProduct({
    nama_produk: "  Kopi  ",
    harga: "15000",
    stok: "3",
    id: 99,
    created_at: "x",
  });
  assert.deepEqual(v, { nama_produk: "Kopi", harga: 15000, stok: 3 }); // id/created_at tidak lolos
});

test("validateProduct: menolak nilai tidak valid", () => {
  const e = errorsOf(() =>
    validateProduct({ nama_produk: "", harga: -1, stok: 1.5 }),
  );
  assert.ok(e.nama_produk && e.harga && e.stok);
  assert.ok(
    errorsOf(() => validateProduct({ nama_produk: "a", harga: "", stok: 0 }))
      .harga,
  );
  assert.ok(
    errorsOf(() => validateProduct({ nama_produk: "a", harga: 1, stok: null }))
      .stok,
  );
  assert.ok(
    errorsOf(() =>
      validateProduct({ nama_produk: "a".repeat(151), harga: 1, stok: 1 }),
    ).nama_produk,
  );
});

test("validateProduct partial: hanya field yang dikirim", () => {
  assert.deepEqual(validateProduct({ stok: 5 }, { partial: true }), {
    stok: 5,
  });
  assert.deepEqual(validateProduct({}, { partial: true }), {});
  assert.ok(
    errorsOf(() => validateProduct({ harga: -5 }, { partial: true })).harga,
  );
});

test("validateTransaction", () => {
  const ok = validateTransaction({ produk_id: "2", qty: 3 });
  assert.deepEqual(ok, { produk_id: 2, qty: 3 });
  assert.ok(
    errorsOf(() => validateTransaction({ produk_id: null, qty: 1 })).produk_id,
  );
  assert.ok(errorsOf(() => validateTransaction({ produk_id: 1, qty: 0 })).qty);
  assert.ok(
    errorsOf(() => validateTransaction({ produk_id: 1, qty: 1.5 })).qty,
  );
  assert.ok(
    errorsOf(() =>
      validateTransaction({
        produk_id: 1,
        qty: 1,
        tanggal_transaksi: "bukan tanggal",
      }),
    ).tanggal_transaksi,
  );
  const future = new Date(Date.now() + 3 * 86400000).toISOString();
  assert.ok(
    errorsOf(() =>
      validateTransaction({ produk_id: 1, qty: 1, tanggal_transaksi: future }),
    ).tanggal_transaksi,
  );
  assert.ok(
    validateTransaction({
      produk_id: 1,
      qty: 1,
      tanggal_transaksi: new Date().toISOString(),
    }).tanggal_transaksi instanceof Date,
  );
});

test("validateLogin & parseId", () => {
  assert.deepEqual(validateLogin({ username: " admin ", password: "x" }), {
    username: "admin",
    password: "x",
  });
  assert.ok(errorsOf(() => validateLogin({})).username);
  assert.equal(parseId("12"), 12);
  assert.ok(errorsOf(() => parseId("abc")));
  assert.ok(errorsOf(() => parseId("0")));
});

test("escapeLike", () => {
  assert.equal(escapeLike("50%_off\\"), "50\\%\\_off\\\\");
});

test("pagination", () => {
  assert.deepEqual(parsePagination({}), { page: 1, limit: 10, offset: 0 });
  assert.deepEqual(parsePagination({ page: "3", limit: "20" }), {
    page: 3,
    limit: 20,
    offset: 40,
  });
  assert.equal(parsePagination({ limit: "9999" }).limit, 100);
  assert.equal(parsePagination({ page: "-4", limit: "0" }).page, 1);
  assert.deepEqual(buildMeta(25, 2, 10), {
    page: 2,
    limit: 10,
    total: 25,
    totalPages: 3,
  });
  assert.equal(buildMeta(0, 1, 10).totalPages, 1);
});

test("tanggal: awal hari zona Asia/Jakarta", () => {
  assert.equal(
    startOfDay("2026-09-29", "Asia/Jakarta").toISOString(),
    "2026-09-28T17:00:00.000Z",
  );
  assert.equal(addDays("2026-09-30", 1), "2026-10-01");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.ok(isDateString("2026-02-28"));
  assert.ok(!isDateString("2026-02-30"));
  assert.ok(!isDateString("29-09-2026"));
});

test("buildDailySeries: 7 hari, hari kosong = 0, urut dari terlama", () => {
  const now = new Date("2026-09-29T05:00:00Z"); // 12:00 WIB
  const rows = [
    { tanggal_transaksi: "2026-09-29T02:00:00Z", total_harga: "100000.00" },
    { tanggal_transaksi: "2026-09-28T20:00:00Z", total_harga: 50000 }, // 03:00 WIB tgl 29
    { tanggal_transaksi: "2026-09-27T10:00:00Z", total_harga: 20000 },
    { tanggal_transaksi: "2026-09-01T10:00:00Z", total_harga: 999 }, // di luar rentang
  ];
  const s = buildDailySeries(rows, 7, "Asia/Jakarta", now);
  assert.equal(s.length, 7);
  assert.equal(s[0].tanggal, "2026-09-23");
  assert.equal(s[6].tanggal, "2026-09-29");
  assert.deepEqual([s[6].total, s[6].transaksi], [150000, 2]);
  assert.deepEqual([s[4].total, s[4].transaksi], [20000, 1]);
  assert.equal(s[5].total, 0);
  assert.equal(dayKey(now, "Asia/Jakarta"), "2026-09-29");
});

test("rateLimit: blokir setelah melewati batas", () => {
  const mw = rateLimit({ max: 2, windowMs: 1000 });
  const res = {
    set() {},
    status(c) {
      this.code = c;
      return this;
    },
    json() {
      return this;
    },
  };
  let passed = 0;
  for (let i = 0; i < 3; i++) mw({ ip: "1.1.1.1" }, res, () => passed++);
  assert.equal(passed, 2);
  assert.equal(res.code, 429);
  mw({ ip: "2.2.2.2" }, res, () => passed++);
  assert.equal(passed, 3); // IP lain tidak terpengaruh
});
