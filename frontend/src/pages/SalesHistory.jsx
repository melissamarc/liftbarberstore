import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function SalesHistory() {
  const [vendas, setVendas] = useState([]);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);
  const [itensEditados, setItensEditados] = useState([]);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    carregarVendas();
  }, []);

  async function carregarVendas() {
    try {
      setLoading(true);
      setErro("");

      const response = await api.get("/sales");
      setVendas(response.data);
    } catch (error) {
      setErro("Erro ao carregar histórico de vendas.");
    } finally {
      setLoading(false);
    }
  }

  async function verDetalhes(id) {
    try {
      setLoadingDetalhe(true);
      setErro("");
      setMensagem("");
      setModoEdicao(false);

      const response = await api.get(`/sales/${id}`);
      setVendaSelecionada(response.data);
      setItensEditados(
        response.data.itens.map((item) => ({
          produto_id: item.produto_id,
          produto_nome: item.produto_nome,
          quantidade: Number(item.quantidade),
          preco_unitario: Number(item.preco_unitario),
          subtotal: Number(item.subtotal),
        }))
      );
    } catch (error) {
      setErro("Erro ao carregar detalhes da venda.");
    } finally {
      setLoadingDetalhe(false);
    }
  }

  function fecharDetalhes() {
    setVendaSelecionada(null);
    setItensEditados([]);
    setModoEdicao(false);
    setMensagem("");
  }

  function iniciarEdicao() {
    setMensagem("");
    setErro("");
    setModoEdicao(true);
  }

  function cancelarEdicao() {
    if (!vendaSelecionada) return;

    setItensEditados(
      vendaSelecionada.itens.map((item) => ({
        produto_id: item.produto_id,
        produto_nome: item.produto_nome,
        quantidade: Number(item.quantidade),
        preco_unitario: Number(item.preco_unitario),
        subtotal: Number(item.subtotal),
      }))
    );
    setModoEdicao(false);
    setMensagem("");
    setErro("");
  }

  function alterarQuantidade(index, novaQuantidade) {
    const quantidade = Number(novaQuantidade);

    const novosItens = [...itensEditados];
    novosItens[index] = {
      ...novosItens[index],
      quantidade,
      subtotal: novosItens[index].preco_unitario * quantidade,
    };

    setItensEditados(novosItens);
  }

  function removerItem(index) {
    const novosItens = itensEditados.filter((_, i) => i !== index);
    setItensEditados(novosItens);
  }

  const totalEditado = useMemo(() => {
    return itensEditados.reduce((acc, item) => acc + Number(item.subtotal), 0);
  }, [itensEditados]);

  const vendasFiltradas = useMemo(() => {
    if (!busca.trim()) return vendas;

    const termo = busca.toLowerCase();

    return vendas.filter((venda) => {
      const usuario = venda.usuario_nome?.toLowerCase() || "";
      const origem = venda.origem?.toLowerCase() || "";
      const id = String(venda.id);

      return (
        usuario.includes(termo) ||
        origem.includes(termo) ||
        id.includes(termo)
      );
    });
  }, [vendas, busca]);

  async function salvarEdicao() {
    if (!vendaSelecionada) return;

    try {
      setSalvandoEdicao(true);
      setErro("");
      setMensagem("");

      if (itensEditados.length === 0) {
        setErro("A venda precisa ter pelo menos um item.");
        return;
      }

      if (itensEditados.some((item) => Number(item.quantidade) <= 0)) {
        setErro("Todas as quantidades devem ser maiores que zero.");
        return;
      }

      await api.put(`/sales/${vendaSelecionada.id}`, {
        itens: itensEditados.map((item) => ({
          produto_id: item.produto_id,
          quantidade: Number(item.quantidade),
        })),
      });

      setMensagem("Venda editada com sucesso.");
      setModoEdicao(false);

      await carregarVendas();
      await verDetalhes(vendaSelecionada.id);
    } catch (error) {
      setErro(error.response?.data?.message || "Erro ao editar venda.");
    } finally {
      setSalvandoEdicao(false);
    }
  }

  if (loading) {
    return <p>Carregando histórico...</p>;
  }

  return (
    <div style={styles.page}>
      <header style={styles.pageHeader}>
        <div>
          <p style={styles.pageMini}>Operação</p>
          <h1 style={styles.pageTitle}>Histórico de vendas</h1>
          <p style={styles.pageSubtitle}>
            Consulte, pesquise e edite as vendas registradas no sistema.
          </p>
        </div>
      </header>

      {erro && !vendaSelecionada && <p style={styles.erro}>{erro}</p>}

      <section style={styles.historyCard}>
        <div style={styles.toolbar}>
          <div style={styles.toolbarLeft}>
            <div style={styles.searchBox}>
              <span style={styles.searchIcon}>⌕</span>
              <input
                type="text"
                placeholder="Buscar por usuário, origem ou ID..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          <div style={styles.toolbarRight}>
            <div style={styles.counterPill}>
              {vendasFiltradas.length} vendas
            </div>
          </div>
        </div>

        <div style={styles.tableViewport}>
          {vendasFiltradas.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyTitle}>Nenhuma venda encontrada</p>
              <p style={styles.emptyText}>
                Tente mudar a busca ou registre novas vendas.
              </p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuário</th>
                  <th>Origem</th>
                  <th>Total</th>
                  <th>Editada</th>
                  <th>Data</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {vendasFiltradas.map((venda) => (
                  <tr key={venda.id}>
                    <td style={styles.idCell}>#{venda.id}</td>
                    <td>{venda.usuario_nome}</td>
                    <td>
                      <span
                        style={{
                          ...styles.statusPill,
                          ...(venda.origem === "ia"
                            ? styles.statusBlue
                            : styles.statusDark),
                        }}
                      >
                        {venda.origem === "ia" ? "IA" : "Manual"}
                      </span>
                    </td>
                    <td style={styles.totalCell}>
                      R$ {Number(venda.valor_total).toFixed(2)}
                    </td>
                    <td>
                      <span
                        style={{
                          ...styles.statusPill,
                          ...(venda.editada
                            ? styles.statusYellow
                            : styles.statusGreen),
                        }}
                      >
                        {venda.editada ? "Sim" : "Não"}
                      </span>
                    </td>
                    <td>{new Date(venda.data_criacao).toLocaleString("pt-BR")}</td>
                    <td>
                      <button
                        onClick={() => verDetalhes(venda.id)}
                        style={styles.actionButton}
                      >
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {loadingDetalhe && <p>Carregando detalhes...</p>}

      {vendaSelecionada && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalTop}>
              <div>
                <h2 style={styles.modalTitle}>Venda #{vendaSelecionada.id}</h2>
                <p style={styles.modalSubtitle}>
                  {vendaSelecionada.origem === "ia" ? "Origem IA" : "Origem manual"} •{" "}
                  {new Date(vendaSelecionada.data_criacao).toLocaleString("pt-BR")}
                </p>
              </div>

              {!modoEdicao ? (
                <button onClick={iniciarEdicao} style={styles.editMainButton}>
                  Editar venda
                </button>
              ) : (
                <div style={styles.editActions}>
                  <button onClick={cancelarEdicao} style={styles.cancelButton}>
                    Cancelar
                  </button>
                  <button
                    onClick={salvarEdicao}
                    disabled={salvandoEdicao}
                    style={styles.saveButton}
                  >
                    {salvandoEdicao ? "Salvando..." : "Salvar edição"}
                  </button>
                </div>
              )}
            </div>

            {erro && <p style={styles.erro}>{erro}</p>}
            {mensagem && <p style={styles.sucesso}>{mensagem}</p>}

            <div style={styles.infoGrid}>
              <div style={styles.infoCard}>
                <span style={styles.infoLabel}>Usuário</span>
                <strong style={styles.infoValue}>{vendaSelecionada.usuario_nome}</strong>
              </div>

              <div style={styles.infoCard}>
                <span style={styles.infoLabel}>Email</span>
                <strong style={styles.infoValue}>{vendaSelecionada.usuario_email}</strong>
              </div>

              <div style={styles.infoCard}>
                <span style={styles.infoLabel}>Total</span>
                <strong style={styles.infoValue}>
                  R$ {(modoEdicao ? totalEditado : Number(vendaSelecionada.valor_total)).toFixed(2)}
                </strong>
              </div>

              <div style={styles.infoCard}>
                <span style={styles.infoLabel}>Editada</span>
                <strong style={styles.infoValue}>
                  {vendaSelecionada.editada ? "Sim" : "Não"}
                </strong>
              </div>
            </div>

            {vendaSelecionada.texto_original && (
              <div style={styles.messageBox}>
                <strong style={styles.messageTitle}>Mensagem original</strong>
                <p style={styles.messageText}>{vendaSelecionada.texto_original}</p>
              </div>
            )}

            <div style={styles.itemsSection}>
              <h3 style={styles.itemsTitle}>Itens da venda</h3>

              {itensEditados.length === 0 ? (
                <p>Nenhum item encontrado.</p>
              ) : (
                <div style={styles.itemsList}>
                  {itensEditados.map((item, index) => (
                    <div key={`${item.produto_id}-${index}`} style={styles.itemCard}>
                      <div>
                        <p style={styles.itemName}>{item.produto_nome}</p>
                        <p style={styles.itemMeta}>
                          R$ {Number(item.preco_unitario).toFixed(2)} por unidade
                        </p>
                      </div>

                      <div style={styles.itemRight}>
                        <div style={styles.itemBlock}>
                          <span style={styles.itemBlockLabel}>Qtd.</span>
                          {modoEdicao ? (
                            <input
                              type="number"
                              min="1"
                              value={item.quantidade}
                              onChange={(e) => alterarQuantidade(index, e.target.value)}
                              style={styles.qtyInput}
                            />
                          ) : (
                            <strong style={styles.itemBlockValue}>{item.quantidade}</strong>
                          )}
                        </div>

                        <div style={styles.itemBlock}>
                          <span style={styles.itemBlockLabel}>Subtotal</span>
                          <strong style={styles.itemBlockValue}>
                            R$ {Number(item.subtotal).toFixed(2)}
                          </strong>
                        </div>

                        {modoEdicao && (
                          <button
                            onClick={() => removerItem(index)}
                            style={styles.removeButton}
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={fecharDetalhes} style={styles.closeButton}>
              Fechar
            </button>
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
  sucesso: {
    color: "#0a7d32",
    fontWeight: 600,
  },
  historyCard: {
    background: "#fff",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    height: "calc(100vh - 230px)",
    minHeight: "620px",
    maxHeight: "620px",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    flexShrink: 0,
  },
  toolbarLeft: {
    flex: 1,
    minWidth: "280px",
  },
  toolbarRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  searchBox: {
    width: "100%",
    maxWidth: "420px",
    height: "54px",
    background: "#f5f2ec",
    borderRadius: "16px",
    display: "grid",
    gridTemplateColumns: "24px 1fr",
    alignItems: "center",
    gap: "10px",
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
    fontSize: "14px",
    color: "#111",
  },
  counterPill: {
    padding: "12px 16px",
    borderRadius: "999px",
    background: "rgba(31,79,163,0.10)",
    color: "#1f4fa3",
    fontSize: "13px",
    fontWeight: 800,
  },
  tableViewport: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    borderRadius: "18px",
    border: "1px solid #eee8df",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
  },
  idCell: {
    fontWeight: 800,
    color: "#1f4fa3",
  },
  totalCell: {
    fontWeight: 800,
    color: "#111",
  },
  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
    minWidth: "72px",
  },
  statusBlue: {
    background: "rgba(31,79,163,0.10)",
    color: "#1f4fa3",
  },
  statusDark: {
    background: "#111",
    color: "#fff",
  },
  statusGreen: {
    background: "rgba(18, 130, 70, 0.14)",
    color: "#0b7f44",
  },
  statusYellow: {
    background: "rgba(241,203,58,0.28)",
    color: "#7a6100",
  },
  actionButton: {
    height: "40px",
    padding: "0 14px",
    borderRadius: "12px",
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  emptyState: {
    background: "#f8f6f2",
    borderRadius: "20px",
    padding: "32px",
    textAlign: "center",
    margin: "18px",
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
    maxWidth: "980px",
    background: "#fff",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },
  modalTitle: {
    fontSize: "28px",
    fontWeight: 900,
    color: "#111",
    letterSpacing: "-0.04em",
    marginBottom: "6px",
  },
  modalSubtitle: {
    color: "#666",
    fontSize: "14px",
  },
  editMainButton: {
    height: "48px",
    padding: "0 18px",
    borderRadius: "14px",
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  editActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  cancelButton: {
    height: "48px",
    padding: "0 18px",
    borderRadius: "14px",
    border: "1px solid #ddd",
    background: "#fff",
    color: "#111",
    fontWeight: 700,
    cursor: "pointer",
  },
  saveButton: {
    height: "48px",
    padding: "0 18px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #c91f28 0%, #9f161e 100%)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    marginTop: "18px",
    marginBottom: "18px",
  },
  infoCard: {
    background: "#f8f6f2",
    borderRadius: "18px",
    padding: "16px",
    border: "1px solid #eee8df",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  infoLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#7b7b7b",
    fontWeight: 700,
  },
  infoValue: {
    fontSize: "16px",
    color: "#111",
    fontWeight: 800,
  },
  messageBox: {
    background: "#f5f2ec",
    borderRadius: "18px",
    padding: "18px",
    marginBottom: "18px",
  },
  messageTitle: {
    display: "block",
    color: "#111",
    marginBottom: "8px",
    fontSize: "15px",
  },
  messageText: {
    color: "#555",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
  },
  itemsSection: {
    marginTop: "8px",
  },
  itemsTitle: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#111",
    marginBottom: "16px",
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  itemCard: {
    background: "#f8f6f2",
    borderRadius: "18px",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    border: "1px solid #eee8df",
  },
  itemName: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#111",
    marginBottom: "4px",
  },
  itemMeta: {
    color: "#666",
    fontSize: "13px",
  },
  itemRight: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  itemBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minWidth: "90px",
  },
  itemBlockLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#7b7b7b",
    fontWeight: 700,
  },
  itemBlockValue: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#111",
  },
  qtyInput: {
    width: "84px",
    height: "42px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    padding: "0 10px",
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
  closeButton: {
    marginTop: "20px",
    height: "48px",
    padding: "0 18px",
    borderRadius: "14px",
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
};

export default SalesHistory;    