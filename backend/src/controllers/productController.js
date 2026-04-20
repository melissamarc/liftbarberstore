const pool = require("../config/db");

// LISTAR PRODUTOS
async function listarProdutos(req, res) {
  try {
    const { busca = "" } = req.query;

    let query = `
      SELECT id, nome, preco, foto_produto, ativo, data_criacao
      FROM produtos
    `;

    const params = [];

    if (busca.trim()) {
      query += ` WHERE nome LIKE ? `;
      params.push(`%${busca.trim()}%`);
    }

    query += ` ORDER BY id DESC`;

    const [produtos] = await pool.query(query, params);

    return res.status(200).json(produtos);
  } catch (error) {
    console.error("Erro ao listar produtos:", error.message);
    return res.status(500).json({
      message: "Erro ao listar produtos."
    });
  }
}

// CRIAR PRODUTO
async function criarProduto(req, res) {
  try {
    const { nome, preco } = req.body;

    if (!nome || preco === undefined || preco === null || preco === "") {
      return res.status(400).json({
        message: "Nome e preço são obrigatórios."
      });
    }

    const precoNumero = Number(preco);

    if (Number.isNaN(precoNumero) || precoNumero <= 0) {
      return res.status(400).json({
        message: "Preço inválido."
      });
    }

    const fotoProduto = req.file ? `/uploads/produtos/${req.file.filename}` : null;

    await pool.query(
      `INSERT INTO produtos (nome, preco, foto_produto)
       VALUES (?, ?, ?)`,
      [nome, precoNumero, fotoProduto]
    );

    return res.status(201).json({
      message: "Produto criado com sucesso."
    });
  } catch (error) {
    console.error("Erro ao criar produto:", error.message);
    return res.status(500).json({
      message: "Erro ao criar produto."
    });
  }
}

// BUSCAR PRODUTO POR ID
async function buscarProdutoPorId(req, res) {
  try {
    const { id } = req.params;

    const [produtos] = await pool.query(
      `
      SELECT id, nome, preco, foto_produto, ativo, data_criacao
      FROM produtos
      WHERE id = ?
      `,
      [id]
    );

    if (produtos.length === 0) {
      return res.status(404).json({
        message: "Produto não encontrado."
      });
    }

    return res.status(200).json(produtos[0]);
  } catch (error) {
    console.error("Erro ao buscar produto:", error.message);
    return res.status(500).json({
      message: "Erro ao buscar produto."
    });
  }
}

// ATUALIZAR PRODUTO
async function atualizarProduto(req, res) {
  try {
    const { id } = req.params;
    const { nome, preco, ativo } = req.body;

    const [produtos] = await pool.query(
      `SELECT * FROM produtos WHERE id = ?`,
      [id]
    );

    if (produtos.length === 0) {
      return res.status(404).json({
        message: "Produto não encontrado."
      });
    }

    const produtoAtual = produtos[0];

    const nomeFinal = nome ?? produtoAtual.nome;
    const precoFinal = preco !== undefined ? Number(preco) : Number(produtoAtual.preco);
    const ativoFinal =
      ativo !== undefined
        ? ativo === true || ativo === "true" || ativo === 1 || ativo === "1"
        : Boolean(produtoAtual.ativo);

    if (!nomeFinal || Number.isNaN(precoFinal) || precoFinal <= 0) {
      return res.status(400).json({
        message: "Dados inválidos para atualização."
      });
    }

    const fotoFinal = req.file
      ? `/uploads/produtos/${req.file.filename}`
      : produtoAtual.foto_produto;

    await pool.query(
      `
      UPDATE produtos
      SET nome = ?, preco = ?, foto_produto = ?, ativo = ?
      WHERE id = ?
      `,
      [nomeFinal, precoFinal, fotoFinal, ativoFinal, id]
    );

    return res.status(200).json({
      message: "Produto atualizado com sucesso."
    });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error.message);
    return res.status(500).json({
      message: "Erro ao atualizar produto."
    });
  }
}

module.exports = {
  listarProdutos,
  criarProduto,
  buscarProdutoPorId,
  atualizarProduto,
};