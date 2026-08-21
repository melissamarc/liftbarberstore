import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getImageUrl } from "../services/api";

import "./DashboardLayout.css";

function DashboardLayout({ children }) {
  const { logout, usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <div>
            <div className="dashboard-brand">
              <div className="dashboard-brand-icon">
                <span className="dashboard-brand-mark">
                  L
                </span>
              </div>

              <div>
                <p className="dashboard-brand-mini">
                  Sistema
                </p>

                <h2 className="dashboard-brand-title">
                  LiftBarberStore
                </h2>
              </div>
            </div>

            <nav className="dashboard-nav">
              {links.map((item) => {
                const ativo = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`dashboard-nav-item ${
                      ativo ? "active" : ""
                    }`}
                  >
                    <span className="dashboard-nav-icon">
                      {item.icon}
                    </span>

                    <span className="dashboard-nav-label">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="dashboard-sidebar-footer">
            <div className="dashboard-user">
              {urlFoto ? (
                <img
                  src={urlFoto}
                  alt="Foto do usuário"
                  className="dashboard-user-avatar"
                />
              ) : (
                <div className="dashboard-user-avatar-placeholder">
                  {usuario?.nome
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </div>
              )}

              <div className="dashboard-user-info">
                <p className="dashboard-user-name">
                  {usuario?.nome || "Usuário"}
                </p>

                <p className="dashboard-user-role">
                  {usuario?.cargo || ""}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="dashboard-logout"
            >
              Sair
            </button>
          </div>
        </aside>

        <main className="dashboard-main">
          <div className="dashboard-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;