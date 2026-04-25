const pool = require("../config/db");

// RANKING DE VENDEDORES
async function rankingVendedores(req, res) {
  try {
    const [ranking] = await pool.query(`
      SELECT
        u.id AS usuario_id,
        u.nome AS usuario_nome,
        u.email AS usuario_email,
        u.foto_perfil,

        COALESCE(vendas_resumo.total_vendido, 0) AS total_vendido,
        COALESCE(vendas_resumo.quantidade_vendas, 0) AS quantidade_vendas,
        COALESCE(itens_resumo.quantidade_itens_vendidos, 0) AS quantidade_itens_vendidos

      FROM usuarios u

      LEFT JOIN (
        SELECT
          usuario_id,
          SUM(valor_total) AS total_vendido,
          COUNT(id) AS quantidade_vendas
        FROM vendas
        GROUP BY usuario_id
      ) vendas_resumo ON vendas_resumo.usuario_id = u.id

      LEFT JOIN (
        SELECT
          v.usuario_id,
          SUM(iv.quantidade) AS quantidade_itens_vendidos
        FROM vendas v
        INNER JOIN itens_venda iv ON iv.venda_id = v.id
        GROUP BY v.usuario_id
      ) itens_resumo ON itens_resumo.usuario_id = u.id

      WHERE u.ativo = TRUE

      ORDER BY 
        total_vendido DESC, 
        quantidade_vendas DESC, 
        quantidade_itens_vendidos DESC
    `);

    const rankingFormatado = ranking.map((item, index) => ({
      posicao: index + 1,
      usuario_id: item.usuario_id,
      usuario_nome: item.usuario_nome,
      usuario_email: item.usuario_email,
      foto_perfil: item.foto_perfil,
      total_vendido: Number(item.total_vendido),
      quantidade_vendas: Number(item.quantidade_vendas),
      quantidade_itens_vendidos: Number(item.quantidade_itens_vendidos),
    }));

    return res.status(200).json(rankingFormatado);
  } catch (error) {
    console.error("Erro ao carregar ranking:", error.message);
    return res.status(500).json({
      message: "Erro ao carregar ranking."
    });
  }
}

module.exports = {
  rankingVendedores,
};