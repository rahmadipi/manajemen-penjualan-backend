// Pemakaian:
//   npm run seed       -> membuat tabel, akun admin, dan data contoh (jika produk masih kosong)
//   npm run db:reset   -> HAPUS semua tabel lalu buat ulang beserta data contoh
const { sequelize, Product, Transaction } = require("../models");
const ensureAdmin = require("./admin");
const { products, transactions } = require("./sampleData");

const DAY_MS = 86400000;

(async () => {
  try {
    const reset = process.argv.includes("--reset");
    await sequelize.authenticate();
    await sequelize.sync({ force: reset });
    await ensureAdmin();

    if ((await Product.count()) > 0) {
      console.log(
        "Data produk sudah ada, data contoh dilewati. Gunakan `npm run db:reset` untuk mengulang dari awal.",
      );
      return;
    }

    await sequelize.transaction(async (t) => {
      const sold = new Array(products.length + 1).fill(0);
      transactions.forEach(([idx, qty]) => (sold[idx] += qty));

      const created = [];
      for (const [i, p] of products.entries()) {
        created.push(
          await Product.create(
            {
              nama_produk: p.nama_produk,
              harga: p.harga,
              stok: p.stok_awal - sold[i + 1],
            },
            { transaction: t },
          ),
        );
      }

      const now = Date.now();
      await Transaction.bulkCreate(
        transactions.map(([idx, qty, daysAgo, minutesAgo]) => {
          const p = created[idx - 1];
          return {
            produk_id: p.id,
            qty,
            harga_satuan: p.harga,
            total_harga: Number(p.harga) * qty,
            tanggal_transaksi: new Date(
              now - daysAgo * DAY_MS - minutesAgo * 60000,
            ),
          };
        }),
        { transaction: t },
      );
    });

    console.log(
      `Seed selesai: ${products.length} produk, ${transactions.length} transaksi.`,
    );
  } catch (e) {
    console.error("Seed gagal:", e.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
})();
