const express = require("express");
const router = express.Router();

const {
  desempenhoFuncionarios,
} = require("../controllers/performanceController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "vendedor"),
  desempenhoFuncionarios
);

module.exports = router;