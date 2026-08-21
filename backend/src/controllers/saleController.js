const pool = require("../config/db");

// ======================================================
// EXTRAIR VALOR TOTAL DA MENSAGEM
// ======================================================
function extrairValorTotalDoTexto(texto) {
  if (!texto || !texto.trim()) {
    throw new Error("A mensagem do pedido é obrigatória.");
  }

  const linhas = texto.split("\n");

  // Primeiro tenta encontrar uma linha que contenha "total"
  const linhaTotal = linhas.find((linha) =>
    linha.toLowerCase().includes("total")
  );

  if (linhaTotal) {
    const matchTotal = linhaTotal.match(
      /(\d{1,3}(?:\.\d{3})*|\d+)(?:,\d{2}|\.\d{2})/
    );

    if (matchTotal) {
      return Number(
        matchTotal[0]
          .replace(/\./g, "")
          .replace(",", ".")
      );
    }
  }

  // Caso não exista uma linha "Total", tenta encontrar valores
  const valores = texto.match(
    /(\d{1,3}(?:\.\d{3})*|\d+)(?:,\d{2}|\.\d{2})/g
  );

  if (!valores || valores.length === 0) {
    throw new Error(
      "Não encontrei nenhum valor válido na mensagem."
    );
  }

  // Soma os valores encontrados como fallback
  return valores.reduce((acc, valor) => {
    const numero = Number(
      valor
        .replace(/\./g, "")
        .replace(",", ".")
    );

    return acc + numero;
  }, 0);
}

// ======================================================
// CRIAR VENDA POR TEXTO / CATÁLOGO
// ======================================================
async function criarVendaIa(req, res) {
  try {
    const {
      cliente_nome,
      data_venda,
      mensagem_original,
    } = req.body;

    const usuarioLogado = req.usuario;

    const textoOriginal = mensagem_original?.trim();

    if (!textoOriginal) {
      return res.status(400).json({
        message: "A mensagem do pedido é obrigatória.",
      });
    }

    const valorTotal =
      extrairValorTotalDoTexto(textoOriginal);

    if (
      Number.isNaN(valorTotal) ||
      Number(valorTotal) <= 0
    ) {
      return res.status(400).json({
        message:
          "Não foi possível identificar um valor total válido.",
      });
    }

    const dataVendaFinal =
      data_venda ||
      new Date().toISOString().slice(0, 10);

    const [resultadoVenda] = await pool.query(
      `
      INSERT INTO vendas
      (
        usuario_id,
        cliente_nome,
        data_venda,
        valor_total,
        origem,
        texto_original
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        usuarioLogado.id,
        cliente_nome?.trim() || null,
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
        cliente_nome:
          cliente_nome?.trim() || null,
        data_venda: dataVendaFinal,
        valor_total: valorTotal,
        origem: "ia",
        texto_original: textoOriginal,
      },
    });
  } catch (error) {
    console.error(
      "Erro ao registrar venda:",
      error.message
    );

    return res.status(400).json({
      message:
        error.message ||
        "Erro ao registrar venda.",
    });
  }
}

// ======================================================
// ATUALIZAR VENDA
// ======================================================
async function atualizarVenda(req, res) {
  try {
    const { id } = req.params;

    const {
      cliente_nome,
      data_venda,
      mensagem_original,
      valor_total,
    } = req.body;

    const usuarioLogado = req.usuario;

    const [vendas] = await pool.query(
      `
      SELECT *
      FROM vendas
      WHERE id = ?
      `,
      [id]
    );

    if (vendas.length === 0) {
      return res.status(404).json({
        message: "Venda não encontrada.",
      });
    }

    const venda = vendas[0];

    const usuarioEhAdmin =
      usuarioLogado.cargo === "admin";

    const usuarioEhDono =
      Number(venda.usuario_id) ===
      Number(usuarioLogado.id);

    if (!usuarioEhAdmin && !usuarioEhDono) {
      return res.status(403).json({
        message:
          "Você não tem permissão para editar esta venda.",
      });
    }

    const clienteNomeFinal =
      cliente_nome !== undefined
        ? cliente_nome?.trim() || null
        : venda.cliente_nome;

    const dataVendaFinal =
      data_venda || venda.data_venda;

    const textoOriginalFinal =
      mensagem_original !== undefined
        ? mensagem_original?.trim()
        : venda.texto_original;

    if (!textoOriginalFinal) {
      return res.status(400).json({
        message:
          "A mensagem original da venda é obrigatória.",
      });
    }

    let valorTotalFinal;

    // Se o usuário informou manualmente o valor na edição,
    // usamos esse valor.
    if (
      valor_total !== undefined &&
      valor_total !== null &&
      valor_total !== ""
    ) {
      valorTotalFinal = Number(valor_total);
    } else {
      valorTotalFinal =
        extrairValorTotalDoTexto(
          textoOriginalFinal
        );
    }

    if (
      Number.isNaN(valorTotalFinal) ||
      valorTotalFinal <= 0
    ) {
      return res.status(400).json({
        message: "Valor total inválido.",
      });
    }

    await pool.query(
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
        clienteNomeFinal,
        dataVendaFinal,
        valorTotalFinal,
        textoOriginalFinal,
        usuarioLogado.id,
        id,
      ]
    );

    return res.status(200).json({
      message:
        "Venda atualizada com sucesso.",

      venda: {
        id: Number(id),
        cliente_nome: clienteNomeFinal,
        data_venda: dataVendaFinal,
        valor_total: valorTotalFinal,
        texto_original:
          textoOriginalFinal,
      },
    });
  } catch (error) {
    console.error(
      "Erro ao atualizar venda:",
      error.message
    );

    return res.status(400).json({
      message:
        error.message ||
        "Erro ao atualizar venda.",
    });
  }
}

// ======================================================
// LISTAR VENDAS COM FILTROS
// ======================================================
async function listarVendas(req, res) {
  try {
    const {
      cliente = "",
      data = "",
    } = req.query;

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

        v.data_criacao

      FROM vendas v

      INNER JOIN usuarios u
        ON u.id = v.usuario_id

      WHERE 1 = 1
    `;

    const params = [];

    if (cliente.trim()) {
      query += `
        AND v.cliente_nome LIKE ?
      `;

      params.push(
        `%${cliente.trim()}%`
      );
    }

    if (data.trim()) {
      query += `
        AND v.data_venda = ?
      `;

      params.push(data.trim());
    }

    query += `
      ORDER BY
        v.data_criacao DESC,
        v.id DESC
    `;

    const [vendas] =
      await pool.query(query, params);

    const vendasFormatadas =
      vendas.map((venda) => ({
        ...venda,
        valor_total: Number(
          venda.valor_total || 0
        ),
      }));

    return res
      .status(200)
      .json(vendasFormatadas);
  } catch (error) {
    console.error(
      "Erro ao listar vendas:",
      error.message
    );

    return res.status(500).json({
      message:
        "Erro ao listar vendas.",
    });
  }
}

// ======================================================
// BUSCAR VENDA POR ID
// ======================================================
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

      INNER JOIN usuarios u
        ON u.id = v.usuario_id

      WHERE v.id = ?
      `,
      [id]
    );

    if (vendas.length === 0) {
      return res.status(404).json({
        message:
          "Venda não encontrada.",
      });
    }

    const venda = vendas[0];

    return res.status(200).json({
      ...venda,
      valor_total: Number(
        venda.valor_total || 0
      ),
    });
  } catch (error) {
    console.error(
      "Erro ao buscar venda:",
      error.message
    );

    return res.status(500).json({
      message:
        "Erro ao buscar venda.",
    });
  }
}

// ======================================================
// EXCLUIR VENDA
// ======================================================
async function excluirVenda(req, res) {
  try {
    const { id } = req.params;

    const usuarioLogado = req.usuario;

    const [vendas] = await pool.query(
      `
      SELECT *
      FROM vendas
      WHERE id = ?
      `,
      [id]
    );

    if (vendas.length === 0) {
      return res.status(404).json({
        message:
          "Venda não encontrada.",
      });
    }

    const venda = vendas[0];

    const usuarioEhAdmin =
      usuarioLogado.cargo === "admin";

    const usuarioEhDono =
      Number(venda.usuario_id) ===
      Number(usuarioLogado.id);

    if (!usuarioEhAdmin && !usuarioEhDono) {
      return res.status(403).json({
        message:
          "Você não tem permissão para excluir esta venda.",
      });
    }

    await pool.query(
      `
      DELETE FROM vendas
      WHERE id = ?
      `,
      [id]
    );

    return res.status(200).json({
      message:
        "Venda excluída com sucesso.",
    });
  } catch (error) {
    console.error(
      "Erro ao excluir venda:",
      error.message
    );

    return res.status(500).json({
      message:
        "Erro ao excluir venda.",
    });
  }
}

module.exports = {
  criarVendaIa,
  atualizarVenda,
  listarVendas,
  buscarVendaPorId,
  excluirVenda,
};