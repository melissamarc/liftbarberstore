const pool = require("../config/db");

// RESUMO DO DASHBOARD
async function resumoDashboard(req, res) {
  try {
    const [vendasHojeResult] = await pool.query(`
      SELECT
        COUNT(*) AS quantidade_vendas_hoje,
        COALESCE(SUM(valor_total), 0) AS total_vendido_hoje
      FROM vendas
      WHERE DATE(data_criacao) = CURDATE()
    `);

    const [vendasSemanaResult] = await pool.query(`
      SELECT
        COUNT(*) AS quantidade_vendas_semana,
        COALESCE(SUM(valor_total), 0) AS total_vendido_semana
      FROM vendas
      WHERE YEARWEEK(data_criacao, 1) = YEARWEEK(CURDATE(), 1)
    `);

    const vendasHoje = vendasHojeResult[0];
    const vendasSemana = vendasSemanaResult[0];

    return res.status(200).json({
      total_vendido_hoje: Number(vendasHoje.total_vendido_hoje),
      quantidade_vendas_hoje: Number(vendasHoje.quantidade_vendas_hoje),
      total_vendido_semana: Number(vendasSemana.total_vendido_semana),
      quantidade_vendas_semana: Number(vendasSemana.quantidade_vendas_semana),
    });
  } catch (error) {
    console.error("Erro ao carregar resumo do dashboard:", error.message);
    return res.status(500).json({
      message: "Erro ao carregar resumo do dashboard."
    });
  }
}

// PRODUTOS MAIS VENDIDOS
async function topProdutos(req, res) {
  try {
    const [produtos] = await pool.query(`
      SELECT
        p.id,
        p.nome,
        SUM(iv.quantidade) AS total_quantidade_vendida,
        SUM(iv.subtotal) AS total_valor_vendido
      FROM itens_venda iv
      INNER JOIN produtos p ON p.id = iv.produto_id
      GROUP BY p.id, p.nome
      ORDER BY total_quantidade_vendida DESC, total_valor_vendido DESC
      LIMIT 5
    `);

    return res.status(200).json(produtos);
  } catch (error) {
    console.error("Erro ao carregar produtos mais vendidos:", error.message);
    return res.status(500).json({
      message: "Erro ao carregar produtos mais vendidos."
    });
  }
}

module.exports = {
  resumoDashboard,
  topProdutos,
};