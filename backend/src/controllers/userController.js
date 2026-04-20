const pool = require("../config/db");
const bcrypt = require("bcryptjs");

// LISTAR USUÁRIOS
async function listarUsuarios(req, res) {
  try {
    const [usuarios] = await pool.query(`
      SELECT id, nome, email, foto_perfil, cargo, ativo, data_criacao
      FROM usuarios
      ORDER BY id DESC
    `);

    return res.status(200).json(usuarios);
  } catch (error) {
    console.error("Erro ao listar usuários:", error.message);
    return res.status(500).json({
      message: "Erro ao listar usuários."
    });
  }
}

// CRIAR USUÁRIO
async function criarUsuario(req, res) {
  try {
    const { nome, email, senha, cargo } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        message: "Nome, email e senha são obrigatórios."
      });
    }

    const [existe] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (existe.length > 0) {
      return res.status(400).json({
        message: "Email já cadastrado."
      });
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, cargo)
       VALUES (?, ?, ?, ?)`,
      [nome, email, senha_hash, cargo || "vendedor"]
    );

    return res.status(201).json({
      message: "Usuário criado com sucesso."
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error.message);
    return res.status(500).json({
      message: "Erro ao criar usuário."
    });
  }
}

// BUSCAR PERFIL DO USUÁRIO LOGADO
async function buscarPerfil(req, res) {
  try {
    const usuarioId = req.usuario.id;

    const [usuarios] = await pool.query(
      `
      SELECT id, nome, email, foto_perfil, cargo, ativo, data_criacao
      FROM usuarios
      WHERE id = ?
      `,
      [usuarioId]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        message: "Usuário não encontrado."
      });
    }

    return res.status(200).json(usuarios[0]);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error.message);
    return res.status(500).json({
      message: "Erro ao buscar perfil."
    });
  }
}

// UPLOAD FOTO DE PERFIL
async function uploadFotoPerfil(req, res) {
  try {
    const usuarioId = req.usuario.id;

    if (!req.file) {
      return res.status(400).json({
        message: "Nenhum arquivo enviado."
      });
    }

    const caminhoArquivo = `/uploads/${req.file.filename}`;

    await pool.query(
      `
      UPDATE usuarios
      SET foto_perfil = ?
      WHERE id = ?
      `,
      [caminhoArquivo, usuarioId]
    );

    return res.status(200).json({
      message: "Foto de perfil atualizada com sucesso.",
      foto_perfil: caminhoArquivo
    });
  } catch (error) {
    console.error("Erro ao enviar foto de perfil:", error.message);
    return res.status(500).json({
      message: "Erro ao enviar foto de perfil."
    });
  }
}

module.exports = {
  listarUsuarios,
  criarUsuario,
  buscarPerfil,
  uploadFotoPerfil,
};