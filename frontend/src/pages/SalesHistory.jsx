import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useResponsive } from "../hooks/useResponsive";

function SalesHistory() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");

  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    async function carregarHistorico() {
      try {
        setLoading(true);
        setErro("");

        const response = await api.get("/sales");
        setVendas(response.data);
      } catch (error) {
        setErro("Erro ao carregar histórico.");
      } finally {
        setLoading(false);
      }
    }

    carregarHistorico();
  }, []);

  const vendasFiltradas = useMemo(() => {
    if (!busca.trim()) return vendas;

    const termo = busca.toLowerCase();

    return vendas.filter((venda) => {
      const nome = venda.usuario_nome?.toLowerCase() || "";
      const origem = venda.origem?.toLowerCase() || "";
      const texto = venda.texto_original?.toLowerCase() || "";

      return (
        nome.includes(termo) ||
        origem.includes(termo) ||
        texto.includes(termo)
      );
    });
  }, [vendas, busca]);

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
            Visualize as vendas registradas e acompanhe a origem e o total de cada uma.
          </p>
        </div>

        <div style={styles.totalBadge}>
          {vendasFiltradas.length} {vendasFiltradas.length === 1 ? "venda" : "vendas"}
        </div>
      </header>

      {erro && <p style={styles.erro}>{erro}</p>}

      <section style={styles.tableCard}>
        <div style={styles.toolbar(isMobile)}>
          <div style={styles.searchBox(isMobile)}>
            <span style={styles.searchIcon}>⌕</span>
            <input
              type="text"
              placeholder="Buscar por vendedor, origem ou mensagem..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        <div style={styles.tableViewport(isMobile)}>
          {vendasFiltradas.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyTitle}>Nenhuma venda encontrada</p>
              <p style={styles.emptyText}>
                Tente mudar o filtro ou registre novas vendas.
              </p>
            </div>
          ) : (
            <div style={styles.rows}>
              {vendasFiltradas.map((venda) => (
                <div key={venda.id} style={styles.rowCard(isMobile)}>
                  <div style={styles.rowMain}>
                    <div>
                      <p style={styles.rowName}>{venda.usuario_nome}</p>
                      <p style={styles.rowDate}>
                        {new Date(venda.data_criacao).toLocaleString("pt-BR")}
                      </p>
                    </div>

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
                  </div>

                  <div style={styles.rowMiddle(isMobile)}>
                    <div style={styles.infoBlock}>
                      <span style={styles.infoLabel}>Total</span>
                      <strong style={styles.infoValue}>
                        R$ {Number(venda.valor_total).toFixed(2)}
                      </strong>
                    </div>

                    <div style={styles.infoBlock}>
                      <span style={styles.infoLabel}>Editada</span>
                      <strong style={styles.infoValue}>
                        {venda.editada ? "Sim" : "Não"}
                      </strong>
                    </div>
                  </div>

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
  totalBadge: {
    padding: "12px 16px",
    borderRadius: "999px",
    background: "rgba(31,79,163,0.10)",
    color: "#1f4fa3",
    fontSize: "13px",
    fontWeight: 800,
  },
  erro: {
    color: "#b00020",
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
  },
  toolbar: (isMobile) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile ? "stretch" : "center",
    flexDirection: isMobile ? "column" : "row",
    gap: "16px",
  }),
  searchBox: (isMobile) => ({
    width: "100%",
    maxWidth: isMobile ? "100%" : "420px",
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
  tableViewport: (isMobile) => ({
    minHeight: 0,
    overflowY: isMobile ? "visible" : "auto",
    paddingRight: isMobile ? "0" : "4px",
  }),
  rows: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  rowCard: (isMobile) => ({
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
};

export default SalesHistory;