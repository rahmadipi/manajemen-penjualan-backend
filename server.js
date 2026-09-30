const config = require("./config/env");
const app = require("./app");
const { sequelize } = require("./models");
const ensureAdmin = require("./seeders/admin");

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await ensureAdmin();
    console.log("Database connected");
    app.listen(config.port, () =>
      console.log(`Backend running http://localhost:${config.port}`),
    );
  } catch (e) {
    console.error("Gagal menjalankan server:", e.message);
    process.exit(1);
  }
})();
