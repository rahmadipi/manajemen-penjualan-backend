require("dotenv").config();

const missing = ["DB_NAME", "DB_USER", "JWT_SECRET"].filter(
  (k) => !process.env[k],
);
if (missing.length) {
  console.error(`Konfigurasi .env belum lengkap: ${missing.join(", ")}`);
  console.error("Salin .env.example menjadi .env lalu isi nilainya.");
  process.exit(1);
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  isProd: process.env.NODE_ENV === "production",
  clientUrls: (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  db: {
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
  },
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  admin: {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "admin123",
  },
  timezone: process.env.APP_TIMEZONE || "Asia/Jakarta",
  lowStockThreshold: Number(process.env.LOW_STOCK_THRESHOLD) || 5,
};
