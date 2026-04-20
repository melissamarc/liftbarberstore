const pool = require("../config/db");
const { interpretarVendaComIA } = require("../services/aiService");

async function interpretarMensagemVenda(req, res) {
  try {
    const { mensagem } = req.body;

    if (!mensagem || !mensagem.trim()) {
      return res.status(400).json({
        message: "A mensagem é obrigatória.",
      });
    }

    // buscar produtos ativos
    const [produtos] = await pool.query(`
      SELECT id, nome, preco
      FROM produtos
      WHERE ativo = TRUE
    `);

    // chamar IA
    const resultadoIA = await interpretarVendaComIA(mensagem, produtos);

    const itensEncontrados = [];

    for (const item of resultadoIA.itens || []) {
      const produto = produtos.find(
        (p) => Number(p.id) === Number(item.produto_id)
      );

      if (!produto) continue;

      const quantidade = Number(item.quantidade) || 1;
      const preco = Number(produto.preco);
      const subtotal = preco * quantidade;

      itensEncontrados.push({
        produto_id: produto.id,
        produto_nome: produto.nome,
        quantidade,
        preco_unitario: preco,
        subtotal,
        confianca: "ia",
      });
    }

    const valorTotal = itensEncontrados.reduce((acc, item) => {
      return acc + item.subtotal;
    }, 0);

    return res.status(200).json({
      mensagem_original: mensagem,
      itens_encontrados: itensEncontrados,
      valor_total: valorTotal,
    });
  } catch (error) {
    console.error("Erro IA:", error.message);

    return res.status(500).json({
      message: "Erro ao interpretar mensagem com IA.",
    });
  }
}

module.exports = {
  interpretarMensagemVenda,
};