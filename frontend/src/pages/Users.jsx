import { useEffect, useMemo, useState } from "react";
import api, { getImageUrl } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useResponsive } from "../hooks/useResponsive";

function Users() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");

  const { usuario } = useAuth();
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    async function carregarUsuarios() {
      try {
        setLoading(true);
        setErro("");

        const response = await api.get("/users");
        setUsuarios(response.data);
      } catch (error) {
        setErro("Erro ao carregar usuários.");
      } finally {
        setLoading(false);
      }
    }

    carregarUsuarios();
  }, []);

  const usuariosFiltrados = useMemo(() => {
    if (!busca.trim()) return usuarios;

    const termo = busca.toLowerCase();

    return usuarios.filter((item) => {
      const nome = item.nome?.toLowerCase() || "";
      const email = item.email?.toLowerCase() || "";
      const cargo = item.cargo?.toLowerCase() || "";

      return (
        nome.includes(termo) ||
        email.includes(termo) ||
        cargo.includes(termo)
      );
    });
  }, [usuarios, busca]);

  const totalUsuarios = usuarios.length;
  const totalAtivos = usuarios.filter((u) => u.ativo).length;
  const totalAdmins = usuarios.filter((u) => u.cargo === "admin").length;
  const totalVendedores = usuarios.filter((u) => u.cargo === "vendedor").length;

  if (usuario?.cargo !== "admin") {
    return (
      <div style={styles.page}>
        <header style={styles.pageHeader}>
          <div>
            <p style={styles.pageMini}>Equipe</p>
            <h1 style={styles.pageTitle(isMobile)}>Usuários da loja</h1>
            <p style={styles.pageSubtitle}>
              Área restrita para administradores.
            </p>
          </div>
        </header>

        <section style={styles.restrictedCard}>
          <p style={styles.restrictedTitle}>Acesso restrito</p>
          <p style={styles.restrictedText}>
            Somente administradores podem acessar esta página.
          </p>
        </section>
      </div>
    );
  }

  if (loading) {
    return <p>Carregando usuários...</p>;
  }

  return (
    <div style={styles.page}>
      <header style={styles.pageHeader}>
        <div>
          <p style={styles.pageMini}>Equipe</p>
          <h1 style={styles.pageTitle(isMobile)}>Usuários da loja</h1>
          <p style={styles.pageSubtitle}>
            Visualize e acompanhe as pessoas que fazem parte da operação.
          </p>
        </div>
      </header>

      {erro && <p style={styles.erro}>{erro}</p>}

      <section
        style={styles.board(
          isMobile ? "1fr" : isTablet ? "1fr" : "1fr 290px",
          isMobile
        )}
      >
        <div style={styles.mainArea}>
          <div style={styles.topTools(isMobile)}>
            <div style={styles.searchBox(isMobile)}>
              <span style={styles.searchIcon}>⌕</span>
              <input
                type="text"
                placeholder="Buscar por nome, email ou cargo..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.filterPill}>
              {usuariosFiltrados.length} usuários
            </div>
          </div>

          <div style={styles.cardsViewport(isMobile)}>
            {usuariosFiltrados.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyTitle}>Nenhum usuário encontrado</p>
                <p style={styles.emptyText}>
                  Tente buscar por outro nome ou cargo.
                </p>
              </div>
            ) : (
              <div
                style={styles.cardsGrid(
                  isMobile ? "1fr" : isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))"
                )}
              >
                {usuariosFiltrados.map((item) => {
                  const fotoUrl = getImageUrl(item.foto_perfil);

                  return (
                    <div key={item.id} style={styles.userCard}>
                      <div style={styles.userCardTop}>
                        <div style={styles.avatarWrapper}>
                          {fotoUrl ? (
                            <img
                              src={fotoUrl}
                              alt={item.nome}
                              style={styles.avatar}
                            />
                          ) : (
                            <div style={styles.avatarPlaceholder}>
                              {item.nome?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                          )}

                          <span
                            style={{
                              ...styles.onlineDot,
                              ...(item.ativo ? styles.dotActive : styles.dotInactive),
                            }}
                          ></span>
                        </div>
                      </div>

                      <div style={styles.userCardBody}>
                        <h3 style={styles.userName}>{item.nome}</h3>
                        <p style={styles.userEmail}>{item.email}</p>

                        <div style={styles.userMeta}>
                          <span
                            style={{
                              ...styles.rolePill,
                              ...(item.cargo === "admin"
                                ? styles.roleAdmin
                                : styles.roleSeller),
                            }}
                          >
                            {item.cargo === "admin" ? "Admin" : "Vendedor"}
                          </span>

                          <span
                            style={{
                              ...styles.statusPill,
                              ...(item.ativo
                                ? styles.statusActive
                                : styles.statusInactive),
                            }}
                          >
                            {item.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </div>

                        <div style={styles.userFooter}>
                          <span style={styles.footerLabel}>Criado em</span>
                          <strong style={styles.footerValue}>
                            {new Date(item.data_criacao).toLocaleDateString("pt-BR")}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <aside style={styles.sidePanel}>
          <div style={styles.sideCardDark}>
            <p style={styles.sideMiniDark}>Resumo da equipe</p>
            <h3 style={styles.sideTitleDark}>Time da loja</h3>
            <p style={styles.sideTextDark}>
              Acompanhe rapidamente a composição atual da operação.
            </p>
          </div>

          <div style={styles.sideStatsGrid}>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>Total</span>
              <strong style={styles.statValue}>{totalUsuarios}</strong>
            </div>

            <div style={styles.statBox}>
              <span style={styles.statLabel}>Ativos</span>
              <strong style={styles.statValue}>{totalAtivos}</strong>
            </div>

            <div style={styles.statBox}>
              <span style={styles.statLabel}>Admins</span>
              <strong style={styles.statValue}>{totalAdmins}</strong>
            </div>

            <div style={styles.statBox}>
              <span style={styles.statLabel}>Vendedores</span>
              <strong style={styles.statValue}>{totalVendedores}</strong>
            </div>
          </div>

          <div style={styles.sideCardLight}>
            <p style={styles.sideMiniLight}>Visão rápida</p>
            <p style={styles.sideTextLight}>
              Use a busca para encontrar membros da equipe por nome, email ou cargo.
            </p>
          </div>
        </aside>
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
  pageTitle: (isMobile) => ({
    fontSize: isMobile ? "28px" : "34px",
    fontWeight: 900,
    letterSpacing: "-0.05em",
    color: "#111",
  }),
  pageSubtitle: {
    color: "#666",
    fontSize: "15px",
  },
  erro: {
    color: "#b00020",
    fontWeight: 600,
  },
  board: (columns, isMobile) => ({
    display: "grid",
    gridTemplateColumns: columns,
    gap: "20px",
    alignItems: "stretch",
    height: isMobile ? "auto" : "calc(100vh - 230px)",
    minHeight: isMobile ? "auto" : "620px",
    maxHeight: isMobile ? "none" : "620px",
  }),
  mainArea: {
    background: "#fff",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    overflow: "hidden",
  },
  topTools: (isMobile) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile ? "stretch" : "center",
    flexDirection: isMobile ? "column" : "row",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "18px",
    flexShrink: 0,
  }),
  searchBox: (isMobile) => ({
    width: "100%",
    maxWidth: isMobile ? "100%" : "420px",
    height: "54px",
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
  filterPill: {
    padding: "12px 16px",
    borderRadius: "999px",
    background: "rgba(31,79,163,0.10)",
    color: "#1f4fa3",
    fontSize: "13px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  cardsViewport: (isMobile) => ({
    flex: isMobile ? "unset" : 1,
    minHeight: 0,
    overflowY: isMobile ? "visible" : "auto",
    paddingRight: isMobile ? "0" : "4px",
  }),
  cardsGrid: (columns) => ({
    display: "grid",
    gridTemplateColumns: columns,
    gap: "18px",
  }),
  userCard: {
    background: "#f8f6f2",
    borderRadius: "22px",
    padding: "18px",
    border: "1px solid #eee8df",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  userCardTop: {
    display: "flex",
    justifyContent: "center",
  },
  avatarWrapper: {
    position: "relative",
    width: "92px",
    height: "92px",
  },
  avatar: {
    width: "92px",
    height: "92px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #f1ebe3",
  },
  avatarPlaceholder: {
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
    border: "4px solid #f1ebe3",
  },
  onlineDot: {
    position: "absolute",
    right: "6px",
    top: "6px",
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    border: "3px solid #f8f6f2",
  },
  dotActive: {
    background: "#7ecb4f",
  },
  dotInactive: {
    background: "#c7c7c7",
  },
  userCardBody: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  userName: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#111",
    letterSpacing: "-0.03em",
    wordBreak: "break-word",
  },
  userEmail: {
    color: "#7b7b7b",
    fontSize: "13px",
    lineHeight: 1.5,
    wordBreak: "break-word",
  },
  userMeta: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  rolePill: {
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
  },
  roleAdmin: {
    background: "rgba(201,31,40,0.10)",
    color: "#c91f28",
  },
  roleSeller: {
    background: "rgba(31,79,163,0.10)",
    color: "#1f4fa3",
  },
  statusPill: {
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
  },
  statusActive: {
    background: "rgba(18, 130, 70, 0.14)",
    color: "#0b7f44",
  },
  statusInactive: {
    background: "rgba(176, 0, 32, 0.12)",
    color: "#b00020",
  },
  userFooter: {
    marginTop: "6px",
    paddingTop: "12px",
    borderTop: "1px solid #ebe3d8",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },
  footerLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#8a8a8a",
    fontWeight: 700,
  },
  footerValue: {
    fontSize: "14px",
    color: "#111",
    fontWeight: 800,
  },
  sidePanel: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    height: "100%",
  },
  sideCardDark: {
    background: "#171921",
    color: "#fff",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
  },
  sideMiniDark: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.55)",
    fontWeight: 700,
    marginBottom: "8px",
  },
  sideTitleDark: {
    fontSize: "26px",
    fontWeight: 800,
    letterSpacing: "-0.04em",
    marginBottom: "10px",
  },
  sideTextDark: {
    color: "rgba(255,255,255,0.72)",
    fontSize: "14px",
    lineHeight: 1.7,
  },
  sideStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "14px",
  },
  statBox: {
    background: "#fff",
    borderRadius: "20px",
    padding: "18px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  statLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#8a8a8a",
    fontWeight: 700,
  },
  statValue: {
    fontSize: "28px",
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: "-0.04em",
    color: "#111",
  },
  sideCardLight: {
    background: "#fff",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
  },
  sideMiniLight: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#8a8a8a",
    fontWeight: 700,
    marginBottom: "10px",
  },
  sideTextLight: {
    color: "#666",
    fontSize: "14px",
    lineHeight: 1.7,
  },
  restrictedCard: {
    background: "#fff",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
  },
  restrictedTitle: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#111",
    marginBottom: "8px",
  },
  restrictedText: {
    color: "#666",
    fontSize: "15px",
  },
  emptyState: {
    background: "#f8f6f2",
    borderRadius: "20px",
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

export default Users;