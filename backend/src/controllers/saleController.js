const pool = require("../config/db");

function extrairValorTotalDoTexto(texto) {
  if (!texto || !texto.trim()) {
    throw new Error("A mensagem do pedido é obrigatória.");
  }

  const linhas = texto.split("\n");

  const linhaTotal = linhas.find((linha) =>
    linha.toLowerCase().includes("total")
  );

  if (linhaTotal) {
    const matchTotal = linhaTotal.match(/(\d{1,3}(?:\.\d{3})*|\d+)(?:,\d{2}|\.\d{2})/);

    if (matchTotal) {
      return Number(
        matchTotal[0]
          .replace(/\./g, "")
          .replace(",", ".")
      );
    }
  }

  const valores = texto.match(/(\d{1,3}(?:\.\d{3})*|\d+)(?:,\d{2}|\.\d{2})/g);

  if (!valores || valores.length === 0) {
    throw new Error("Não encontrei nenhum valor na mensagem.");
  }

  return valores.reduce((acc, valor) => {
    const numero = Number(valor.replace(/\./g, "").replace(",", "."));
    return acc + numero;
  }, 0);
}

// PROCESSAR ITENS DA VENDA MANUAL
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

// CRIAR VENDA MANUAL COM PRODUTOS
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
      [usuarioLogado.id, cliente_nome || null, dataVendaFinal, valorTotal, "manual"]
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

    return res.status(400).json({
      message: error.message || "Erro ao criar venda manual.",
    });
  }
}

// CRIAR VENDA POR TEXTO / CATÁLOGO
async function criarVendaIa(req, res) {
  try {
    const { cliente_nome, data_venda, mensagem_original } = req.body;
    const usuarioLogado = req.usuario;

    const textoOriginal = mensagem_original?.trim();

    if (!textoOriginal) {
      return res.status(400).json({
        message: "A mensagem do pedido é obrigatória.",
      });
    }

    const valorTotal = extrairValorTotalDoTexto(textoOriginal);
    const dataVendaFinal = data_venda || new Date().toISOString().slice(0, 10);

    const [resultadoVenda] = await pool.query(
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
        textoOriginal,
      ]
    );

    return res.status(201).json({
      message: "Venda registrada com sucesso.",
      venda: {
        id: resultadoVenda.insertId,
        usuario_id: usuarioLogado.id,
        cliente_nome: cliente_nome || null,
        data_venda: dataVendaFinal,
        valor_total: valorTotal,
        origem: "ia",
        texto_original: textoOriginal,
        itens: [],
      },
    });
  } catch (error) {
    console.error("Erro ao criar venda por texto:", error.message);

    return res.status(400).json({
      message: error.message || "Erro ao registrar venda.",
    });
  }
}

// ATUALIZAR VENDA
async function atualizarVenda(req, res) {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { cliente_nome, data_venda, itens, mensagem_original, valor_total } = req.body;
    const usuarioLogado = req.usuario;

    await connection.beginTransaction();

    const [vendas] = await connection.query(
      `SELECT * FROM vendas WHERE id = ?`,
      [id]
    );

    if (vendas.length === 0) {
      await connection.rollback();
      connection.release();

      return res.status(404).json({
        message: "Venda não encontrada.",
      });
    }

    const venda = vendas[0];

    const usuarioEhAdmin = usuarioLogado.cargo === "admin";
    const usuarioEhDono = Number(venda.usuario_id) === Number(usuarioLogado.id);

    if (!usuarioEhAdmin && !usuarioEhDono) {
      await connection.rollback();
      connection.release();

      return res.status(403).json({
        message: "Você não tem permissão para editar esta venda.",
      });
    }

    const dataVendaFinal = data_venda || venda.data_venda;

    if (itens && Array.isArray(itens) && itens.length > 0) {
      const { valorTotal, itensProcessados } = await processarItensVenda(
        connection,
        itens
      );

      await connection.query(
        `
        UPDATE vendas
        SET
          cliente_nome = ?,
          data_venda = ?,
          valor_total = ?,
          editada = 1,
          editada_em = NOW(),
          editada_por = ?
        WHERE id = ?
        `,
        [cliente_nome || null, dataVendaFinal, valorTotal, usuarioLogado.id, id]
      );

      await connection.query(`DELETE FROM itens_venda WHERE venda_id = ?`, [id]);

      for (const item of itensProcessados) {
        await connection.query(
          `
          INSERT INTO itens_venda
          (venda_id, produto_id, quantidade, preco_unitario, custo_unitario, subtotal, lucro)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [
            id,
            item.produto_id,
            item.quantidade,
            item.preco_unitario,
            item.custo_unitario,
            item.subtotal,
            item.lucro,
          ]
        );
      }
    } else {
      const textoOriginal = mensagem_original?.trim() || venda.texto_original;

      const valorTotalFinal =
        valor_total !== undefined && valor_total !== null && valor_total !== ""
          ? Number(valor_total)
          : extrairValorTotalDoTexto(textoOriginal);

      if (Number.isNaN(valorTotalFinal) || valorTotalFinal <= 0) {
        await connection.rollback();
        connection.release();

        return res.status(400).json({
          message: "Valor total inválido.",
        });
      }

      await connection.query(
        `
        UPDATE vendas
        SET
          cliente_nome = ?,
          data_venda = ?,
          valor_total = ?,
          texto_original = ?,
          editada = 1,
          editada_em = NOW(),
          editada_por = ?
        WHERE id = ?
        `,
        [
          cliente_nome || null,
          dataVendaFinal,
          valorTotalFinal,
          textoOriginal,
          usuarioLogado.id,
          id,
        ]
      );

      await connection.query(`DELETE FROM itens_venda WHERE venda_id = ?`, [id]);
    }

    await connection.commit();
    connection.release();

    return res.status(200).json({
      message: "Venda atualizada com sucesso.",
    });
  } catch (error) {
    await connection.rollback();
    connection.release();

    return res.status(400).json({
      message: error.message || "Erro ao atualizar venda.",
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

    const [vendas] = await pool.query(`SELECT * FROM vendas WHERE id = ?`, [id]);

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
    return res.status(500).json({
      message: "Erro ao excluir venda.",
    });
  }
}

module.exports = {
  criarVendaManual,
  criarVendaIa,
  atualizarVenda,
  listarVendas,
  buscarVendaPorId,
  excluirVenda,
};