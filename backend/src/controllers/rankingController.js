const pool = require("../config/db");
const { resolverSemana } = require("../utils/semana");

// =====================================================
// RANKING DE VENDEDORES
//
// Semana: segunda 07:00 até sábado 22:00, contada pela
// DATA DA VENDA (data_venda), e não pela data do registro.
// Depois de sábado 22:00 o ranking passa para a semana nova.
//
// Opcional: ?semana=passada  ou  ?semana=YYYY-MM-DD
// =====================================================
async function rankingVendedores(req, res) {
  try {
    const semana = resolverSemana(req.query.semana);

    if (!semana) {
      return res.status(400).json({
        message: "Semana inválida. Use 'atual', 'passada' ou YYYY-MM-DD.",
      });
    }

    const [ranking] = await pool.query(
      `
      SELECT
        u.id AS usuario_id,
        u.nome AS usuario_nome,
        u.email AS usuario_email,
        u.foto_perfil,

        COALESCE(
          SUM(v.valor_total),
          0
        ) AS total_vendido,

        COUNT(v.id) AS quantidade_vendas

      FROM usuarios u

      LEFT JOIN vendas v
        ON v.usuario_id = u.id
        AND COALESCE(v.data_venda, DATE(v.data_criacao)) >= ?
        AND COALESCE(v.data_venda, DATE(v.data_criacao)) < DATE_ADD(?, INTERVAL 1 DAY)

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
      `,
      [semana.consultaDe, semana.consultaAte]
    );

    const rankingFormatado = ranking.map((item, index) => ({
      posicao: index + 1,

      usuario_id: item.usuario_id,
      usuario_nome: item.usuario_nome,
      usuario_email: item.usuario_email,
      foto_perfil: item.foto_perfil,

      total_vendido: Number(item.total_vendido),

      quantidade_vendas: Number(item.quantidade_vendas),
    }));

    // Formato mantido (array) para não quebrar o front atual
    return res.status(200).json(rankingFormatado);
  } catch (error) {
    console.error("Erro ao carregar ranking:", error.message);

    return res.status(500).json({
      message: "Erro ao carregar ranking.",
    });
  }
}

module.exports = {
  rankingVendedores,
};