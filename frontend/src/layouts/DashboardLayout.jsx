import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useResponsive } from "../hooks/useResponsive";
import { getImageUrl } from "../services/api";

function DashboardLayout({ children }) {
  const { logout, usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { isMobile, isTablet } = useResponsive();

  const urlFoto = getImageUrl(usuario?.foto_perfil);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function isActive(path) {
    return location.pathname === path;
  }

  const links = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: "◉",
    },
    {
      path: "/produtos",
      label: "Produtos",
      icon: "▣",
    },
    {
      path: "/venda-ia",
      label: "Registrar Venda",
      icon: "✦",
    },
    {
      path: "/historico",
      label: "Histórico",
      icon: "☰",
    },
    {
      path: "/ranking",
      label: "Ranking",
      icon: "★",
    },
    {
      path: "/desempenho",
      label: "Desempenho",
      icon: "▤",
    },
    {
      path: "/usuarios",
      label: "Usuários",
      icon: "◌",
    },
    {
      path: "/perfil",
      label: "Perfil",
      icon: "◎",
    },
  ];

  const shellColumns = isMobile
    ? "1fr"
    : isTablet
    ? "220px 1fr"
    : "280px 1fr";

  return (
    <div style={styles.page}>
      <div style={styles.shell(shellColumns, isMobile)}>
        <aside style={styles.sidebar(isMobile)}>
          <div>
            <div style={styles.brand}>
              <div style={styles.brandIcon}>
                <span style={styles.brandBarberRed} />
                <span style={styles.brandBarberBlue} />
              </div>

              <div>
                <p style={styles.brandMini}>Sistema</p>

                <h2 style={styles.brandTitle}>
                  LiftBarberStore
                </h2>
              </div>
            </div>

            <nav style={styles.nav(isMobile)}>
              {links.map((item) => {
                const ativo = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      ...styles.navItem,
                      ...(ativo
                        ? styles.navItemActive
                        : {}),
                    }}
                  >
                    <span
                      style={{
                        ...styles.navIcon,
                        ...(ativo
                          ? styles.navIconActive
                          : {}),
                      }}
                    >
                      {item.icon}
                    </span>

                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div style={styles.sidebarFooter(isMobile)}>
            <div style={styles.userCard}>
              {urlFoto ? (
                <img
                  src={urlFoto}
                  alt="Foto do usuário"
                  style={styles.avatar}
                />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  {usuario?.nome
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </div>
              )}

              <div style={styles.userInfo}>
                <p style={styles.userName}>
                  {usuario?.nome}
                </p>

                <p style={styles.userRole}>
                  {usuario?.cargo}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={styles.logoutButton}
            >
              Sair
            </button>
          </div>
        </aside>

        <main style={styles.main(isMobile)}>
          <div style={styles.content(isMobile)}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  // ==========================================
  // ESTRUTURA GERAL
  // ==========================================

  page: {
    width: "100%",
    minHeight: "100vh",
    background: "#f7f4ef",
  },

  shell: (columns, isMobile) => ({
    width: "100%",
    minHeight: "100vh",

    display: "grid",
    gridTemplateColumns: columns,

    // removemos completamente:
    // margem externa
    // border-radius
    // sombra
    // moldura preta

    overflow: isMobile ? "visible" : "hidden",
  }),

  // ==========================================
  // SIDEBAR
  // ==========================================

  sidebar: (isMobile) => ({
    background: "#111111",
    color: "#fff",

    padding: isMobile
      ? "18px 14px"
      : "32px 24px",

    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",

    gap: "24px",

    minHeight: isMobile ? "auto" : "100vh",

    position: isMobile ? "relative" : "sticky",
    top: 0,

    alignSelf: "start",
  }),

  // ==========================================
  // MARCA
  // ==========================================

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "13px",

    marginBottom: "32px",
  },

  brandIcon: {
    width: "46px",
    height: "46px",

    borderRadius: "13px",

    background: "#181818",

    position: "relative",
    overflow: "hidden",

    border:
      "1px solid rgba(255,255,255,0.07)",

    flexShrink: 0,
  },

  brandBarberRed: {
    position: "absolute",

    left: "10px",
    top: 0,

    width: "8px",
    height: "100%",

    background: "#c91f28",

    transform: "skewX(-18deg)",
  },

  brandBarberBlue: {
    position: "absolute",

    right: "10px",
    top: 0,

    width: "8px",
    height: "100%",

    background: "#1f4fa3",

    transform: "skewX(-18deg)",
  },

  brandMini: {
    fontSize: "11px",

    color:
      "rgba(255,255,255,0.48)",

    textTransform: "uppercase",

    letterSpacing: "0.09em",

    marginBottom: "3px",

    fontWeight: 700,
  },

  brandTitle: {
    fontSize: "18px",

    fontWeight: 800,

    letterSpacing: "-0.03em",
  },

  // ==========================================
  // NAVEGAÇÃO
  // ==========================================

  nav: (isMobile) => ({
    display: "grid",

    gridTemplateColumns: isMobile
      ? "repeat(2, minmax(0, 1fr))"
      : "1fr",

    gap: "6px",
  }),

  navItem: {
    display: "flex",

    alignItems: "center",

    gap: "12px",

    minHeight: "52px",

    padding: "8px 12px",

    borderRadius: "12px",

    color:
      "rgba(255,255,255,0.68)",

    fontSize: "14px",

    fontWeight: 600,

    textDecoration: "none",

    transition:
      "background 0.2s ease, color 0.2s ease",
  },

  navItemActive: {
    background:
      "rgba(255,255,255,0.08)",

    color: "#ffffff",
  },

  navIcon: {
    width: "30px",
    height: "30px",

    borderRadius: "9px",

    background:
      "rgba(255,255,255,0.045)",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: "13px",

    fontWeight: 700,

    flexShrink: 0,
  },

  navIconActive: {
    background:
      "rgba(255,255,255,0.10)",

    color: "#fff",
  },

  // ==========================================
  // USUÁRIO
  // ==========================================

  sidebarFooter: (isMobile) => ({
    marginTop: isMobile
      ? "12px"
      : "40px",
  }),

  userCard: {
    display: "flex",

    alignItems: "center",

    gap: "11px",

    padding: "10px 4px",

    marginBottom: "10px",
  },

  avatar: {
    width: "42px",
    height: "42px",

    borderRadius: "50%",

    objectFit: "cover",
  },

  avatarPlaceholder: {
    width: "42px",
    height: "42px",

    borderRadius: "50%",

    background: "#252525",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontWeight: 800,

    fontSize: "14px",
  },

  userInfo: {
    minWidth: 0,
  },

  userName: {
    fontSize: "14px",

    fontWeight: 700,

    whiteSpace: "nowrap",

    overflow: "hidden",

    textOverflow: "ellipsis",
  },

  userRole: {
    fontSize: "12px",

    color:
      "rgba(255,255,255,0.48)",

    textTransform: "capitalize",

    marginTop: "3px",
  },

  logoutButton: {
    width: "100%",

    height: "42px",

    border:
      "1px solid rgba(255,255,255,0.08)",

    borderRadius: "10px",

    background:
      "rgba(255,255,255,0.04)",

    color:
      "rgba(255,255,255,0.72)",

    fontWeight: 700,

    cursor: "pointer",
  },

  // ==========================================
  // ÁREA PRINCIPAL
  // ==========================================

  main: (isMobile) => ({
    width: "100%",

    minWidth: 0,

    minHeight: isMobile
      ? "auto"
      : "100vh",

    background: "#f7f4ef",

    overflowY: isMobile
      ? "visible"
      : "auto",
  }),

  content: (isMobile) => ({
    width: "100%",

    maxWidth: "1500px",

    margin: "0 auto",

    padding: isMobile
      ? "22px 16px 40px"
      : "34px 36px 50px",
  }),
};

export default DashboardLayout;