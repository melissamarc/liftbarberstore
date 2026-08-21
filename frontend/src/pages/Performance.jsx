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

  return (
    <div style={styles.page}>
      <header style={styles.pageHeader(isMobile)}>
        <div>
          <p style={styles.pageMini}>Equipe</p>

          <h1 style={styles.pageTitle(isMobile)}>
            Desempenho dos funcionários
          </h1>

          <p style={styles.pageSubtitle}>
            Compare os resultados de vendas de cada funcionário por período.
          </p>
        </div>

        <div style={styles.periodBadge}>
          {obterNomePeriodo()}
        </div>
      </header>

      {erro && <p style={styles.erro}>{erro}</p>}

      <section
        style={styles.summaryGrid(
          isMobile
            ? "1fr"
            : isTablet
            ? "repeat(2, minmax(0, 1fr))"
            : "repeat(3, minmax(0, 1fr))"
        )}
      >
        <div style={styles.summaryCard}>
          <p style={styles.summaryMini}>Total vendido</p>

          <h3 style={styles.summaryValue}>
            {formatarMoeda(resumo.totalVendido)}
          </h3>

          <p style={styles.summaryText}>
            valor total registrado pela equipe no período.
          </p>
        </div>

        <div style={styles.summaryCard}>
          <p style={styles.summaryMini}>Quantidade de vendas</p>

          <h3 style={styles.summaryValue}>
            {resumo.totalVendas}
          </h3>

          <p style={styles.summaryText}>
            vendas registradas por todos os funcionários.
          </p>
        </div>

        <div style={styles.summaryCardDark}>
          <p style={styles.summaryMiniDark}>
            Melhor desempenho
          </p>

          <h3 style={styles.bestEmployeeName}>
            {resumo.melhorFuncionario?.usuario_nome || "Sem vendas"}
          </h3>

          <p style={styles.bestEmployeeValue}>
            {resumo.melhorFuncionario
              ? formatarMoeda(
                  resumo.melhorFuncionario.total_vendido
                )
              : formatarMoeda(0)}
          </p>
        </div>
      </section>

      <section style={styles.tableCard}>
        <div style={styles.tableHeader(isMobile)}>
          <div>
            <p style={styles.tableMini}>Comparativo</p>
            <h2 style={styles.tableTitle}>
              Vendas por funcionário
            </h2>
          </div>

          <div style={styles.filters(isMobile)}>
            <button
              type="button"
              onClick={() => setPeriodo("semana")}
              style={{
                ...styles.filterButton,
                ...(periodo === "semana"
                  ? styles.filterButtonActive
                  : {}),
              }}
            >
              Semana
            </button>

            <button
              type="button"
              onClick={() => setPeriodo("mes")}
              style={{
                ...styles.filterButton,
                ...(periodo === "mes"
                  ? styles.filterButtonActive
                  : {}),
              }}
            >
              Mês
            </button>

            <button
              type="button"
              onClick={() => setPeriodo("6meses")}
              style={{
                ...styles.filterButton,
                ...(periodo === "6meses"
                  ? styles.filterButtonActive
                  : {}),
              }}
            >
              6 meses
            </button>

            <button
              type="button"
              onClick={() => setPeriodo("ano")}
              style={{
                ...styles.filterButton,
                ...(periodo === "ano"
                  ? styles.filterButtonActive
                  : {}),
              }}
            >
              Ano
            </button>
          </div>
        </div>

        <div style={styles.tableViewport}>
          {loading ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyTitle}>
                Carregando desempenho...
              </p>
            </div>
          ) : dados.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyTitle}>
                Nenhum funcionário encontrado
              </p>

              <p style={styles.emptyText}>
                Ainda não há dados disponíveis para o período.
              </p>
            </div>
          ) : isMobile ? (
            <div style={styles.mobileList}>
              {dados.map((item) => {
                const fotoUrl = getImageUrl(item.foto_perfil);

                return (
                  <div
                    key={item.usuario_id}
                    style={styles.mobileCard}
                  >
                    <div style={styles.mobileCardTop}>
                      <div style={styles.employeeIdentity}>
                        <span style={styles.positionBadge}>
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

                        <div>
                          <p style={styles.employeeName}>
                            {item.usuario_nome}
                          </p>

                          <p style={styles.employeeEmail}>
                            {item.usuario_email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={styles.mobileStats}>
                      <div style={styles.mobileStat}>
                        <span style={styles.statLabel}>
                          Vendas
                        </span>

                        <strong style={styles.statValue}>
                          {item.quantidade_vendas}
                        </strong>
                      </div>

                      <div style={styles.mobileStat}>
                        <span style={styles.statLabel}>
                          Total vendido
                        </span>

                        <strong style={styles.statValue}>
                          {formatarMoeda(item.total_vendido)}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.thPosition}>#</th>
                  <th style={styles.th}>Funcionário</th>
                  <th style={styles.th}>Vendas</th>
                  <th style={styles.thRight}>
                    Total vendido
                  </th>
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
                        <span style={styles.positionBadge}>
                          {item.posicao}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <div style={styles.employeeIdentity}>
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
                        <strong style={styles.salesCount}>
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

  periodBadge: {
    padding: "11px 16px",
    borderRadius: "999px",
    background: "rgba(31,79,163,0.10)",
    color: "#1f4fa3",
    fontSize: "13px",
    fontWeight: 800,
  },

  erro: {
    color: "#b00020",
    fontWeight: 700,
  },

  summaryGrid: (columns) => ({
    display: "grid",
    gridTemplateColumns: columns,
    gap: "16px",
  }),

  summaryCard: {
    background: "#fff",
    borderRadius: "22px",
    padding: "20px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
  },

  summaryCardDark: {
    background: "#171921",
    color: "#fff",
    borderRadius: "22px",
    padding: "20px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
  },

  summaryMini: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#777",
    fontWeight: 700,
    marginBottom: "10px",
  },

  summaryMiniDark: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.55)",
    fontWeight: 700,
    marginBottom: "10px",
  },

  summaryValue: {
    fontSize: "30px",
    fontWeight: 900,
    letterSpacing: "-0.05em",
    color: "#111",
    marginBottom: "8px",
  },

  summaryText: {
    color: "#666",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  bestEmployeeName: {
    fontSize: "24px",
    fontWeight: 900,
    color: "#fff",
    letterSpacing: "-0.04em",
    marginBottom: "6px",
  },

  bestEmployeeValue: {
    color: "#f1cb3a",
    fontSize: "18px",
    fontWeight: 800,
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

  tableHeader: (isMobile) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile ? "stretch" : "center",
    flexDirection: isMobile ? "column" : "row",
    gap: "16px",
  }),

  tableMini: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#7b7b7b",
    fontWeight: 700,
    marginBottom: "6px",
  },

  tableTitle: {
    fontSize: "22px",
    fontWeight: 800,
    letterSpacing: "-0.04em",
    color: "#111",
  },

  filters: (isMobile) => ({
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    width: isMobile ? "100%" : "auto",
  }),

  filterButton: {
    minHeight: "40px",
    padding: "0 14px",
    borderRadius: "999px",
    border: "1px solid #ddd",
    background: "#fff",
    color: "#555",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
  },

  filterButtonActive: {
    background: "#111",
    color: "#fff",
    borderColor: "#111",
  },

  tableViewport: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "700px",
  },

  thPosition: {
    width: "70px",
    padding: "13px",
    textAlign: "left",
    color: "#888",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    borderBottom: "1px solid #eee8df",
  },

  th: {
    padding: "13px",
    textAlign: "left",
    color: "#888",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    borderBottom: "1px solid #eee8df",
  },

  thRight: {
    padding: "13px",
    textAlign: "right",
    color: "#888",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    borderBottom: "1px solid #eee8df",
  },

  tableRow: {
    borderBottom: "1px solid #f0ece5",
  },

  tdPosition: {
    padding: "15px 13px",
  },

  td: {
    padding: "15px 13px",
  },

  tdRight: {
    padding: "15px 13px",
    textAlign: "right",
  },

  positionBadge: {
    width: "30px",
    height: "30px",
    borderRadius: "10px",
    background: "#f5f2ec",
    color: "#111",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 900,
  },

  employeeIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  },

  employeeText: {
    minWidth: 0,
  },

  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
  },

  avatarPlaceholder: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#171921",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 800,
    flexShrink: 0,
  },

  employeeName: {
    fontSize: "14px",
    fontWeight: 800,
    color: "#111",
    marginBottom: "3px",
  },

  employeeEmail: {
    color: "#888",
    fontSize: "12px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  salesCount: {
    color: "#111",
    fontSize: "15px",
    fontWeight: 800,
  },

  totalValue: {
    color: "#111",
    fontSize: "15px",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },

  mobileList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  mobileCard: {
    background: "#f8f6f2",
    border: "1px solid #eee8df",
    borderRadius: "18px",
    padding: "15px",
  },

  mobileCardTop: {
    marginBottom: "14px",
  },

  mobileStats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },

  mobileStat: {
    background: "#fff",
    borderRadius: "14px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  statLabel: {
    fontSize: "10px",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    fontWeight: 700,
  },

  statValue: {
    fontSize: "14px",
    fontWeight: 900,
    color: "#111",
  },

  emptyBox: {
    borderRadius: "20px",
    background: "#f8f6f2",
    padding: "32px",
    textAlign: "center",
  },

  emptyTitle: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#111",
    marginBottom: "7px",
  },

  emptyText: {
    color: "#666",
    fontSize: "14px",
  },
};

export default Performance;