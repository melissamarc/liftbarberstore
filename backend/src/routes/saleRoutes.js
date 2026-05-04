const express = require("express");
const router = express.Router();

const {
  criarVendaManual,
  criarVendaIa,
  atualizarVenda,
  listarVendas,
  buscarVendaPorId,
  excluirVenda,
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

// atualizar venda: admin e vendedor
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "vendedor"),
  atualizarVenda
);

// excluir venda: admin e vendedor
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "vendedor"),
  excluirVenda
);

module.exports = router;
