const router = require("express").Router();
const c = require("../controllers/transactionController");
const auth = require("../middlewares/auth");

router.use(auth);
router.get("/", c.getAll);
router.post("/", c.create);

module.exports = router;
