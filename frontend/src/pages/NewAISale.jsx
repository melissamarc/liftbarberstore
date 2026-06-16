import { useMemo, useState } from "react";
import api from "../services/api";
import { useResponsive } from "../hooks/useResponsive";

function NewAISale() {
  const [clienteNome, setClienteNome] = useState("");
  const [dataVenda, setDataVenda] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  const { isMobile, isTablet } = useResponsive();

  const valorDetectado = useMemo(() => {
    if (!mensagem.trim()) return 0;

    const linhas = mensagem.split("\n");
    const linhaTotal = linhas.find((linha) =>
      linha.toLowerCase().includes("total")
    );

    const textoBase = linhaTotal || mensagem;

    const valores = textoBase.match(
      /(\d{1,3}(?:\.\d{3})*|\d+)(?:,\d{2}|\.\d{2})/g
    );

    if (!valores || valores.length === 0) return 0;

    if (linhaTotal) {
      return Number(valores[0].replace(/\./g, "").replace(",", "."));
    }

    return valores.reduce((acc, valor) => {
      return acc + Number(valor.replace(/\./g, "").replace(",", "."));
    }, 0);
  }, [mensagem]);

  async function confirmarVenda() {
    try {
      setErro("");
      setMensagemSucesso("");

      if (!mensagem.trim()) {
        setErro("Cole a mensagem do pedido antes de salvar.");
        return;
      }

      if (!valorDetectado || valorDetectado <= 0) {
        setErro("Não encontrei um valor válido na mensagem.");
        return;
      }

      setSalvando(true);

      await api.post("/sales/ia", {
        cliente_nome: clienteNome.trim() || null,
        data_venda: dataVenda,
        mensagem_original: mensagem,
      });

      setMensagemSucesso("Venda registrada com sucesso.");
      setClienteNome("");
      setDataVenda(new Date().toISOString().slice(0, 10));
      setMensagem("");
    } catch (error) {
      setErro(error.response?.data?.message || "Erro ao salvar venda.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.pageHeader}>
        <div>
          <p style={styles.pageMini}>Pedido por texto</p>
          <h1 style={styles.pageTitle(isMobile)}>Registrar venda do catálogo</h1>
          <p style={styles.pageSubtitle}>
            Cole a mensagem gerada pelo carrinho. O sistema identifica o total e
            registra a venda no dashboard, ranking e histórico.
          </p>
        </div>
      </header>

      {erro && <p style={styles.erro}>{erro}</p>}
      {mensagemSucesso && <p style={styles.sucesso}>{mensagemSucesso}</p>}

      <section
        style={styles.board(
          isMobile ? "1fr" : isTablet ? "1fr" : "320px 1fr",
          isMobile
        )}
      >
        <aside style={styles.sidebar(isMobile)}>
          <div style={styles.darkCard}>
            <p style={styles.darkMini}>Venda rápida</p>
            <h3 style={styles.darkTitle}>Somador de pedido</h3>
            <p style={styles.darkText}>
              Não precisa reconhecer produto por produto. Basta colar o texto do
              pedido e confirmar.
            </p>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Cliente</label>
              <input
                placeholder="Nome do cliente"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Data da venda</label>
              <input
                type="date"
                value={dataVenda}
                onChange={(e) => setDataVenda(e.target.value)}
                style={styles.input}
              />
            </div>

            <p style={styles.summaryMini}>Total detectado</p>
            <h3 style={styles.summaryValue}>R$ {valorDetectado.toFixed(2)}</h3>

            <p style={styles.summaryText}>
              Esse valor será registrado como venda do dia e entrará no ranking
              semanal.
            </p>

            <button
              onClick={confirmarVenda}
              disabled={salvando || !mensagem.trim()}
              style={styles.confirmButton}
            >
              {salvando ? "Salvando..." : "Registrar venda"}
            </button>
          </div>
        </aside>

        <div style={styles.content(isMobile)}>
          <div style={styles.contentHeader}>
            <h2 style={styles.contentTitle}>Mensagem do pedido</h2>
            <p style={styles.contentSubtitle}>
              Cole aqui o texto copiado do carrinho do catálogo.
            </p>
          </div>

          <textarea
            placeholder={`Exemplo:

Pedido de João

2x Pomada Matte - R$ 40,00
1x Gel Cola - R$ 25,00

Total: R$ 65,00`}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            style={styles.textarea(isMobile)}
          />

          <div style={styles.previewBox}>
            <p style={styles.previewMini}>Prévia</p>

            {mensagem.trim() ? (
              <pre style={styles.previewText}>{mensagem}</pre>
            ) : (
              <p style={styles.emptyText}>Nenhuma mensagem colada ainda.</p>
            )}
          </div>
        </div>
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
  pageTitle: (isMobile) => ({
    fontSize: isMobile ? "28px" : "34px",
    fontWeight: 900,
    letterSpacing: "-0.05em",
    color: "#111",
  }),
  pageSubtitle: {
    color: "#666",
    fontSize: "15px",
    lineHeight: 1.6,
  },
  erro: {
    color: "#b00020",
    fontWeight: 600,
  },
  sucesso: {
    color: "#0a7d32",
    fontWeight: 600,
  },
  board: (columns, isMobile) => ({
    display: "grid",
    gridTemplateColumns: columns,
    gap: "20px",
    alignItems: "stretch",
    height: isMobile ? "auto" : "calc(100vh - 230px)",
    minHeight: isMobile ? "auto" : "620px",
    maxHeight: isMobile ? "none" : "620px",
  }),
  sidebar: (isMobile) => ({
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    height: isMobile ? "auto" : "100%",
  }),
  darkCard: {
    background: "#171921",
    color: "#fff",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
  },
  darkMini: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.55)",
    fontWeight: 700,
    marginBottom: "8px",
  },
  darkTitle: {
    fontSize: "24px",
    fontWeight: 800,
    letterSpacing: "-0.04em",
    marginBottom: "12px",
  },
  darkText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: "14px",
    lineHeight: 1.7,
  },
  summaryCard: {
    background: "#fff",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  fieldLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#7b7b7b",
    fontWeight: 700,
  },
  input: {
    height: "46px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    padding: "0 12px",
    outline: "none",
    color: "#111",
    fontSize: "14px",
    background: "#faf9f7",
  },
  summaryMini: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#7b7b7b",
    fontWeight: 700,
    marginTop: "6px",
  },
  summaryValue: {
    fontSize: "42px",
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: "-0.05em",
    color: "#111",
  },
  summaryText: {
    color: "#666",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  confirmButton: {
    marginTop: "8px",
    height: "52px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #c91f28 0%, #9f161e 100%)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  content: (isMobile) => ({
    background: "#fff",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    minHeight: 0,
    overflow: "hidden",
    height: isMobile ? "auto" : "100%",
  }),
  contentHeader: {
    flexShrink: 0,
  },
  contentTitle: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#111",
    letterSpacing: "-0.03em",
    marginBottom: "6px",
  },
  contentSubtitle: {
    color: "#666",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  textarea: (isMobile) => ({
    width: "100%",
    minHeight: isMobile ? "260px" : "300px",
    flex: isMobile ? "unset" : 1,
    resize: "none",
    borderRadius: "18px",
    border: "1px solid #ddd",
    padding: "16px",
    fontSize: "14px",
    lineHeight: 1.6,
    outline: "none",
    background: "#faf9f7",
    color: "#111",
  }),
  previewBox: {
    background: "#f8f6f2",
    borderRadius: "18px",
    padding: "16px",
    border: "1px solid #eee8df",
    maxHeight: "180px",
    overflowY: "auto",
  },
  previewMini: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#7b7b7b",
    fontWeight: 700,
    marginBottom: "8px",
  },
  previewText: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontSize: "13px",
    lineHeight: 1.6,
    color: "#333",
    margin: 0,
    fontFamily: "inherit",
  },
  emptyText: {
    color: "#666",
    fontSize: "14px",
    lineHeight: 1.6,
  },
};

export default NewAISale;