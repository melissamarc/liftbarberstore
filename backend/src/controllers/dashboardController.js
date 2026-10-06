const pool = require("../config/db");
const { agoraBrasil, resolverSemana } = require("../utils/semana");

// Data da venda; vendas antigas sem data_venda usam a data de criação
const DATA_REAL = "COALESCE(data_venda, DATE(data_criacao))";

function pad(n) {
  return String(n).padStart(2, "0");
}

// RESUMO DO DASHBOARD
async function resumoDashboard(req, res) {
  try {
    // Tudo calculado no fuso de São Paulo (e não no do servidor MySQL)
    const hoje = agoraBrasil().data;
    const [ano, mes] = hoje.split("-").map(Number);

    const inicioMes = `${ano}-${pad(mes)}-01`;
    const ultimoDiaMes = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
    const fimMes = `${ano}-${pad(mes)}-${pad(ultimoDiaMes)}`;

    // Semana atual: segunda 07:00 até sábado 22:00 (pela data da venda)
    const semana = resolverSemana("atual");

    // =====================================================
    // VENDAS DE HOJE
    // =====================================================
    const [vendasHojeResult] = await pool.query(
      `
      SELECT
        COUNT(*) AS quantidade_vendas_hoje,
        COALESCE(SUM(valor_total), 0) AS total_vendido_hoje
      FROM vendas
      WHERE ${DATA_REAL} = ?
      `,
      [hoje]
    );

    // =====================================================
    // VENDAS DA SEMANA (data_venda, não data_criacao)
    // =====================================================
    const [vendasSemanaResult] = await pool.query(
      `
      SELECT
        COUNT(*) AS quantidade_vendas_semana,
        COALESCE(SUM(valor_total), 0) AS total_vendido_semana
      FROM vendas
      WHERE ${DATA_REAL} >= ?
        AND ${DATA_REAL} < DATE_ADD(?, INTERVAL 1 DAY)
      `,
      [semana.consultaDe, semana.consultaAte]
    );

    // =====================================================
    // VENDAS DO MÊS
    // =====================================================
    const [vendasMesResult] = await pool.query(
      `
      SELECT
        COUNT(*) AS quantidade_vendas_mes,
        COALESCE(SUM(valor_total), 0) AS total_vendido_mes
      FROM vendas
      WHERE ${DATA_REAL} >= ?
        AND ${DATA_REAL} < DATE_ADD(?, INTERVAL 1 DAY)
      `,
      [inicioMes, fimMes]
    );

    const vendasHoje = vendasHojeResult[0];
    const vendasSemana = vendasSemanaResult[0];
    const vendasMes = vendasMesResult[0];

    return res.status(200).json({
      total_vendido_hoje: Number(vendasHoje.total_vendido_hoje),
      quantidade_vendas_hoje: Number(vendasHoje.quantidade_vendas_hoje),

      total_vendido_semana: Number(vendasSemana.total_vendido_semana),
      quantidade_vendas_semana: Number(
        vendasSemana.quantidade_vendas_semana
      ),

      total_vendido_mes: Number(vendasMes.total_vendido_mes),
      quantidade_vendas_mes: Number(vendasMes.quantidade_vendas_mes),

      // Informativo: datas da semana contabilizada
      semana_inicio: semana.inicio,
      semana_fim: semana.fim,
    });
  } catch (error) {
    console.error("Erro ao carregar resumo do dashboard:", error.message);

    return res.status(500).json({
      message: "Erro ao carregar resumo do dashboard.",
    });
  }
}

module.exports = {
  resumoDashboard,
};