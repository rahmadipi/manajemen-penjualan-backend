const router = require("express").Router();
const c = require("../controllers/productController");
const auth = require("../middlewares/auth");

router.use(auth);
router.get("/options", c.options);
router.get("/", c.getAll);
router.post("/", c.create);
router.put("/:id", c.update);
router.delete("/:id", c.remove);

module.exports = router;
