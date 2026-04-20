const express = require("express");
const router = express.Router();

const { rankingVendedores } = require("../controllers/rankingController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "vendedor"),
  rankingVendedores
);

module.exports = router;