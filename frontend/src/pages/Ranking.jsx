import { useEffect, useMemo, useState } from "react";
import api, { getImageUrl } from "../services/api";

import "./Ranking.css";

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
        setRanking(response.data || []);
      } catch (error) {
        console.error("Erro ao carregar ranking:", error);
        setErro("Erro ao carregar ranking.");
      } finally {
        setLoading(false);
      }
    }

    carregarRanking();
  }, []);

  const top3 = useMemo(() => {
    return ranking.slice(0, 3);
  }, [ranking]);

  const restantes = useMemo(() => {
    const outros = ranking.slice(3);

    if (!busca.trim()) {
      return outros;
    }

    return outros.filter((item) =>
      item.usuario_nome
        ?.toLowerCase()
        .includes(busca.toLowerCase())
    );
  }, [ranking, busca]);

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  if (loading) {
    return (
      <div className="ranking-state">
        Carregando ranking...
      </div>
    );
  }

  return (
    <div className="ranking-page">
      <header className="ranking-header">
        <div>
          <p className="ranking-eyebrow">
            Equipe
          </p>

          <h1 className="ranking-title">
            Ranking de vendedores
          </h1>

          <p className="ranking-subtitle">
            Acompanhe quem mais vendeu durante a semana atual.
          </p>
        </div>

        <div className="ranking-period">
          Sex–Qui
        </div>
      </header>

      {erro && (
        <div className="ranking-error">
          {erro}
        </div>
      )}

      <section className="ranking-top3">
        {top3.map((item, index) => {
          const fotoUrl = getImageUrl(item.foto_perfil);

          return (
            <article
              key={item.usuario_id}
              className={`ranking-top-card ranking-top-${index + 1}`}
            >
              <div className="ranking-top-position">
                {item.posicao}º
              </div>

              <div className="ranking-top-user">
                {fotoUrl ? (
                  <img
                    src={fotoUrl}
                    alt={item.usuario_nome}
                    className="ranking-top-avatar"
                  />
                ) : (
                  <div className="ranking-top-avatar-placeholder">
                    {item.usuario_nome
                      ?.charAt(0)
                      ?.toUpperCase() || "U"}
                  </div>
                )}

                <div className="ranking-top-user-text">
                  <h3>
                    {item.usuario_nome}
                  </h3>

                  <p>
                    {item.usuario_email}
                  </p>
                </div>
              </div>

              <div className="ranking-top-value">
                <span>Total vendido</span>

                <strong>
                  {formatarMoeda(item.total_vendido)}
                </strong>
              </div>

              <div className="ranking-top-footer">
                <span>
                  {item.quantidade_vendas}{" "}
                  {Number(item.quantidade_vendas) === 1
                    ? "venda"
                    : "vendas"}
                </span>

                {index === 0 && (
                  <span className="ranking-leader-badge">
                    Líder da semana
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <section className="ranking-list-section">
        <div className="ranking-list-header">
          <div>
            <p className="ranking-list-eyebrow">
              Classificação
            </p>

            <h2>
              Demais vendedores
            </h2>
          </div>

          <div className="ranking-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Buscar vendedor..."
              value={busca}
              onChange={(e) =>
                setBusca(e.target.value)
              }
            />
          </div>
        </div>

        <div className="ranking-list">
          {restantes.length === 0 ? (
            <div className="ranking-empty">
              <strong>
                Nenhum vendedor encontrado
              </strong>

              <p>
                Tente buscar por outro nome.
              </p>
            </div>
          ) : (
            restantes.map((item) => {
              const fotoUrl = getImageUrl(item.foto_perfil);

              return (
                <div
                  key={item.usuario_id}
                  className="ranking-row"
                >
                  <span className="ranking-row-position">
                    {item.posicao}
                  </span>

                  {fotoUrl ? (
                    <img
                      src={fotoUrl}
                      alt={item.usuario_nome}
                      className="ranking-row-avatar"
                    />
                  ) : (
                    <div className="ranking-row-avatar-placeholder">
                      {item.usuario_nome
                        ?.charAt(0)
                        ?.toUpperCase() || "U"}
                    </div>
                  )}

                  <div className="ranking-row-user">
                    <p>
                      {item.usuario_nome}
                    </p>

                    <span>
                      {item.usuario_email}
                    </span>
                  </div>

                  <div className="ranking-row-sales">
                    <span>
                      Vendas
                    </span>

                    <strong>
                      {item.quantidade_vendas}
                    </strong>
                  </div>

                  <div className="ranking-row-total">
                    <span>
                      Total vendido
                    </span>

                    <strong>
                      {formatarMoeda(item.total_vendido)}
                    </strong>
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

export default Ranking;