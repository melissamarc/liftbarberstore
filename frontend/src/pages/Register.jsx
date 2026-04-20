import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setErro("");
      setMensagem("");

      await api.post("/users", {
        nome,
        email,
        senha,
        cargo: "vendedor",
      });

      setMensagem("Conta criada com sucesso. Redirecionando para o login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setErro(error.response?.data?.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <section style={styles.visualSide}>
          <div style={styles.visualPanel}>
            <div style={styles.visualOverlay}></div>

            <div style={styles.visualScissor}>
              ✂
            </div>

            <div style={styles.visualTextBox}>
              <p style={styles.visualMini}>LiftBarberStore</p>
              <h2 style={styles.visualTitle}>
                Comece sua operação com uma base simples e inteligente.
              </h2>
              <p style={styles.visualDesc}>
                Crie sua conta, organize a equipe e acompanhe as vendas em uma experiência mais moderna.
              </p>
            </div>
          </div>
        </section>

        <section style={styles.formSide}>
          <div style={styles.topBar}>
            <Link to="/" style={styles.backButton}>
              ←
            </Link>

            <div style={styles.switchTabs}>
              <span style={styles.tabActive}>Cadastro</span>
              <Link to="/login" style={styles.tabGhost}>
                Login
              </Link>
            </div>
          </div>

          <div style={styles.formContent}>
            <h1 style={styles.title}>Criar nova conta</h1>
            <p style={styles.subtitle}>
              Entre para o sistema e comece a registrar vendas com mais agilidade.
            </p>

            {erro && <p style={styles.erro}>{erro}</p>}
            {mensagem && <p style={styles.sucesso}>{mensagem}</p>}

            <form onSubmit={handleRegister} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nome</label>
                <input
                  type="text"
                  placeholder="Digite seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Senha</label>
                <input
                  type="password"
                  placeholder="Crie uma senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <button type="submit" disabled={loading} style={styles.primaryButton}>
                {loading ? "Criando..." : "Criar conta"}
              </button>
            </form>

            <p style={styles.bottomText}>
              Já tem conta?{" "}
              <Link to="/login" style={styles.inlineLink}>
                Entrar
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a0a 0%, #171717 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "32px",
  },
  card: {
    width: "100%",
    maxWidth: "1200px",
    minHeight: "720px",
    background: "#f7f4ef",
    borderRadius: "28px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    overflow: "hidden",
  },
  visualSide: {
    padding: "22px 0 22px 22px",
  },
  visualPanel: {
    height: "100%",
    minHeight: "676px",
    borderRadius: "24px",
    position: "relative",
    overflow: "hidden",
    background:
      "radial-gradient(circle at top left, rgba(201,31,40,0.28), transparent 30%), radial-gradient(circle at bottom right, rgba(49,95,181,0.35), transparent 30%), linear-gradient(160deg, #0f1720 0%, #10151d 100%)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    padding: "34px",
  },
  visualOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to top, rgba(0,0,0,0.38), rgba(0,0,0,0.03))",
  },
  visualScissor: {
    position: "absolute",
    right: "48px",
    top: "56px",
    fontSize: "120px",
    color: "rgba(255,255,255,0.08)",
    zIndex: 1,
    transform: "rotate(-12deg)",
    fontWeight: 900,
  },
  visualTextBox: {
    position: "relative",
    zIndex: 2,
    maxWidth: "360px",
  },
  visualMini: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.75)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "12px",
    fontWeight: 700,
  },
  visualTitle: {
    fontSize: "50px",
    lineHeight: 1.03,
    letterSpacing: "-0.05em",
    fontWeight: 900,
    color: "#fff",
    marginBottom: "16px",
  },
  visualDesc: {
    color: "rgba(255,255,255,0.72)",
    fontSize: "16px",
    lineHeight: 1.7,
  },
  formSide: {
    padding: "32px",
    display: "flex",
    flexDirection: "column",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },
  backButton: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#ece8e1",
    color: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: 700,
  },
  switchTabs: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#efebe5",
    padding: "6px",
    borderRadius: "999px",
  },
  tabGhost: {
    padding: "8px 14px",
    borderRadius: "999px",
    color: "#666",
    fontSize: "13px",
    fontWeight: 700,
  },
  tabActive: {
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#c91f28",
    color: "#fff",
    fontSize: "13px",
    fontWeight: 800,
  },
  formContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    maxWidth: "430px",
    margin: "0 auto",
    width: "100%",
  },
  title: {
    fontSize: "46px",
    lineHeight: 1.05,
    fontWeight: 900,
    letterSpacing: "-0.05em",
    color: "#111",
    marginBottom: "12px",
  },
  subtitle: {
    color: "#5d6168",
    fontSize: "16px",
    lineHeight: 1.7,
    marginBottom: "28px",
  },
  erro: {
    color: "#b00020",
    marginBottom: "14px",
    fontSize: "14px",
    fontWeight: 600,
  },
  sucesso: {
    color: "#0a7d32",
    marginBottom: "14px",
    fontSize: "14px",
    fontWeight: 600,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#444",
  },
  input: {
    height: "54px",
    borderRadius: "14px",
    border: "1px solid #ddd6cd",
    background: "#fff",
    padding: "0 16px",
    color: "#111",
    outline: "none",
  },
  primaryButton: {
    marginTop: "8px",
    height: "54px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #c91f28 0%, #9f161e 100%)",
    color: "#fff",
    fontWeight: 800,
    fontSize: "15px",
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(201,31,40,0.22)",
  },
  bottomText: {
    marginTop: "18px",
    color: "#666",
    fontSize: "14px",
  },
  inlineLink: {
    color: "#c91f28",
    fontWeight: 700,
  },
};

export default Register;