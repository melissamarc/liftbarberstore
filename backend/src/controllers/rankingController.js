const pool = require("../config/db");

// =====================================================
// RANKING DE VENDEDORES
//
// Semana:
// segunda-feira às 07:00
// até a próxima segunda-feira às 06:59:59
// =====================================================
async function rankingVendedores(req, res) {
  try {
    const [ranking] = await pool.query(`
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

        -- =============================================
        -- INÍCIO DA SEMANA
        -- Segunda-feira às 07:00
        -- =============================================
        AND v.data_criacao >=
          DATE_SUB(
            DATE_ADD(
              DATE_SUB(
                CURDATE(),
                INTERVAL WEEKDAY(CURDATE()) DAY
              ),
              INTERVAL 7 HOUR
            ),
            INTERVAL (
              CASE
                WHEN WEEKDAY(CURDATE()) = 0
                  AND CURTIME() < '07:00:00'
                THEN 7
                ELSE 0
              END
            ) DAY
          )

        -- =============================================
        -- FIM DA SEMANA
        -- Próxima segunda-feira às 07:00
        -- =============================================
        AND v.data_criacao <
          DATE_ADD(
            DATE_SUB(
              DATE_ADD(
                DATE_SUB(
                  CURDATE(),
                  INTERVAL WEEKDAY(CURDATE()) DAY
                ),
                INTERVAL 7 HOUR
              ),
              INTERVAL (
                CASE
                  WHEN WEEKDAY(CURDATE()) = 0
                    AND CURTIME() < '07:00:00'
                  THEN 7
                  ELSE 0
                END
              ) DAY
            ),
            INTERVAL 7 DAY
          )

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
    // FORMATAR RANKING
    // =====================================================
    const rankingFormatado = ranking.map(
      (item, index) => ({
        posicao: index + 1,

        usuario_id: item.usuario_id,
        usuario_nome: item.usuario_nome,
        usuario_email: item.usuario_email,
        foto_perfil: item.foto_perfil,

        total_vendido: Number(
          item.total_vendido
        ),

        quantidade_vendas: Number(
          item.quantidade_vendas
        ),
      })
    );

    return res
      .status(200)
      .json(rankingFormatado);
  } catch (error) {
    console.error(
      "Erro ao carregar ranking:",
      error.message
    );

    return res.status(500).json({
      message: "Erro ao carregar ranking.",
    });
  }
}

module.exports = {
  rankingVendedores,
};