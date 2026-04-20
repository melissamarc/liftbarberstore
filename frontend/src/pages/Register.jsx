import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useResponsive } from "../hooks/useResponsive";

function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setErro("");

      await api.post("/users", {
        nome,
        email,
        senha,
      });

      navigate("/login");
    } catch (error) {
      setErro(error.response?.data?.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card(isMobile)}>
        <div
          style={styles.grid(
            isMobile ? "1fr" : isTablet ? "1fr" : "1fr 1fr",
            isMobile
          )}
        >
          <div style={styles.visualSide(isMobile)}>
            <div style={styles.visualCard}>
              <div style={styles.visualOverlay}>
                <h2 style={styles.visualTitle}>Your adventure start here</h2>
                <p style={styles.visualText}>
                  Crie sua conta e comece a organizar sua operação com mais estilo.
                </p>
              </div>
            </div>
          </div>

          <div style={styles.formSide}>
            <Link to="/" style={styles.backButton}>
              ← Voltar
            </Link>

            <div style={styles.authToggle}>
              <span style={styles.toggleActive}>Register</span>
              <Link to="/login" style={styles.toggleInactive}>
                Login
              </Link>
            </div>

            <div style={styles.formWrap}>
              <h1 style={styles.title}>Create New Account</h1>
              <p style={styles.subtitle}>
                Comece sua jornada no sistema da barbearia.
              </p>

              {erro && <p style={styles.erro}>{erro}</p>}

              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.field}>
                  <label style={styles.label}>Nome</label>
                  <input
                    type="text"
                    placeholder="Melissa"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    placeholder="admin@liftbarber.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Senha</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <button type="submit" style={styles.primaryButton}>
                  {loading ? "Criando..." : "Let's Start Your Journey"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#d9d9d9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  card: (isMobile) => ({
    width: "100%",
    maxWidth: "1200px",
    background: "#fff",
    borderRadius: "24px",
    boxShadow: "0 12px 35px rgba(0,0,0,0.10)",
    padding: isMobile ? "18px" : "22px",
  }),
  grid: (columns) => ({
    display: "grid",
    gridTemplateColumns: columns,
    gap: "22px",
    alignItems: "stretch",
  }),
  visualSide: (isMobile) => ({
    display: isMobile ? "none" : "block",
  }),
  visualCard: {
    height: "100%",
    minHeight: "520px",
    borderRadius: "22px",
    background:
      "linear-gradient(180deg, rgba(18,52,86,0.45), rgba(18,52,86,0.15)), url('https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80') center/cover",
    position: "relative",
    overflow: "hidden",
  },
  visualOverlay: {
    position: "absolute",
    inset: "auto 24px 24px 24px",
    color: "#fff",
  },
  visualTitle: {
    fontSize: "42px",
    lineHeight: 1.05,
    fontWeight: 300,
    marginBottom: "10px",
  },
  visualText: {
    fontSize: "14px",
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.88)",
    maxWidth: "420px",
  },
  formSide: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  backButton: {
    width: "fit-content",
    height: "42px",
    padding: "0 14px",
    borderRadius: "999px",
    background: "#f4f4f4",
    display: "inline-flex",
    alignItems: "center",
    color: "#111",
    fontWeight: 700,
  },
  authToggle: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    flexWrap: "wrap",
  },
  toggleInactive: {
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#f3f3f3",
    color: "#666",
    fontWeight: 700,
    fontSize: "13px",
  },
  toggleActive: {
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#ef4637",
    color: "#fff",
    fontWeight: 700,
    fontSize: "13px",
  },
  formWrap: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    maxWidth: "420px",
    width: "100%",
    margin: "0 auto",
    gap: "18px",
  },
  title: {
    fontSize: "42px",
    fontWeight: 900,
    color: "#111",
    letterSpacing: "-0.05em",
  },
  subtitle: {
    color: "#666",
    fontSize: "14px",
    lineHeight: 1.7,
  },
  erro: {
    color: "#b00020",
    fontWeight: 600,
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    color: "#555",
    fontWeight: 700,
  },
  input: {
    height: "52px",
    borderRadius: "14px",
    border: "1px solid #ddd",
    padding: "0 14px",
    fontSize: "14px",
    outline: "none",
  },
  primaryButton: {
    height: "52px",
    borderRadius: "14px",
    border: "none",
    background: "#ef4637",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    marginTop: "4px",
  },
};

export default Register;