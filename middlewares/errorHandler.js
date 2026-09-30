const config = require("../config/env");
const HttpError = require("../utils/httpError");

const notFound = (req, res) =>
  res.status(404).json({ message: "Endpoint tidak ditemukan" });

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err instanceof HttpError) {
    return res
      .status(err.status)
      .json({
        message: err.message,
        ...(err.errors && { errors: err.errors }),
      });
  }
  if (err.type === "entity.parse.failed")
    return res.status(400).json({ message: "Format JSON tidak valid" });
  if (err.type === "entity.too.large")
    return res.status(413).json({ message: "Data terlalu besar" });
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res
      .status(409)
      .json({
        message:
          "Data masih digunakan oleh data lain sehingga tidak dapat diubah atau dihapus",
      });
  }
  if (
    ["SequelizeValidationError", "SequelizeUniqueConstraintError"].includes(
      err.name,
    )
  ) {
    return res
      .status(400)
      .json({ message: err.errors?.[0]?.message || "Data tidak valid" });
  }
  console.error(err);
  res
    .status(500)
    .json({
      message: config.isProd ? "Terjadi kesalahan pada server" : err.message,
    });
};

module.exports = { notFound, errorHandler };
