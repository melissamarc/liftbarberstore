import { useEffect, useState } from "react";
import api from "../services/api";

function Products() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [fotoProduto, setFotoProduto] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const [produtoEditando, setProdutoEditando] = useState(null);
  const [editNome, setEditNome] = useState("");
  const [editPreco, setEditPreco] = useState("");
  const [editAtivo, setEditAtivo] = useState(true);
  const [editFoto, setEditFoto] = useState(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

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
    } catch (error) {
      setErro("Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBuscar(e) {
    e.preventDefault();
    await carregarProdutos(busca);
  }

  async function handleCadastrar(e) {
    e.preventDefault();

    try {
      setSalvando(true);
      setErro("");

      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("preco", preco);

      if (fotoProduto) {
        formData.append("foto_produto", fotoProduto);
      }

      await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setNome("");
      setPreco("");
      setFotoProduto(null);

      await carregarProdutos(busca);
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
    setEditAtivo(Boolean(produto.ativo));
    setEditFoto(null);
  }

  function fecharEdicao() {
    setProdutoEditando(null);
    setEditNome("");
    setEditPreco("");
    setEditAtivo(true);
    setEditFoto(null);
  }

  async function salvarEdicao() {
    if (!produtoEditando) return;

    try {
      setSalvandoEdicao(true);
      setErro("");

      const formData = new FormData();
      formData.append("nome", editNome);
      formData.append("preco", editPreco);
      formData.append("ativo", editAtivo);

      if (editFoto) {
        formData.append("foto_produto", editFoto);
      }

      await api.put(`/products/${produtoEditando.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await carregarProdutos(busca);
      fecharEdicao();
    } catch (error) {
      setErro(error.response?.data?.message || "Erro ao atualizar produto.");
    } finally {
      setSalvandoEdicao(false);
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.pageHeader}>
        <div>
          <p style={styles.pageMini}>Catálogo</p>
          <h1 style={styles.pageTitle}>Produtos</h1>
          <p style={styles.pageSubtitle}>
            Cadastre, pesquise e atualize os produtos da loja.
          </p>
        </div>
      </header>

      {erro && <p style={styles.erro}>{erro}</p>}

      <section style={styles.board}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarBlock}>
            <p style={styles.sidebarMini}>Resumo</p>
            <h3 style={styles.sidebarTitle}>{produtos.length} produtos</h3>
            <p style={styles.sidebarText}>
              exibidos na listagem atual.
            </p>
          </div>

          <div style={styles.sidebarBlock}>
            <div style={styles.blockHeader}>
              <h3 style={styles.blockTitle}>Cadastrar produto</h3>
              <span style={styles.badge}>Admin</span>
            </div>

            <form onSubmit={handleCadastrar} style={styles.form}>
              <div style={styles.inputWrap}>
                <label style={styles.label}>Nome</label>
                <input
                  type="text"
                  placeholder="Ex.: Pomada Modeladora"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.inputWrap}>
                <label style={styles.label}>Preço</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex.: 39.90"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.inputWrap}>
                <label style={styles.label}>Foto do produto</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(e) => setFotoProduto(e.target.files[0])}
                  style={styles.fileInput}
                />
              </div>

              <button
                type="submit"
                style={styles.primaryButton}
                disabled={salvando}
              >
                {salvando ? "Salvando..." : "Cadastrar produto"}
              </button>
            </form>
          </div>
        </aside>

        <div style={styles.content}>
          <div style={styles.toolbar}>
            <form onSubmit={handleBuscar} style={styles.searchForm}>
              <span style={styles.searchIcon}>⌕</span>
              <input
                type="text"
                placeholder="Buscar produto pelo nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                style={styles.searchInput}
              />
              <button type="submit" style={styles.searchButton}>
                Buscar
              </button>
            </form>
          </div>

          <div style={styles.productsViewport}>
            {loading ? (
              <p style={styles.loadingText}>Carregando produtos...</p>
            ) : produtos.length === 0 ? (
              <div style={styles.emptyBox}>
                <p style={styles.emptyTitle}>Nenhum produto encontrado</p>
                <p style={styles.emptyText}>
                  Tente mudar a busca ou cadastrar um novo produto.
                </p>
              </div>
            ) : (
              <div style={styles.grid}>
                {produtos.map((produto) => {
                  const fotoUrl = produto.foto_produto
                    ? `http://localhost:3001${produto.foto_produto}`
                    : null;

                  return (
                    <div key={produto.id} style={styles.productCard}>
                      <div style={styles.productImageBox}>
                        {fotoUrl ? (
                          <img
                            src={fotoUrl}
                            alt={produto.nome}
                            style={styles.productImage}
                          />
                        ) : (
                          <div style={styles.productImagePlaceholder}>
                            Sem imagem
                          </div>
                        )}

                        <span
                          style={{
                            ...styles.statusTag,
                            ...(produto.ativo
                              ? styles.statusActive
                              : styles.statusInactive),
                          }}
                        >
                          {produto.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </div>

                      <div style={styles.productBody}>
                        <div>
                          <h3 style={styles.productName}>{produto.nome}</h3>
                          <p style={styles.productCategory}>Produto da loja</p>
                        </div>

                        <div style={styles.productFooter}>
                          <div>
                            <p style={styles.priceLabel}>Preço</p>
                            <p style={styles.productPrice}>
                              R$ {Number(produto.preco).toFixed(2)}
                            </p>
                          </div>

                          <button
                            onClick={() => abrirEdicao(produto)}
                            style={styles.editButton}
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {produtoEditando && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Editar produto</h2>

            <div style={styles.modalForm}>
              <div style={styles.inputWrap}>
                <label style={styles.label}>Nome</label>
                <input
                  type="text"
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  style={styles.input}
                  placeholder="Nome do produto"
                />
              </div>

              <div style={styles.inputWrap}>
                <label style={styles.label}>Preço</label>
                <input
                  type="number"
                  step="0.01"
                  value={editPreco}
                  onChange={(e) => setEditPreco(e.target.value)}
                  style={styles.input}
                  placeholder="Preço"
                />
              </div>

              <label style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={editAtivo}
                  onChange={(e) => setEditAtivo(e.target.checked)}
                />
                Produto ativo
              </label>

              <div style={styles.inputWrap}>
                <label style={styles.label}>Trocar foto</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(e) => setEditFoto(e.target.files[0])}
                  style={styles.fileInput}
                />
              </div>
            </div>

            <div style={styles.modalActions}>
              <button onClick={fecharEdicao} style={styles.cancelButton}>
                Cancelar
              </button>

              <button
                onClick={salvarEdicao}
                style={styles.primaryButton}
                disabled={salvandoEdicao}
              >
                {salvandoEdicao ? "Salvando..." : "Salvar alterações"}
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
  board: {
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
    overflow: "hidden",
  },
  sidebarBlock: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
  },
  sidebarMini: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#7b7b7b",
    fontWeight: 700,
    marginBottom: "8px",
  },
  sidebarTitle: {
    fontSize: "40px",
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: "-0.06em",
    color: "#111",
    marginBottom: "10px",
  },
  sidebarText: {
    color: "#666",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  blockHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "18px",
  },
  blockTitle: {
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
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  inputWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
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
  fileInput: {
    minHeight: "52px",
    borderRadius: "14px",
    border: "1px solid #ddd",
    padding: "12px",
    background: "#fff",
    color: "#111",
  },
  primaryButton: {
    height: "52px",
    padding: "0 18px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #c91f28 0%, #9f161e 100%)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(201,31,40,0.18)",
  },
  content: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    height: "100%",
    overflow: "hidden",
  },
  toolbar: {
    marginBottom: "18px",
    flexShrink: 0,
  },
  searchForm: {
    height: "58px",
    background: "#f5f2ec",
    borderRadius: "18px",
    display: "grid",
    gridTemplateColumns: "24px 1fr auto",
    alignItems: "center",
    gap: "12px",
    padding: "0 14px",
    border: "1px solid #ece5da",
  },
  searchIcon: {
    fontSize: "18px",
    color: "#7b7b7b",
    textAlign: "center",
  },
  searchInput: {
    height: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "15px",
    color: "#111",
  },
  searchButton: {
    height: "42px",
    padding: "0 18px",
    borderRadius: "12px",
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  productsViewport: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    paddingRight: "4px",
  },
  loadingText: {
    color: "#666",
    fontSize: "14px",
  },
  emptyBox: {
    borderRadius: "20px",
    background: "#f8f6f2",
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "18px",
  },
  productCard: {
    background: "#f8f6f2",
    borderRadius: "22px",
    overflow: "hidden",
    border: "1px solid #eee8df",
  },
  productImageBox: {
    position: "relative",
    height: "220px",
    background: "#ece7df",
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  productImagePlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#777",
    fontWeight: 700,
    fontSize: "14px",
  },
  statusTag: {
    position: "absolute",
    top: "14px",
    right: "14px",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
  },
  statusActive: {
    background: "rgba(18, 130, 70, 0.14)",
    color: "#0b7f44",
  },
  statusInactive: {
    background: "rgba(176, 0, 32, 0.12)",
    color: "#b00020",
  },
  productBody: {
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  productName: {
    fontSize: "20px",
    lineHeight: 1.2,
    fontWeight: 800,
    color: "#111",
    letterSpacing: "-0.03em",
    marginBottom: "6px",
  },
  productCategory: {
    color: "#7b7b7b",
    fontSize: "13px",
    fontWeight: 600,
  },
  productFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "12px",
  },
  priceLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#7b7b7b",
    fontWeight: 700,
    marginBottom: "4px",
  },
  productPrice: {
    fontSize: "24px",
    fontWeight: 900,
    color: "#111",
    letterSpacing: "-0.04em",
  },
  editButton: {
    height: "44px",
    padding: "0 18px",
    borderRadius: "999px",
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.40)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    zIndex: 1000,
  },
  modal: {
    width: "100%",
    maxWidth: "560px",
    background: "#fff",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
  },
  modalTitle: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#111",
    marginBottom: "18px",
  },
  modalForm: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    color: "#333",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },
  cancelButton: {
    height: "50px",
    padding: "0 18px",
    borderRadius: "14px",
    border: "1px solid #ddd",
    background: "#fff",
    color: "#111",
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default Products;