const router = require("express").Router();
const { login } = require("../controllers/authController");

router.post("/", login);

module.exports = router;
