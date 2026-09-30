const router = require("express").Router();
const c = require("../controllers/dashboardController");
const auth = require("../middlewares/auth");

router.get("/", auth, c.summary);

module.exports = router;
