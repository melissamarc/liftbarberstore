const express = require("express");
const router = express.Router();

const {
  listarUsuarios,
  criarUsuario,
  buscarPerfil,
  uploadFotoPerfil,
} = require("../controllers/userController");

const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../config/multer");

router.get("/", listarUsuarios);
router.post("/", criarUsuario);

router.get("/me", authMiddleware, buscarPerfil);
router.post("/me/foto", authMiddleware, upload.single("foto"), uploadFotoPerfil);

module.exports = router;