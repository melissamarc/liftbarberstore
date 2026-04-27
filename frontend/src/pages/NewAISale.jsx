import { useEffect, useState } from "react";
import api from "../services/api";
import { useResponsive } from "../hooks/useResponsive";

function NewAISale() {
  const [clienteNome, setClienteNome] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [itens, setItens] = useState([]);
  const [valorTotal, setValorTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  const [produtos, setProdutos] = useState([]);
  const [produtoManualId, setProdutoManualId] = useState("");
  const [quantidadeManual, setQuantidadeManual] = useState(1);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);

  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    try {
      setCarregandoProdutos(true);

      const response = await api.get("/products");

      setProdutos(response.data || []);
    } catch (error) {
      setErro("Erro ao carregar produtos.");
    } finally {
      setCarregandoProdutos(false);
    }
  }

  function calcularTotal(lista) {
    return lista.reduce((acc, item) => {
      return acc + Number(item.preco_unitario || 0) * Number(item.quantidade || 0);
    }, 0);
  }

  function montarItemPorProduto(produto, quantidade = 1) {
    const qtd = Number(quantidade) || 1;
    const preco = Number(produto.preco || 0);

    return {
      produto_id: produto.id,
      produto_nome: produto.nome,
      preco_unitario: preco,
      quantidade: qtd,
      subtotal: preco * qtd,
    };
  }

  async function interpretarMensagem() {
    try {
      setErro("");
      setMensagemSucesso("");
      setLoading(true);

      const response = await api.post("/ai/parse-sale", {
        mensagem,
      });

      const itensEncontrados = response.data.itens_encontrados || [];

      const itensNormalizados = itensEncontrados.map((item) => {
        const quantidade = Number(item.quantidade || 1);
        const precoUnitario = Number(item.preco_unitario || 0);

        return {
          produto_id: item.produto_id,
          produto_nome: item.produto_nome,
          preco_unitario: precoUnitario,
          quantidade,
          subtotal: precoUnitario * quantidade,
        };
      });

      setItens(itensNormalizados);
      setValorTotal(calcularTotal(itensNormalizados));
    } catch (error) {
      setErro("Erro ao interpretar mensagem.");
    } finally {
      setLoading(false);
    }
  }

  function alterarProduto(index, produtoId) {
    const produto = produtos.find((item) => String(item.id) === String(produtoId));

    if (!produto) return;

    const itensAtualizados = [...itens];
    const quantidadeAtual = itensAtualizados[index].quantidade || 1;

    itensAtualizados[index] = montarItemPorProduto(produto, quantidadeAtual);

    setItens(itensAtualizados);
    setValorTotal(calcularTotal(itensAtualizados));
  }

  function alterarQuantidade(index, novaQuantidade) {
    const quantidade = Number(novaQuantidade) || 1;

    const itensAtualizados = [...itens];

    itensAtualizados[index].quantidade = quantidade;
    itensAtualizados[index].subtotal =
      Number(itensAtualizados[index].preco_unitario || 0) * quantidade;

    setItens(itensAtualizados);
    setValorTotal(calcularTotal(itensAtualizados));
  }

  function removerItem(index) {
    const itensAtualizados = itens.filter((_, i) => i !== index);

    setItens(itensAtualizados);
    setValorTotal(calcularTotal(itensAtualizados));
  }

  function adicionarProdutoManual() {
    const produto = produtos.find(
      (item) => String(item.id) === String(produtoManualId)
    );

    if (!produto) {
      setErro("Selecione um produto para adicionar.");
      return;
    }

    const quantidade = Number(quantidadeManual) || 1;

    const itemExistenteIndex = itens.findIndex(
      (item) => String(item.produto_id) === String(produto.id)
    );

    let itensAtualizados;

    if (itemExistenteIndex >= 0) {
      itensAtualizados = [...itens];

      const novaQuantidade =
        Number(itensAtualizados[itemExistenteIndex].quantidade || 0) + quantidade;

      itensAtualizados[itemExistenteIndex] = montarItemPorProduto(
        produto,
        novaQuantidade
      );
    } else {
      itensAtualizados = [...itens, montarItemPorProduto(produto, quantidade)];
    }

    setItens(itensAtualizados);
    setValorTotal(calcularTotal(itensAtualizados));
    setProdutoManualId("");
    setQuantidadeManual(1);
    setErro("");
  }

  async function confirmarVenda() {
    try {
      setErro("");
      setMensagemSucesso("");

      if (itens.length === 0) {
        setErro("Nenhum item para salvar.");
        return;
      }

      setSalvando(true);

      await api.post("/sales/ia", {
        cliente_nome: clienteNome.trim() || null,
        mensagem_original: mensagem,
        itens: itens.map((item) => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
        })),
      });

      setMensagemSucesso("Venda registrada com sucesso.");
      setClienteNome("");
      setMensagem("");
      setItens([]);
      setValorTotal(0);
      setProdutoManualId("");
      setQuantidadeManual(1);
    } catch (error) {
      setErro(error.response?.data?.message || "Erro ao salvar venda.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.pageHeader}>
        <div>
          <p style={styles.pageMini}>IA</p>
          <h1 style={styles.pageTitle(isMobile)}>Nova venda com IA</h1>
          <p style={styles.pageSubtitle}>
            Cole a mensagem do cliente, deixe a IA sugerir os itens e confirme a venda.
          </p>
        </div>
      </header>

      {erro && <p style={styles.erro}>{erro}</p>}
      {mensagemSucesso && <p style={styles.sucesso}>{mensagemSucesso}</p>}

      <section
        style={styles.chatBoard(
          isMobile ? "1fr" : isTablet ? "1fr" : "300px 1fr",
          isMobile
        )}
      >
        <aside style={styles.sidebar(isMobile)}>
          <div style={styles.darkCard}>
            <p style={styles.darkMini}>Assistente</p>
            <h3 style={styles.darkTitle}>Interpretação inteligente</h3>
            <p style={styles.darkText}>
              A IA lê a mensagem, sugere os produtos do catálogo e você revisa antes de salvar.
            </p>
          </div>

          <div style={styles.summaryCard}>
            <label style={styles.fieldLabel}>Cliente</label>
            <input
              placeholder="Nome do cliente"
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
              style={styles.clientInput}
            />

            <p style={styles.summaryMini}>Resumo</p>
            <h3 style={styles.summaryValue}>R$ {valorTotal.toFixed(2)}</h3>
            <p style={styles.summaryText}>
              {itens.length} {itens.length === 1 ? "item na venda" : "itens na venda"}
            </p>

            <button
              onClick={confirmarVenda}
              disabled={salvando || itens.length === 0}
              style={styles.confirmButton}
            >
              {salvando ? "Salvando..." : "Confirmar venda"}
            </button>
          </div>
        </aside>

        <div style={styles.chatArea(isMobile)}>
          <div style={styles.chatTop}>
            <h2 style={styles.chatTitle}>Conversa</h2>
          </div>

          <div style={styles.chatBody(isMobile)}>
            <div style={styles.messageAssistant}>
              <div style={styles.messageBubbleAssistant(isMobile)}>
                Cole abaixo a mensagem do cliente para eu identificar os itens da venda.
              </div>
            </div>

            {mensagem.trim() && (
              <div style={styles.messageUser}>
                <div style={styles.messageBubbleUser(isMobile)}>{mensagem}</div>
              </div>
            )}

            <div style={styles.messageAssistant}>
              <div style={styles.resultBox}>
                <div style={styles.resultHeader}>
                  <h3 style={styles.resultTitle}>Itens da venda</h3>
                </div>

                {itens.length > 0 && (
                  <div style={styles.resultList}>
                    {itens.map((item, index) => (
                      <div key={index} style={styles.resultItem(isMobile)}>
                        <div style={styles.resultItemLeft}>
                          <div style={styles.aiBadge}>IA</div>

                          <div>
                            <p style={styles.resultName}>{item.produto_nome}</p>
                            <p style={styles.resultMeta}>
                              R$ {Number(item.preco_unitario).toFixed(2)} por unidade
                            </p>
                          </div>
                        </div>

                        <div style={styles.resultItemRight(isMobile)}>
                          <div style={styles.productSelectBox}>
                            <label style={styles.qtyLabel}>Produto</label>
                            <select
                              value={item.produto_id || ""}
                              onChange={(e) => alterarProduto(index, e.target.value)}
                              style={styles.productSelect}
                            >
                              <option value="">Selecione</option>

                              {produtos.map((produto) => (
                                <option key={produto.id} value={produto.id}>
                                  {produto.nome} - R$ {Number(produto.preco).toFixed(2)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div style={styles.quantityBox}>
                            <label style={styles.qtyLabel}>Qtd.</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantidade}
                              onChange={(e) => alterarQuantidade(index, e.target.value)}
                              style={styles.qtyInput}
                            />
                          </div>

                          <div style={styles.subtotalBox}>
                            <span style={styles.subtotalLabel}>Subtotal</span>
                            <strong style={styles.subtotalValue}>
                              R$ {(item.preco_unitario * item.quantidade).toFixed(2)}
                            </strong>
                          </div>

                          <button
                            onClick={() => removerItem(index)}
                            style={styles.removeButton(isMobile)}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {itens.length === 0 && (
                  <p style={styles.emptyText}>
                    Nenhum item adicionado ainda. Use a IA ou adicione manualmente.
                  </p>
                )}

                <div style={styles.manualAddBox}>
                  <div style={styles.manualFields}>
                    <div style={styles.productSelectBox}>
                      <label style={styles.qtyLabel}>Adicionar produto</label>
                      <select
                        value={produtoManualId}
                        onChange={(e) => setProdutoManualId(e.target.value)}
                        style={styles.productSelect}
                        disabled={carregandoProdutos}
                      >
                        <option value="">
                          {carregandoProdutos
                            ? "Carregando produtos..."
                            : "Selecione um produto"}
                        </option>

                        {produtos.map((produto) => (
                          <option key={produto.id} value={produto.id}>
                            {produto.nome} - R$ {Number(produto.preco).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={styles.quantityBox}>
                      <label style={styles.qtyLabel}>Qtd.</label>
                      <input
                        type="number"
                        min="1"
                        value={quantidadeManual}
                        onChange={(e) => setQuantidadeManual(e.target.value)}
                        style={styles.qtyInput}
                      />
                    </div>
                  </div>

                  <button onClick={adicionarProdutoManual} style={styles.addManualButton}>
                    Adicionar à venda
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.chatInputArea(isMobile)}>
            <textarea
              placeholder="Cole a mensagem do cliente aqui..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              style={styles.textarea}
            />

            <button
              onClick={interpretarMensagem}
              disabled={loading || !mensagem.trim()}
              style={styles.primaryButton(isMobile)}
            >
              {loading ? "Interpretando..." : "Interpretar mensagem"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  pageHeader: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  pageMini: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#7b7b7b",
    fontWeight: 700,
  },
  pageTitle: (isMobile) => ({
    fontSize: isMobile ? "28px" : "34px",
    fontWeight: 900,
    letterSpacing: "-0.05em",
    color: "#111",
  }),
  pageSubtitle: {
    color: "#666",
    fontSize: "15px",
  },
  erro: {
    color: "#b00020",
    fontWeight: 600,
  },
  sucesso: {
    color: "#0a7d32",
    fontWeight: 600,
  },
  chatBoard: (columns, isMobile) => ({
    display: "grid",
    gridTemplateColumns: columns,
    gap: "20px",
    alignItems: "stretch",
    height: isMobile ? "auto" : "calc(100vh - 230px)",
    minHeight: isMobile ? "auto" : "620px",
    maxHeight: isMobile ? "none" : "620px",
  }),
  sidebar: (isMobile) => ({
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    height: isMobile ? "auto" : "100%",
  }),
  darkCard: {
    background: "#171921",
    color: "#fff",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
  },
  darkMini: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.55)",
    fontWeight: 700,
    marginBottom: "8px",
  },
  darkTitle: {
    fontSize: "24px",
    fontWeight: 800,
    letterSpacing: "-0.04em",
    marginBottom: "12px",
  },
  darkText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: "14px",
    lineHeight: 1.7,
  },
  summaryCard: {
    background: "#fff",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  fieldLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#7b7b7b",
    fontWeight: 700,
  },
  clientInput: {
    height: "46px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    padding: "0 12px",
    outline: "none",
    color: "#111",
    fontSize: "14px",
    background: "#faf9f7",
    marginBottom: "8px",
  },
  summaryMini: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#7b7b7b",
    fontWeight: 700,
  },
  summaryValue: {
    fontSize: "42px",
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: "-0.05em",
    color: "#111",
  },
  summaryText: {
    color: "#666",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  confirmButton: {
    marginTop: "8px",
    height: "52px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #c91f28 0%, #9f161e 100%)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  chatArea: (isMobile) => ({
    background: "#fff",
    borderRadius: "24px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    overflow: "hidden",
    height: isMobile ? "auto" : "100%",
  }),
  chatTop: {
    padding: "22px 22px 0 22px",
    flexShrink: 0,
  },
  chatTitle: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#111",
    letterSpacing: "-0.03em",
  },
  chatBody: (isMobile) => ({
    flex: isMobile ? "unset" : 1,
    minHeight: 0,
    overflowY: isMobile ? "visible" : "auto",
    padding: "22px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  }),
  messageAssistant: {
    display: "flex",
    justifyContent: "flex-start",
  },
  messageUser: {
    display: "flex",
    justifyContent: "flex-end",
  },
  messageBubbleAssistant: (isMobile) => ({
    maxWidth: isMobile ? "100%" : "70%",
    background: "#f5f2ec",
    color: "#111",
    padding: "14px 16px",
    borderRadius: "18px 18px 18px 6px",
    lineHeight: 1.6,
    fontSize: "14px",
  }),
  messageBubbleUser: (isMobile) => ({
    maxWidth: isMobile ? "100%" : "70%",
    background: "#111",
    color: "#fff",
    padding: "14px 16px",
    borderRadius: "18px 18px 6px 18px",
    lineHeight: 1.6,
    fontSize: "14px",
    whiteSpace: "pre-wrap",
  }),
  resultBox: {
    width: "100%",
    background: "#f8f6f2",
    borderRadius: "22px",
    padding: "18px",
    border: "1px solid #eee8df",
  },
  resultHeader: {
    marginBottom: "14px",
  },
  resultTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#111",
  },
  resultList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  resultItem: (isMobile) => ({
    background: "#fff",
    borderRadius: "18px",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile ? "stretch" : "center",
    gap: "16px",
    border: "1px solid #eee8df",
    flexDirection: isMobile ? "column" : "row",
  }),
  resultItemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  aiBadge: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "rgba(31,79,163,0.10)",
    color: "#1f4fa3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "13px",
    flexShrink: 0,
  },
  resultName: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#111",
    marginBottom: "4px",
  },
  resultMeta: {
    color: "#666",
    fontSize: "13px",
  },
  resultItemRight: (isMobile) => ({
    display: "flex",
    alignItems: isMobile ? "stretch" : "center",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    flexDirection: isMobile ? "column" : "row",
    maxWidth: isMobile ? "100%" : "560px",
  }),
  productSelectBox: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    width: "180px",
    maxWidth: "100%",
  },
  productSelect: {
    width: "100%",
    height: "42px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    padding: "0 8px",
    background: "#fff",
    color: "#111",
    fontWeight: 600,
    fontSize: "13px",
  },
  quantityBox: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  qtyLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#7b7b7b",
    fontWeight: 700,
  },
  qtyInput: {
    width: "80px",
    height: "42px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    padding: "0 10px",
  },
  subtotalBox: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  subtotalLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#7b7b7b",
    fontWeight: 700,
  },
  subtotalValue: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#111",
  },
  removeButton: (isMobile) => ({
    height: "42px",
    padding: "0 16px",
    borderRadius: "999px",
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    width: isMobile ? "100%" : "auto",
  }),
  emptyText: {
    color: "#666",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  manualAddBox: {
    marginTop: "16px",
    padding: "16px",
    borderRadius: "18px",
    background: "#fff",
    border: "1px dashed #d8d0c4",
    display: "flex",
    alignItems: "end",
    justifyContent: "space-between",
    gap: "14px",
    flexWrap: "wrap",
  },
  manualFields: {
    display: "flex",
    alignItems: "end",
    gap: "14px",
    flexWrap: "wrap",
  },
  addManualButton: {
    height: "42px",
    padding: "0 16px",
    borderRadius: "12px",
    border: "none",
    background: "#1f4fa3",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  chatInputArea: (isMobile) => ({
    padding: "18px 22px 22px 22px",
    borderTop: "1px solid #eee8df",
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr auto",
    gap: "14px",
    alignItems: "end",
    flexShrink: 0,
  }),
  textarea: {
    minHeight: "110px",
    maxHeight: "110px",
    resize: "none",
    borderRadius: "18px",
    border: "1px solid #ddd",
    padding: "14px 16px",
    fontSize: "14px",
    lineHeight: 1.6,
    outline: "none",
    background: "#faf9f7",
  },
  primaryButton: (isMobile) => ({
    height: "52px",
    padding: "0 18px",
    borderRadius: "14px",
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    minWidth: isMobile ? "100%" : "190px",
    width: isMobile ? "100%" : "auto",
  }),
};

export default NewAISale;
