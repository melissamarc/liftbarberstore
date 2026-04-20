import { Link } from "react-router-dom";

function Home() {
  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.card}>
          <header style={styles.header}>
            <div style={styles.brand}>
              <div style={styles.brandIcon}>
                <span style={styles.brandBarberRed}></span>
                <span style={styles.brandBarberBlue}></span>
              </div>

              <h2 style={styles.brandTitle}>Lift Barber Registro de Vendas</h2>
            </div>

            <nav style={styles.nav}>
              <Link to="/login" style={styles.navLink}>
                Entrar
              </Link>

              <Link to="/cadastro" style={styles.navButton}>
                Criar conta
              </Link>
            </nav>
          </header>

          <div style={styles.hero}>
            <div style={styles.left}>
              <span style={styles.badge}>gestão de vendas com IA</span>

              <h1 style={styles.title}>
                Controle sua loja com mais velocidade.
              </h1>

              <p style={styles.description}>
                Registre vendas, acompanhe a equipe e interprete pedidos com IA.
              </p>

              <div style={styles.actions}>
                <Link to="/cadastro" style={styles.primaryButton}>
                  Criar conta
                </Link>

                <Link to="/login" style={styles.secondaryButton}>
                  Entrar
                </Link>
              </div>
            </div>

            <div style={styles.right}>
              <div style={styles.visualBox}>
                <div style={styles.glowRed}></div>
                <div style={styles.glowBlue}></div>

                <div style={styles.centerVisual}>
                  <div style={styles.pole}>
                    <div style={styles.poleCap}></div>

                    <div style={styles.poleBody}>
                      <div style={styles.poleStripeBlue}></div>
                      <div style={styles.poleStripeRed}></div>
                      <div style={styles.poleStripeBlue2}></div>
                    </div>

                    <div style={styles.poleCap}></div>
                  </div>
                </div>

                <div style={styles.floatingTagTop}>IA</div>
                <div style={styles.floatingTagBottom}>Dashboard</div>
              </div>
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
    padding: "32px",
  },
  shell: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  card: {
    minHeight: "calc(100vh - 64px)",
    background: "linear-gradient(135deg, #f7f4ef 0%, #f1ebe3 100%)",
    borderRadius: "28px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
    padding: "30px 34px",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  brandIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "#111",
    position: "relative",
    overflow: "hidden",
  },
  brandBarberRed: {
    position: "absolute",
    left: "10px",
    top: 0,
    width: "8px",
    height: "100%",
    background: "#c91f28",
    transform: "skewX(-18deg)",
  },
  brandBarberBlue: {
    position: "absolute",
    right: "10px",
    top: 0,
    width: "8px",
    height: "100%",
    background: "#1f4fa3",
    transform: "skewX(-18deg)",
  },
  brandTitle: {
    color: "#111",
    fontSize: "22px",
    fontWeight: 800,
    letterSpacing: "-0.03em",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  navLink: {
    color: "#1c1c1c",
    fontSize: "14px",
    fontWeight: 600,
    padding: "10px 14px",
  },
  navButton: {
    padding: "12px 18px",
    borderRadius: "999px",
    background: "#111",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 700,
  },
  hero: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    alignItems: "center",
  },
  left: {
    maxWidth: "620px",
  },
  badge: {
    display: "inline-flex",
    padding: "10px 16px",
    borderRadius: "999px",
    background: "rgba(201,31,40,0.08)",
    color: "#8e1118",
    fontSize: "13px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "22px",
  },
  title: {
    color: "#101418",
    fontSize: "clamp(42px, 6vw, 74px)",
    lineHeight: 1.02,
    fontWeight: 900,
    letterSpacing: "-0.06em",
    marginBottom: "18px",
    maxWidth: "720px",
  },
  description: {
    color: "#5d6168",
    fontSize: "18px",
    lineHeight: 1.7,
    maxWidth: "520px",
    marginBottom: "28px",
  },
  actions: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "15px 24px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #c91f28 0%, #9f161e 100%)",
    color: "#fff",
    fontWeight: 800,
    boxShadow: "0 12px 24px rgba(201,31,40,0.22)",
  },
  secondaryButton: {
    padding: "15px 24px",
    borderRadius: "999px",
    background: "#ffffff",
    color: "#111",
    fontWeight: 700,
    border: "1px solid rgba(17,17,17,0.08)",
  },
  right: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  visualBox: {
    width: "100%",
    maxWidth: "520px",
    minHeight: "500px",
    borderRadius: "32px",
    background: "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.95) 0%, #ebe4db 68%, #e4dcd2 100%)",
    position: "relative",
    overflow: "hidden",
    boxShadow: "inset 0 0 0 1px rgba(17,17,17,0.05)",
  },
  glowRed: {
    position: "absolute",
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    background: "rgba(201,31,40,0.18)",
    filter: "blur(48px)",
    top: "38px",
    right: "30px",
  },
  glowBlue: {
    position: "absolute",
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    background: "rgba(31,79,163,0.16)",
    filter: "blur(48px)",
    bottom: "34px",
    left: "24px",
  },
  centerVisual: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pole: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    transform: "rotate(18deg)",
    filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.14))",
  },
  poleCap: {
    width: "84px",
    height: "28px",
    borderRadius: "999px",
    background: "#181818",
  },
  poleBody: {
    width: "84px",
    height: "250px",
    background: "#f5f5f5",
    borderLeft: "4px solid #d8d8d8",
    borderRight: "4px solid #d8d8d8",
    position: "relative",
    overflow: "hidden",
  },
  poleStripeBlue: {
    position: "absolute",
    top: "-20px",
    left: "8px",
    width: "22px",
    height: "290px",
    background: "#1f4fa3",
    transform: "skewY(28deg)",
  },
  poleStripeRed: {
    position: "absolute",
    top: "-10px",
    left: "30px",
    width: "22px",
    height: "290px",
    background: "#c91f28",
    transform: "skewY(28deg)",
  },
  poleStripeBlue2: {
    position: "absolute",
    top: "-20px",
    left: "52px",
    width: "22px",
    height: "290px",
    background: "#1f4fa3",
    transform: "skewY(28deg)",
  },
  floatingTagTop: {
    position: "absolute",
    top: "34px",
    left: "34px",
    background: "#fff",
    color: "#111",
    padding: "10px 16px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },
  floatingTagBottom: {
    position: "absolute",
    bottom: "34px",
    right: "34px",
    background: "#fff",
    color: "#111",
    padding: "10px 16px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },
};

export default Home;