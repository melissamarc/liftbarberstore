import { useEffect, useMemo, useState } from "react";
import api, { getImageUrl } from "../services/api";
import { useResponsive } from "../hooks/useResponsive";

function NewManualSale() {
  const [produtos, setProdutos] = useState([]);
  const [buscaProduto, setBuscaProduto] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [itensVenda, setItensVenda] = useState([]);

  const [clienteNome, setClienteNome] = useState("");
  const [dataVenda, setDataVenda] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const { isMobile, isTablet } = useResponsive();

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

  const produtosFiltrados = useMemo(() => {
    if (!buscaProduto.trim()) return produtos.slice(0, 6);

    return produtos
      .filter((produto) =>
        produto.nome.toLowerCase().includes(buscaProduto.toLowerCase())
      )
      .slice(0, 8);
  }, [produtos, buscaProduto]);

  function selecionarProduto(produto) {
    setProdutoSelecionado(produto);
    setBuscaProduto(produto.nome);
    setErro("");
    setMensagem("");
  }

  function adicionarItem() {
    setErro("");
    setMensagem("");

    if (!produtoSelecionado) {
      setErro("Selecione um produto.");
      return;
    }

    const quantidadeNumero = Number(quantidade);

    if (!quantidadeNumero || quantidadeNumero <= 0) {
      setErro("Quantidade inválida.");
      return;
    }

    const itemExistente = itensVenda.find(
      (item) => Number(item.produto_id) === Number(produtoSelecionado.id)
    );

    if (itemExistente) {
      setItensVenda((prev) =>
        prev.map((item) =>
          Number(item.produto_id) === Number(produtoSelecionado.id)
            ? { ...item, quantidade: item.quantidade + quantidadeNumero }
            : item
        )
      );
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

    setProdutoSelecionado(null);
    setBuscaProduto("");
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
        cliente_nome: clienteNome,
        data_venda: dataVenda,
        itens: itensVenda.map((item) => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
        })),
      };

      await api.post("/sales/manual", payload);

      setMensagem("Venda registrada com sucesso.");
      setItensVenda([]);
      setProdutoSelecionado(null);
      setBuscaProduto("");
      setQuantidade(1);
      setClienteNome("");
      setDataVenda(new Date().toISOString().slice(0, 10));
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
          <h1 style={styles.pageTitle(isMobile)}>Nova venda manual</h1>
          <p style={styles.pageSubtitle}>
            Monte a venda item por item com total calculado automaticamente.
          </p>
        </div>
      </header>

      {erro && <p style={styles.erro}>{erro}</p>}
      {mensagem && <p style={styles.sucesso}>{mensagem}</p>}

      <section
        style={styles.board(
          isMobile ? "1fr" : isTablet ? "1fr" : "340px 1fr",
          isMobile
        )}
      >
        <aside style={styles.sidebar(isMobile)}>
          <div style={styles.sidebarCard}>
            <div style={styles.cardHeader(isMobile)}>
              <h2 style={styles.cardTitle}>Adicionar item</h2>
              <span style={styles.badge}>Manual</span>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Nome do cliente</label>
              <input
                type="text"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                placeholder="Ex: João Silva"
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Data da venda</label>
              <input
                type="date"
                value={dataVenda}
                onChange={(e) => setDataVenda(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Buscar produto</label>
              <input
                type="text"
                value={buscaProduto}
                onChange={(e) => {
                  setBuscaProduto(e.target.value);
                  setProdutoSelecionado(null);
                }}
                placeholder="Digite o nome do produto..."
                style={styles.input}
              />

              {buscaProduto && (
                <div style={styles.productSearchList}>
                  {produtosFiltrados.length === 0 ? (
                    <p style={styles.noProducts}>Nenhum produto encontrado.</p>
                  ) : (
                    produtosFiltrados.map((produto) => {
                      const fotoUrl = getImageUrl(produto.foto_produto);

                      return (
                        <button
                          key={produto.id}
                          type="button"
                          onClick={() => selecionarProduto(produto)}
                          style={{
                            ...styles.productOption,
                            ...(produtoSelecionado?.id === produto.id
                              ? styles.productOptionActive
                              : {}),
                          }}
                        >
                          {fotoUrl ? (
                            <img
                              src={fotoUrl}
                              alt={produto.nome}
                              style={styles.productOptionImage}
                            />
                          ) : (
                            <div style={styles.productOptionImageEmpty}>IMG</div>
                          )}

                          <div style={styles.productOptionInfo}>
                            <strong style={styles.productOptionName}>
                              {produto.nome}
                            </strong>
                            <span style={styles.productOptionPrice}>
                              R$ {Number(produto.preco).toFixed(2)}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
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

        <div style={styles.content(isMobile)}>
          <div style={styles.contentHeader}>
            <h2 style={styles.contentTitle}>Itens da venda</h2>
          </div>

          <div style={styles.itemsViewport(isMobile)}>
            {itensVenda.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyTitle}>Nenhum item adicionado</p>
                <p style={styles.emptyText}>
                  Busque um produto ao lado e monte a venda.
                </p>
              </div>
            ) : (
              <div style={styles.itemsList}>
                {itensVenda.map((item) => {
                  const fotoUrl = getImageUrl(item.foto_produto);

                  return (
                    <div key={item.produto_id} style={styles.itemCard(isMobile)}>
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

                      <div style={styles.itemRight(isMobile)}>
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
                          style={styles.removeButton(isMobile)}
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
  board: (columns, isMobile) => ({
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
  cardHeader: (isMobile) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile ? "flex-start" : "center",
    flexDirection: isMobile ? "column" : "row",
    gap: "10px",
    marginBottom: "18px",
  }),
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
  productSearchList: {
    maxHeight: "260px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "4px",
  },
  productOption: {
    width: "100%",
    border: "1px solid #eee8df",
    background: "#f8f6f2",
    borderRadius: "16px",
    padding: "10px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    textAlign: "left",
  },
  productOptionActive: {
    border: "1px solid #1f4fa3",
    background: "rgba(31,79,163,0.08)",
  },
  productOptionImage: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    objectFit: "cover",
    flexShrink: 0,
  },
  productOptionImageEmpty: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "#ece7df",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#777",
    fontSize: "10px",
    fontWeight: 800,
    flexShrink: 0,
  },
  productOptionInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    minWidth: 0,
  },
  productOptionName: {
    fontSize: "13px",
    color: "#111",
    fontWeight: 800,
  },
  productOptionPrice: {
    fontSize: "12px",
    color: "#666",
  },
  noProducts: {
    fontSize: "13px",
    color: "#777",
    background: "#f8f6f2",
    padding: "12px",
    borderRadius: "14px",
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
  content: (isMobile) => ({
    background: "#fff",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    overflow: "hidden",
    height: isMobile ? "auto" : "100%",
  }),
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
  itemsViewport: (isMobile) => ({
    flex: isMobile ? "unset" : 1,
    minHeight: 0,
    overflowY: isMobile ? "visible" : "auto",
    paddingRight: isMobile ? 0 : "4px",
  }),
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
  itemCard: (isMobile) => ({
    background: "#f8f6f2",
    borderRadius: "22px",
    padding: "18px",
    border: "1px solid #eee8df",
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile ? "stretch" : "center",
    gap: "16px",
    flexDirection: isMobile ? "column" : "row",
  }),
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
  itemRight: (isMobile) => ({
    display: "flex",
    alignItems: isMobile ? "stretch" : "center",
    gap: "18px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    flexDirection: isMobile ? "column" : "row",
  }),
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
  removeButton: (isMobile) => ({
    height: "44px",
    padding: "0 16px",
    borderRadius: "999px",
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    width: isMobile ? "100%" : "auto",
  }),
};

export default NewManualSale;