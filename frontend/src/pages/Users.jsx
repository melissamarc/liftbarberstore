import { useEffect, useMemo, useState } from "react";
import api, { getImageUrl } from "../services/api";
import { useAuth } from "../hooks/useAuth";

import "./Users.css";

function Users() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");

  const { usuario } = useAuth();

  useEffect(() => {
    async function carregarUsuarios() {
      try {
        setLoading(true);
        setErro("");

        const response = await api.get("/users");
        setUsuarios(response.data);
      } catch {
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

  const totalAtivos = usuarios.filter(
    (u) => u.ativo
  ).length;

  const totalAdmins = usuarios.filter(
    (u) => u.cargo === "admin"
  ).length;

  const totalVendedores = usuarios.filter(
    (u) => u.cargo === "vendedor"
  ).length;

  function formatarData(data) {
    if (!data) return "—";

    return new Date(data).toLocaleDateString("pt-BR");
  }

  if (usuario?.cargo !== "admin") {
    return (
      <div className="users-page">
        <header className="users-header">
          <div>
            <p className="users-eyebrow">
              Equipe
            </p>

            <h1 className="users-title">
              Usuários da loja
            </h1>

            <p className="users-subtitle">
              Gerenciamento das pessoas que fazem parte
              da operação.
            </p>
          </div>
        </header>

        <div className="users-restricted">
          <div className="users-restricted-icon">
            !
          </div>

          <div>
            <h2>Acesso restrito</h2>

            <p>
              Somente administradores podem acessar
              esta página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="users-page">
        <p className="users-loading">
          Carregando usuários...
        </p>
      </div>
    );
  }

  return (
    <div className="users-page">

      {/* HEADER */}

      <header className="users-header">
        <div>
          <p className="users-eyebrow">
            Equipe
          </p>

          <h1 className="users-title">
            Usuários da loja
          </h1>

          <p className="users-subtitle">
            Visualize as pessoas que fazem parte da operação
            e acompanhe o status de cada conta.
          </p>
        </div>

        <div className="users-total-pill">
          <strong>{totalUsuarios}</strong>

          <span>
            {totalUsuarios === 1
              ? "usuário"
              : "usuários"}
          </span>
        </div>
      </header>

      {erro && (
        <div className="users-error">
          {erro}
        </div>
      )}

      {/* RESUMO */}

      <section className="users-summary">
        <div className="users-summary-main">
          <div className="users-summary-icon">
            ◌
          </div>

          <div>
            <span>Equipe atual</span>

            <strong>
              {totalUsuarios}
            </strong>

            <p>
              pessoas cadastradas no sistema
            </p>
          </div>
        </div>

        <div className="users-summary-divider" />

        <div className="users-stat">
          <span className="users-stat-dot active" />

          <div>
            <strong>{totalAtivos}</strong>
            <span>Ativos</span>
          </div>
        </div>

        <div className="users-stat">
          <span className="users-stat-dot admin" />

          <div>
            <strong>{totalAdmins}</strong>
            <span>Administradores</span>
          </div>
        </div>

        <div className="users-stat">
          <span className="users-stat-dot seller" />

          <div>
            <strong>{totalVendedores}</strong>
            <span>Vendedores</span>
          </div>
        </div>
      </section>

      {/* LISTAGEM */}

      <section className="users-content">

        <div className="users-content-header">
          <div>
            <p className="users-section-eyebrow">
              Membros
            </p>

            <h2>Equipe cadastrada</h2>
          </div>

          <span className="users-results">
            {usuariosFiltrados.length} exibidos
          </span>
        </div>

        {/* BUSCA */}

        <div className="users-search">
          <span className="users-search-icon">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou cargo..."
            value={busca}
            onChange={(e) =>
              setBusca(e.target.value)
            }
          />

          {busca && (
            <button
              type="button"
              onClick={() => setBusca("")}
            >
              Limpar
            </button>
          )}
        </div>

        {/* CABEÇALHO DA TABELA */}

        <div className="users-table-header">
          <span>Usuário</span>
          <span>Cargo</span>
          <span>Status</span>
          <span>Cadastrado em</span>
        </div>

        {/* USUÁRIOS */}

        <div className="users-list">

          {usuariosFiltrados.length === 0 ? (
            <div className="users-empty">
              <strong>
                Nenhum usuário encontrado
              </strong>

              <p>
                Tente pesquisar por outro nome,
                e-mail ou cargo.
              </p>
            </div>
          ) : (
            usuariosFiltrados.map((item) => {
              const fotoUrl = getImageUrl(
                item.foto_perfil
              );

              return (
                <article
                  key={item.id}
                  className="users-row"
                >
                  {/* USUÁRIO */}

                  <div className="users-person">

                    <div className="users-avatar-wrapper">
                      {fotoUrl ? (
                        <img
                          src={fotoUrl}
                          alt={item.nome}
                          className="users-avatar"
                        />
                      ) : (
                        <div className="users-avatar-placeholder">
                          {item.nome
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>
                      )}

                      <span
                        className={
                          item.ativo
                            ? "users-online-dot active"
                            : "users-online-dot inactive"
                        }
                      />
                    </div>

                    <div className="users-person-info">
                      <strong>
                        {item.nome}
                      </strong>

                      <span>
                        {item.email}
                      </span>
                    </div>
                  </div>

                  {/* CARGO */}

                  <div className="users-role">
                    <span
                      className={
                        item.cargo === "admin"
                          ? "admin"
                          : "seller"
                      }
                    >
                      {item.cargo === "admin"
                        ? "Administrador"
                        : "Vendedor"}
                    </span>
                  </div>

                  {/* STATUS */}

                  <div className="users-status">
                    <span
                      className={
                        item.ativo
                          ? "active"
                          : "inactive"
                      }
                    >
                      <i />

                      {item.ativo
                        ? "Ativo"
                        : "Inativo"}
                    </span>
                  </div>

                  {/* DATA */}

                  <div className="users-date">
                    {formatarData(
                      item.data_criacao
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

export default Users;