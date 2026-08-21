const pool = require("../config/db");

// DESEMPENHO DOS FUNCIONÁRIOS
async function desempenhoFuncionarios(req, res) {
  try {
    const { periodo = "semana" } = req.query;

    let filtroData = "";

    // =====================================================
    // SEMANA ATUAL
    // SEXTA-FEIRA ATÉ QUINTA-FEIRA
    // =====================================================
    if (periodo === "semana") {
      filtroData = `
        COALESCE(v.data_venda, DATE(v.data_criacao)) >= DATE_SUB(
          CURDATE(),
          INTERVAL ((DAYOFWEEK(CURDATE()) + 1) % 7) DAY
        )

        AND

        COALESCE(v.data_venda, DATE(v.data_criacao)) < DATE_ADD(
          DATE_SUB(
            CURDATE(),
            INTERVAL ((DAYOFWEEK(CURDATE()) + 1) % 7) DAY
          ),
          INTERVAL 7 DAY
        )
      `;
    }

    // =====================================================
    // MÊS ATUAL
    // =====================================================
    else if (periodo === "mes") {
      filtroData = `
        COALESCE(v.data_venda, DATE(v.data_criacao)) >=
          DATE_FORMAT(CURDATE(), '%Y-%m-01')

        AND

        COALESCE(v.data_venda, DATE(v.data_criacao)) <
          DATE_ADD(
            LAST_DAY(CURDATE()),
            INTERVAL 1 DAY
          )
      `;
    }

    // =====================================================
    // ÚLTIMOS 6 MESES
    // =====================================================
    else if (periodo === "6meses") {
      filtroData = `
        COALESCE(v.data_venda, DATE(v.data_criacao)) >=
          DATE_SUB(CURDATE(), INTERVAL 6 MONTH)

        AND

        COALESCE(v.data_venda, DATE(v.data_criacao)) <
          DATE_ADD(CURDATE(), INTERVAL 1 DAY)
      `;
    }

    // =====================================================
    // ANO ATUAL
    // =====================================================
    else if (periodo === "ano") {
      filtroData = `
        YEAR(
          COALESCE(v.data_venda, DATE(v.data_criacao))
        ) = YEAR(CURDATE())
      `;
    }

    // =====================================================
    // PERÍODO INVÁLIDO
    // =====================================================
    else {
      return res.status(400).json({
        message: "Período inválido.",
      });
    }

    // =====================================================
    // CONSULTA
    // =====================================================
    const [resultado] = await pool.query(`
      SELECT
        u.id AS usuario_id,
        u.nome AS usuario_nome,
        u.email AS usuario_email,
        u.foto_perfil,

        COUNT(v.id) AS quantidade_vendas,

        COALESCE(
          SUM(v.valor_total),
          0
        ) AS total_vendido

      FROM usuarios u

      LEFT JOIN vendas v
        ON v.usuario_id = u.id
        AND ${filtroData}

      WHERE u.ativo = TRUE

      GROUP BY
        u.id,
        u.nome,
        u.email,
        u.foto_perfil

      ORDER BY
        total_vendido DESC,
        quantidade_vendas DESC,
        u.nome ASC
    `);

    // =====================================================
    // FORMATAR RESPOSTA
    // =====================================================
    const desempenho = resultado.map(
      (item, index) => ({
        posicao: index + 1,

        usuario_id: item.usuario_id,
        usuario_nome: item.usuario_nome,
        usuario_email: item.usuario_email,
        foto_perfil: item.foto_perfil,

        quantidade_vendas: Number(
          item.quantidade_vendas
        ),

        total_vendido: Number(
          item.total_vendido
        ),
      })
    );

    return res.status(200).json(desempenho);
  } catch (error) {
    console.error(
      "Erro ao carregar desempenho dos funcionários:",
      error.message
    );

    return res.status(500).json({
      message:
        "Erro ao carregar desempenho dos funcionários.",
    });
  }
}

module.exports = {
  desempenhoFuncionarios,
};