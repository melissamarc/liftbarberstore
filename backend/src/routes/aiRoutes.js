const express = require("express");
const router = express.Router();

const { interpretarMensagemVenda } = require("../controllers/aiController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.post(
  "/parse-sale",
  authMiddleware,
  roleMiddleware("admin", "vendedor"),
  interpretarMensagemVenda
);

module.exports = router;