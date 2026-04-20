const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Token não informado."
      });
    }

    const partes = authHeader.split(" ");

    if (partes.length !== 2) {
      return res.status(401).json({
        message: "Token inválido."
      });
    }

    const [tipo, token] = partes;

    if (tipo !== "Bearer") {
      return res.status(401).json({
        message: "Formato do token inválido."
      });
    }

    const decoded = jwt.verify(token, "segredo_super_secreto");

    req.usuario = {
      id: decoded.id,
      email: decoded.email,
      cargo: decoded.cargo
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido ou expirado."
    });
  }
}

module.exports = authMiddleware;