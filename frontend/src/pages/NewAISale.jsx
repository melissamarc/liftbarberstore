import { useState } from "react";
import api from "../services/api";

function NewAISale() {
  const [mensagem, setMensagem] = useState("");
  const [itens, setItens] = useState([]);
  const [valorTotal, setValorTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  async function interpretarMensagem() {
    try {
      setErro("");
      setMensagemSucesso("");
      setLoading(true);

      const response = await api.post("/ai/parse-sale", {
        mensagem,
      });

      setItens(response.data.itens_encontrados || []);
      setValorTotal(response.data.valor_total || 0);
    } catch (error) {
      setErro("Erro ao interpretar mensagem.");
    } finally {
      setLoading(false);
    }
  }

  function alterarQuantidade(index, novaQuantidade) {
    const quantidade = Number(novaQuantidade) || 1;

    const itensAtualizados = [...itens];
    itensAtualizados[index].quantidade = quantidade;
    itensAtualizados[index].subtotal =
      itensAtualizados[index].preco_unitario * quantidade;

    const novoTotal = itensAtualizados.reduce((acc, item) => {
      return acc + item.preco_unitario * item.quantidade;
    }, 0);

    setItens(itensAtualizados);
    setValorTotal(novoTotal);
  }

  function removerItem(index) {
    const itensAtualizados = itens.filter((_, i) => i !== index);

    const novoTotal = itensAtualizados.reduce((acc, item) => {
      return acc + item.preco_unitario * item.quantidade;
    }, 0);

    setItens(itensAtualizados);
    setValorTotal(novoTotal);
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
        mensagem_original: mensagem,
        itens: itens.map((item) => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
        })),
      });

      setMensagemSucesso("Venda registrada com sucesso.");
      setMensagem("");
      setItens([]);
      setValorTotal(0);
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
          <h1 style={styles.pageTitle}>Nova venda com IA</h1>
          <p style={styles.pageSubtitle}>
            Cole a mensagem do cliente, deixe a IA sugerir os itens e confirme a venda.
          </p>
        </div>
      </header>

      {erro && <p style={styles.erro}>{erro}</p>}
      {mensagemSucesso && <p style={styles.sucesso}>{mensagemSucesso}</p>}

      <section style={styles.chatBoard}>
        <aside style={styles.sidebar}>
          <div style={styles.darkCard}>
            <p style={styles.darkMini}>Assistente</p>
            <h3 style={styles.darkTitle}>Interpretação inteligente</h3>
            <p style={styles.darkText}>
              A IA lê a mensagem, sugere os produtos do catálogo e você só revisa.
            </p>
          </div>

          <div style={styles.summaryCard}>
            <p style={styles.summaryMini}>Resumo</p>
            <h3 style={styles.summaryValue}>R$ {valorTotal.toFixed(2)}</h3>
            <p style={styles.summaryText}>
              {itens.length} {itens.length === 1 ? "item sugerido" : "itens sugeridos"}
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

        <div style={styles.chatArea}>
          <div style={styles.chatTop}>
            <h2 style={styles.chatTitle}>Conversa</h2>
          </div>

          <div style={styles.chatBody}>
            <div style={styles.messageAssistant}>
              <div style={styles.messageBubbleAssistant}>
                Cole abaixo a mensagem do cliente para eu identificar os itens da venda.
              </div>
            </div>

            {mensagem.trim() && (
              <div style={styles.messageUser}>
                <div style={styles.messageBubbleUser}>{mensagem}</div>
              </div>
            )}

            {itens.length > 0 && (
              <div style={styles.messageAssistant}>
                <div style={styles.resultBox}>
                  <div style={styles.resultHeader}>
                    <h3 style={styles.resultTitle}>Itens encontrados</h3>
                  </div>

                  <div style={styles.resultList}>
                    {itens.map((item, index) => (
                      <div key={index} style={styles.resultItem}>
                        <div style={styles.resultItemLeft}>
                          <div style={styles.aiBadge}>IA</div>

                          <div>
                            <p style={styles.resultName}>{item.produto_nome}</p>
                            <p style={styles.resultMeta}>
                              R$ {Number(item.preco_unitario).toFixed(2)} por unidade
                            </p>
                          </div>
                        </div>

                        <div style={styles.resultItemRight}>
                          <div style={styles.quantityBox}>
                            <label style={styles.qtyLabel}>Qtd.</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantidade}
                              onChange={(e) =>
                                alterarQuantidade(index, e.target.value)
                              }
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
                            style={styles.removeButton}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={styles.chatInputArea}>
            <textarea
              placeholder="Cole a mensagem do cliente aqui..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              style={styles.textarea}
            />

            <button onClick={interpretarMensagem} style={styles.primaryButton}>
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
  pageTitle: {
    fontSize: "34px",
    fontWeight: 900,
    letterSpacing: "-0.05em",
    color: "#111",
  },
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
  chatBoard: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: "20px",
    alignItems: "stretch",
    height: "calc(100vh - 230px)",
    minHeight: "620px",
    maxHeight: "620px",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    height: "100%",
  },
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
  chatArea: {
    background: "#fff",
    borderRadius: "24px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    overflow: "hidden",
  },
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
  chatBody: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "22px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  messageAssistant: {
    display: "flex",
    justifyContent: "flex-start",
  },
  messageUser: {
    display: "flex",
    justifyContent: "flex-end",
  },
  messageBubbleAssistant: {
    maxWidth: "70%",
    background: "#f5f2ec",
    color: "#111",
    padding: "14px 16px",
    borderRadius: "18px 18px 18px 6px",
    lineHeight: 1.6,
    fontSize: "14px",
  },
  messageBubbleUser: {
    maxWidth: "70%",
    background: "#111",
    color: "#fff",
    padding: "14px 16px",
    borderRadius: "18px 18px 6px 18px",
    lineHeight: 1.6,
    fontSize: "14px",
    whiteSpace: "pre-wrap",
  },
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
  resultItem: {
    background: "#fff",
    borderRadius: "18px",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    border: "1px solid #eee8df",
  },
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
  resultItemRight: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
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
  removeButton: {
    height: "42px",
    padding: "0 16px",
    borderRadius: "999px",
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  chatInputArea: {
    padding: "18px 22px 22px 22px",
    borderTop: "1px solid #eee8df",
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "14px",
    alignItems: "end",
    flexShrink: 0,
  },
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
  primaryButton: {
    height: "52px",
    padding: "0 18px",
    borderRadius: "14px",
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    minWidth: "190px",
  },
};

export default NewAISale;