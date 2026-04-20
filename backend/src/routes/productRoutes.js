const express = require("express");
const router = express.Router();

const {
  listarProdutos,
  criarProduto,
  buscarProdutoPorId,
  atualizarProduto,
} = require("../controllers/productController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const uploadProduct = require("../config/multerProduct");

// listar: admin e vendedor
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "vendedor"),
  listarProdutos
);

// buscar por id: admin e vendedor
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "vendedor"),
  buscarProdutoPorId
);

// criar: só admin
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  uploadProduct.single("foto_produto"),
  criarProduto
);

// atualizar: só admin
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  uploadProduct.single("foto_produto"),
  atualizarProduto
);

module.exports = router;