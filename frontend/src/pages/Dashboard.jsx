import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useResponsive } from "../hooks/useResponsive";
import api, { getImageUrl } from "../services/api";

function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const { usuario } = useAuth();
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    async function carregarDashboard() {
      try {
        setLoading(true);
        setErro("");

        const [resumoResponse, rankingResponse] = await Promise.all([
          api.get("/dashboard"),
          api.get("/ranking"),
        ]);

        setResumo(resumoResponse.data);
        setRanking(rankingResponse.data.slice(0, 8));
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
        setErro("Erro ao carregar dashboard.");
      } finally {
        setLoading(false);
      }
    }

    carregarDashboard();
  }, []);

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  if (loading) {
    return <p>Carregando dashboard...</p>;
  }

  if (erro) {
    return <p style={styles.erro}>{erro}</p>;
  }

  return (
    <div style={styles.page}>
      <header style={styles.topBar(isMobile)}>
        <div>
          <p style={styles.greetingMini}>Painel principal</p>

          <h1 style={styles.greetingTitle(isMobile)}>
            Olá, {usuario?.nome?.split(" ")[0] || "Usuário"}!
          </h1>

          <p style={styles.greetingText}>
            Acompanhe as vendas da equipe e o desempenho da loja.
          </p>
        </div>

        <div style={styles.onlineBox(isMobile)}>
          <span style={styles.onlineDot}></span>
          <span style={styles.onlineText}>Seu sistema está online</span>
        </div>
      </header>

      <section
        style={styles.dashboardBoard(
          isMobile ? "1fr" : isTablet ? "1fr" : "1.35fr 0.85fr",
          isMobile
        )}
      >
        <div style={styles.leftColumn}>
          <div style={styles.highlightCard}>
            <div style={styles.highlightHeader}>
              <div>
                <p style={styles.sectionMini}>Resumo de vendas</p>
                <h2 style={styles.sectionTitle}>Resultados da operação</h2>
              </div>
            </div>

            <div
              style={styles.metricsGrid(
                isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))"
              )}
            >
              <div style={styles.metricCard}>
                <div>
                  <p style={styles.metricLabel}>Total vendido hoje</p>
                  <strong style={styles.metricValue(isMobile)}>
                    {formatarMoeda(resumo?.total_vendido_hoje)}
                  </strong>
                </div>

                <span style={styles.metricTagRed}>Hoje</span>
              </div>

              <div style={styles.metricCard}>
                <div>
                  <p style={styles.metricLabel}>Vendas realizadas hoje</p>
                  <strong style={styles.metricValue(isMobile)}>
                    {resumo?.quantidade_vendas_hoje || 0}
                  </strong>
                </div>

                <span style={styles.metricTagDark}>Dia</span>
              </div>

              <div style={styles.metricCard}>
                <div>
                  <p style={styles.metricLabel}>Total vendido na semana</p>
                  <strong style={styles.metricValue(isMobile)}>
                    {formatarMoeda(resumo?.total_vendido_semana)}
                  </strong>
                </div>

                <span style={styles.metricTagYellow}>Sex–Qui</span>
              </div>

              <div style={styles.metricCard}>
                <div>
                  <p style={styles.metricLabel}>Vendas na semana</p>
                  <strong style={styles.metricValue(isMobile)}>
                    {resumo?.quantidade_vendas_semana || 0}
                  </strong>
                </div>

                <span style={styles.metricTagBlue}>Semana</span>
              </div>

              <div style={styles.metricCard}>
                <div>
                  <p style={styles.metricLabel}>Total vendido no mês</p>
                  <strong style={styles.metricValue(isMobile)}>
                    {formatarMoeda(resumo?.total_vendido_mes)}
                  </strong>
                </div>

                <span style={styles.metricTagPurple}>Mês</span>
              </div>

              <div style={styles.metricCard}>
                <div>
                  <p style={styles.metricLabel}>Vendas realizadas no mês</p>
                  <strong style={styles.metricValue(isMobile)}>
                    {resumo?.quantidade_vendas_mes || 0}
                  </strong>
                </div>

                <span style={styles.metricTagDark}>Mensal</span>
              </div>
            </div>
          </div>

          <div
            style={styles.bottomGrid(
              isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))"
            )}
          >
            <div style={styles.infoCard}>
              <p style={styles.infoMini}>Hoje</p>

              <h3 style={styles.infoNumber}>
                {resumo?.quantidade_vendas_hoje || 0}
              </h3>

              <p style={styles.infoText}>
                vendas registradas no sistema durante o dia.
              </p>
            </div>

            <div style={styles.infoCard}>
              <p style={styles.infoMini}>Semana atual</p>

              <h3 style={styles.infoNumber}>
                {formatarMoeda(resumo?.total_vendido_semana)}
              </h3>

              <p style={styles.infoText}>
                acumulado desde sexta-feira até o momento.
              </p>
            </div>

            <div style={styles.infoCardDark}>
              <p style={styles.infoMiniDark}>Mês atual</p>

              <h3 style={styles.infoNumberDark}>
                {formatarMoeda(resumo?.total_vendido_mes)}
              </h3>

              <p style={styles.infoTextDark}>
                faturamento registrado durante o mês.
              </p>
            </div>
          </div>
        </div>

        <div style={styles.rightColumn}>
          <div style={styles.rankingCard}>
            <div style={styles.rankingHeader}>
              <div>
                <p style={styles.darkMini}>Equipe</p>
                <h3 style={styles.darkTitle}>Ranking de vendas</h3>
                <p style={styles.rankingDescription}>
                  Desempenho dos vendedores na semana atual.
                </p>
              </div>
            </div>

            <div style={styles.rankingScroll}>
              {ranking.length === 0 ? (
                <p style={styles.emptyDark}>
                  Nenhuma venda registrada ainda.
                </p>
              ) : (
                ranking.map((item) => {
                  const urlFoto = getImageUrl(item.foto_perfil);

                  return (
                    <div
                      key={item.usuario_id}
                      style={styles.rankRow(isMobile)}
                    >
                      <div style={styles.rankLeft}>
                        <span style={styles.rankPos}>
                          {item.posicao}
                        </span>

                        {urlFoto ? (
                          <img
                            src={urlFoto}
                            alt={item.usuario_nome}
                            style={styles.rankAvatar}
                          />
                        ) : (
                          <div style={styles.rankAvatarPlaceholder}>
                            {item.usuario_nome
                              ?.charAt(0)
                              ?.toUpperCase() || "U"}
                          </div>
                        )}

                        <div style={styles.rankUserInfo}>
                          <p style={styles.rankName}>
                            {item.usuario_nome}
                          </p>

                          <p style={styles.rankSub}>
                            {item.quantidade_vendas || 0}{" "}
                            {Number(item.quantidade_vendas) === 1
                              ? "venda"
                              : "vendas"}
                          </p>
                        </div>
                      </div>

                      <strong style={styles.rankValue}>
                        {formatarMoeda(item.total_vendido)}
                      </strong>
                    </div>
                  );
                })
              )}
            </div>

            <div style={styles.rankingFooter}>
              <p style={styles.rankingFooterTitle}>
                Semana de vendas
              </p>

              <p style={styles.rankingFooterText}>
                O ranking considera as vendas registradas de sexta-feira
                até quinta-feira e começa um novo período toda sexta-feira.
              </p>
            </div>
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
    gap: "18px",
  },

  erro: {
    color: "#b00020",
    fontWeight: 700,
  },

  topBar: (isMobile) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    flexWrap: "wrap",
    flexDirection: isMobile ? "column" : "row",
  }),

  greetingMini: {
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#7b7b7b",
    fontWeight: 700,
    marginBottom: "8px",
  },

  greetingTitle: (isMobile) => ({
    fontSize: isMobile ? "28px" : "36px",
    lineHeight: 1.05,
    fontWeight: 900,
    letterSpacing: "-0.05em",
    color: "#111",
    marginBottom: "10px",
  }),

  greetingText: {
    color: "#666",
    fontSize: "15px",
    lineHeight: 1.7,
  },

  onlineBox: (isMobile) => ({
    minWidth: isMobile ? "100%" : "250px",
    width: isMobile ? "100%" : "auto",
    background: "rgba(255,255,255,0.65)",
    border: "1px solid rgba(17,17,17,0.06)",
    height: "50px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 16px",
  }),

  onlineDot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: "#168a4a",
  },

  onlineText: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#666",
  },

  dashboardBoard: (columns, isMobile) => ({
    display: "grid",
    gridTemplateColumns: columns,
    gap: "18px",
    height: isMobile ? "auto" : "calc(100vh - 230px)",
    minHeight: isMobile ? "auto" : "620px",
  }),

  leftColumn: {
    display: "grid",
    gridTemplateRows: "minmax(0, 1fr) auto",
    gap: "18px",
    minHeight: 0,
  },

  rightColumn: {
    minHeight: 0,
  },

  highlightCard: {
    background: "#d8cec0",
    borderRadius: "24px",
    padding: "20px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },

  highlightHeader: {
    marginBottom: "16px",
  },

  sectionMini: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#6d655a",
    fontWeight: 700,
    marginBottom: "6px",
  },

  sectionTitle: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#111",
    letterSpacing: "-0.04em",
  },

  metricsGrid: (columns) => ({
    display: "grid",
    gridTemplateColumns: columns,
    gap: "12px",
    minHeight: 0,
    overflowY: "auto",
    paddingRight: "4px",
  }),

  metricCard: {
    background: "rgba(255,255,255,0.48)",
    border: "1px solid rgba(17,17,17,0.05)",
    borderRadius: "18px",
    padding: "17px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },

  metricLabel: {
    fontSize: "11px",
    color: "#5b5349",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: 700,
    marginBottom: "7px",
  },

  metricValue: (isMobile) => ({
    fontSize: isMobile ? "22px" : "25px",
    fontWeight: 900,
    color: "#111",
    letterSpacing: "-0.04em",
  }),

  metricTagRed: {
    padding: "7px 10px",
    borderRadius: "999px",
    background: "rgba(201,31,40,0.14)",
    color: "#8f1118",
    fontSize: "11px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  metricTagDark: {
    padding: "7px 10px",
    borderRadius: "999px",
    background: "#111",
    color: "#fff",
    fontSize: "11px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  metricTagYellow: {
    padding: "7px 10px",
    borderRadius: "999px",
    background: "rgba(241,203,58,0.32)",
    color: "#6f5700",
    fontSize: "11px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  metricTagBlue: {
    padding: "7px 10px",
    borderRadius: "999px",
    background: "rgba(31,79,163,0.16)",
    color: "#1f4fa3",
    fontSize: "11px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  metricTagPurple: {
    padding: "7px 10px",
    borderRadius: "999px",
    background: "rgba(120,70,255,0.15)",
    color: "#5d34d6",
    fontSize: "11px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  bottomGrid: (columns) => ({
    display: "grid",
    gridTemplateColumns: columns,
    gap: "18px",
  }),

  infoCard: {
    background: "#fff",
    borderRadius: "22px",
    padding: "18px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
  },

  infoCardDark: {
    background: "#171921",
    borderRadius: "22px",
    padding: "18px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
  },

  infoMini: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#777",
    fontWeight: 700,
    marginBottom: "10px",
  },

  infoMiniDark: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.55)",
    fontWeight: 700,
    marginBottom: "10px",
  },

  infoNumber: {
    fontSize: "27px",
    fontWeight: 900,
    color: "#111",
    letterSpacing: "-0.05em",
    marginBottom: "8px",
  },

  infoNumberDark: {
    fontSize: "27px",
    fontWeight: 900,
    color: "#fff",
    letterSpacing: "-0.05em",
    marginBottom: "8px",
  },

  infoText: {
    color: "#666",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  infoTextDark: {
    color: "rgba(255,255,255,0.62)",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  rankingCard: {
    height: "100%",
    background: "#171921",
    color: "#fff",
    borderRadius: "24px",
    padding: "20px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },

  rankingHeader: {
    marginBottom: "16px",
  },

  darkMini: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.55)",
    fontWeight: 700,
    marginBottom: "6px",
  },

  darkTitle: {
    fontSize: "23px",
    fontWeight: 800,
    letterSpacing: "-0.04em",
  },

  rankingDescription: {
    color: "rgba(255,255,255,0.55)",
    fontSize: "13px",
    marginTop: "7px",
    lineHeight: 1.5,
  },

  rankingScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    paddingRight: "4px",
    display: "flex",
    flexDirection: "column",
  },

  rankRow: (isMobile) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile ? "flex-start" : "center",
    gap: "12px",
    padding: "14px 0",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    flexDirection: isMobile ? "column" : "row",
  }),

  rankLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: 0,
  },

  rankPos: {
    width: "20px",
    fontWeight: 900,
    color: "#f1cb3a",
  },

  rankAvatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    objectFit: "cover",
  },

  rankAvatarPlaceholder: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#2b2f38",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "13px",
  },

  rankUserInfo: {
    minWidth: 0,
  },

  rankName: {
    fontSize: "14px",
    fontWeight: 700,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  rankSub: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.55)",
    marginTop: "3px",
  },

  rankValue: {
    fontSize: "14px",
    fontWeight: 800,
    color: "#fff",
    whiteSpace: "nowrap",
  },

  rankingFooter: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "15px",
    marginTop: "16px",
  },

  rankingFooterTitle: {
    fontSize: "13px",
    fontWeight: 800,
    color: "#fff",
    marginBottom: "5px",
  },

  rankingFooterText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: "12px",
    lineHeight: 1.55,
  },

  emptyDark: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "14px",
  },
};

export default Dashboard;