const pool = require("../config/db");

// RESUMO DO DASHBOARD
async function resumoDashboard(req, res) {
  try {
    const [vendasHojeResult] = await pool.query(`
      SELECT
        COUNT(*) AS quantidade_vendas_hoje,
        COALESCE(SUM(valor_total), 0) AS total_vendido_hoje
      FROM vendas
      WHERE data_criacao >= CURDATE()
        AND data_criacao < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
    `);

    const [vendasSemanaResult] = await pool.query(`
      SELECT
        COUNT(*) AS quantidade_vendas_semana,
        COALESCE(SUM(valor_total), 0) AS total_vendido_semana
      FROM vendas
      WHERE data_criacao >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    const [lucroHojeResult] = await pool.query(`
      SELECT
        COALESCE(SUM(iv.lucro), 0) AS lucro_hoje
      FROM itens_venda iv
      INNER JOIN vendas v ON v.id = iv.venda_id
      WHERE v.data_criacao >= CURDATE()
        AND v.data_criacao < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
    `);

    const [lucroMesResult] = await pool.query(`
      SELECT
        COALESCE(SUM(iv.lucro), 0) AS lucro_mes,
        COALESCE(SUM(v.valor_total), 0) AS faturamento_mes,
        COUNT(DISTINCT v.id) AS quantidade_vendas_mes
      FROM vendas v
      LEFT JOIN itens_venda iv ON iv.venda_id = v.id
      WHERE v.data_criacao >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
        AND v.data_criacao < DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 1 DAY)
    `);

    const [produtoMaisLucrativoResult] = await pool.query(`
      SELECT
        p.id,
        p.nome,
        p.foto_produto,
        COALESCE(SUM(iv.lucro), 0) AS lucro_total
      FROM itens_venda iv
      INNER JOIN produtos p ON p.id = iv.produto_id
      INNER JOIN vendas v ON v.id = iv.venda_id
      WHERE v.data_criacao >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
        AND v.data_criacao < DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 1 DAY)
      GROUP BY p.id, p.nome, p.foto_produto
      ORDER BY lucro_total DESC
      LIMIT 1
    `);

    const [vendedorMaisLucrativoResult] = await pool.query(`
      SELECT
        u.id,
        u.nome,
        u.email,
        u.foto_perfil,
        COALESCE(SUM(iv.lucro), 0) AS lucro_total
      FROM vendas v
      INNER JOIN usuarios u ON u.id = v.usuario_id
      LEFT JOIN itens_venda iv ON iv.venda_id = v.id
      WHERE v.data_criacao >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
        AND v.data_criacao < DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 1 DAY)
      GROUP BY u.id, u.nome, u.email, u.foto_perfil
      ORDER BY lucro_total DESC
      LIMIT 1
    `);

    const vendasHoje = vendasHojeResult[0];
    const vendasSemana = vendasSemanaResult[0];
    const lucroHoje = lucroHojeResult[0];
    const lucroMes = lucroMesResult[0];

    const faturamentoMes = Number(lucroMes.faturamento_mes);
    const quantidadeVendasMes = Number(lucroMes.quantidade_vendas_mes);
    const ticketMedioMes =
      quantidadeVendasMes > 0 ? faturamentoMes / quantidadeVendasMes : 0;

    return res.status(200).json({
      total_vendido_hoje: Number(vendasHoje.total_vendido_hoje),
      quantidade_vendas_hoje: Number(vendasHoje.quantidade_vendas_hoje),

      total_vendido_semana: Number(vendasSemana.total_vendido_semana),
      quantidade_vendas_semana: Number(vendasSemana.quantidade_vendas_semana),

      lucro_hoje: Number(lucroHoje.lucro_hoje),
      lucro_mes: Number(lucroMes.lucro_mes),
      faturamento_mes: faturamentoMes,
      quantidade_vendas_mes: quantidadeVendasMes,
      ticket_medio_mes: ticketMedioMes,

      produto_mais_lucrativo: produtoMaisLucrativoResult[0] || null,
      vendedor_mais_lucrativo: vendedorMaisLucrativoResult[0] || null,
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
        p.foto_produto,
        SUM(iv.quantidade) AS total_quantidade_vendida,
        SUM(iv.subtotal) AS total_valor_vendido,
        SUM(iv.lucro) AS total_lucro
      FROM itens_venda iv
      INNER JOIN produtos p ON p.id = iv.produto_id
      GROUP BY p.id, p.nome, p.foto_produto
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