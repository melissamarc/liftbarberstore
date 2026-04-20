import { useEffect, useMemo, useState } from "react";
import api, {getImageUrl} from "../services/api";

function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    async function carregarRanking() {
      try {
        setLoading(true);
        setErro("");

        const response = await api.get("/ranking");
        setRanking(response.data);
      } catch (error) {
        setErro("Erro ao carregar ranking.");
      } finally {
        setLoading(false);
      }
    }

    carregarRanking();
  }, []);

  const top3 = useMemo(() => ranking.slice(0, 3), [ranking]);

  const restantes = useMemo(() => {
    const outros = ranking.slice(3);

    if (!busca.trim()) return outros;

    return outros.filter((item) =>
      item.usuario_nome.toLowerCase().includes(busca.toLowerCase())
    );
  }, [ranking, busca]);

  if (loading) {
    return <p>Carregando ranking...</p>;
  }

  return (
    <div style={styles.page}>
      <header style={styles.pageHeader}>
        <div>
          <p style={styles.pageMini}>Equipe</p>
          <h1 style={styles.pageTitle}>Ranking de vendedores</h1>
          <p style={styles.pageSubtitle}>
            Acompanhe o desempenho da equipe e veja quem mais vendeu no período.
          </p>
        </div>

        <div style={styles.periodBadge}>Esta semana</div>
      </header>

      {erro && <p style={styles.erro}>{erro}</p>}

      <section style={styles.topSection}>
        {top3.map((item, index) => {
          const fotoUrl = getImageUrl(item.foto_perfil);

          const medalStyle =
            index === 0
              ? styles.goldMedal
              : index === 1
              ? styles.silverMedal
              : styles.bronzeMedal;

          return (
            <div key={item.usuario_id} style={styles.topCard}>
              <div style={styles.topCardBody}>
                <div style={styles.avatarWrap}>
                  {fotoUrl ? (
                    <img
                      src={fotoUrl}
                      alt={item.usuario_nome}
                      style={styles.topAvatar}
                    />
                  ) : (
                    <div style={styles.topAvatarPlaceholder}>
                      {item.usuario_nome?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}

                  <span style={{ ...styles.medal, ...medalStyle }}>
                    {item.posicao}º
                  </span>
                </div>

                <h3 style={styles.topName}>{item.usuario_nome}</h3>
                <p style={styles.topEmail}>{item.usuario_email}</p>

                <div style={styles.contributionPill}>
                  R$ {Number(item.total_vendido).toFixed(2)}
                </div>
              </div>

              <div style={styles.topStatsRow}>
                <div style={styles.topStatBox}>
                  <span style={styles.topStatLabel}>Vendas</span>
                  <strong style={styles.topStatValue}>{item.quantidade_vendas}</strong>
                </div>

                <div style={styles.topStatBox}>
                  <span style={styles.topStatLabel}>Itens</span>
                  <strong style={styles.topStatValue}>
                    {item.quantidade_itens_vendidos}
                  </strong>
                </div>

                <div style={styles.topStatBox}>
                  <span style={styles.topStatLabel}>Posição</span>
                  <strong style={styles.topStatValue}>{item.posicao}º</strong>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section style={styles.listSection}>
        <div style={styles.listHeader}>
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>⌕</span>
            <input
              type="text"
              placeholder="Buscar usuário..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.legend}>
            <span style={styles.legendItem}>Total vendido</span>
            <span style={styles.legendItem}>Qtd. vendas</span>
            <span style={styles.legendItem}>Qtd. itens</span>
          </div>
        </div>

        <div style={styles.rows}>
          {restantes.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyTitle}>Nenhum usuário encontrado</p>
              <p style={styles.emptyText}>
                Tente buscar por outro nome.
              </p>
            </div>
          ) : (
            restantes.map((item) => {
              const fotoUrl = item.foto_perfil
                ? `http://localhost:3001${item.foto_perfil}`
                : null;

              return (
                <div key={item.usuario_id} style={styles.rowCard}>
                  <div style={styles.rowLeft}>
                    <span style={styles.rowPosition}>{item.posicao}º</span>

                    {fotoUrl ? (
                      <img
                        src={fotoUrl}
                        alt={item.usuario_nome}
                        style={styles.rowAvatar}
                      />
                    ) : (
                      <div style={styles.rowAvatarPlaceholder}>
                        {item.usuario_nome?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}

                    <div>
                      <p style={styles.rowName}>{item.usuario_nome}</p>
                      <p style={styles.rowEmail}>{item.usuario_email}</p>
                    </div>
                  </div>

                  <div style={styles.rowCenter}>
                    <div style={styles.valuePill}>
                      R$ {Number(item.total_vendido).toFixed(2)}
                    </div>
                  </div>

                  <div style={styles.rowRight}>
                    <div style={styles.miniStat}>
                      <span style={styles.miniStatLabel}>Vendas</span>
                      <strong style={styles.miniStatValue}>{item.quantidade_vendas}</strong>
                    </div>

                    <div style={styles.miniStat}>
                      <span style={styles.miniStatLabel}>Itens</span>
                      <strong style={styles.miniStatValue}>
                        {item.quantidade_itens_vendidos}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })
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
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
  },
  pageMini: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#7b7b7b",
    fontWeight: 700,
    marginBottom: "6px",
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
    marginTop: "6px",
  },
  periodBadge: {
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
  topSection: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "20px",
  },
  topCard: {
    background: "#fff",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  topCardBody: {
    padding: "28px 24px 22px 24px",
    textAlign: "center",
  },
  avatarWrap: {
    position: "relative",
    width: "92px",
    margin: "0 auto 18px auto",
  },
  topAvatar: {
    width: "92px",
    height: "92px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #f3efe9",
  },
  topAvatarPlaceholder: {
    width: "92px",
    height: "92px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1f4fa3 0%, #c91f28 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: "28px",
    border: "4px solid #f3efe9",
  },
  medal: {
    position: "absolute",
    right: "-8px",
    bottom: "6px",
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 800,
    boxShadow: "0 8px 18px rgba(0,0,0,0.10)",
  },
  goldMedal: {
    background: "#f1cb3a",
    color: "#6f5700",
  },
  silverMedal: {
    background: "#d8dee5",
    color: "#5f6770",
  },
  bronzeMedal: {
    background: "#dcb08a",
    color: "#7b4e2a",
  },
  topName: {
    fontSize: "24px",
    lineHeight: 1.15,
    fontWeight: 800,
    letterSpacing: "-0.04em",
    color: "#111",
    marginBottom: "6px",
  },
  topEmail: {
    color: "#7b7b7b",
    fontSize: "14px",
    marginBottom: "20px",
  },
  contributionPill: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "12px 18px",
    borderRadius: "999px",
    background: "rgba(31,79,163,0.08)",
    color: "#1f4fa3",
    fontWeight: 800,
    fontSize: "14px",
  },
  topStatsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    borderTop: "1px solid #ece7df",
  },
  topStatBox: {
    padding: "16px 12px",
    textAlign: "center",
    borderRight: "1px solid #ece7df",
  },
  topStatLabel: {
    display: "block",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#8b8b8b",
    fontWeight: 700,
    marginBottom: "6px",
  },
  topStatValue: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#111",
  },
  listSection: {
    background: "#fff",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  searchBox: {
    width: "100%",
    maxWidth: "340px",
    height: "52px",
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
  legend: {
    display: "flex",
    alignItems: "center",
    gap: "22px",
    flexWrap: "wrap",
  },
  legendItem: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#9a9a9a",
    fontWeight: 700,
  },
  rows: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  rowCard: {
    background: "#f8f6f2",
    borderRadius: "18px",
    padding: "16px 18px",
    border: "1px solid #eee8df",
    display: "grid",
    gridTemplateColumns: "1.25fr 0.8fr 0.7fr",
    alignItems: "center",
    gap: "18px",
  },
  rowLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  },
  rowPosition: {
    minWidth: "34px",
    fontWeight: 800,
    color: "#1f4fa3",
    fontSize: "15px",
  },
  rowAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  rowAvatarPlaceholder: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1f4fa3 0%, #c91f28 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: "16px",
  },
  rowName: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#111",
    letterSpacing: "-0.03em",
    marginBottom: "4px",
  },
  rowEmail: {
    color: "#777",
    fontSize: "13px",
  },
  rowCenter: {
    display: "flex",
    justifyContent: "center",
  },
  valuePill: {
    padding: "12px 18px",
    borderRadius: "999px",
    background: "rgba(31,79,163,0.08)",
    color: "#1f4fa3",
    fontWeight: 800,
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
  rowRight: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "20px",
    flexWrap: "wrap",
  },
  miniStat: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    alignItems: "flex-end",
    minWidth: "70px",
  },
  miniStatLabel: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#8b8b8b",
    fontWeight: 700,
  },
  miniStatValue: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#111",
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

export default Ranking;