import { useEffect, useState } from "react";
import api, { getImageUrl } from "../services/api";
import { useResponsive } from "../hooks/useResponsive";

function Products() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [precoCusto, setPrecoCusto] = useState("");
  const [fotoProduto, setFotoProduto] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const [produtoEditando, setProdutoEditando] = useState(null);
  const [editNome, setEditNome] = useState("");
  const [editPreco, setEditPreco] = useState("");
  const [editPrecoCusto, setEditPrecoCusto] = useState("");
  const [editAtivo, setEditAtivo] = useState(true);
  const [editFoto, setEditFoto] = useState(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos(buscaAtual = "") {
    try {
      setLoading(true);
      setErro("");

      const response = await api.get("/products", {
        params: { busca: buscaAtual },
      });

      setProdutos(response.data);
    } catch {
      setErro("Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBuscar(e) {
    e.preventDefault();
    carregarProdutos(busca);
  }

  async function handleCadastrar(e) {
    e.preventDefault();

    try {
      setSalvando(true);
      setErro("");

      const formData = new FormData();

      formData.append("nome", nome);
      formData.append("preco", preco);
      formData.append("preco_custo", precoCusto);

      if (fotoProduto) {
        formData.append("foto_produto", fotoProduto);
      }

      await api.post("/products", formData);

      setNome("");
      setPreco("");
      setPrecoCusto("");
      setFotoProduto(null);

      carregarProdutos(busca);
    } catch (error) {
      setErro(error.response?.data?.message || "Erro ao cadastrar produto.");
    } finally {
      setSalvando(false);
    }
  }

  function abrirEdicao(produto) {
    setProdutoEditando(produto);
    setEditNome(produto.nome);
    setEditPreco(produto.preco);
    setEditPrecoCusto(produto.preco_custo || 0);
    setEditAtivo(Boolean(produto.ativo));
    setEditFoto(null);
  }

  function fecharEdicao() {
    setProdutoEditando(null);
  }

  async function salvarEdicao() {
    try {
      setSalvandoEdicao(true);

      const formData = new FormData();

      formData.append("nome", editNome);
      formData.append("preco", editPreco);
      formData.append("preco_custo", editPrecoCusto);
      formData.append("ativo", editAtivo);

      if (editFoto) {
        formData.append("foto_produto", editFoto);
      }

      await api.put(`/products/${produtoEditando.id}`, formData);

      fecharEdicao();
      carregarProdutos(busca);
    } catch (error) {
      setErro(error.response?.data?.message || "Erro ao atualizar.");
    } finally {
      setSalvandoEdicao(false);
    }
  }

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div style={styles.page}>
      <header style={styles.pageHeader}>
        <div>
          <p style={styles.pageMini}>Catálogo</p>
          <h1 style={styles.pageTitle(isMobile)}>Produtos</h1>
          <p style={styles.pageSubtitle}>
            Cadastre, pesquise e gerencie os produtos.
          </p>
        </div>
      </header>

      {erro && <p style={styles.erro}>{erro}</p>}

      <section
        style={styles.board(
          isMobile ? "1fr" : isTablet ? "1fr" : "330px minmax(0, 1fr)"
        )}
      >
        <aside style={styles.sidebar}>
          <div style={styles.sidebarCard}>
            <p style={styles.smallLabel}>Resumo</p>
            <h2 style={styles.bigNumber}>{produtos.length}</h2>
            <p style={styles.smallText}>produtos cadastrados</p>
          </div>

          <div style={styles.sidebarCard}>
            <h3 style={styles.cardTitle}>Cadastrar produto</h3>

            <form onSubmit={handleCadastrar} style={styles.form}>
              <input
                placeholder="Nome do produto"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={styles.input}
              />

              <input
                type="number"
                step="0.01"
                placeholder="Preço venda"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                style={styles.input}
              />

              <input
                type="number"
                step="0.01"
                placeholder="Preço custo"
                value={precoCusto}
                onChange={(e) => setPrecoCusto(e.target.value)}
                style={styles.input}
              />

              <input
                type="file"
                onChange={(e) => setFotoProduto(e.target.files[0])}
                style={styles.input}
              />

              <button style={styles.primaryButton}>
                {salvando ? "Salvando..." : "Cadastrar"}
              </button>
            </form>
          </div>
        </aside>

        <div style={styles.content}>
          <form onSubmit={handleBuscar} style={styles.searchBar(isMobile)}>
            <input
              placeholder="Buscar produto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={styles.searchInput}
            />

            <button style={styles.searchButton}>Buscar</button>
          </form>

          <div style={styles.listArea}>
            {loading ? (
              <p style={styles.feedbackText}>Carregando...</p>
            ) : produtos.length === 0 ? (
              <p style={styles.feedbackText}>Nenhum produto encontrado.</p>
            ) : (
              produtos.map((produto) => {
                const lucro =
                  Number(produto.preco || 0) - Number(produto.preco_custo || 0);

                return (
                  <div key={produto.id} style={styles.row}>
                    <div style={styles.leftInfo}>
                      {produto.foto_produto ? (
                        <img
                          src={getImageUrl(produto.foto_produto)}
                          alt=""
                          style={styles.thumb}
                        />
                      ) : (
                        <div style={styles.thumbEmpty}>IMG</div>
                      )}

                      <div style={styles.productInfo}>
                        <p style={styles.productName}>{produto.nome}</p>

                        <span
                          style={{
                            ...styles.statusBadge,
                            ...(produto.ativo
                              ? styles.statusActive
                              : styles.statusInactive),
                          }}
                        >
                          {produto.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    </div>

                    <div style={styles.values}>
                      <div style={styles.valueCard}>
                        <span style={styles.valueLabel}>Venda</span>
                        <strong style={styles.valueAmount}>
                          {formatarMoeda(produto.preco)}
                        </strong>
                      </div>

                      <div style={styles.valueCard}>
                        <span style={styles.valueLabel}>Custo</span>
                        <strong style={styles.valueAmount}>
                          {formatarMoeda(produto.preco_custo)}
                        </strong>
                      </div>

                      <div style={styles.valueCard}>
                        <span style={styles.valueLabel}>Lucro</span>
                        <strong
                          style={{
                            ...styles.valueAmount,
                            ...(lucro >= 0
                              ? styles.profitPositive
                              : styles.profitNegative),
                          }}
                        >
                          {formatarMoeda(lucro)}
                        </strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      style={styles.editButton}
                      onClick={() => abrirEdicao(produto)}
                    >
                      Editar
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {produtoEditando && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Editar produto</h2>

            <input
              value={editNome}
              onChange={(e) => setEditNome(e.target.value)}
              style={styles.input}
            />

            <input
              type="number"
              step="0.01"
              value={editPreco}
              onChange={(e) => setEditPreco(e.target.value)}
              style={styles.input}
            />

            <input
              type="number"
              step="0.01"
              value={editPrecoCusto}
              onChange={(e) => setEditPrecoCusto(e.target.value)}
              style={styles.input}
            />

            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={editAtivo}
                onChange={(e) => setEditAtivo(e.target.checked)}
              />
              Produto ativo
            </label>

            <input
              type="file"
              onChange={(e) => setEditFoto(e.target.files[0])}
              style={styles.input}
            />

            <div style={styles.modalButtons}>
              <button onClick={fecharEdicao} style={styles.cancelButton}>
                Cancelar
              </button>

              <button onClick={salvarEdicao} style={styles.primaryButton}>
                {salvandoEdicao ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  pageHeader: {},

  pageMini: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#888",
    fontWeight: 700,
    marginBottom: 6,
  },

  pageTitle: (isMobile) => ({
    fontSize: isMobile ? 28 : 32,
    fontWeight: 900,
    color: "#111",
  }),

  pageSubtitle: {
    color: "#666",
    fontSize: 15,
    lineHeight: 1.6,
    marginTop: 4,
  },

  erro: {
    color: "#b00020",
    fontWeight: 700,
  },

  board: (cols) => ({
    display: "grid",
    gridTemplateColumns: cols,
    gap: 20,
    alignItems: "start",
    minWidth: 0,
  }),

  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    minWidth: 0,
  },

  sidebarCard: {
    background: "#fff",
    padding: 22,
    borderRadius: 22,
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
    minWidth: 0,
  },

  smallLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#888",
    fontWeight: 800,
  },

  bigNumber: {
    fontSize: 42,
    lineHeight: 1,
    fontWeight: 900,
    color: "#111",
    marginTop: 8,
  },

  smallText: {
    color: "#666",
    fontSize: 14,
    marginTop: 6,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: "#111",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 14,
  },

  input: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    border: "1px solid #ddd",
    padding: "0 14px",
    outline: "none",
    background: "#fff",
    color: "#111",
    fontSize: 14,
    minWidth: 0,
  },

  primaryButton: {
    height: 48,
    border: "none",
    borderRadius: 12,
    background: "#c91f28",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },

  content: {
    background: "#fff",
    borderRadius: 22,
    padding: 22,
    minHeight: 0,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
  },

  searchBar: (isMobile) => ({
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1fr) auto",
    gap: 12,
    marginBottom: 18,
    flexShrink: 0,
    minWidth: 0,
  }),

  searchInput: {
    height: 48,
    borderRadius: 12,
    border: "1px solid #ddd",
    padding: "0 14px",
    outline: "none",
    color: "#111",
    fontSize: 14,
    minWidth: 0,
  },

  searchButton: {
    height: 48,
    padding: "0 20px",
    border: "none",
    borderRadius: 12,
    background: "#111",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },

  listArea: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxHeight: "620px",
    overflowY: "auto",
    overflowX: "auto",
    paddingRight: 6,
    paddingBottom: 4,
    minWidth: 0,
  },

  row: {
    background: "#f8f6f2",
    borderRadius: 18,
    padding: 14,
    display: "grid",
    gridTemplateColumns: "minmax(230px, 1fr) minmax(270px, 360px) 86px",
    gap: 14,
    alignItems: "center",
    border: "1px solid #eee8df",
    minWidth: 680,
  },

  leftInfo: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    minWidth: 0,
    overflow: "hidden",
  },

  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    objectFit: "cover",
    flexShrink: 0,
  },

  thumbEmpty: {
    width: 56,
    height: 56,
    borderRadius: 12,
    background: "#ddd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#777",
    fontSize: 12,
    fontWeight: 800,
    flexShrink: 0,
  },

  productInfo: {
    minWidth: 0,
    overflow: "hidden",
  },

  productName: {
    fontWeight: 800,
    fontSize: 15,
    color: "#111",
    lineHeight: 1.35,
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    width: "fit-content",
    marginTop: 6,
    padding: "5px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
  },

  statusActive: {
    background: "rgba(10,125,50,0.10)",
    color: "#0a7d32",
  },

  statusInactive: {
    background: "rgba(176,0,32,0.10)",
    color: "#b00020",
  },

  values: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 8,
    minWidth: 0,
  },

  valueCard: {
    background: "#fff",
    border: "1px solid #ebe3d8",
    borderRadius: 14,
    padding: "9px 8px",
    minWidth: 0,
    overflow: "hidden",
  },

  valueLabel: {
    display: "block",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#8a8a8a",
    fontWeight: 800,
    marginBottom: 4,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  valueAmount: {
    display: "block",
    maxWidth: "100%",
    fontSize: 13,
    color: "#111",
    fontWeight: 900,
    lineHeight: 1.25,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  profitPositive: {
    color: "#0a7d32",
  },

  profitNegative: {
    color: "#b00020",
  },

  editButton: {
    height: 42,
    padding: "0 14px",
    borderRadius: 999,
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    width: "86px",
    justifySelf: "end",
  },

  feedbackText: {
    color: "#666",
    fontSize: 14,
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: 500,
    background: "#fff",
    borderRadius: 22,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: "#111",
  },

  checkbox: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    color: "#111",
    fontWeight: 700,
  },

  modalButtons: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    border: "1px solid #ddd",
    background: "#fff",
    color: "#111",
    fontWeight: 800,
    cursor: "pointer",
  },
};

export default Products;
