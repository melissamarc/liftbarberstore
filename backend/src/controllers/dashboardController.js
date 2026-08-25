const pool = require("../config/db");

// RESUMO DO DASHBOARD
async function resumoDashboard(req, res) {
  try {
    // =====================================================
    // VENDAS DE HOJE
    // Usa a data real da venda.
    // Se for venda antiga sem data_venda,
    // usa a data em que foi criada.
    // =====================================================
    const [vendasHojeResult] = await pool.query(`
      SELECT
        COUNT(*) AS quantidade_vendas_hoje,
        COALESCE(SUM(valor_total), 0) AS total_vendido_hoje

      FROM vendas

      WHERE
        COALESCE(
          data_venda,
          DATE(data_criacao)
        ) = CURDATE()
    `);

    // =====================================================
    // VENDAS DA SEMANA
    //
    // SEMANA:
    // segunda-feira às 07:00
    // até próxima segunda-feira às 06:59:59
    //
    // Se for segunda antes das 07:00,
    // ainda pertence à semana anterior.
    //
    // Aqui usamos data_criacao porque precisamos
    // considerar também o HORÁRIO da venda registrada.
    // =====================================================
    const [vendasSemanaResult] = await pool.query(`
      SELECT
        COUNT(*) AS quantidade_vendas_semana,
        COALESCE(SUM(valor_total), 0) AS total_vendido_semana

      FROM vendas

      WHERE
        data_criacao >=
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

      AND

        data_criacao <
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
    `);

    // =====================================================
    // VENDAS DO MÊS
    // =====================================================
    const [vendasMesResult] = await pool.query(`
      SELECT
        COUNT(*) AS quantidade_vendas_mes,
        COALESCE(SUM(valor_total), 0) AS total_vendido_mes

      FROM vendas

      WHERE
        COALESCE(
          data_venda,
          DATE(data_criacao)
        ) >= DATE_FORMAT(
          CURDATE(),
          '%Y-%m-01'
        )

      AND

        COALESCE(
          data_venda,
          DATE(data_criacao)
        ) <
          DATE_ADD(
            LAST_DAY(CURDATE()),
            INTERVAL 1 DAY
          )
    `);

    // =====================================================
    // RESULTADOS
    // =====================================================
    const vendasHoje =
      vendasHojeResult[0];

    const vendasSemana =
      vendasSemanaResult[0];

    const vendasMes =
      vendasMesResult[0];

    // =====================================================
    // RESPOSTA
    // =====================================================
    return res.status(200).json({
      total_vendido_hoje: Number(
        vendasHoje.total_vendido_hoje
      ),

      quantidade_vendas_hoje: Number(
        vendasHoje.quantidade_vendas_hoje
      ),

      total_vendido_semana: Number(
        vendasSemana.total_vendido_semana
      ),

      quantidade_vendas_semana: Number(
        vendasSemana.quantidade_vendas_semana
      ),

      total_vendido_mes: Number(
        vendasMes.total_vendido_mes
      ),

      quantidade_vendas_mes: Number(
        vendasMes.quantidade_vendas_mes
      ),
    });
  } catch (error) {
    console.error(
      "Erro ao carregar resumo do dashboard:",
      error.message
    );

    return res.status(500).json({
      message:
        "Erro ao carregar resumo do dashboard.",
    });
  }
}

module.exports = {
  resumoDashboard,
};