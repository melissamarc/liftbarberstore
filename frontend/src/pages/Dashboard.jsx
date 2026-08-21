import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import api, { getImageUrl } from "../services/api";

import "./Dashboard.css";

function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const { usuario } = useAuth();

  useEffect(() => {
    async function carregarDashboard() {
      try {
        setLoading(true);
        setErro("");

        const [resumoResponse, rankingResponse] =
          await Promise.all([
            api.get("/dashboard"),
            api.get("/ranking"),
          ]);

        setResumo(resumoResponse.data);
        setRanking((rankingResponse.data || []).slice(0, 8));
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
    return (
      <div className="dashboard-screen-state">
        Carregando dashboard...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="dashboard-error">
        {erro}
      </div>
    );
  }

  return (
    <div className="dashboard-page-content">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">
            Painel principal
          </p>

          <h1 className="dashboard-title">
            Olá, {usuario?.nome?.split(" ")[0] || "Usuário"}
          </h1>

          <p className="dashboard-subtitle">
            Acompanhe as vendas da equipe e o desempenho da loja.
          </p>
        </div>

        <div className="dashboard-status">
          <span className="dashboard-status-dot" />
          Sistema online
        </div>
      </header>

      <section className="dashboard-summary">
        <div className="dashboard-summary-item">
          <p className="dashboard-summary-label">
            Total vendido hoje
          </p>

          <strong className="dashboard-summary-value">
            {formatarMoeda(resumo?.total_vendido_hoje)}
          </strong>

          <span className="dashboard-summary-detail">
            {resumo?.quantidade_vendas_hoje || 0} vendas hoje
          </span>
        </div>

        <div className="dashboard-summary-item">
          <p className="dashboard-summary-label">
            Total da semana
          </p>

          <strong className="dashboard-summary-value">
            {formatarMoeda(resumo?.total_vendido_semana)}
          </strong>

          <span className="dashboard-summary-detail">
            {resumo?.quantidade_vendas_semana || 0} vendas · sex–qui
          </span>
        </div>

        <div className="dashboard-summary-item">
          <p className="dashboard-summary-label">
            Total do mês
          </p>

          <strong className="dashboard-summary-value">
            {formatarMoeda(resumo?.total_vendido_mes)}
          </strong>

          <span className="dashboard-summary-detail">
            {resumo?.quantidade_vendas_mes || 0} vendas no mês
          </span>
        </div>
      </section>

      <section className="dashboard-content-grid">
        <div className="dashboard-overview">
          <div className="dashboard-section-header">
            <div>
              <p className="dashboard-section-eyebrow">
                Resumo
              </p>

              <h2 className="dashboard-section-title">
                Visão geral das vendas
              </h2>
            </div>
          </div>

          <div className="dashboard-overview-list">
            <div className="dashboard-overview-row">
              <div>
                <p className="dashboard-overview-label">
                  Hoje
                </p>

                <span className="dashboard-overview-text">
                  Vendas registradas no dia
                </span>
              </div>

              <div className="dashboard-overview-right">
                <strong>
                  {resumo?.quantidade_vendas_hoje || 0}
                </strong>

                <span>
                  {formatarMoeda(resumo?.total_vendido_hoje)}
                </span>
              </div>
            </div>

            <div className="dashboard-overview-row">
              <div>
                <p className="dashboard-overview-label">
                  Semana atual
                </p>

                <span className="dashboard-overview-text">
                  Acumulado desde sexta-feira
                </span>
              </div>

              <div className="dashboard-overview-right">
                <strong>
                  {resumo?.quantidade_vendas_semana || 0}
                </strong>

                <span>
                  {formatarMoeda(resumo?.total_vendido_semana)}
                </span>
              </div>
            </div>

            <div className="dashboard-overview-row">
              <div>
                <p className="dashboard-overview-label">
                  Mês atual
                </p>

                <span className="dashboard-overview-text">
                  Faturamento acumulado do mês
                </span>
              </div>

              <div className="dashboard-overview-right">
                <strong>
                  {resumo?.quantidade_vendas_mes || 0}
                </strong>

                <span>
                  {formatarMoeda(resumo?.total_vendido_mes)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-ranking">
          <div className="dashboard-section-header">
            <div>
              <p className="dashboard-section-eyebrow">
                Equipe
              </p>

              <h2 className="dashboard-section-title">
                Ranking da semana
              </h2>

              <p className="dashboard-section-description">
                Vendas registradas de sexta-feira até quinta-feira.
              </p>
            </div>
          </div>

          <div className="dashboard-ranking-list">
            {ranking.length === 0 ? (
              <div className="dashboard-empty">
                Nenhuma venda registrada ainda.
              </div>
            ) : (
              ranking.map((item) => {
                const fotoUrl = getImageUrl(item.foto_perfil);

                return (
                  <div
                    key={item.usuario_id}
                    className="dashboard-ranking-row"
                  >
                    <span className="dashboard-ranking-position">
                      {item.posicao}
                    </span>

                    {fotoUrl ? (
                      <img
                        src={fotoUrl}
                        alt={item.usuario_nome}
                        className="dashboard-ranking-avatar"
                      />
                    ) : (
                      <div className="dashboard-ranking-avatar-placeholder">
                        {item.usuario_nome
                          ?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </div>
                    )}

                    <div className="dashboard-ranking-user">
                      <p>{item.usuario_nome}</p>

                      <span>
                        {item.quantidade_vendas || 0}{" "}
                        {Number(item.quantidade_vendas) === 1
                          ? "venda"
                          : "vendas"}
                      </span>
                    </div>

                    <strong className="dashboard-ranking-value">
                      {formatarMoeda(item.total_vendido)}
                    </strong>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;