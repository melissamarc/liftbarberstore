const pool = require("../config/db");
const fs = require("fs");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

// LISTAR PRODUTOS
async function listarProdutos(req, res) {
  try {
    const { busca = "" } = req.query;

    let query = `
      SELECT id, nome, preco, preco_custo, foto_produto, ativo, data_criacao
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
      message: "Erro ao listar produtos.",
    });
  }
}

// CRIAR PRODUTO
async function criarProduto(req, res) {
  try {
    const { nome, preco, preco_custo } = req.body;

    if (!nome || preco === undefined || preco === null || preco === "") {
      return res.status(400).json({
        message: "Nome e preço de venda são obrigatórios.",
      });
    }

    const precoNumero = Number(preco);
    const precoCustoNumero = Number(preco_custo || 0);

    if (Number.isNaN(precoNumero) || precoNumero <= 0) {
      return res.status(400).json({
        message: "Preço de venda inválido.",
      });
    }

    if (Number.isNaN(precoCustoNumero) || precoCustoNumero < 0) {
      return res.status(400).json({
        message: "Preço de custo inválido.",
      });
    }

    let fotoProduto = null;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.path,
        "liftbarberstore/produtos"
      );

      fotoProduto = uploadResult.url;

      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    await pool.query(
      `
      INSERT INTO produtos (nome, preco, preco_custo, foto_produto)
      VALUES (?, ?, ?, ?)
      `,
      [nome, precoNumero, precoCustoNumero, fotoProduto]
    );

    return res.status(201).json({
      message: "Produto criado com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao criar produto:", error.message);

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      message: "Erro ao criar produto.",
    });
  }
}

// BUSCAR PRODUTO POR ID
async function buscarProdutoPorId(req, res) {
  try {
    const { id } = req.params;

    const [produtos] = await pool.query(
      `
      SELECT id, nome, preco, preco_custo, foto_produto, ativo, data_criacao
      FROM produtos
      WHERE id = ?
      `,
      [id]
    );

    if (produtos.length === 0) {
      return res.status(404).json({
        message: "Produto não encontrado.",
      });
    }

    return res.status(200).json(produtos[0]);
  } catch (error) {
    console.error("Erro ao buscar produto:", error.message);
    return res.status(500).json({
      message: "Erro ao buscar produto.",
    });
  }
}

// ATUALIZAR PRODUTO
async function atualizarProduto(req, res) {
  try {
    const { id } = req.params;
    const { nome, preco, preco_custo, ativo } = req.body;

    const [produtos] = await pool.query(`SELECT * FROM produtos WHERE id = ?`, [
      id,
    ]);

    if (produtos.length === 0) {
      return res.status(404).json({
        message: "Produto não encontrado.",
      });
    }

    const produtoAtual = produtos[0];

    const nomeFinal = nome ?? produtoAtual.nome;

    const precoFinal =
      preco !== undefined && preco !== ""
        ? Number(preco)
        : Number(produtoAtual.preco);

    const precoCustoFinal =
      preco_custo !== undefined && preco_custo !== ""
        ? Number(preco_custo)
        : Number(produtoAtual.preco_custo || 0);

    const ativoFinal =
      ativo !== undefined
        ? ativo === true || ativo === "true" || ativo === 1 || ativo === "1"
        : Boolean(produtoAtual.ativo);

    if (!nomeFinal || Number.isNaN(precoFinal) || precoFinal <= 0) {
      return res.status(400).json({
        message: "Preço de venda inválido.",
      });
    }

    if (Number.isNaN(precoCustoFinal) || precoCustoFinal < 0) {
      return res.status(400).json({
        message: "Preço de custo inválido.",
      });
    }

    let fotoFinal = produtoAtual.foto_produto;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.path,
        "liftbarberstore/produtos"
      );

      fotoFinal = uploadResult.url;

      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    await pool.query(
      `
      UPDATE produtos
      SET nome = ?, preco = ?, preco_custo = ?, foto_produto = ?, ativo = ?
      WHERE id = ?
      `,
      [nomeFinal, precoFinal, precoCustoFinal, fotoFinal, ativoFinal, id]
    );

    return res.status(200).json({
      message: "Produto atualizado com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error.message);

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      message: "Erro ao atualizar produto.",
    });
  }
}

module.exports = {
  listarProdutos,
  criarProduto,
  buscarProdutoPorId,
  atualizarProduto,
};