const pool = require("../config/db");

// PROCESSAR ITENS DA VENDA
async function processarItensVenda(connection, itens) {
  if (!itens || !Array.isArray(itens) || itens.length === 0) {
    throw new Error("A venda precisa ter pelo menos um item.");
  }

  let valorTotal = 0;
  const itensProcessados = [];

  for (const item of itens) {
    if (!item.produto_id || !item.quantidade) {
      throw new Error("Cada item precisa ter produto_id e quantidade.");
    }

    const produtoId = Number(item.produto_id);
    const quantidade = Number(item.quantidade);

    if (quantidade <= 0) {
      throw new Error("Quantidade inválida.");
    }

    const [produtos] = await connection.query(
      `
      SELECT id, nome, preco, preco_custo, ativo
      FROM produtos
      WHERE id = ?
      `,
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
    const custoUnitario = Number(produto.preco_custo || 0);
    const subtotal = precoUnitario * quantidade;
    const lucro = (precoUnitario - custoUnitario) * quantidade;

    valorTotal += subtotal;

    itensProcessados.push({
      produto_id: produto.id,
      nome: produto.nome,
      quantidade,
      preco_unitario: precoUnitario,
      custo_unitario: custoUnitario,
      subtotal,
      lucro,
    });
  }

  return { valorTotal, itensProcessados };
}

// CRIAR VENDA MANUAL
async function criarVendaManual(req, res) {
  const connection = await pool.getConnection();

  try {
    const { cliente_nome, data_venda, itens } = req.body;
    const usuarioLogado = req.usuario;

    await connection.beginTransaction();

    const { valorTotal, itensProcessados } = await processarItensVenda(connection, itens);

    const dataVendaFinal = data_venda || new Date().toISOString().slice(0, 10);

    const [resultadoVenda] = await connection.query(
      `
      INSERT INTO vendas (usuario_id, cliente_nome, data_venda, valor_total, origem)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        usuarioLogado.id,
        cliente_nome || null,
        dataVendaFinal,
        valorTotal,
        "manual",
      ]
    );

    const vendaId = resultadoVenda.insertId;

    for (const item of itensProcessados) {
      await connection.query(
        `
        INSERT INTO itens_venda
        (venda_id, produto_id, quantidade, preco_unitario, custo_unitario, subtotal, lucro)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          vendaId,
          item.produto_id,
          item.quantidade,
          item.preco_unitario,
          item.custo_unitario,
          item.subtotal,
          item.lucro,
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
        cliente_nome: cliente_nome || null,
        data_venda: dataVendaFinal,
        valor_total: valorTotal,
        origem: "manual",
        itens: itensProcessados,
      },
    });
  } catch (error) {
    await connection.rollback();
    connection.release();

    console.error("Erro ao criar venda manual:", error.message);

    return res.status(400).json({
      message: error.message || "Erro ao criar venda manual.",
    });
  }
}

// CRIAR VENDA COM IA
async function criarVendaIa(req, res) {
  const connection = await pool.getConnection();

  try {
    const { cliente_nome, data_venda, mensagem_original, itens } = req.body;
    const usuarioLogado = req.usuario;

    if (!mensagem_original || !mensagem_original.trim()) {
      connection.release();
      return res.status(400).json({
        message: "A mensagem original é obrigatória.",
      });
    }

    await connection.beginTransaction();

    const { valorTotal, itensProcessados } = await processarItensVenda(connection, itens);

    const dataVendaFinal = data_venda || new Date().toISOString().slice(0, 10);

    const [resultadoVenda] = await connection.query(
      `
      INSERT INTO vendas 
      (usuario_id, cliente_nome, data_venda, valor_total, origem, texto_original)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        usuarioLogado.id,
        cliente_nome || null,
        dataVendaFinal,
        valorTotal,
        "ia",
        mensagem_original.trim(),
      ]
    );

    const vendaId = resultadoVenda.insertId;

    for (const item of itensProcessados) {
      await connection.query(
        `
        INSERT INTO itens_venda
        (venda_id, produto_id, quantidade, preco_unitario, custo_unitario, subtotal, lucro)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          vendaId,
          item.produto_id,
          item.quantidade,
          item.preco_unitario,
          item.custo_unitario,
          item.subtotal,
          item.lucro,
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
        cliente_nome: cliente_nome || null,
        data_venda: dataVendaFinal,
        valor_total: valorTotal,
        origem: "ia",
        texto_original: mensagem_original.trim(),
        itens: itensProcessados,
      },
    });
  } catch (error) {
    await connection.rollback();
    connection.release();

    console.error("Erro ao criar venda com IA:", error.message);

    return res.status(400).json({
      message: error.message || "Erro ao criar venda com IA.",
    });
  }
}

// LISTAR VENDAS COM FILTRO
async function listarVendas(req, res) {
  try {
    const { cliente = "", data = "" } = req.query;

    let query = `
      SELECT
        v.id,
        v.usuario_id,
        u.nome AS usuario_nome,
        u.email AS usuario_email,
        v.cliente_nome,
        v.data_venda,
        v.valor_total,
        v.origem,
        v.texto_original,
        v.editada,
        v.editada_em,
        v.editada_por,
        v.data_criacao,
        iv.id AS item_id,
        iv.produto_id,
        p.nome AS produto_nome,
        iv.quantidade,
        iv.preco_unitario,
        iv.custo_unitario,
        iv.subtotal,
        iv.lucro
      FROM vendas v
      INNER JOIN usuarios u ON u.id = v.usuario_id
      LEFT JOIN itens_venda iv ON iv.venda_id = v.id
      LEFT JOIN produtos p ON p.id = iv.produto_id
      WHERE 1 = 1
    `;

    const params = [];

    if (cliente.trim()) {
      query += ` AND v.cliente_nome LIKE ? `;
      params.push(`%${cliente.trim()}%`);
    }

    if (data.trim()) {
      query += ` AND v.data_venda = ? `;
      params.push(data.trim());
    }

    query += ` ORDER BY v.id DESC, iv.id ASC`;

    const [rows] = await pool.query(query, params);

    const vendasMap = new Map();

    for (const row of rows) {
      if (!vendasMap.has(row.id)) {
        vendasMap.set(row.id, {
          id: row.id,
          usuario_id: row.usuario_id,
          usuario_nome: row.usuario_nome,
          usuario_email: row.usuario_email,
          cliente_nome: row.cliente_nome,
          data_venda: row.data_venda,
          valor_total: row.valor_total,
          origem: row.origem,
          texto_original: row.texto_original,
          editada: row.editada,
          editada_em: row.editada_em,
          editada_por: row.editada_por,
          data_criacao: row.data_criacao,
          itens: [],
        });
      }

      if (row.item_id) {
        vendasMap.get(row.id).itens.push({
          id: row.item_id,
          produto_id: row.produto_id,
          produto_nome: row.produto_nome,
          quantidade: row.quantidade,
          preco_unitario: row.preco_unitario,
          custo_unitario: row.custo_unitario,
          subtotal: row.subtotal,
          lucro: row.lucro,
        });
      }
    }

    return res.status(200).json(Array.from(vendasMap.values()));
  } catch (error) {
    console.error("Erro ao listar vendas:", error.message);
    return res.status(500).json({
      message: "Erro ao listar vendas.",
    });
  }
}


// BUSCAR VENDA POR ID
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
        v.cliente_nome,
        v.data_venda,
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
        message: "Venda não encontrada.",
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
        iv.custo_unitario,
        iv.subtotal,
        iv.lucro
      FROM itens_venda iv
      INNER JOIN produtos p ON p.id = iv.produto_id
      WHERE iv.venda_id = ?
      ORDER BY iv.id ASC
      `,
      [id]
    );

    return res.status(200).json({
      ...venda,
      itens,
    });
  } catch (error) {
    console.error("Erro ao buscar venda:", error.message);
    return res.status(500).json({
      message: "Erro ao buscar venda.",
    });
  }
}

// EXCLUIR VENDA
async function excluirVenda(req, res) {
  try {
    const { id } = req.params;
    const usuarioLogado = req.usuario;

    const [vendas] = await pool.query(
      `SELECT * FROM vendas WHERE id = ?`,
      [id]
    );

    if (vendas.length === 0) {
      return res.status(404).json({
        message: "Venda não encontrada.",
      });
    }

    const venda = vendas[0];

    const usuarioEhAdmin = usuarioLogado.cargo === "admin";
    const usuarioEhDono = Number(venda.usuario_id) === Number(usuarioLogado.id);

    if (!usuarioEhAdmin && !usuarioEhDono) {
      return res.status(403).json({
        message: "Você não tem permissão para excluir esta venda.",
      });
    }

    await pool.query(`DELETE FROM vendas WHERE id = ?`, [id]);

    return res.status(200).json({
      message: "Venda excluída com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao excluir venda:", error.message);
    return res.status(500).json({
      message: "Erro ao excluir venda.",
    });
  }
}

module.exports = {
  criarVendaManual,
  criarVendaIa,
  listarVendas,
  buscarVendaPorId,
  excluirVenda,
};