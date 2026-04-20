import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function NewManualSale() {
  const [produtos, setProdutos] = useState([]);
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [itensVenda, setItensVenda] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function carregarProdutos() {
      try {
        setLoading(true);
        const response = await api.get("/products");
        setProdutos(response.data.filter((produto) => produto.ativo));
      } catch (error) {
        setErro("Erro ao carregar produtos.");
      } finally {
        setLoading(false);
      }
    }

    carregarProdutos();
  }, []);

  function adicionarItem() {
    setErro("");
    setMensagem("");

    if (!produtoId) {
      setErro("Selecione um produto.");
      return;
    }

    const quantidadeNumero = Number(quantidade);

    if (!quantidadeNumero || quantidadeNumero <= 0) {
      setErro("Quantidade inválida.");
      return;
    }

    const produtoSelecionado = produtos.find(
      (produto) => Number(produto.id) === Number(produtoId)
    );

    if (!produtoSelecionado) {
      setErro("Produto não encontrado.");
      return;
    }

    const itemExistente = itensVenda.find(
      (item) => Number(item.produto_id) === Number(produtoSelecionado.id)
    );

    if (itemExistente) {
      const itensAtualizados = itensVenda.map((item) => {
        if (Number(item.produto_id) === Number(produtoSelecionado.id)) {
          return {
            ...item,
            quantidade: item.quantidade + quantidadeNumero,
          };
        }

        return item;
      });

      setItensVenda(itensAtualizados);
    } else {
      setItensVenda((prev) => [
        ...prev,
        {
          produto_id: produtoSelecionado.id,
          nome: produtoSelecionado.nome,
          preco: Number(produtoSelecionado.preco),
          quantidade: quantidadeNumero,
          foto_produto: produtoSelecionado.foto_produto || null,
        },
      ]);
    }

    setProdutoId("");
    setQuantidade(1);
  }

  function removerItem(produtoIdRemover) {
    setItensVenda((prev) =>
      prev.filter((item) => Number(item.produto_id) !== Number(produtoIdRemover))
    );
  }

  const totalVenda = useMemo(() => {
    return itensVenda.reduce((acc, item) => {
      return acc + item.preco * item.quantidade;
    }, 0);
  }, [itensVenda]);

  async function salvarVenda() {
    try {
      setErro("");
      setMensagem("");

      if (itensVenda.length === 0) {
        setErro("Adicione pelo menos um item à venda.");
        return;
      }

      setSalvando(true);

      const payload = {
        itens: itensVenda.map((item) => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
        })),
      };

      await api.post("/sales/manual", payload);

      setMensagem("Venda registrada com sucesso.");
      setItensVenda([]);
      setProdutoId("");
      setQuantidade(1);
    } catch (error) {
      setErro(error.response?.data?.message || "Erro ao registrar venda.");
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
    return <p>Carregando tela de venda...</p>;
  }

  return (
    <div style={styles.page}>
      <header style={styles.pageHeader}>
        <div>
          <p style={styles.pageMini}>Operação</p>
          <h1 style={styles.pageTitle}>Nova venda manual</h1>
          <p style={styles.pageSubtitle}>
            Monte a venda item por item com total calculado automaticamente.
          </p>
        </div>
      </header>

      {erro && <p style={styles.erro}>{erro}</p>}
      {mensagem && <p style={styles.sucesso}>{mensagem}</p>}

      <section style={styles.board}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarCard}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Adicionar item</h2>
              <span style={styles.badge}>Manual</span>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Produto</label>
              <select
                value={produtoId}
                onChange={(e) => setProdutoId(e.target.value)}
                style={styles.input}
              >
                <option value="">Selecione um produto</option>
                {produtos.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome} — R$ {Number(produto.preco).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Quantidade</label>
              <input
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                style={styles.input}
              />
            </div>

            <button onClick={adicionarItem} style={styles.primaryButton}>
              Adicionar item
            </button>
          </div>

          <div style={styles.darkCard}>
            <p style={styles.darkMini}>Resumo</p>
            <h3 style={styles.darkBig}>R$ {totalVenda.toFixed(2)}</h3>
            <p style={styles.darkText}>
              {itensVenda.length} {itensVenda.length === 1 ? "item" : "itens"} na venda atual
            </p>

            <button
              onClick={salvarVenda}
              disabled={salvando || itensVenda.length === 0}
              style={styles.darkButton}
            >
              {salvando ? "Salvando..." : "Registrar venda"}
            </button>
          </div>
        </aside>

        <div style={styles.content}>
          <div style={styles.contentHeader}>
            <h2 style={styles.contentTitle}>Itens da venda</h2>
          </div>

          <div style={styles.itemsViewport}>
            {itensVenda.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyTitle}>Nenhum item adicionado</p>
                <p style={styles.emptyText}>
                  Escolha um produto ao lado e monte a venda.
                </p>
              </div>
            ) : (
              <div style={styles.itemsList}>
                {itensVenda.map((item) => {
                  const fotoUrl = item.foto_produto
                    ? `http://localhost:3001${item.foto_produto}`
                    : null;

                  return (
                    <div key={item.produto_id} style={styles.itemCard}>
                      <div style={styles.itemLeft}>
                        <div style={styles.itemImageBox}>
                          {fotoUrl ? (
                            <img
                              src={fotoUrl}
                              alt={item.nome}
                              style={styles.itemImage}
                            />
                          ) : (
                            <div style={styles.itemImagePlaceholder}>Sem imagem</div>
                          )}
                        </div>

                        <div>
                          <h3 style={styles.itemName}>{item.nome}</h3>
                          <p style={styles.itemMeta}>
                            R$ {Number(item.preco).toFixed(2)} por unidade
                          </p>
                        </div>
                      </div>

                      <div style={styles.itemRight}>
                        <div style={styles.itemInfoBlock}>
                          <span style={styles.itemInfoLabel}>Qtd.</span>
                          <strong style={styles.itemInfoValue}>{item.quantidade}</strong>
                        </div>

                        <div style={styles.itemInfoBlock}>
                          <span style={styles.itemInfoLabel}>Subtotal</span>
                          <strong style={styles.itemInfoValue}>
                            R$ {(item.preco * item.quantidade).toFixed(2)}
                          </strong>
                        </div>

                        <button
                          onClick={() => removerItem(item.produto_id)}
                          style={styles.removeButton}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
  board: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
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
  sidebarCard: {
    background: "#fff",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
  },
  darkCard: {
    background: "#171921",
    color: "#fff",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  darkMini: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.55)",
    fontWeight: 700,
  },
  darkBig: {
    fontSize: "42px",
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: "-0.05em",
  },
  darkText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  darkButton: {
    marginTop: "8px",
    height: "52px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #c91f28 0%, #9f161e 100%)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "18px",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#111",
    letterSpacing: "-0.03em",
  },
  badge: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(31,79,163,0.10)",
    color: "#1f4fa3",
    fontSize: "12px",
    fontWeight: 800,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "14px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#444",
  },
  input: {
    height: "52px",
    borderRadius: "14px",
    border: "1px solid #ddd",
    padding: "0 14px",
    background: "#fff",
    color: "#111",
    fontSize: "14px",
  },
  primaryButton: {
    width: "100%",
    height: "52px",
    borderRadius: "14px",
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  content: {
    background: "#fff",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    overflow: "hidden",
  },
  contentHeader: {
    marginBottom: "18px",
    flexShrink: 0,
  },
  contentTitle: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#111",
    letterSpacing: "-0.03em",
  },
  itemsViewport: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    paddingRight: "4px",
  },
  emptyState: {
    background: "#f8f6f2",
    borderRadius: "20px",
    padding: "32px",
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#111",
    marginBottom: "8px",
  },
  emptyText: {
    color: "#666",
    fontSize: "14px",
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  itemCard: {
    background: "#f8f6f2",
    borderRadius: "22px",
    padding: "18px",
    border: "1px solid #eee8df",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
  },
  itemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minWidth: 0,
  },
  itemImageBox: {
    width: "84px",
    height: "84px",
    borderRadius: "18px",
    overflow: "hidden",
    background: "#ece7df",
    flexShrink: 0,
  },
  itemImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  itemImagePlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#777",
    fontSize: "12px",
    fontWeight: 700,
    textAlign: "center",
    padding: "6px",
  },
  itemName: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#111",
    letterSpacing: "-0.03em",
    marginBottom: "6px",
  },
  itemMeta: {
    color: "#666",
    fontSize: "14px",
  },
  itemRight: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  itemInfoBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minWidth: "90px",
  },
  itemInfoLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#7b7b7b",
    fontWeight: 700,
  },
  itemInfoValue: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#111",
  },
  removeButton: {
    height: "44px",
    padding: "0 16px",
    borderRadius: "999px",
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default NewManualSale;