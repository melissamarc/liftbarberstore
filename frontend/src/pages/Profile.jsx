import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import api, { getImageUrl } from "../services/api";

function Profile() {
  const [perfil, setPerfil] = useState(null);
  const [arquivo, setArquivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const { usuario, login } = useAuth();

  async function carregarPerfil() {
    try {
      setLoading(true);
      setErro("");

      const response = await api.get("/users/me");
      setPerfil(response.data);
    } catch (error) {
      setErro("Erro ao carregar perfil.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function handleUpload(e) {
    e.preventDefault();

    if (!arquivo) {
      setErro("Selecione uma imagem.");
      return;
    }

    try {
      setEnviando(true);
      setErro("");
      setMensagem("");

      const formData = new FormData();
      formData.append("foto", arquivo);

      const response = await api.post("/users/me/foto", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const novaFoto = response.data.foto_perfil;

      const usuarioAtualizado = {
        ...usuario,
        foto_perfil: novaFoto,
      };

      login(usuarioAtualizado, localStorage.getItem("token"));

      setMensagem("Foto atualizada com sucesso.");
      setArquivo(null);

      await carregarPerfil();
    } catch (error) {
      setErro(error.response?.data?.message || "Erro ao enviar foto.");
    } finally {
      setEnviando(false);
    }
  }

  if (loading) {
    return <p>Carregando perfil...</p>;
  }

   const urlFoto = getImageUrl(item.foto_perfil);

  return (
    <div style={styles.page}>
      <header style={styles.pageHeader}>
        <div>
          <p style={styles.pageMini}>Conta</p>
          <h1 style={styles.pageTitle}>Meu perfil</h1>
          <p style={styles.pageSubtitle}>
            Visualize seus dados e atualize sua foto de perfil.
          </p>
        </div>
      </header>

      {erro && <p style={styles.erro}>{erro}</p>}
      {mensagem && <p style={styles.sucesso}>{mensagem}</p>}

      <section style={styles.board}>
        <div style={styles.mainCard}>
          <div style={styles.heroCard}>
            <div style={styles.heroLeft}>
              <div style={styles.avatarWrap}>
                {urlFoto ? (
                  <img src={urlFoto} alt="Foto de perfil" style={styles.avatar} />
                ) : (
                  <div style={styles.avatarPlaceholder}>
                    {perfil?.nome?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              <div>
                <p style={styles.heroMini}>Usuário logado</p>
                <h2 style={styles.heroName}>{perfil?.nome}</h2>
                <p style={styles.heroEmail}>{perfil?.email}</p>

                <div style={styles.heroBadges}>
                  <span
                    style={{
                      ...styles.badge,
                      ...(perfil?.cargo === "admin"
                        ? styles.badgeAdmin
                        : styles.badgeSeller),
                    }}
                  >
                    {perfil?.cargo === "admin" ? "Administrador" : "Vendedor"}
                  </span>

                  <span
                    style={{
                      ...styles.badge,
                      ...(perfil?.ativo ? styles.badgeActive : styles.badgeInactive),
                    }}
                  >
                    {perfil?.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.infoGrid}>
            <div style={styles.infoCard}>
              <span style={styles.infoLabel}>Nome</span>
              <strong style={styles.infoValue}>{perfil?.nome}</strong>
            </div>

            <div style={styles.infoCard}>
              <span style={styles.infoLabel}>Email</span>
              <strong style={styles.infoValue}>{perfil?.email}</strong>
            </div>

            <div style={styles.infoCard}>
              <span style={styles.infoLabel}>Cargo</span>
              <strong style={styles.infoValue}>
                {perfil?.cargo === "admin" ? "Administrador" : "Vendedor"}
              </strong>
            </div>

            <div style={styles.infoCard}>
              <span style={styles.infoLabel}>Conta criada em</span>
              <strong style={styles.infoValue}>
                {new Date(perfil?.data_criacao).toLocaleDateString("pt-BR")}
              </strong>
            </div>
          </div>
        </div>

        <aside style={styles.sidePanel}>
          <div style={styles.sideCardDark}>
            <p style={styles.sideMiniDark}>Imagem</p>
            <h3 style={styles.sideTitleDark}>Atualizar foto</h3>
            <p style={styles.sideTextDark}>
              Escolha uma imagem em JPG, PNG ou WEBP para usar como foto de perfil.
            </p>
          </div>

          <div style={styles.sideCardLight}>
            <form onSubmit={handleUpload} style={styles.form}>
              <div style={styles.inputWrap}>
                <label style={styles.label}>Selecionar arquivo</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(e) => setArquivo(e.target.files[0])}
                  style={styles.fileInput}
                />
              </div>

              <button type="submit" disabled={enviando} style={styles.primaryButton}>
                {enviando ? "Enviando..." : "Atualizar foto"}
              </button>
            </form>
          </div>

          <div style={styles.sideInfoCard}>
            <p style={styles.sideMiniLight}>Dica</p>
            <p style={styles.sideTextLight}>
              Uma boa foto ajuda a deixar o ranking e a navegação da equipe mais claros.
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
  pageTitle: {
    fontSize: "34px",
    fontWeight: 900,
    letterSpacing: "-0.05em",
    color: "#111",
  },
  pageSubtitle: {
    color: "#666",
    fontSize: "15px",
  },
  erro: {
    color: "#b00020",
    fontWeight: 600,
  },
  sucesso: {
    color: "#0a7d32",
    fontWeight: 600,
  },
  board: {
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: "20px",
    alignItems: "stretch",
    height: "calc(100vh - 230px)",
    minHeight: "620px",
    maxHeight: "620px",
  },
  mainCard: {
    background: "#fff",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    overflow: "hidden",
  },
  heroCard: {
    background: "#f8f6f2",
    borderRadius: "24px",
    padding: "22px",
    border: "1px solid #eee8df",
  },
  heroLeft: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  avatarWrap: {
    width: "128px",
    height: "128px",
    flexShrink: 0,
  },
  avatar: {
    width: "128px",
    height: "128px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "5px solid #f1ebe3",
  },
  avatarPlaceholder: {
    width: "128px",
    height: "128px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1f4fa3 0%, #c91f28 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: "40px",
    border: "5px solid #f1ebe3",
  },
  heroMini: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#7b7b7b",
    fontWeight: 700,
    marginBottom: "6px",
  },
  heroName: {
    fontSize: "34px",
    lineHeight: 1.05,
    fontWeight: 900,
    letterSpacing: "-0.05em",
    color: "#111",
    marginBottom: "8px",
  },
  heroEmail: {
    color: "#666",
    fontSize: "15px",
    marginBottom: "16px",
  },
  heroBadges: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  badge: {
    padding: "10px 14px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
  },
  badgeAdmin: {
    background: "rgba(201,31,40,0.10)",
    color: "#c91f28",
  },
  badgeSeller: {
    background: "rgba(31,79,163,0.10)",
    color: "#1f4fa3",
  },
  badgeActive: {
    background: "rgba(18, 130, 70, 0.14)",
    color: "#0b7f44",
  },
  badgeInactive: {
    background: "rgba(176, 0, 32, 0.12)",
    color: "#b00020",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },
  infoCard: {
    background: "#fff",
    borderRadius: "20px",
    padding: "18px",
    border: "1px solid #eee8df",
    boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  infoLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#8a8a8a",
    fontWeight: 700,
  },
  infoValue: {
    fontSize: "18px",
    color: "#111",
    fontWeight: 800,
    lineHeight: 1.4,
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
  sideCardLight: {
    background: "#fff",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
  },
  sideInfoCard: {
    background: "#f8f6f2",
    borderRadius: "24px",
    padding: "22px",
    border: "1px solid #eee8df",
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
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  inputWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#444",
  },
  fileInput: {
    minHeight: "52px",
    borderRadius: "14px",
    border: "1px solid #ddd",
    padding: "12px",
    background: "#fff",
    color: "#111",
  },
  primaryButton: {
    height: "52px",
    padding: "0 18px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #c91f28 0%, #9f161e 100%)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(201,31,40,0.18)",
  },
};

export default Profile;