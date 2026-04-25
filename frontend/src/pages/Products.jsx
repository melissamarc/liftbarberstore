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
          isMobile ? "1fr" : isTablet ? "1fr" : "330px 1fr"
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
          <form onSubmit={handleBuscar} style={styles.searchBar}>
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
              <p>Carregando...</p>
            ) : produtos.length === 0 ? (
              <p>Nenhum produto encontrado.</p>
            ) : (
              produtos.map((produto) => {
                const lucro =
                  Number(produto.preco) -
                  Number(produto.preco_custo || 0);

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

                      <div>
                        <p style={styles.productName}>{produto.nome}</p>
                        <p style={styles.subText}>
                          {produto.ativo ? "Ativo" : "Inativo"}
                        </p>
                      </div>
                    </div>

                    <div style={styles.values}>
                      <span>Venda: R$ {Number(produto.preco).toFixed(2)}</span>
                      <span>
                        Custo: R${" "}
                        {Number(produto.preco_custo || 0).toFixed(2)}
                      </span>
                      <span>
                        Lucro: R$ {Number(lucro).toFixed(2)}
                      </span>
                    </div>

                    <button
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
  page: { display: "flex", flexDirection: "column", gap: 20 },
  pageHeader: {},
  pageMini: { fontSize: 12, color: "#888", fontWeight: 700 },
  pageTitle: () => ({ fontSize: 32, fontWeight: 900 }),
  pageSubtitle: { color: "#666" },
  erro: { color: "red" },

  board: (cols) => ({
    display: "grid",
    gridTemplateColumns: cols,
    gap: 20,
  }),

  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  sidebarCard: {
    background: "#fff",
    padding: 22,
    borderRadius: 22,
  },

  smallLabel: { fontSize: 12, color: "#888" },
  bigNumber: { fontSize: 42, fontWeight: 900 },
  smallText: { color: "#666" },

  cardTitle: { fontSize: 20, fontWeight: 800 },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 14,
  },

  input: {
    height: 48,
    borderRadius: 12,
    border: "1px solid #ddd",
    padding: "0 14px",
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
  },

  searchBar: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 12,
    marginBottom: 18,
  },

  searchInput: {
    height: 48,
    borderRadius: 12,
    border: "1px solid #ddd",
    padding: "0 14px",
  },

  searchButton: {
    height: 48,
    padding: "0 20px",
    border: "none",
    borderRadius: 12,
    background: "#111",
    color: "#fff",
    fontWeight: 800,
  },

  listArea: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  row: {
    background: "#f8f6f2",
    borderRadius: 18,
    padding: 14,
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr auto",
    gap: 14,
    alignItems: "center",
  },

  leftInfo: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },

  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    objectFit: "cover",
  },

  thumbEmpty: {
    width: 56,
    height: 56,
    borderRadius: 12,
    background: "#ddd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  productName: {
    fontWeight: 800,
    fontSize: 15,
  },

  subText: {
    fontSize: 13,
    color: "#666",
  },

  values: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    fontSize: 13,
  },

  editButton: {
    height: 42,
    padding: "0 18px",
    borderRadius: 999,
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
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
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: 800,
  },

  checkbox: {
    display: "flex",
    gap: 8,
    alignItems: "center",
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
    cursor: "pointer",
  },
};

export default Products;