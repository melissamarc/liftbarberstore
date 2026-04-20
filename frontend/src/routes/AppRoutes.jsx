import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import NewManualSale from "../pages/NewManualSale";
import NewAISale from "../pages/NewAISale";
import SalesHistory from "../pages/SalesHistory";
import Ranking from "../pages/Ranking";
import Users from "../pages/Users";
import Profile from "../pages/Profile";
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
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />

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

        <Route
          path="/produtos"
          element={
            <RotaPrivada>
              <DashboardLayout>
                <Products />
              </DashboardLayout>
            </RotaPrivada>
          }
        />

        <Route
          path="/venda-manual"
          element={
            <RotaPrivada>
              <DashboardLayout>
                <NewManualSale />
              </DashboardLayout>
            </RotaPrivada>
          }
        />

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
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;