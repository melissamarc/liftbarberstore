const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// LOGIN
async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        message: "Email e senha são obrigatórios."
      });
    }

    const [usuarios] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(400).json({
        message: "Usuário não encontrado."
      });
    }

    const usuario = usuarios[0];

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(400).json({
        message: "Senha incorreta."
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        cargo: usuario.cargo
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    return res.status(200).json({
      message: "Login realizado com sucesso.",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
        foto_perfil: usuario.foto_perfil || null
      }
    });
  } catch (error) {
    console.error("Erro no login:", error.message);
    return res.status(500).json({
      message: "Erro ao realizar login."
    });
  }
}

module.exports = {
  login
};