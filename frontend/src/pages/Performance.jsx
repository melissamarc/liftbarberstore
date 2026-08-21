import { useEffect, useMemo, useState } from "react";
import api, { getImageUrl } from "../services/api";
import { useResponsive } from "../hooks/useResponsive";

function Performance() {
  const [periodo, setPeriodo] = useState("semana");
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    carregarDesempenho(periodo);
  }, [periodo]);

  async function carregarDesempenho(periodoSelecionado) {
    try {
      setLoading(true);
      setErro("");

      const response = await api.get("/performance", {
        params: {
          periodo: periodoSelecionado,
        },
      });

      setDados(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar desempenho:", error);

      setErro(
        error.response?.data?.message ||
          "Erro ao carregar desempenho dos funcionários."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const resumo = useMemo(() => {
    const totalVendido = dados.reduce(
      (acc, item) => acc + Number(item.total_vendido || 0),
      0
    );

    const totalVendas = dados.reduce(
      (acc, item) => acc + Number(item.quantidade_vendas || 0),
      0
    );

    const melhorFuncionario =
      dados.length > 0 && Number(dados[0]?.total_vendido || 0) > 0
        ? dados[0]
        : null;

    return {
      totalVendido,
      totalVendas,
      melhorFuncionario,
    };
  }, [dados]);

  function obterNomePeriodo() {
    if (periodo === "semana") return "Semana atual";
    if (periodo === "mes") return "Mês atual";
    if (periodo === "6meses") return "Últimos 6 meses";
    if (periodo === "ano") return "Ano atual";

    return "Período";
  }

  const filtros = [
    { value: "semana", label: "Semana" },
    { value: "mes", label: "Mês" },
    { value: "6meses", label: "6 meses" },
    { value: "ano", label: "Ano" },
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header(isMobile)}>
        <div>
          <p style={styles.eyebrow}>Equipe</p>

          <h1 style={styles.title(isMobile)}>
            Desempenho dos funcionários
          </h1>

          <p style={styles.subtitle}>
            Acompanhe as vendas individuais da equipe por período.
          </p>
        </div>

        <div style={styles.currentPeriod}>
          {obterNomePeriodo()}
        </div>
      </header>

      <div style={styles.filtersWrap(isMobile)}>
        {filtros.map((filtro) => (
          <button
            key={filtro.value}
            type="button"
            onClick={() => setPeriodo(filtro.value)}
            style={{
              ...styles.filterButton,
              ...(periodo === filtro.value
                ? styles.filterButtonActive
                : {}),
            }}
          >
            {filtro.label}
          </button>
        ))}
      </div>

      {erro && <div style={styles.errorBox}>{erro}</div>}

      <section
        style={styles.summaryGrid(
          isMobile
            ? "1fr"
            : isTablet
            ? "repeat(2, minmax(0, 1fr))"
            : "repeat(3, minmax(0, 1fr))"
        )}
      >
        <div style={styles.summaryItem}>
          <p style={styles.summaryLabel}>Total vendido</p>

          <h2 style={styles.summaryValue}>
            {formatarMoeda(resumo.totalVendido)}
          </h2>

          <p style={styles.summaryHint}>
            valor acumulado no período
          </p>
        </div>

        <div style={styles.summaryItem}>
          <p style={styles.summaryLabel}>Quantidade de vendas</p>

          <h2 style={styles.summaryValue}>
            {resumo.totalVendas}
          </h2>

          <p style={styles.summaryHint}>
            vendas registradas pela equipe
          </p>
        </div>

        <div style={styles.summaryItem}>
          <p style={styles.summaryLabel}>Maior resultado</p>

          <h2 style={styles.summaryName}>
            {resumo.melhorFuncionario?.usuario_nome || "Sem vendas"}
          </h2>

          <p style={styles.summaryHighlight}>
            {resumo.melhorFuncionario
              ? formatarMoeda(resumo.melhorFuncionario.total_vendido)
              : formatarMoeda(0)}
          </p>
        </div>
      </section>

      <section style={styles.tableSection}>
        <div style={styles.tableHeader}>
          <div>
            <p style={styles.tableEyebrow}>Comparativo</p>

            <h2 style={styles.tableTitle}>
              Vendas por funcionário
            </h2>
          </div>
        </div>

        {loading ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyTitle}>
              Carregando desempenho...
            </p>
          </div>
        ) : dados.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyTitle}>
              Nenhum dado encontrado
            </p>

            <p style={styles.emptyText}>
              Ainda não existem vendas registradas neste período.
            </p>
          </div>
        ) : isMobile ? (
          <div style={styles.mobileList}>
            {dados.map((item) => {
              const fotoUrl = getImageUrl(item.foto_perfil);

              return (
                <div
                  key={item.usuario_id}
                  style={styles.mobileRow}
                >
                  <div style={styles.mobileTop}>
                    <div style={styles.employee}>
                      <span style={styles.position}>
                        {item.posicao}
                      </span>

                      {fotoUrl ? (
                        <img
                          src={fotoUrl}
                          alt={item.usuario_nome}
                          style={styles.avatar}
                        />
                      ) : (
                        <div style={styles.avatarPlaceholder}>
                          {item.usuario_nome
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>
                      )}

                      <div style={styles.employeeText}>
                        <p style={styles.employeeName}>
                          {item.usuario_nome}
                        </p>

                        <p style={styles.employeeEmail}>
                          {item.usuario_email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={styles.mobileMetrics}>
                    <div>
                      <span style={styles.metricLabel}>
                        Vendas
                      </span>

                      <strong style={styles.metricValue}>
                        {item.quantidade_vendas}
                      </strong>
                    </div>

                    <div style={styles.mobileTotal}>
                      <span style={styles.metricLabel}>
                        Total vendido
                      </span>

                      <strong style={styles.metricValue}>
                        {formatarMoeda(item.total_vendido)}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.thPosition}>#</th>
                  <th style={styles.th}>Funcionário</th>
                  <th style={styles.th}>Vendas</th>
                  <th style={styles.thRight}>Total vendido</th>
                </tr>
              </thead>

              <tbody>
                {dados.map((item) => {
                  const fotoUrl = getImageUrl(item.foto_perfil);

                  return (
                    <tr
                      key={item.usuario_id}
                      style={styles.tableRow}
                    >
                      <td style={styles.tdPosition}>
                        <span style={styles.position}>
                          {item.posicao}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <div style={styles.employee}>
                          {fotoUrl ? (
                            <img
                              src={fotoUrl}
                              alt={item.usuario_nome}
                              style={styles.avatar}
                            />
                          ) : (
                            <div style={styles.avatarPlaceholder}>
                              {item.usuario_nome
                                ?.charAt(0)
                                ?.toUpperCase() || "U"}
                            </div>
                          )}

                          <div style={styles.employeeText}>
                            <p style={styles.employeeName}>
                              {item.usuario_nome}
                            </p>

                            <p style={styles.employeeEmail}>
                              {item.usuario_email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td style={styles.td}>
                        <strong style={styles.salesValue}>
                          {item.quantidade_vendas}
                        </strong>
                      </td>

                      <td style={styles.tdRight}>
                        <strong style={styles.totalValue}>
                          {formatarMoeda(item.total_vendido)}
                        </strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
    gap: "24px",
  },

  header: (isMobile) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile ? "flex-start" : "center",
    flexDirection: isMobile ? "column" : "row",
    gap: "16px",
  }),

  eyebrow: {
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#9a948d",
    marginBottom: "7px",
  },

  title: (isMobile) => ({
    fontSize: isMobile ? "28px" : "34px",
    fontWeight: 800,
    letterSpacing: "-0.04em",
    color: "#1a1918",
  }),

  subtitle: {
    marginTop: "7px",
    fontSize: "14px",
    color: "#77716b",
    lineHeight: 1.6,
  },

  currentPeriod: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#6b655f",
    background: "#f7f4f0",
    border: "1px solid #e9e4dd",
    borderRadius: "999px",
    padding: "10px 14px",
    whiteSpace: "nowrap",
  },

  filtersWrap: (isMobile) => ({
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    width: isMobile ? "100%" : "fit-content",
    padding: "4px",
    background: "#f3efea",
    borderRadius: "12px",
  }),

  filterButton: {
    height: "38px",
    padding: "0 15px",
    border: "none",
    borderRadius: "9px",
    background: "transparent",
    color: "#77716b",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },

  filterButtonActive: {
    background: "#fff",
    color: "#1a1918",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },

  errorBox: {
    background: "#fff7f7",
    border: "1px solid #f1d9da",
    borderRadius: "12px",
    padding: "12px 14px",
    color: "#a7272e",
    fontSize: "14px",
    fontWeight: 600,
  },

  summaryGrid: (columns) => ({
    display: "grid",
    gridTemplateColumns: columns,
    gap: "14px",
    borderTop: "1px solid #e9e4dd",
    borderBottom: "1px solid #e9e4dd",
    padding: "22px 0",
  }),

  summaryItem: {
    minWidth: 0,
    padding: "4px 16px",
  },

  summaryLabel: {
    fontSize: "12px",
    color: "#918b84",
    fontWeight: 700,
    marginBottom: "10px",
  },

  summaryValue: {
    fontSize: "28px",
    fontWeight: 800,
    letterSpacing: "-0.04em",
    color: "#1a1918",
    marginBottom: "6px",
  },

  summaryName: {
    fontSize: "22px",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    color: "#1a1918",
    marginBottom: "6px",
  },

  summaryHint: {
    fontSize: "12px",
    color: "#aaa39c",
  },

  summaryHighlight: {
    fontSize: "13px",
    color: "#a71f27",
    fontWeight: 700,
  },

  tableSection: {
    background: "#fff",
    border: "1px solid #e9e4dd",
    borderRadius: "16px",
    overflow: "hidden",
  },

  tableHeader: {
    padding: "20px 22px 16px",
    borderBottom: "1px solid #eee9e3",
  },

  tableEyebrow: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#aaa39c",
    marginBottom: "5px",
  },

  tableTitle: {
    fontSize: "19px",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    color: "#1a1918",
  },

  tableWrap: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "680px",
  },

  thPosition: {
    width: "70px",
    padding: "13px 18px",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: 700,
    color: "#aaa39c",
    borderBottom: "1px solid #eee9e3",
  },

  th: {
    padding: "13px 18px",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: 700,
    color: "#aaa39c",
    borderBottom: "1px solid #eee9e3",
  },

  thRight: {
    padding: "13px 18px",
    textAlign: "right",
    fontSize: "11px",
    fontWeight: 700,
    color: "#aaa39c",
    borderBottom: "1px solid #eee9e3",
  },

  tableRow: {
    borderBottom: "1px solid #f1ede8",
  },

  tdPosition: {
    padding: "14px 18px",
  },

  td: {
    padding: "14px 18px",
  },

  tdRight: {
    padding: "14px 18px",
    textAlign: "right",
  },

  position: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    background: "#f5f2ee",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#77716b",
    fontSize: "12px",
    fontWeight: 800,
  },

  employee: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    minWidth: 0,
  },

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
  },

  avatarPlaceholder: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#eee9e3",
    color: "#5f5953",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "13px",
    fontWeight: 800,
    flexShrink: 0,
  },

  employeeText: {
    minWidth: 0,
  },

  employeeName: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#1a1918",
    marginBottom: "3px",
  },

  employeeEmail: {
    fontSize: "12px",
    color: "#9b958e",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  salesValue: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#514c47",
  },

  totalValue: {
    fontSize: "14px",
    fontWeight: 800,
    color: "#1a1918",
    whiteSpace: "nowrap",
  },

  mobileList: {
    display: "flex",
    flexDirection: "column",
  },

  mobileRow: {
    padding: "16px",
    borderBottom: "1px solid #eee9e3",
  },

  mobileTop: {
    marginBottom: "14px",
  },

  mobileMetrics: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    paddingLeft: "39px",
  },

  mobileTotal: {
    textAlign: "right",
  },

  metricLabel: {
    display: "block",
    fontSize: "11px",
    color: "#aaa39c",
    marginBottom: "4px",
  },

  metricValue: {
    fontSize: "14px",
    color: "#1a1918",
    fontWeight: 800,
  },

  emptyState: {
    padding: "42px 20px",
    textAlign: "center",
  },

  emptyTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#514c47",
    marginBottom: "6px",
  },

  emptyText: {
    fontSize: "13px",
    color: "#9b958e",
  },
};

export default Performance;