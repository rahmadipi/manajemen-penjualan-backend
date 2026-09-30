const express = require("express");
const cors = require("cors");
const config = require("./config/env");
const rateLimit = require("./middlewares/rateLimit");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: config.clientUrls }));
app.use(express.json({ limit: "100kb" }));

app.get("/", (req, res) => res.json({ message: "API Admin Panel aktif" }));
app.use("/login", rateLimit(), require("./routes/auth"));
app.use("/products", require("./routes/products"));
app.use("/transactions", require("./routes/transactions"));
app.use("/dashboard", require("./routes/dashboard"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
