import { useEffect, useMemo, useState } from "react";
import api, { getImageUrl } from "../services/api";
import { useResponsive } from "../hooks/useResponsive";

function SalesHistory() {
  const [vendas, setVendas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [clienteBusca, setClienteBusca] = useState("");
  const [dataBusca, setDataBusca] = useState("");

  const [vendaEditando, setVendaEditando] = useState(null);
  const [editClienteNome, setEditClienteNome] = useState("");
  const [editDataVenda, setEditDataVenda] = useState("");
  const [editItens, setEditItens] = useState([]);
  const [editBuscaProduto, setEditBuscaProduto] = useState("");
  const [editProdutoSelecionado, setEditProdutoSelecionado] = useState(null);
  const [editQuantidade, setEditQuantidade] = useState(1);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  const { isMobile } = useResponsive();

  useEffect(() => {
    carregarHistorico();
    carregarProdutos();
  }, []);

  const produtosFiltrados = useMemo(() => {
    const produtosAtivos = produtos.filter((produto) => produto.ativo);

    if (!editBuscaProduto.trim()) return produtosAtivos.slice(0, 6);

    return produtosAtivos
      .filter((produto) =>
        produto.nome.toLowerCase().includes(editBuscaProduto.toLowerCase())
      )
      .slice(0, 8);
  }, [produtos, editBuscaProduto]);

  const totalEdicao = useMemo(() => {
    return editItens.reduce((acc, item) => {
      return acc + Number(item.preco || 0) * Number(item.quantidade || 0);
    }, 0);
  }, [editItens]);

  async function carregarHistorico() {
    try {
      setLoading(true);
      setErro("");

      const response = await api.get("/sales", {
        params: {
          cliente: clienteBusca,
          data: dataBusca,
        },
      });

      setVendas(response.data);
    } catch (error) {
      setErro("Erro ao carregar histórico.");
    } finally {
      setLoading(false);
    }
  }

  async function carregarProdutos() {
    try {
      setLoadingProdutos(true);

      const response = await api.get("/products");

      setProdutos(response.data || []);
    } catch (error) {
      setErro("Erro ao carregar produtos.");
    } finally {
      setLoadingProdutos(false);
    }
  }

  async function handleBuscar(e) {
    e.preventDefault();
    await carregarHistorico();
  }

  async function limparFiltros() {
    setClienteBusca("");
    setDataBusca("");

    try {
      setLoading(true);
      const response = await api.get("/sales");
      setVendas(response.data);
    } catch (error) {
      setErro("Erro ao carregar histórico.");
    } finally {
      setLoading(false);
    }
  }

  async function excluirVenda(id) {
    const confirmar = window.confirm("Tem certeza que deseja excluir esta venda?");

    if (!confirmar) return;

    try {
      setErro("");
      setMensagem("");

      await api.delete(`/sales/${id}`);

      setMensagem("Venda excluída com sucesso.");
      await carregarHistorico();
    } catch (error) {
      setErro(error.response?.data?.message || "Erro ao excluir venda.");
    }
  }

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarDataInput(data) {
    if (!data) return new Date().toISOString().slice(0, 10);

    if (typeof data === "string" && data.includes("T")) {
      return data.slice(0, 10);
    }

    if (typeof data === "string" && data.length >= 10) {
      return data.slice(0, 10);
    }

    return new Date(data).toISOString().slice(0, 10);
  }

  function gerarNumeroPedido(venda) {
    return String(venda.id).padStart(9, "0");
  }

  function escaparHtml(valor) {
    return String(valor || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function abrirEdicao(venda) {
    const itensFormatados = (venda.itens || []).map((item) => {
      const produto = produtos.find(
        (produtoAtual) => Number(produtoAtual.id) === Number(item.produto_id)
      );

      return {
        produto_id: item.produto_id,
        nome: item.produto_nome,
        preco: Number(item.preco_unitario || produto?.preco || 0),
        quantidade: Number(item.quantidade || 1),
        foto_produto: produto?.foto_produto || null,
      };
    });

    setVendaEditando(venda);
    setEditClienteNome(venda.cliente_nome || "");
    setEditDataVenda(formatarDataInput(venda.data_venda || venda.data_criacao));
    setEditItens(itensFormatados);
    setEditBuscaProduto("");
    setEditProdutoSelecionado(null);
    setEditQuantidade(1);
    setErro("");
    setMensagem("");
  }

  function fecharEdicao() {
    setVendaEditando(null);
    setEditClienteNome("");
    setEditDataVenda("");
    setEditItens([]);
    setEditBuscaProduto("");
    setEditProdutoSelecionado(null);
    setEditQuantidade(1);
  }

  function selecionarProdutoEdicao(produto) {
    setEditProdutoSelecionado(produto);
    setEditBuscaProduto(produto.nome);
    setErro("");
    setMensagem("");
  }

  function adicionarItemEdicao() {
    setErro("");
    setMensagem("");

    if (!editProdutoSelecionado) {
      setErro("Selecione um produto.");
      return;
    }

    const quantidadeNumero = Number(editQuantidade);

    if (!quantidadeNumero || quantidadeNumero <= 0) {
      setErro("Quantidade inválida.");
      return;
    }

    const itemExistente = editItens.find(
      (item) => Number(item.produto_id) === Number(editProdutoSelecionado.id)
    );

    if (itemExistente) {
      setEditItens((prev) =>
        prev.map((item) =>
          Number(item.produto_id) === Number(editProdutoSelecionado.id)
            ? { ...item, quantidade: Number(item.quantidade) + quantidadeNumero }
            : item
        )
      );
    } else {
      setEditItens((prev) => [
        ...prev,
        {
          produto_id: editProdutoSelecionado.id,
          nome: editProdutoSelecionado.nome,
          preco: Number(editProdutoSelecionado.preco),
          quantidade: quantidadeNumero,
          foto_produto: editProdutoSelecionado.foto_produto || null,
        },
      ]);
    }

    setEditProdutoSelecionado(null);
    setEditBuscaProduto("");
    setEditQuantidade(1);
  }

  function alterarQuantidadeItemEdicao(produtoId, novaQuantidade) {
    const quantidadeNumero = Number(novaQuantidade) || 1;

    setEditItens((prev) =>
      prev.map((item) =>
        Number(item.produto_id) === Number(produtoId)
          ? { ...item, quantidade: quantidadeNumero }
          : item
      )
    );
  }

  function removerItemEdicao(produtoIdRemover) {
    setEditItens((prev) =>
      prev.filter((item) => Number(item.produto_id) !== Number(produtoIdRemover))
    );
  }

  async function salvarEdicaoVenda() {
    try {
      setErro("");
      setMensagem("");

      if (!vendaEditando) return;

      if (editItens.length === 0) {
        setErro("Adicione pelo menos um item à venda.");
        return;
      }

      setSalvandoEdicao(true);

      await api.put(`/sales/${vendaEditando.id}`, {
        cliente_nome: editClienteNome,
        data_venda: editDataVenda,
        itens: editItens.map((item) => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
        })),
      });

      setMensagem("Venda atualizada com sucesso.");
      fecharEdicao();
      await carregarHistorico();
    } catch (error) {
      setErro(error.response?.data?.message || "Erro ao atualizar venda.");
    } finally {
      setSalvandoEdicao(false);
    }
  }

  function montarHtmlPedido(venda) {
    const itens = venda.itens || [];
    const nomeCliente = venda.cliente_nome || "Cliente não informado";

    const subtotal = itens.reduce((acc, item) => {
      return acc + Number(item.subtotal || 0);
    }, 0);

    const cupom = Number(venda.valor_cupom || 0);
    const desconto = Number(venda.desconto || 0);
    const frete = Number(venda.frete || 0);
    const total = Number(venda.valor_total || subtotal);

    const produtosHtml =
      itens.length > 0
        ? itens
            .map((item) => {
              const quantidade = Number(item.quantidade || 1);
              const nome = escaparHtml(item.produto_nome || "Produto");
              const valorItem =
                Number(item.subtotal) ||
                Number(item.preco_unitario || 0) * quantidade;

              return `<p>${quantidade}x ${nome} = ${formatarMoeda(valorItem)}</p>`;
            })
            .join("")
        : `<p>Produtos não disponíveis.</p>`;

    return `
      <section class="pedido">
        <div class="cliente-topo">${escaparHtml(nomeCliente)}</div>
        <h1>PEDIDO - ${gerarNumeroPedido(venda)}</h1>

        <h2>Produtos</h2>
        ${produtosHtml}

        <div class="totais">
          <p>Subtotal: ${formatarMoeda(subtotal || total)}</p>
          <p>Cupom: ${formatarMoeda(cupom)}</p>
          <p>Desconto: ${formatarMoeda(desconto)}</p>
          <p>Frete: ${formatarMoeda(frete)}</p>
          <p class="total">Total: ${formatarMoeda(total)}</p>
        </div>

        <h2>Cliente</h2>
        <p>Nome: ${escaparHtml(nomeCliente)}</p>
      </section>
    `;
  }

  function imprimirVendas(listaVendas) {
    if (!listaVendas || listaVendas.length === 0) {
      setErro("Nenhuma venda para exportar.");
      return;
    }

    const conteudo = listaVendas.map(montarHtmlPedido).join("");
    const janela = window.open("", "_blank");

    if (!janela) {
      setErro("Não foi possível abrir a janela de impressão.");
      return;
    }

    janela.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pedidos</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: Arial, sans-serif;
              color: #111;
              margin: 0;
              padding: 32px;
              background: #fff;
            }
            .pedido {
              width: 100%;
              max-width: 720px;
              margin: 0 auto;
              padding-bottom: 36px;
              page-break-after: always;
            }
            .pedido:last-child { page-break-after: auto; }
            .cliente-topo {
              font-size: 34px;
              line-height: 1.1;
              font-weight: 900;
              text-transform: uppercase;
              margin-bottom: 10px;
              color: #111;
              word-break: break-word;
            }
            h1 {
              font-size: 20px;
              margin: 0 0 24px;
              font-weight: 800;
              color: #444;
            }
            h2 {
              font-size: 17px;
              margin: 22px 0 10px;
              font-weight: 800;
            }
            p {
              font-size: 15px;
              line-height: 1.5;
              margin: 4px 0;
            }
            .totais { margin-top: 18px; }
            .total {
              font-weight: 800;
              font-size: 17px;
              margin-top: 8px;
            }
            @media print {
              body { padding: 24px; }
              .cliente-topo { font-size: 32px; }
            }
          </style>
        </head>
        <body>
          ${conteudo}
          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    janela.document.close();
  }

  function exportarVendaPdf(venda) {
    imprimirVendas([venda]);
  }

  function exportarTodasVendasPdf() {
    imprimirVendas(vendas);
  }

  if (loading) {
    return <p>Carregando histórico...</p>;
  }

  return (
    <div style={styles.page}>
      <header style={styles.pageHeader(isMobile)}>
        <div>
          <p style={styles.pageMini}>Vendas</p>
          <h1 style={styles.pageTitle(isMobile)}>Histórico</h1>
          <p style={styles.pageSubtitle}>
            Visualize, edite, exporte e acompanhe as vendas registradas.
          </p>
        </div>

        <div style={styles.headerActions}>
          <div style={styles.totalBadge}>
            {vendas.length} {vendas.length === 1 ? "venda" : "vendas"}
          </div>

          <button onClick={exportarTodasVendasPdf} style={styles.exportButton}>
            Exportar PDF
          </button>
        </div>
      </header>

      {erro && <p style={styles.erro}>{erro}</p>}
      {mensagem && <p style={styles.sucesso}>{mensagem}</p>}

      <section style={styles.tableCard}>
        <form onSubmit={handleBuscar} style={styles.toolbar(isMobile)}>
          <div style={styles.searchBox(isMobile)}>
            <span style={styles.searchIcon}>⌕</span>
            <input
              type="text"
              placeholder="Buscar por nome do cliente..."
              value={clienteBusca}
              onChange={(e) => setClienteBusca(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.dateBox(isMobile)}>
            <input
              type="date"
              value={dataBusca}
              onChange={(e) => setDataBusca(e.target.value)}
              style={styles.dateInput}
            />
          </div>

          <button type="submit" style={styles.searchButton(isMobile)}>
            Buscar
          </button>

          <button type="button" onClick={limparFiltros} style={styles.clearButton(isMobile)}>
            Limpar
          </button>
        </form>

        <div style={styles.tableViewport(isMobile)}>
          {vendas.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyTitle}>Nenhuma venda encontrada</p>
              <p style={styles.emptyText}>Tente mudar o filtro ou registre novas vendas.</p>
            </div>
          ) : (
            <div style={styles.rows}>
              {vendas.map((venda) => (
                <div key={venda.id} style={styles.rowCard(isMobile)}>
                  <div style={styles.rowMain}>
                    <div>
                      <p style={styles.rowName}>
                        {venda.cliente_nome || "Cliente não informado"}
                      </p>

                      <p style={styles.rowDate}>Vendedor: {venda.usuario_nome}</p>

                      <p style={styles.rowDate}>
                        Data da venda:{" "}
                        {venda.data_venda
                          ? new Date(venda.data_venda).toLocaleDateString("pt-BR")
                          : new Date(venda.data_criacao).toLocaleDateString("pt-BR")}
                      </p>
                    </div>

                    <div style={styles.badgeGroup}>
                      <span
                        style={{
                          ...styles.originBadge,
                          ...(venda.origem === "ia"
                            ? styles.originIA
                            : styles.originManual),
                        }}
                      >
                        {venda.origem === "ia" ? "Venda com IA" : "Venda manual"}
                      </span>

                      <button
                        onClick={() => abrirEdicao(venda)}
                        style={styles.editButton}
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => exportarVendaPdf(venda)}
                        style={styles.pdfButton}
                      >
                        PDF
                      </button>

                      <button
                        onClick={() => excluirVenda(venda.id)}
                        style={styles.deleteButton}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>

                  <div style={styles.rowMiddle(isMobile)}>
                    <div style={styles.infoBlock}>
                      <span style={styles.infoLabel}>Total</span>
                      <strong style={styles.infoValue}>
                        {formatarMoeda(venda.valor_total)}
                      </strong>
                    </div>

                    <div style={styles.infoBlock}>
                      <span style={styles.infoLabel}>Editada</span>
                      <strong style={styles.infoValue}>{venda.editada ? "Sim" : "Não"}</strong>
                    </div>

                    <div style={styles.infoBlock}>
                      <span style={styles.infoLabel}>Criada em</span>
                      <strong style={styles.infoValueSmall}>
                        {new Date(venda.data_criacao).toLocaleString("pt-BR")}
                      </strong>
                    </div>
                  </div>

                  {venda.itens?.length > 0 && (
                    <div style={styles.itemsBox}>
                      <span style={styles.messageLabel}>Produtos</span>
                      {venda.itens.map((item) => (
                        <p key={item.id} style={styles.itemText}>
                          {item.quantidade}x {item.produto_nome} ={" "}
                          {formatarMoeda(item.subtotal)}
                        </p>
                      ))}
                    </div>
                  )}

                  {venda.texto_original && (
                    <div style={styles.messageBox}>
                      <span style={styles.messageLabel}>Mensagem original</span>
                      <p style={styles.messageText}>{venda.texto_original}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {vendaEditando && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <p style={styles.pageMini}>Editar venda</p>
                <h2 style={styles.modalTitle}>Pedido {gerarNumeroPedido(vendaEditando)}</h2>
              </div>

              <button onClick={fecharEdicao} style={styles.closeButton}>
                Fechar
              </button>
            </div>

            <div style={styles.editGrid(isMobile)}>
              <aside style={styles.editSidebar}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Nome do cliente</label>
                  <input
                    type="text"
                    value={editClienteNome}
                    onChange={(e) => setEditClienteNome(e.target.value)}
                    placeholder="Ex: João Silva"
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Data da venda</label>
                  <input
                    type="date"
                    value={editDataVenda}
                    onChange={(e) => setEditDataVenda(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Buscar produto</label>
                  <input
                    type="text"
                    value={editBuscaProduto}
                    onChange={(e) => {
                      setEditBuscaProduto(e.target.value);
                      setEditProdutoSelecionado(null);
                    }}
                    placeholder={
                      loadingProdutos
                        ? "Carregando produtos..."
                        : "Digite o nome do produto..."
                    }
                    disabled={loadingProdutos}
                    style={styles.input}
                  />

                  {editBuscaProduto && (
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
                              onClick={() => selecionarProdutoEdicao(produto)}
                              style={{
                                ...styles.productOption,
                                ...(editProdutoSelecionado?.id === produto.id
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
                                  {formatarMoeda(produto.preco)}
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
                    value={editQuantidade}
                    onChange={(e) => setEditQuantidade(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <button onClick={adicionarItemEdicao} style={styles.primaryButton}>
                  Adicionar item
                </button>

                <div style={styles.editSummary}>
                  <p style={styles.darkMini}>Resumo</p>
                  <h3 style={styles.darkBig}>{formatarMoeda(totalEdicao)}</h3>
                  <p style={styles.darkText}>
                    {editItens.length} {editItens.length === 1 ? "item" : "itens"} na venda
                  </p>

                  <button
                    onClick={salvarEdicaoVenda}
                    disabled={salvandoEdicao || editItens.length === 0}
                    style={styles.darkButton}
                  >
                    {salvandoEdicao ? "Salvando..." : "Salvar alterações"}
                  </button>
                </div>
              </aside>

              <div style={styles.editContent}>
                <h3 style={styles.contentTitle}>Itens da venda</h3>

                <div style={styles.editItemsViewport}>
                  {editItens.length === 0 ? (
                    <div style={styles.emptyBox}>
                      <p style={styles.emptyTitle}>Nenhum item adicionado</p>
                      <p style={styles.emptyText}>Busque um produto e monte a venda.</p>
                    </div>
                  ) : (
                    <div style={styles.editItemsList}>
                      {editItens.map((item) => {
                        const fotoUrl = getImageUrl(item.foto_produto);

                        return (
                          <div key={item.produto_id} style={styles.editItemCard(isMobile)}>
                            <div style={styles.editItemLeft}>
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

                              <div style={styles.editItemInfo}>
                                <h3 style={styles.editItemName}>{item.nome}</h3>
                                <p style={styles.itemText}>
                                  {formatarMoeda(item.preco)} por unidade
                                </p>
                              </div>
                            </div>

                            <div style={styles.editItemRight(isMobile)}>
                              <div style={styles.qtyEditBox}>
                                <label style={styles.infoLabel}>Qtd.</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantidade}
                                  onChange={(e) =>
                                    alterarQuantidadeItemEdicao(
                                      item.produto_id,
                                      e.target.value
                                    )
                                  }
                                  style={styles.qtyInput}
                                />
                              </div>

                              <div style={styles.infoBlock}>
                                <span style={styles.infoLabel}>Subtotal</span>
                                <strong style={styles.infoValue}>
                                  {formatarMoeda(item.preco * item.quantidade)}
                                </strong>
                              </div>

                              <button
                                onClick={() => removerItemEdicao(item.produto_id)}
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
  pageHeader: (isMobile) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile ? "flex-start" : "center",
    flexDirection: isMobile ? "column" : "row",
    gap: "16px",
    flexWrap: "wrap",
  }),
  pageMini: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#7b7b7b",
    fontWeight: 700,
    marginBottom: "6px",
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
    marginTop: "6px",
    lineHeight: 1.6,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  totalBadge: {
    padding: "12px 16px",
    borderRadius: "999px",
    background: "rgba(31,79,163,0.10)",
    color: "#1f4fa3",
    fontSize: "13px",
    fontWeight: 800,
  },
  exportButton: {
    height: "42px",
    padding: "0 16px",
    borderRadius: "999px",
    border: "none",
    background: "#111",
    color: "#fff",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
  },
  erro: {
    color: "#b00020",
    fontWeight: 600,
  },
  sucesso: {
    color: "#0a7d32",
    fontWeight: 600,
  },
  tableCard: {
    background: "#fff",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    height: "calc(100vh - 210px)",
    minHeight: "520px",
    overflow: "hidden",
  },
  toolbar: (isMobile) => ({
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1.4fr 220px auto auto",
    alignItems: "center",
    gap: "12px",
    flexShrink: 0,
  }),
  searchBox: () => ({
    width: "100%",
    height: "52px",
    background: "#f5f2ec",
    borderRadius: "16px",
    display: "grid",
    gridTemplateColumns: "24px 1fr",
    alignItems: "center",
    gap: "10px",
    padding: "0 14px",
    border: "1px solid #ece5da",
  }),
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
    fontSize: "14px",
    color: "#111",
  },
  dateBox: () => ({
    width: "100%",
    height: "52px",
    background: "#f5f2ec",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    padding: "0 14px",
    border: "1px solid #ece5da",
  }),
  dateInput: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#111",
    fontSize: "14px",
  },
  searchButton: (isMobile) => ({
    height: "52px",
    padding: "0 20px",
    borderRadius: "14px",
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    width: isMobile ? "100%" : "auto",
  }),
  clearButton: (isMobile) => ({
    height: "52px",
    padding: "0 20px",
    borderRadius: "14px",
    border: "1px solid #ddd",
    background: "#fff",
    color: "#111",
    fontWeight: 800,
    cursor: "pointer",
    width: isMobile ? "100%" : "auto",
  }),
  tableViewport: () => ({
    minHeight: 0,
    overflowY: "auto",
    paddingRight: "4px",
  }),
  rows: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  rowCard: () => ({
    background: "#f8f6f2",
    borderRadius: "20px",
    padding: "18px",
    border: "1px solid #eee8df",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  }),
  rowMain: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
  },
  rowName: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#111",
    marginBottom: "4px",
  },
  rowDate: {
    color: "#777",
    fontSize: "13px",
    marginTop: "4px",
  },
  badgeGroup: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  originBadge: {
    padding: "10px 14px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
  },
  originIA: {
    background: "rgba(31,79,163,0.10)",
    color: "#1f4fa3",
  },
  originManual: {
    background: "rgba(201,31,40,0.10)",
    color: "#c91f28",
  },
  editButton: {
    padding: "10px 14px",
    borderRadius: "999px",
    border: "none",
    background: "rgba(17,17,17,0.10)",
    color: "#111",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  pdfButton: {
    padding: "10px 14px",
    borderRadius: "999px",
    border: "none",
    background: "rgba(31,79,163,0.10)",
    color: "#1f4fa3",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  deleteButton: {
    padding: "10px 14px",
    borderRadius: "999px",
    border: "none",
    background: "rgba(176, 0, 32, 0.10)",
    color: "#b00020",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  rowMiddle: (isMobile) => ({
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    flexDirection: isMobile ? "column" : "row",
  }),
  infoBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minWidth: "120px",
  },
  infoLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#8a8a8a",
    fontWeight: 700,
  },
  infoValue: {
    fontSize: "18px",
    color: "#111",
    fontWeight: 800,
  },
  infoValueSmall: {
    fontSize: "14px",
    color: "#111",
    fontWeight: 800,
  },
  itemsBox: {
    background: "#fff",
    borderRadius: "16px",
    padding: "14px",
    border: "1px solid #ebe3d8",
  },
  itemText: {
    color: "#444",
    fontSize: "14px",
    lineHeight: 1.6,
    marginTop: "4px",
  },
  messageBox: {
    background: "#fff",
    borderRadius: "16px",
    padding: "14px",
    border: "1px solid #ebe3d8",
  },
  messageLabel: {
    display: "block",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#8a8a8a",
    fontWeight: 700,
    marginBottom: "8px",
  },
  messageText: {
    color: "#444",
    fontSize: "14px",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
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
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "rgba(0,0,0,0.45)",
    padding: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    width: "100%",
    maxWidth: "1180px",
    maxHeight: "calc(100vh - 48px)",
    background: "#fff",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 22px 70px rgba(0,0,0,0.24)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    flexShrink: 0,
  },
  modalTitle: {
    fontSize: "28px",
    fontWeight: 900,
    color: "#111",
    letterSpacing: "-0.04em",
  },
  closeButton: {
    height: "42px",
    padding: "0 16px",
    borderRadius: "999px",
    border: "1px solid #ddd",
    background: "#fff",
    color: "#111",
    fontWeight: 800,
    cursor: "pointer",
  },
  editGrid: (isMobile) => ({
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "340px minmax(0, 1fr)",
    gap: "18px",
    minHeight: 0,
    overflow: "hidden",
  }),
  editSidebar: {
    minHeight: 0,
    overflowY: "auto",
    paddingRight: "4px",
  },
  editContent: {
    minHeight: 0,
    background: "#f8f6f2",
    borderRadius: "22px",
    border: "1px solid #eee8df",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  contentTitle: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#111",
    letterSpacing: "-0.03em",
    marginBottom: "14px",
    flexShrink: 0,
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
    outline: "none",
  },
  productSearchList: {
    maxHeight: "220px",
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
  editSummary: {
    marginTop: "18px",
    background: "#171921",
    color: "#fff",
    borderRadius: "22px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  darkMini: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.55)",
    fontWeight: 700,
  },
  darkBig: {
    fontSize: "34px",
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
  editItemsViewport: {
    minHeight: 0,
    overflowY: "auto",
    paddingRight: "4px",
  },
  editItemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  editItemCard: (isMobile) => ({
    background: "#fff",
    borderRadius: "20px",
    padding: "16px",
    border: "1px solid #eee8df",
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile ? "stretch" : "center",
    gap: "16px",
    flexDirection: isMobile ? "column" : "row",
  }),
  editItemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minWidth: 0,
  },
  itemImageBox: {
    width: "72px",
    height: "72px",
    borderRadius: "16px",
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
    fontSize: "11px",
    fontWeight: 700,
    textAlign: "center",
    padding: "6px",
  },
  editItemInfo: {
    minWidth: 0,
  },
  editItemName: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#111",
    letterSpacing: "-0.03em",
    marginBottom: "4px",
  },
  editItemRight: (isMobile) => ({
    display: "flex",
    alignItems: isMobile ? "stretch" : "center",
    gap: "14px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    flexDirection: isMobile ? "column" : "row",
  }),
  qtyEditBox: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  qtyInput: {
    width: "84px",
    height: "42px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    padding: "0 10px",
    outline: "none",
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

export default SalesHistory;
