const express = require("express");
const router = express.Router();

const {
  criarVendaManual,
  criarVendaIa,
  listarVendas,
  buscarVendaPorId,
  editarVenda,
} = require("../controllers/saleController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// criar venda manual: admin e vendedor
router.post(
  "/manual",
  authMiddleware,
  roleMiddleware("admin", "vendedor"),
  criarVendaManual
);

// criar venda com IA confirmada: admin e vendedor
router.post(
  "/ia",
  authMiddleware,
  roleMiddleware("admin", "vendedor"),
  criarVendaIa
);

// listar vendas: admin e vendedor
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "vendedor"),
  listarVendas
);

// buscar venda por id: admin e vendedor
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "vendedor"),
  buscarVendaPorId
);

// editar venda: admin e vendedor
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "vendedor"),
  editarVenda
);

module.exports = router;