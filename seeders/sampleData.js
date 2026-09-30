// Data contoh untuk demo & screenshot. Dipakai oleh seeders/seed.js.
const products = [
  { nama_produk: "Kopi Arabika Gayo 250g", harga: 68000, stok_awal: 40 },
  { nama_produk: "Teh Melati Celup (isi 25)", harga: 18000, stok_awal: 30 },
  { nama_produk: "Gula Aren Cair 500ml", harga: 32000, stok_awal: 35 },
  { nama_produk: "Madu Hutan Sumbawa 250ml", harga: 85000, stok_awal: 9 },
  { nama_produk: "Keripik Tempe Original", harga: 15000, stok_awal: 60 },
  { nama_produk: "Sambal Roa Botol", harga: 28000, stok_awal: 45 },
  { nama_produk: "Minyak Kelapa Murni 250ml", harga: 45000, stok_awal: 12 },
  { nama_produk: "Beras Merah Organik 1kg", harga: 26000, stok_awal: 50 },
  { nama_produk: "Tas Kain Batik Jogja", harga: 55000, stok_awal: 8 },
  { nama_produk: "Sabun Herbal Serai", harga: 22000, stok_awal: 30 },
];

// [nomor produk (mulai 1), qty, berapa hari lalu, berapa menit lalu tambahan]
const transactions = [
  [1, 3, 6, 200],
  [5, 4, 6, 120],
  [2, 2, 6, 60],
  [3, 2, 5, 300],
  [1, 2, 5, 180],
  [8, 3, 5, 45],
  [6, 2, 4, 400],
  [4, 2, 4, 240],
  [1, 4, 4, 90],
  [7, 3, 3, 330],
  [10, 2, 3, 250],
  [5, 6, 3, 130],
  [9, 2, 3, 30],
  [2, 5, 2, 420],
  [3, 3, 2, 210],
  [8, 2, 2, 75],
  [1, 5, 1, 360],
  [4, 3, 1, 260],
  [6, 4, 1, 150],
  [9, 3, 1, 50],
  [5, 3, 0, 300],
  [7, 2, 0, 200],
];

module.exports = { products, transactions };
