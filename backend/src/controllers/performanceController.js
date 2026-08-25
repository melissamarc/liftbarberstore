const pool = require("../config/db");

// =====================================================
// DESEMPENHO DOS FUNCIONÁRIOS
// =====================================================
async function desempenhoFuncionarios(req, res) {
  try {
    const { periodo = "semana" } = req.query;

    let filtroData = "";

    // =====================================================
    // HOJE
    // =====================================================
    if (periodo === "dia") {
      filtroData = `
        v.data_criacao >= CURDATE()
        AND v.data_criacao < DATE_ADD(
          CURDATE(),
          INTERVAL 1 DAY
        )
      `;
    }

    // =====================================================
    // SEMANA ATUAL
    //
    // Segunda-feira às 07:00
    // até a próxima segunda-feira às 07:00
    //
    // IMPORTANTE:
    // Se for segunda antes das 07:00, ainda estamos
    // considerando a semana iniciada na segunda anterior.
    // =====================================================
    else if (periodo === "semana") {
      filtroData = `
        v.data_criacao >=
          DATE_SUB(
            DATE_ADD(
              DATE_SUB(
                CURDATE(),
                INTERVAL WEEKDAY(CURDATE()) DAY
              ),
              INTERVAL 7 HOUR
            ),
            INTERVAL
              (
                CASE
                  WHEN WEEKDAY(CURDATE()) = 0
                    AND CURTIME() < '07:00:00'
                  THEN 7
                  ELSE 0
                END
              ) DAY
          )

        AND

        v.data_criacao <
          DATE_ADD(
            DATE_SUB(
              DATE_ADD(
                DATE_SUB(
                  CURDATE(),
                  INTERVAL WEEKDAY(CURDATE()) DAY
                ),
                INTERVAL 7 HOUR
              ),
              INTERVAL
                (
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
      `;
    }

    // =====================================================
    // MÊS ATUAL
    // =====================================================
    else if (periodo === "mes") {
      filtroData = `
        v.data_criacao >=
          DATE_FORMAT(
            CURDATE(),
            '%Y-%m-01'
          )

        AND

        v.data_criacao <
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
        v.data_criacao >=
          DATE_SUB(
            NOW(),
            INTERVAL 6 MONTH
          )

        AND

        v.data_criacao <= NOW()
      `;
    }

    // =====================================================
    // ANO ATUAL
    // =====================================================
    else if (periodo === "ano") {
      filtroData = `
        v.data_criacao >=
          MAKEDATE(
            YEAR(CURDATE()),
            1
          )

        AND

        v.data_criacao <
          MAKEDATE(
            YEAR(CURDATE()) + 1,
            1
          )
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