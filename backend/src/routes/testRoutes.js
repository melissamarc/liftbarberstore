const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.get("/protegida", authMiddleware, (req, res) => {
  return res.status(200).json({
    message: "Você acessou uma rota protegida.",
    usuario: req.usuario
  });
});

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    return res.status(200).json({
      message: "Você acessou uma rota exclusiva de admin.",
      usuario: req.usuario
    });
  }
);

module.exports = router;