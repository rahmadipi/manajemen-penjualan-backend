# Admin Panel Manajemen Penjualan - Backend

REST API untuk modul **Master Produk** dan **Transaksi Penjualan**.

**Stack:** Node.js, Express.js, PostgreSQL, Sequelize, JWT, bcryptjs.

## Fitur

- Login dengan JWT, password di-hash (bcrypt), middleware auth di semua endpoint selain `/login`
- CRUD Produk dengan **pagination** dan **search** nama produk
- Transaksi penjualan: total dihitung otomatis (harga x qty), **validasi stok**, stok berkurang otomatis
- Harga saat transaksi disimpan (`harga_satuan`), riwayat tidak berubah walau harga produk diubah
- Riwayat transaksi dengan pagination, pencarian produk, dan filter rentang tanggal
- Dashboard: total produk, total transaksi, total pendapatan, stok menipis, grafik 7 hari
- Validasi input di server, penanganan error yang konsisten, pembatas percobaan login
- Produk yang sudah dipakai transaksi tidak bisa dihapus (relasi 1 Produk -> banyak Transaksi)

## Setup Backend

Prasyarat: Node.js 18+ dan PostgreSQL.

```bash
# 1. Install dependency
npm install

# 2. Buat file .env
cp .env.example .env

# 3. Buat database kosong sesuai dengan yang diset pada .env file

# 4. Jalankan (tabel & akun admin dibuat otomatis)
npm run dev
```

API berjalan di http://localhost:3000. Login default: **admin / admin123**.

## API

Semua endpoint selain `POST /login` memerlukan header `Authorization: Bearer <token>`.

| Method | Endpoint            | Keterangan                                                              |
| ------ | ------------------- | ----------------------------------------------------------------------- |
| POST   | `/login`            | Body `{ username, password }`, mengembalikan `{ token, user }`          |
| GET    | `/products`         | Query: `page`, `limit`, `search`. Respons `{ data, pagination }`        |
| GET    | `/products/options` | Daftar ringkas semua produk untuk dropdown                              |
| POST   | `/products`         | Body `{ nama_produk, harga, stok }`                                     |
| PUT    | `/products/:id`     | Ubah produk (field boleh sebagian)                                      |
| DELETE | `/products/:id`     | Hapus produk. `409` bila sudah dipakai transaksi                        |
| GET    | `/transactions`     | Query: `page`, `limit`, `search`, `start_date`, `end_date` (YYYY-MM-DD) |
| POST   | `/transactions`     | Body `{ produk_id, qty, tanggal_transaksi? }`. `400` bila stok kurang   |
| GET    | `/dashboard`        | Ringkasan, stok menipis, transaksi terbaru, penjualan 7 hari            |

Format error: `{ "message": "...", "errors": { "field": "pesan" } }` (`errors` hanya ada pada error validasi).

## Keamanan

- Password disimpan sebagai hash bcrypt, tidak pernah dikirim balik
- JWT (HS256) dengan masa berlaku; token dicek oleh middleware auth
- Konfigurasi rahasia di `.env` (tidak ikut ke Git)
- Input divalidasi dan difilter (tidak menerima field di luar yang diizinkan)
- Pencarian memakai query terparameter Sequelize, karakter `%` dan `_` di-escape
- Login dibatasi 20 percobaan per 15 menit per IP (in-memory)
- Pengurangan stok memakai database transaction + row lock, aman untuk transaksi bersamaan

## Testing

```bash
npm test
```

Menguji validasi input, pagination, helper tanggal/zona waktu, dan pembatas login.
