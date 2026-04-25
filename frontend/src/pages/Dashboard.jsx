import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useResponsive } from "../hooks/useResponsive";
import api, { getImageUrl } from "../services/api";

function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [topProdutos, setTopProdutos] = useState([]);
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

        const [resumoResponse, produtosResponse, rankingResponse] =
          await Promise.all([
            api.get("/dashboard"),
            api.get("/dashboard/top-products"),
            api.get("/ranking"),
          ]);

        setResumo(resumoResponse.data);
        setTopProdutos(produtosResponse.data);
        setRanking(rankingResponse.data.slice(0, 8));
      } catch (error) {
        setErro("Erro ao carregar dashboard.");
      } finally {
        setLoading(false);
      }
    }

    carregarDashboard();
  }, []);

  if (loading) {
    return <p>Carregando dashboard...</p>;
  }

  if (erro) {
    return <p>{erro}</p>;
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
            Aqui está uma visão geral da operação da sua loja hoje.
          </p>
        </div>

        <div style={styles.searchBox(isMobile)}>
          <span style={styles.searchIcon}>⌕</span>
          <span style={styles.searchText}>Seu sistema está online</span>
        </div>
      </header>

      <section
        style={styles.dashboardBoard(
          isMobile ? "1fr" : isTablet ? "1fr" : "1.3fr 0.85fr",
          isMobile
        )}
      >
        <div style={styles.leftColumn(isMobile)}>
          <div style={styles.highlightCard}>
            <div style={styles.highlightHeader}>
              <div>
                <p style={styles.sectionMini}>Resumo de vendas</p>
                <h2 style={styles.sectionTitle}>Resultados da operação</h2>
              </div>
            </div>

            <div style={styles.metricsList}>
              <div style={styles.metricRow(isMobile)}>
                <div>
                  <p style={styles.metricLabel}>Total vendido hoje</p>
                  <strong style={styles.metricValue}>
                    R$ {Number(resumo?.total_vendido_hoje || 0).toFixed(2)}
                  </strong>
                </div>
                <span style={styles.metricTagRed}>Hoje</span>
              </div>

              <div style={styles.metricRow(isMobile)}>
                <div>
                  <p style={styles.metricLabel}>Quantidade de vendas hoje</p>
                  <strong style={styles.metricValue}>
                    {resumo?.quantidade_vendas_hoje || 0}
                  </strong>
                </div>
                <span style={styles.metricTagDark}>Dia</span>
              </div>

              <div style={styles.metricRow(isMobile)}>
                <div>
                  <p style={styles.metricLabel}>Total vendido na semana</p>
                  <strong style={styles.metricValue}>
                    R$ {Number(resumo?.total_vendido_semana || 0).toFixed(2)}
                  </strong>
                </div>
                <span style={styles.metricTagYellow}>Semana</span>
              </div>

              <div style={styles.metricRow(isMobile)}>
                <div>
                  <p style={styles.metricLabel}>Quantidade de vendas na semana</p>
                  <strong style={styles.metricValue}>
                    {resumo?.quantidade_vendas_semana || 0}
                  </strong>
                </div>
                <span style={styles.metricTagBlue}>Período</span>
              </div>

              <div style={styles.metricRow(isMobile)}>
                <div>
                  <p style={styles.metricLabel}>Lucro hoje</p>
                  <strong style={styles.metricValue}>
                    R$ {Number(resumo?.lucro_hoje || 0).toFixed(2)}
                  </strong>
                </div>
                <span style={styles.metricTagGreen}>Lucro</span>
              </div>

              <div style={styles.metricRow(isMobile)}>
                <div>
                  <p style={styles.metricLabel}>Lucro do mês</p>
                  <strong style={styles.metricValue}>
                    R$ {Number(resumo?.lucro_mes || 0).toFixed(2)}
                  </strong>
                </div>
                <span style={styles.metricTagPurple}>Mês</span>
              </div>

              <div style={styles.metricRow(isMobile)}>
                <div>
                  <p style={styles.metricLabel}>Faturamento do mês</p>
                  <strong style={styles.metricValue}>
                    R$ {Number(resumo?.faturamento_mes || 0).toFixed(2)}
                  </strong>
                </div>
                <span style={styles.metricTagDark}>Mensal</span>
              </div>

              <div style={styles.metricRow(isMobile)}>
                <div>
                  <p style={styles.metricLabel}>Ticket médio do mês</p>
                  <strong style={styles.metricValue}>
                    R$ {Number(resumo?.ticket_medio_mes || 0).toFixed(2)}
                  </strong>
                </div>
                <span style={styles.metricTagBlue}>Médio</span>
              </div>
            </div>
          </div>

          <div
            style={styles.bottomRow(
              isMobile ? "1fr" : isTablet ? "1fr" : "0.8fr 1.2fr"
            )}
          >
            <div style={styles.smallCard}>
              <div style={styles.smallCardTop}>
                <div>
                  <p style={styles.sectionMini}>Mês atual</p>
                  <h3 style={styles.smallTitle}>Lucro mensal</h3>
                </div>
              </div>

              <div style={styles.metricNumberSmall}>
                R$ {Number(resumo?.lucro_mes || 0).toFixed(2)}
              </div>

              <p style={styles.metricText}>
                lucro calculado com base no custo e preço de venda dos produtos
              </p>
            </div>

            <div style={styles.wideCard}>
              <div style={styles.smallCardTop}>
                <div>
                  <p style={styles.sectionMini}>Produtos</p>
                  <h3 style={styles.smallTitle}>Mais vendidos</h3>
                </div>
              </div>

              <div style={styles.scrollArea}>
                {topProdutos.length === 0 ? (
                  <p style={styles.emptyText}>Nenhum produto vendido ainda.</p>
                ) : (
                  <div style={styles.productList}>
                    {topProdutos.map((produto) => (
                      <div key={produto.id} style={styles.productItem(isMobile)}>
                        <div>
                          <p style={styles.productName}>{produto.nome}</p>
                          <p style={styles.productMeta}>
                            {produto.total_quantidade_vendida} unidades vendidas
                          </p>
                          <p style={styles.productMeta}>
                            Lucro: R$ {Number(produto.total_lucro || 0).toFixed(2)}
                          </p>
                        </div>

                        <strong style={styles.productValue}>
                          R$ {Number(produto.total_valor_vendido).toFixed(2)}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={styles.rightColumn}>
          <div style={styles.darkCard}>
            <div style={styles.darkCardHeader}>
              <div>
                <p style={styles.darkMini}>Equipe</p>
                <h3 style={styles.darkTitle}>Top da loja</h3>
              </div>
            </div>

            <div style={styles.rankingScroll}>
              {ranking.length === 0 ? (
                <p style={styles.emptyDark}>Nenhum ranking disponível.</p>
              ) : (
                ranking.map((item) => {
                  const urlFoto = getImageUrl(item.foto_perfil);

                  return (
                    <div key={item.usuario_id} style={styles.rankRow(isMobile)}>
                      <div style={styles.rankLeft}>
                        <span style={styles.rankPos}>{item.posicao}</span>

                        {urlFoto ? (
                          <img
                            src={urlFoto}
                            alt={item.usuario_nome}
                            style={styles.rankAvatar}
                          />
                        ) : (
                          <div style={styles.rankAvatarPlaceholder}>
                            {item.usuario_nome?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                        )}

                        <div>
                          <p style={styles.rankName}>{item.usuario_nome}</p>
                          <p style={styles.rankSub}>
                            {item.quantidade_vendas} vendas
                          </p>
                        </div>
                      </div>

                      <strong style={styles.rankValue}>
                        R$ {Number(item.total_vendido).toFixed(2)}
                      </strong>
                    </div>
                  );
                })
              )}
            </div>

            <div style={styles.darkDivider}></div>

            <div style={styles.profitBox}>
              <p style={styles.darkMini}>Maior lucro do mês</p>

              <h3 style={styles.profitTitle}>
                {resumo?.vendedor_mais_lucrativo?.nome || "Sem dados"}
              </h3>

              <p style={styles.profitText}>
                R$ {Number(resumo?.vendedor_mais_lucrativo?.lucro_total || 0).toFixed(2)}
              </p>
            </div>

            <div style={styles.profitBox}>
              <p style={styles.darkMini}>Produto mais lucrativo</p>

              <h3 style={styles.profitTitle}>
                {resumo?.produto_mais_lucrativo?.nome || "Sem dados"}
              </h3>

              <p style={styles.profitText}>
                R$ {Number(resumo?.produto_mais_lucrativo?.lucro_total || 0).toFixed(2)}
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
  searchBox: (isMobile) => ({
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
    color: "#666",
  }),
  searchIcon: {
    fontSize: "16px",
  },
  searchText: {
    fontSize: "14px",
    fontWeight: 500,
  },
  dashboardBoard: (columns, isMobile) => ({
    display: "grid",
    gridTemplateColumns: columns,
    gap: "18px",
    height: isMobile ? "auto" : "calc(100vh - 230px)",
    minHeight: isMobile ? "auto" : "620px",
    maxHeight: isMobile ? "none" : "620px",
  }),
  leftColumn: (isMobile) => ({
    display: "grid",
    gridTemplateRows: isMobile ? "auto auto" : "1fr 0.9fr",
    gap: "18px",
    minHeight: 0,
  }),
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
    marginBottom: "14px",
    flexShrink: 0,
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
  metricsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    paddingRight: "4px",
  },
  metricRow: (isMobile) => ({
    background: "rgba(255,255,255,0.44)",
    border: "1px solid rgba(17,17,17,0.05)",
    borderRadius: "18px",
    padding: "16px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile ? "flex-start" : "center",
    gap: "16px",
    flexDirection: isMobile ? "column" : "row",
  }),
  metricLabel: {
    fontSize: "12px",
    color: "#5b5349",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: 700,
    marginBottom: "6px",
  },
  metricValue: {
    fontSize: "24px",
    fontWeight: 900,
    color: "#111",
    letterSpacing: "-0.04em",
  },
  metricTagRed: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(201,31,40,0.14)",
    color: "#8f1118",
    fontSize: "12px",
    fontWeight: 800,
  },
  metricTagDark: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#111",
    color: "#fff",
    fontSize: "12px",
    fontWeight: 800,
  },
  metricTagYellow: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(241,203,58,0.32)",
    color: "#6f5700",
    fontSize: "12px",
    fontWeight: 800,
  },
  metricTagBlue: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(31,79,163,0.16)",
    color: "#1f4fa3",
    fontSize: "12px",
    fontWeight: 800,
  },
  metricTagGreen: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(18,130,70,0.15)",
    color: "#0b7f44",
    fontSize: "12px",
    fontWeight: 800,
  },
  metricTagPurple: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(120,70,255,0.15)",
    color: "#5d34d6",
    fontSize: "12px",
    fontWeight: 800,
  },
  bottomRow: (columns) => ({
    display: "grid",
    gridTemplateColumns: columns,
    gap: "18px",
    minHeight: 0,
  }),
  smallCard: {
    background: "#fff",
    borderRadius: "24px",
    padding: "20px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
    minHeight: 0,
  },
  wideCard: {
    background: "#fff",
    borderRadius: "24px",
    padding: "20px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },
  smallCardTop: {
    marginBottom: "14px",
    flexShrink: 0,
  },
  smallTitle: {
    fontSize: "20px",
    fontWeight: 800,
    letterSpacing: "-0.04em",
    color: "#111",
  },
  metricNumber: {
    fontSize: "52px",
    lineHeight: 1,
    fontWeight: 900,
    color: "#111",
    letterSpacing: "-0.06em",
    marginBottom: "10px",
  },
  metricNumberSmall: {
    fontSize: "32px",
    lineHeight: 1.1,
    fontWeight: 900,
    color: "#111",
    letterSpacing: "-0.06em",
    marginBottom: "10px",
  },
  metricText: {
    color: "#666",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  scrollArea: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    paddingRight: "4px",
  },
  productList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  productItem: (isMobile) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile ? "flex-start" : "center",
    gap: "14px",
    padding: "12px 0",
    borderBottom: "1px solid #eee8df",
    flexDirection: isMobile ? "column" : "row",
  }),
  productName: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#111",
    marginBottom: "4px",
  },
  productMeta: {
    fontSize: "13px",
    color: "#666",
  },
  productValue: {
    fontSize: "15px",
    fontWeight: 800,
    color: "#111",
    whiteSpace: "nowrap",
  },
  darkCard: {
    background: "#171921",
    color: "#fff",
    borderRadius: "24px",
    padding: "20px",
    minHeight: "100%",
    maxHeight: "100%",
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
    display: "flex",
    flexDirection: "column",
  },
  darkCardHeader: {
    marginBottom: "14px",
    flexShrink: 0,
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
    fontSize: "22px",
    fontWeight: 800,
    letterSpacing: "-0.04em",
  },
  rankingScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    paddingRight: "4px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  rankRow: (isMobile) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile ? "flex-start" : "center",
    gap: "12px",
    padding: "12px 0",
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
    fontWeight: 800,
    color: "#f1cb3a",
  },
  rankAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  rankAvatarPlaceholder: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "#2b2f38",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "13px",
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
    marginTop: "2px",
  },
  rankValue: {
    fontSize: "14px",
    fontWeight: 800,
    color: "#fff",
    whiteSpace: "nowrap",
  },
  darkDivider: {
    width: "100%",
    height: "1px",
    background: "rgba(255,255,255,0.08)",
    margin: "16px 0",
  },
  profitBox: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "14px",
    marginTop: "10px",
  },
  profitTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#fff",
    marginBottom: "6px",
  },
  profitText: {
    color: "#f1cb3a",
    fontSize: "15px",
    fontWeight: 800,
  },
  emptyDark: {
    color: "rgba(255,255,255,0.6)",
  },
  emptyText: {
    color: "#666",
    fontSize: "14px",
  },
};

export default Dashboard;