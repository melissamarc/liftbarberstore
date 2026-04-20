import { Link } from "react-router-dom";
import { useResponsive } from "../hooks/useResponsive";

function Home() {
  const { isMobile, isTablet } = useResponsive();

  return (
    <div style={styles.page}>
      <div style={styles.heroCard(isMobile)}>
        <header style={styles.topbar(isMobile)}>
          <div style={styles.brand}>
            <div style={styles.brandIcon}>
              <span style={styles.redStripe}></span>
              <span style={styles.blueStripe}></span>
            </div>

            <div>
              <p style={styles.brandMini}>Sistema</p>
              <h2 style={styles.brandTitle}>LiftBarberStore</h2>
            </div>
          </div>

          <div style={styles.topActions(isMobile)}>
            <Link to="/login" style={styles.secondaryLink}>
              Entrar
            </Link>
            <Link to="/register" style={styles.primaryLink}>
              Criar conta
            </Link>
          </div>
        </header>

        <section
          style={styles.heroContent(
            isMobile ? "1fr" : isTablet ? "1fr" : "1.05fr 0.95fr",
            isMobile
          )}
        >
          <div style={styles.heroLeft}>
            <span style={styles.heroBadge}>Gestão de vendas com IA</span>

            <h1 style={styles.heroTitle(isMobile)}>
              Controle sua loja com mais velocidade.
            </h1>

            <p style={styles.heroText}>
              Registre vendas, acompanhe a equipe e interprete pedidos com IA
              em uma interface bonita, rápida e profissional.
            </p>

            <div style={styles.heroButtons(isMobile)}>
              <Link to="/register" style={styles.heroPrimary}>
                Criar conta
              </Link>
              <Link to="/login" style={styles.heroSecondary}>
                Entrar
              </Link>
            </div>
          </div>

          <div style={styles.heroVisual}>
            <div style={styles.visualCard}>
              <div style={styles.pole}></div>
              <div style={styles.centerStripe}></div>
            </div>
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
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: (isMobile) => ({
    width: "100%",
    maxWidth: "1320px",
    minHeight: isMobile ? "auto" : "92vh",
    background: "linear-gradient(135deg, #f7f4ef 0%, #efe8df 100%)",
    borderRadius: "30px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.30)",
    padding: isMobile ? "20px" : "28px",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  }),
  topbar: (isMobile) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile ? "flex-start" : "center",
    flexDirection: isMobile ? "column" : "row",
    gap: "18px",
  }),
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  brandIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "#111",
    position: "relative",
    overflow: "hidden",
  },
  redStripe: {
    position: "absolute",
    left: "12px",
    top: 0,
    width: "8px",
    height: "100%",
    background: "#c91f28",
    transform: "skewX(-18deg)",
  },
  blueStripe: {
    position: "absolute",
    right: "12px",
    top: 0,
    width: "8px",
    height: "100%",
    background: "#1f4fa3",
    transform: "skewX(-18deg)",
  },
  brandMini: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#7b7b7b",
    fontWeight: 700,
    marginBottom: "2px",
  },
  brandTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#111",
  },
  topActions: (isMobile) => ({
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    width: isMobile ? "100%" : "auto",
  }),
  secondaryLink: {
    height: "44px",
    padding: "0 18px",
    borderRadius: "999px",
    background: "#fff",
    color: "#111",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #ddd",
  },
  primaryLink: {
    height: "44px",
    padding: "0 18px",
    borderRadius: "999px",
    background: "#111",
    color: "#fff",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  heroContent: (columns, isMobile) => ({
    display: "grid",
    gridTemplateColumns: columns,
    gap: "24px",
    alignItems: "center",
    flex: 1,
    minHeight: isMobile ? "auto" : 0,
  }),
  heroLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  heroBadge: {
    width: "fit-content",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(201,31,40,0.08)",
    color: "#c91f28",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  heroTitle: (isMobile) => ({
    fontSize: isMobile ? "42px" : "68px",
    lineHeight: 0.98,
    fontWeight: 900,
    letterSpacing: "-0.08em",
    color: "#111",
    maxWidth: "700px",
  }),
  heroText: {
    maxWidth: "560px",
    color: "#666",
    fontSize: "16px",
    lineHeight: 1.8,
  },
  heroButtons: (isMobile) => ({
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    width: isMobile ? "100%" : "auto",
  }),
  heroPrimary: {
    minWidth: "140px",
    height: "52px",
    padding: "0 20px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #c91f28 0%, #9f161e 100%)",
    color: "#fff",
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 12px 24px rgba(201,31,40,0.18)",
  },
  heroSecondary: {
    minWidth: "120px",
    height: "52px",
    padding: "0 20px",
    borderRadius: "999px",
    background: "#fff",
    color: "#111",
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #ddd",
  },
  heroVisual: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  visualCard: {
    width: "100%",
    maxWidth: "460px",
    aspectRatio: "1 / 1",
    borderRadius: "28px",
    background: "#f6f0e7",
    position: "relative",
    boxShadow: "inset 0 0 0 1px rgba(17,17,17,0.05)",
    overflow: "hidden",
  },
  pole: {
    position: "absolute",
    inset: "18% 41%",
    borderRadius: "999px",
    background: "#111",
    transform: "rotate(-28deg)",
  },
  centerStripe: {
    position: "absolute",
    inset: "23% 45%",
    background:
      "linear-gradient(180deg, #1f4fa3 0%, #1f4fa3 35%, #fff 35%, #fff 65%, #c91f28 65%, #c91f28 100%)",
    transform: "rotate(-28deg)",
    borderRadius: "999px",
  },
};

export default Home;