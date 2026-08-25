import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import NewAISale from "../pages/NewAISale";
import SalesHistory from "../pages/SalesHistory";
import Ranking from "../pages/Ranking";
import Users from "../pages/Users";
import Profile from "../pages/Profile";
import Performance from "../pages/Performance";

import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../hooks/useAuth";

function RotaPrivada({ children }) {
  const { autenticado, authLoading } = useAuth();

  if (authLoading) {
    return <p>Carregando...</p>;
  }

  if (!autenticado) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PÁGINAS PÚBLICAS */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/cadastro"
          element={<Register />}
        />

        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <RotaPrivada>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </RotaPrivada>
          }
        />

        {/* REGISTRAR VENDA */}

        <Route
          path="/venda-ia"
          element={
            <RotaPrivada>
              <DashboardLayout>
                <NewAISale />
              </DashboardLayout>
            </RotaPrivada>
          }
        />

        {/* HISTÓRICO */}

        <Route
          path="/historico"
          element={
            <RotaPrivada>
              <DashboardLayout>
                <SalesHistory />
              </DashboardLayout>
            </RotaPrivada>
          }
        />

        {/* RANKING */}

        <Route
          path="/ranking"
          element={
            <RotaPrivada>
              <DashboardLayout>
                <Ranking />
              </DashboardLayout>
            </RotaPrivada>
          }
        />

        {/* DESEMPENHO */}

        <Route
          path="/desempenho"
          element={
            <RotaPrivada>
              <DashboardLayout>
                <Performance />
              </DashboardLayout>
            </RotaPrivada>
          }
        />

        {/* USUÁRIOS */}

        <Route
          path="/usuarios"
          element={
            <RotaPrivada>
              <DashboardLayout>
                <Users />
              </DashboardLayout>
            </RotaPrivada>
          }
        />

        {/* PERFIL */}

        <Route
          path="/perfil"
          element={
            <RotaPrivada>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </RotaPrivada>
          }
        />

        {/* ROTA NÃO ENCONTRADA */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;