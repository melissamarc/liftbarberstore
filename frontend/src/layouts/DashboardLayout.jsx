import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function DashboardLayout({ children }) {
  const { logout, usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const urlFoto = usuario?.foto_perfil
    ? `http://localhost:3001${usuario.foto_perfil}`
    : null;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function isActive(path) {
    return location.pathname === path;
  }

  const links = [
    { path: "/dashboard", label: "Dashboard", icon: "◉" },
    { path: "/produtos", label: "Produtos", icon: "▣" },
    { path: "/venda-manual", label: "Venda Manual", icon: "＋" },
    { path: "/venda-ia", label: "Venda com IA", icon: "✦" },
    { path: "/historico", label: "Histórico", icon: "☰" },
    { path: "/ranking", label: "Ranking", icon: "★" },
    { path: "/usuarios", label: "Usuários", icon: "◌" },
    { path: "/perfil", label: "Perfil", icon: "◎" },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <aside style={styles.sidebar}>
          <div>
            <div style={styles.brand}>
              <div style={styles.brandIcon}>
                <span style={styles.brandBarberRed}></span>
                <span style={styles.brandBarberBlue}></span>
              </div>

              <div>
                <p style={styles.brandMini}>Sistema</p>
                <h2 style={styles.brandTitle}>Lift Barber</h2>
              </div>
            </div>

            <nav style={styles.nav}>
              {links.map((item) => {
                const ativo = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      ...styles.navItem,
                      ...(ativo ? styles.navItemActive : {}),
                    }}
                  >
                    <span
                      style={{
                        ...styles.navIcon,
                        ...(ativo ? styles.navIconActive : {}),
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

          <div style={styles.sidebarFooter}>
            <div style={styles.userCard}>
              {urlFoto ? (
                <img src={urlFoto} alt="Foto do usuário" style={styles.avatar} />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  {usuario?.nome?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}

              <div style={styles.userInfo}>
                <p style={styles.userName}>{usuario?.nome}</p>
                <p style={styles.userRole}>{usuario?.cargo}</p>
              </div>
            </div>

            <button onClick={handleLogout} style={styles.logoutButton}>
              Sair
            </button>
          </div>
        </aside>

        <main style={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a0a 0%, #171717 100%)",
    padding: "20px",
  },
  shell: {
    minHeight: "calc(100vh - 40px)",
    background: "linear-gradient(135deg, #f7f4ef 0%, #f1ebe3 100%)",
    borderRadius: "28px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    overflow: "hidden",
  },
  sidebar: {
    background: "#111111",
    color: "#fff",
    padding: "24px 18px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "28px",
  },
  brandIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    background: "#181818",
    position: "relative",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)",
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
    fontSize: "12px",
    color: "rgba(255,255,255,0.55)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "2px",
    fontWeight: 700,
  },
  brandTitle: {
    fontSize: "18px",
    fontWeight: 800,
    letterSpacing: "-0.03em",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    borderRadius: "14px",
    color: "rgba(255,255,255,0.75)",
    fontSize: "14px",
    fontWeight: 600,
    transition: "all 0.2s ease",
  },
  navItemActive: {
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
  },
  navIcon: {
    width: "30px",
    height: "30px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 700,
  },
  navIconActive: {
    background: "linear-gradient(135deg, #c91f28 0%, #1f4fa3 100%)",
    color: "#fff",
  },
  sidebarFooter: {
    marginTop: "24px",
  },
  userCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "12px",
    marginBottom: "14px",
  },
  avatar: {
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  avatarPlaceholder: {
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    background: "#2a2a2a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "15px",
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
    color: "rgba(255,255,255,0.6)",
    textTransform: "capitalize",
    marginTop: "3px",
  },
  logoutButton: {
    width: "100%",
    height: "46px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #c91f28 0%, #9f161e 100%)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  main: {

    padding: "26px",

    overflowY: "auto",

    minHeight: "calc(100vh - 40px)",

  },

};

export default DashboardLayout;