const express = require("express");
const router = express.Router();

const {
  resumoDashboard,
  topProdutos,
} = require("../controllers/dashboardController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// resumo do dashboard
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "vendedor"),
  resumoDashboard
);

// top produtos
router.get(
  "/top-products",
  authMiddleware,
  roleMiddleware("admin", "vendedor"),
  topProdutos
);

module.exports = router;