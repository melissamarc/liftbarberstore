function roleMiddleware(...cargosPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        message: "Usuário não autenticado."
      });
    }

    if (!cargosPermitidos.includes(req.usuario.cargo)) {
      return res.status(403).json({
        message: "Acesso negado."
      });
    }

    next();
  };
}

module.exports = roleMiddleware;