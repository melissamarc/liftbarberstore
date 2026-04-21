import { Link } from "react-router-dom";
import { useResponsive } from "../hooks/useResponsive";

function Home() {
  const { isMobile, isTablet } = useResponsive();

  return (
    <div style={styles.page(isMobile)}>
      <div style={styles.heroCard(isMobile, isTablet)}>
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
            <Link to="/cadastro" style={styles.primaryLink}>
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

            <p style={styles.heroText(isMobile)}>
              Registre vendas, acompanhe a equipe e interprete pedidos com IA
              em uma interface bonita, rápida e profissional.
            </p>

            <div style={styles.heroButtons(isMobile)}>
              <Link to="/cadastro" style={styles.heroPrimary}>
                Criar conta
              </Link>
              <Link to="/login" style={styles.heroSecondary}>
                Entrar
              </Link>
            </div>
          </div>

          <div style={styles.heroVisual}>
            <div style={styles.visualCard(isMobile, isTablet)}>
              <div style={styles.visualGlowBlue}></div>
              <div style={styles.visualGlowRed}></div>

              <div style={styles.iconCloud}>
                <div style={styles.floatingIcon("✂", "14%", "12%", "rotate(-14deg)")}>
                  ✂
                </div>
                <div style={styles.floatingIcon("✂", "18%", "70%", "rotate(18deg)")}>
                  ✂
                </div>
                <div style={styles.floatingIcon("🪮", "42%", "18%", "rotate(-8deg)")}>
                  🪮
                </div>
                <div style={styles.floatingIcon("🪮", "68%", "68%", "rotate(10deg)")}>
                  🪮
                </div>
                <div style={styles.floatingIcon("🪒", "72%", "20%", "rotate(-18deg)")}>
                  🪒
                </div>
                <div style={styles.floatingIcon("💈", "30%", "58%", "rotate(0deg)")}>
                  💈
                </div>
                <div style={styles.floatingIcon("💇", "56%", "46%", "rotate(0deg)")}>
                  💇
                </div>
              </div>

              <div style={styles.visualContent}>
                <div style={styles.visualMiniCards(isMobile)}>
                  <div style={styles.visualMiniCard}>
                    <span style={styles.visualMiniLabel}>Dashboard</span>
                    <strong style={styles.visualMiniValue}>Loja online</strong>
                  </div>

                  <div style={styles.visualMiniCardDark}>
                    <span style={styles.visualMiniLabelDark}>Equipe</span>
                    <strong style={styles.visualMiniValueDark}>Top vendas</strong>
                  </div>
                </div>

                <div style={styles.centerInfoCard(isMobile)}>
                  <p style={styles.centerInfoMini}>Painel inteligente</p>
                  <h3 style={styles.centerInfoTitle(isMobile)}>
                    Organização, estética e controle.
                  </h3>
                  <p style={styles.centerInfoText}>
                    Um sistema pensado para vendas, operação e performance da sua loja.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: (isMobile) => ({
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a0a 0%, #171717 100%)",
    padding: isMobile ? "12px" : "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),

  heroCard: (isMobile, isTablet) => ({
    width: "100%",
    maxWidth: "1320px",
    minHeight: isMobile ? "auto" : isTablet ? "auto" : "92vh",
    background: "linear-gradient(135deg, #f7f4ef 0%, #efe8df 100%)",
    borderRadius: isMobile ? "22px" : "30px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.30)",
    padding: isMobile ? "18px" : isTablet ? "22px" : "28px",
    display: "flex",
    flexDirection: "column",
    gap: isMobile ? "22px" : "28px",
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
    flexShrink: 0,
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
    gap: isMobile ? "24px" : "24px",
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
    fontSize: isMobile ? "38px" : "68px",
    lineHeight: 0.98,
    fontWeight: 900,
    letterSpacing: "-0.08em",
    color: "#111",
    maxWidth: "700px",
  }),

  heroText: (isMobile) => ({
    maxWidth: "560px",
    color: "#666",
    fontSize: isMobile ? "15px" : "16px",
    lineHeight: 1.8,
  }),

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

  visualCard: (isMobile, isTablet) => ({
    width: "100%",
    maxWidth: isMobile ? "100%" : isTablet ? "420px" : "480px",
    minHeight: isMobile ? "360px" : isTablet ? "460px" : "560px",
    borderRadius: isMobile ? "22px" : "28px",
    background: "linear-gradient(160deg, #111822 0%, #0f1218 100%)",
    position: "relative",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
    overflow: "hidden",
    padding: isMobile ? "18px" : "24px",
  }),

  visualGlowBlue: {
    position: "absolute",
    top: "-40px",
    right: "-30px",
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    background: "rgba(31,79,163,0.20)",
    filter: "blur(40px)",
  },

  visualGlowRed: {
    position: "absolute",
    bottom: "-50px",
    left: "-20px",
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    background: "rgba(201,31,40,0.16)",
    filter: "blur(40px)",
  },

  iconCloud: {
    position: "absolute",
    inset: 0,
    zIndex: 1,
  },

  floatingIcon: (icon, top, left, transform) => ({
    position: "absolute",
    top,
    left,
    width: "64px",
    height: "64px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(8px)",
    color: "#fff",
    fontSize: icon === "💇" ? "28px" : "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform,
    opacity: 0.9,
  }),

  visualContent: {
    position: "relative",
    zIndex: 2,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  visualMiniCards: (isMobile) => ({
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    flexDirection: isMobile ? "column" : "row",
  }),

  visualMiniCard: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "14px",
    minWidth: "150px",
    backdropFilter: "blur(8px)",
  },

  visualMiniLabel: {
    display: "block",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.58)",
    fontWeight: 700,
    marginBottom: "6px",
  },

  visualMiniValue: {
    color: "#fff",
    fontSize: "16px",
    fontWeight: 800,
  },

  visualMiniCardDark: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "14px",
    minWidth: "150px",
    backdropFilter: "blur(8px)",
  },

  visualMiniLabelDark: {
    display: "block",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.58)",
    fontWeight: 700,
    marginBottom: "6px",
  },

  visualMiniValueDark: {
    color: "#fff",
    fontSize: "16px",
    fontWeight: 800,
  },

  centerInfoCard: (isMobile) => ({
    width: "100%",
    maxWidth: isMobile ? "100%" : "340px",
    alignSelf: "center",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "22px",
    padding: "18px",
    backdropFilter: "blur(10px)",
  }),

  centerInfoMini: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.55)",
    fontWeight: 700,
    marginBottom: "8px",
  },

  centerInfoTitle: (isMobile) => ({
    color: "#fff",
    fontSize: isMobile ? "22px" : "24px",
    lineHeight: 1.1,
    fontWeight: 800,
    letterSpacing: "-0.04em",
    marginBottom: "10px",
  }),

  centerInfoText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: "14px",
    lineHeight: 1.7,
  },
};

export default Home;