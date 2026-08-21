import { useEffect, useState } from "react";
import api, { getImageUrl } from "../services/api";

import "./Products.css";

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
    } catch {
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

      await api.post("/products", formData);

      setNome("");
      setPreco("");
      setFotoProduto(null);

      await carregarProdutos(busca);
    } catch (error) {
      setErro(
        error.response?.data?.message ||
          "Erro ao cadastrar produto."
      );
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

      await api.put(
        `/products/${produtoEditando.id}`,
        formData
      );

      fecharEdicao();
      await carregarProdutos(busca);
    } catch (error) {
      setErro(
        error.response?.data?.message ||
          "Erro ao atualizar produto."
      );
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
    <div className="products-page">

      <header className="products-header">
        <div>
          <p className="products-eyebrow">
            Catálogo
          </p>

          <h1 className="products-title">
            Produtos
          </h1>

          <p className="products-subtitle">
            Cadastre, pesquise e gerencie os produtos da loja.
          </p>
        </div>

        <div className="products-count">
          <strong>{produtos.length}</strong>

          <span>
            {produtos.length === 1
              ? "produto"
              : "produtos"}
          </span>
        </div>
      </header>

      {erro && (
        <div className="products-error">
          {erro}
        </div>
      )}

      <section className="products-layout">

        {/* CADASTRO */}

        <aside className="products-create">
          <div className="products-create-header">
            <div>
              <p className="products-section-eyebrow">
                Novo produto
              </p>

              <h2>
                Cadastrar produto
              </h2>
            </div>

            <span className="products-create-icon">
              +
            </span>
          </div>

          <form
            onSubmit={handleCadastrar}
            className="products-form"
          >
            <div className="products-field">
              <label>
                Nome do produto
              </label>

              <input
                type="text"
                placeholder="Ex.: Pomada Modeladora"
                value={nome}
                onChange={(e) =>
                  setNome(e.target.value)
                }
                required
              />
            </div>

            <div className="products-field">
              <label>
                Preço de venda
              </label>

              <div className="products-price-input">
                <span>R$</span>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="39,90"
                  value={preco}
                  onChange={(e) =>
                    setPreco(e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="products-field">
              <label>
                Foto do produto
              </label>

              <label className="products-file">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(e) =>
                    setFotoProduto(
                      e.target.files?.[0] || null
                    )
                  }
                />

                <span className="products-file-button">
                  Escolher imagem
                </span>

                <span className="products-file-name">
                  {fotoProduto
                    ? fotoProduto.name
                    : "Nenhum arquivo selecionado"}
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="products-primary-button"
              disabled={salvando}
            >
              {salvando
                ? "Salvando..."
                : "Cadastrar produto"}
            </button>
          </form>
        </aside>

        {/* PRODUTOS */}

        <main className="products-content">

          <div className="products-content-header">
            <div>
              <p className="products-section-eyebrow">
                Produtos cadastrados
              </p>

              <h2>
                Lista de produtos
              </h2>
            </div>

            <span className="products-result-count">
              {produtos.length} exibidos
            </span>
          </div>

          <form
            onSubmit={handleBuscar}
            className="products-search"
          >
            <div className="products-search-field">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Buscar produto pelo nome..."
                value={busca}
                onChange={(e) =>
                  setBusca(e.target.value)
                }
              />
            </div>

            <button
              type="submit"
              className="products-search-button"
            >
              Buscar
            </button>

            {busca && (
              <button
                type="button"
                className="products-clear-button"
                onClick={() => {
                  setBusca("");
                  carregarProdutos("");
                }}
              >
                Limpar
              </button>
            )}
          </form>

          <div className="products-list">

            {loading ? (
              <div className="products-feedback">
                Carregando produtos...
              </div>
            ) : produtos.length === 0 ? (
              <div className="products-empty">
                <strong>
                  Nenhum produto encontrado
                </strong>

                <p>
                  Tente outra busca ou cadastre um novo produto.
                </p>
              </div>
            ) : (
              produtos.map((produto) => {
                const fotoUrl = produto.foto_produto
                  ? getImageUrl(produto.foto_produto)
                  : null;

                return (
                  <article
                    key={produto.id}
                    className="products-row"
                  >
                    <div className="products-product">

                      {fotoUrl ? (
                        <img
                          src={fotoUrl}
                          alt={produto.nome}
                          className="products-thumb"
                        />
                      ) : (
                        <div className="products-thumb-empty">
                          IMG
                        </div>
                      )}

                      <div className="products-info">
                        <p className="products-name">
                          {produto.nome}
                        </p>

                        <span
                          className={
                            produto.ativo
                              ? "products-status active"
                              : "products-status inactive"
                          }
                        >
                          <span />

                          {produto.ativo
                            ? "Ativo"
                            : "Inativo"}
                        </span>
                      </div>
                    </div>

                    <div className="products-price">
                      <span>
                        Preço
                      </span>

                      <strong>
                        {formatarMoeda(produto.preco)}
                      </strong>
                    </div>

                    <button
                      type="button"
                      className="products-edit-button"
                      onClick={() =>
                        abrirEdicao(produto)
                      }
                    >
                      Editar
                    </button>
                  </article>
                );
              })
            )}
          </div>
        </main>
      </section>

      {/* MODAL */}

      {produtoEditando && (
        <div className="products-modal-overlay">

          <div className="products-modal">

            <div className="products-modal-header">
              <div>
                <p className="products-section-eyebrow">
                  Produto
                </p>

                <h2>
                  Editar produto
                </h2>
              </div>

              <button
                type="button"
                onClick={fecharEdicao}
                className="products-modal-close"
              >
                Fechar
              </button>
            </div>

            <div className="products-modal-product">

              {produtoEditando.foto_produto ? (
                <img
                  src={getImageUrl(
                    produtoEditando.foto_produto
                  )}
                  alt={produtoEditando.nome}
                />
              ) : (
                <div className="products-modal-image-empty">
                  IMG
                </div>
              )}

              <div>
                <span>
                  Editando
                </span>

                <strong>
                  {produtoEditando.nome}
                </strong>
              </div>
            </div>

            <div className="products-modal-fields">

              <div className="products-field">
                <label>
                  Nome do produto
                </label>

                <input
                  type="text"
                  value={editNome}
                  onChange={(e) =>
                    setEditNome(e.target.value)
                  }
                />
              </div>

              <div className="products-field">
                <label>
                  Preço de venda
                </label>

                <div className="products-price-input">
                  <span>R$</span>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={editPreco}
                    onChange={(e) =>
                      setEditPreco(e.target.value)
                    }
                  />
                </div>
              </div>

              <label className="products-switch-row">

                <div>
                  <strong>
                    Produto ativo
                  </strong>

                  <span>
                    Produtos inativos continuam cadastrados.
                  </span>
                </div>

                <div className="products-switch">
                  <input
                    type="checkbox"
                    checked={editAtivo}
                    onChange={(e) =>
                      setEditAtivo(
                        e.target.checked
                      )
                    }
                  />

                  <span className="products-switch-slider" />
                </div>
              </label>

              <div className="products-field">
                <label>
                  Trocar foto
                </label>

                <label className="products-file">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) =>
                      setEditFoto(
                        e.target.files?.[0] || null
                      )
                    }
                  />

                  <span className="products-file-button">
                    Escolher imagem
                  </span>

                  <span className="products-file-name">
                    {editFoto
                      ? editFoto.name
                      : "Manter imagem atual"}
                  </span>
                </label>
              </div>
            </div>

            <div className="products-modal-actions">
              <button
                type="button"
                onClick={fecharEdicao}
                className="products-secondary-button"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={salvarEdicao}
                className="products-primary-button"
                disabled={salvandoEdicao}
              >
                {salvandoEdicao
                  ? "Salvando..."
                  : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;