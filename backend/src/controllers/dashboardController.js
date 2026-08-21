const pool = require("../config/db");

// RESUMO DO DASHBOARD
async function resumoDashboard(req, res) {
  try {
    // VENDAS DE HOJE
    const [vendasHojeResult] = await pool.query(`
      SELECT
        COUNT(*) AS quantidade_vendas_hoje,
        COALESCE(SUM(valor_total), 0) AS total_vendido_hoje
      FROM vendas
      WHERE COALESCE(data_venda, DATE(data_criacao)) = CURDATE()
    `);

    // VENDAS DA SEMANA
    // SEMANA = SEXTA-FEIRA ATÉ QUINTA-FEIRA
    const [vendasSemanaResult] = await pool.query(`
      SELECT
        COUNT(*) AS quantidade_vendas_semana,
        COALESCE(SUM(valor_total), 0) AS total_vendido_semana
      FROM vendas
      WHERE COALESCE(data_venda, DATE(data_criacao)) >= DATE_SUB(
        CURDATE(),
        INTERVAL ((DAYOFWEEK(CURDATE()) + 1) % 7) DAY
      )
      AND COALESCE(data_venda, DATE(data_criacao)) < DATE_ADD(
        DATE_SUB(
          CURDATE(),
          INTERVAL ((DAYOFWEEK(CURDATE()) + 1) % 7) DAY
        ),
        INTERVAL 7 DAY
      )
    `);

    // VENDAS DO MÊS
    const [vendasMesResult] = await pool.query(`
      SELECT
        COUNT(*) AS quantidade_vendas_mes,
        COALESCE(SUM(valor_total), 0) AS total_vendido_mes
      FROM vendas
      WHERE COALESCE(data_venda, DATE(data_criacao)) >=
        DATE_FORMAT(CURDATE(), '%Y-%m-01')
      AND COALESCE(data_venda, DATE(data_criacao)) <
        DATE_ADD(
          LAST_DAY(CURDATE()),
          INTERVAL 1 DAY
        )
    `);

    const vendasHoje = vendasHojeResult[0];
    const vendasSemana = vendasSemanaResult[0];
    const vendasMes = vendasMesResult[0];

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
      message: "Erro ao carregar resumo do dashboard.",
    });
  }
}

module.exports = {
  resumoDashboard,
};