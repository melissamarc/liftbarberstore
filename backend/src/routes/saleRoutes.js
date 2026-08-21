const express = require("express");

const router = express.Router();

const {
  criarVendaIa,
  atualizarVenda,
  listarVendas,
  buscarVendaPorId,
  excluirVenda,
} = require("../controllers/saleController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// REGISTRAR VENDA DO CATÁLOGO
router.post(
  "/ia",
  authMiddleware,
  roleMiddleware("admin", "vendedor"),
  criarVendaIa
);

// LISTAR VENDAS
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "vendedor"),
  listarVendas
);

// BUSCAR VENDA POR ID
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "vendedor"),
  buscarVendaPorId
);

// ATUALIZAR VENDA
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "vendedor"),
  atualizarVenda
);

// EXCLUIR VENDA
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "vendedor"),
  excluirVenda
);

module.exports = router;