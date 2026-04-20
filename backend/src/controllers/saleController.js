const pool = require("../config/db");

// Função auxiliar para validar e processar itens
async function processarItensVenda(connection, itens) {
  if (!itens || !Array.isArray(itens) || itens.length === 0) {
    throw new Error("A venda precisa ter pelo menos um item.");
  }

  for (const item of itens) {
    if (!item.produto_id || !item.quantidade) {
      throw new Error("Cada item precisa ter produto_id e quantidade.");
    }

    if (Number(item.quantidade) <= 0) {
      throw new Error("Quantidade inválida.");
    }
  }

  let valorTotal = 0;
  const itensProcessados = [];

  for (const item of itens) {
    const produtoId = Number(item.produto_id);
    const quantidade = Number(item.quantidade);

    const [produtos] = await connection.query(
      `SELECT id, nome, preco, ativo
       FROM produtos
       WHERE id = ?`,
      [produtoId]
    );

    if (produtos.length === 0) {
      throw new Error(`Produto com ID ${produtoId} não encontrado.`);
    }

    const produto = produtos[0];

    if (!produto.ativo) {
      throw new Error(`O produto "${produto.nome}" está inativo.`);
    }

    const precoUnitario = Number(produto.preco);
    const subtotal = precoUnitario * quantidade;

    valorTotal += subtotal;

    itensProcessados.push({
      produto_id: produto.id,
      nome: produto.nome,
      quantidade,
      preco_unitario: precoUnitario,
      subtotal
    });
  }

  return { valorTotal, itensProcessados };
}

// CRIAR VENDA MANUAL
async function criarVendaManual(req, res) {
  const connection = await pool.getConnection();

  try {
    const { itens } = req.body;
    const usuarioLogado = req.usuario;

    await connection.beginTransaction();

    const { valorTotal, itensProcessados } = await processarItensVenda(connection, itens);

    const [resultadoVenda] = await connection.query(
      `INSERT INTO vendas (usuario_id, valor_total, origem)
       VALUES (?, ?, ?)`,
      [usuarioLogado.id, valorTotal, "manual"]
    );

    const vendaId = resultadoVenda.insertId;

    for (const item of itensProcessados) {
      await connection.query(
        `INSERT INTO itens_venda
         (venda_id, produto_id, quantidade, preco_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [
          vendaId,
          item.produto_id,
          item.quantidade,
          item.preco_unitario,
          item.subtotal
        ]
      );
    }

    await connection.commit();
    connection.release();

    return res.status(201).json({
      message: "Venda criada com sucesso.",
      venda: {
        id: vendaId,
        usuario_id: usuarioLogado.id,
        valor_total: valorTotal,
        origem: "manual",
        itens: itensProcessados
      }
    });
  } catch (error) {
    await connection.rollback();
    connection.release();

    console.error("Erro ao criar venda manual:", error.message);

    const status = error.message.includes("não encontrado") ? 404 : 400;

    return res.status(status).json({
      message: error.message || "Erro ao criar venda manual."
    });
  }
}

// CRIAR VENDA COM IA CONFIRMADA
async function criarVendaIa(req, res) {
  const connection = await pool.getConnection();

  try {
    const { mensagem_original, itens } = req.body;
    const usuarioLogado = req.usuario;

    if (!mensagem_original || !mensagem_original.trim()) {
      connection.release();
      return res.status(400).json({
        message: "A mensagem original é obrigatória."
      });
    }

    await connection.beginTransaction();

    const { valorTotal, itensProcessados } = await processarItensVenda(connection, itens);

    const [resultadoVenda] = await connection.query(
      `INSERT INTO vendas (usuario_id, valor_total, origem, texto_original)
       VALUES (?, ?, ?, ?)`,
      [usuarioLogado.id, valorTotal, "ia", mensagem_original.trim()]
    );

    const vendaId = resultadoVenda.insertId;

    for (const item of itensProcessados) {
      await connection.query(
        `INSERT INTO itens_venda
         (venda_id, produto_id, quantidade, preco_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [
          vendaId,
          item.produto_id,
          item.quantidade,
          item.preco_unitario,
          item.subtotal
        ]
      );
    }

    await connection.commit();
    connection.release();

    return res.status(201).json({
      message: "Venda com IA criada com sucesso.",
      venda: {
        id: vendaId,
        usuario_id: usuarioLogado.id,
        valor_total: valorTotal,
        origem: "ia",
        texto_original: mensagem_original.trim(),
        itens: itensProcessados
      }
    });
  } catch (error) {
    await connection.rollback();
    connection.release();

    console.error("Erro ao criar venda com IA:", error.message);

    const status = error.message.includes("não encontrado") ? 404 : 400;

    return res.status(status).json({
      message: error.message || "Erro ao criar venda com IA."
    });
  }
}

// LISTAR VENDAS
async function listarVendas(req, res) {
  try {
    const [vendas] = await pool.query(`
      SELECT
        v.id,
        v.usuario_id,
        u.nome AS usuario_nome,
        u.email AS usuario_email,
        v.valor_total,
        v.origem,
        v.texto_original,
        v.editada,
        v.editada_em,
        v.editada_por,
        v.data_criacao
      FROM vendas v
      INNER JOIN usuarios u ON u.id = v.usuario_id
      ORDER BY v.id DESC
    `);

    return res.status(200).json(vendas);
  } catch (error) {
    console.error("Erro ao listar vendas:", error.message);
    return res.status(500).json({
      message: "Erro ao listar vendas."
    });
  }
}

// BUSCAR VENDA POR ID COM ITENS
async function buscarVendaPorId(req, res) {
  try {
    const { id } = req.params;

    const [vendas] = await pool.query(
      `
      SELECT
        v.id,
        v.usuario_id,
        u.nome AS usuario_nome,
        u.email AS usuario_email,
        v.valor_total,
        v.origem,
        v.texto_original,
        v.editada,
        v.editada_em,
        v.editada_por,
        v.data_criacao
      FROM vendas v
      INNER JOIN usuarios u ON u.id = v.usuario_id
      WHERE v.id = ?
      `,
      [id]
    );

    if (vendas.length === 0) {
      return res.status(404).json({
        message: "Venda não encontrada."
      });
    }

    const venda = vendas[0];

    const [itens] = await pool.query(
      `
      SELECT
        iv.id,
        iv.produto_id,
        p.nome AS produto_nome,
        iv.quantidade,
        iv.preco_unitario,
        iv.subtotal
      FROM itens_venda iv
      INNER JOIN produtos p ON p.id = iv.produto_id
      WHERE iv.venda_id = ?
      ORDER BY iv.id ASC
      `,
      [id]
    );

    return res.status(200).json({
      ...venda,
      itens
    });
  } catch (error) {
    console.error("Erro ao buscar venda:", error.message);
    return res.status(500).json({
      message: "Erro ao buscar venda."
    });
  }
}

// EDITAR VENDA
async function editarVenda(req, res) {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { itens } = req.body;
    const usuarioLogado = req.usuario;

    const [vendas] = await connection.query(
      `SELECT * FROM vendas WHERE id = ?`,
      [id]
    );

    if (vendas.length === 0) {
      connection.release();
      return res.status(404).json({
        message: "Venda não encontrada."
      });
    }

    const venda = vendas[0];

    const usuarioEhAdmin = usuarioLogado.cargo === "admin";
    const usuarioEhDonoDaVenda = Number(venda.usuario_id) === Number(usuarioLogado.id);

    if (!usuarioEhAdmin) {
      if (!usuarioEhDonoDaVenda) {
        connection.release();
        return res.status(403).json({
          message: "Você só pode editar as próprias vendas."
        });
      }

      const dataVenda = new Date(venda.data_criacao);
      const agora = new Date();

      const mesmoDia =
        dataVenda.getFullYear() === agora.getFullYear() &&
        dataVenda.getMonth() === agora.getMonth() &&
        dataVenda.getDate() === agora.getDate();

      if (!mesmoDia) {
        connection.release();
        return res.status(403).json({
          message: "Vendedor só pode editar vendas registradas no mesmo dia."
        });
      }
    }

    await connection.beginTransaction();

    const { valorTotal, itensProcessados } = await processarItensVenda(connection, itens);

    await connection.query(
      `DELETE FROM itens_venda WHERE venda_id = ?`,
      [id]
    );

    for (const item of itensProcessados) {
      await connection.query(
        `INSERT INTO itens_venda
         (venda_id, produto_id, quantidade, preco_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [
          id,
          item.produto_id,
          item.quantidade,
          item.preco_unitario,
          item.subtotal
        ]
      );
    }

    await connection.query(
      `UPDATE vendas
       SET valor_total = ?,
           editada = TRUE,
           editada_em = CURRENT_TIMESTAMP,
           editada_por = ?
       WHERE id = ?`,
      [valorTotal, usuarioLogado.id, id]
    );

    await connection.commit();
    connection.release();

    return res.status(200).json({
      message: "Venda editada com sucesso.",
      venda: {
        id: Number(id),
        usuario_id: venda.usuario_id,
        valor_total: valorTotal,
        origem: venda.origem,
        editada: true,
        editada_por: usuarioLogado.id,
        itens: itensProcessados
      }
    });
  } catch (error) {
    await connection.rollback();
    connection.release();

    console.error("Erro ao editar venda:", error.message);

    const status = error.message.includes("não encontrado") ? 404 : 400;

    return res.status(status).json({
      message: error.message || "Erro ao editar venda."
    });
  }
}

module.exports = {
  criarVendaManual,
  criarVendaIa,
  listarVendas,
  buscarVendaPorId,
  editarVenda,
};