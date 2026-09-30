const jwt = require("jsonwebtoken");
const config = require("../config/env");

module.exports = (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer "))
    return res.status(401).json({ message: "Token tidak ditemukan" });
  try {
    req.user = jwt.verify(header.slice(7), config.jwtSecret, {
      algorithms: ["HS256"],
    });
    next();
  } catch (e) {
    const message =
      e.name === "TokenExpiredError"
        ? "Sesi telah berakhir, silakan login kembali"
        : "Token tidak valid";
    res.status(401).json({ message });
  }
};
