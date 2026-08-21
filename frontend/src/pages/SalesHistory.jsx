import { useEffect, useState } from "react";
import api from "../services/api";
import { useResponsive } from "../hooks/useResponsive";

function SalesHistory() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [clienteBusca, setClienteBusca] = useState("");
  const [dataBusca, setDataBusca] = useState("");

  const [vendaEditando, setVendaEditando] = useState(null);
  const [editClienteNome, setEditClienteNome] = useState("");
  const [editDataVenda, setEditDataVenda] = useState("");
  const [editTextoOriginal, setEditTextoOriginal] = useState("");
  const [editValorTotal, setEditValorTotal] = useState("");
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  const { isMobile } = useResponsive();

  useEffect(() => {
    carregarHistorico();
  }, []);

  async function carregarHistorico(
    cliente = clienteBusca,
    data = dataBusca
  ) {
    try {
      setLoading(true);
      setErro("");

      const response = await api.get("/sales", {
        params: {
          cliente,
          data,
        },
      });

      setVendas(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);

      setErro(
        error.response?.data?.message ||
          "Erro ao carregar histórico."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleBuscar(e) {
    e.preventDefault();
    await carregarHistorico();
  }

  async function limparFiltros() {
    setClienteBusca("");
    setDataBusca("");
    await carregarHistorico("", "");
  }

  async function excluirVenda(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta venda?"
    );

    if (!confirmar) return;

    try {
      setErro("");
      setMensagem("");

      await api.delete(`/sales/${id}`);

      setMensagem("Venda excluída com sucesso.");

      await carregarHistorico();
    } catch (error) {
      console.error("Erro ao excluir venda:", error);

      setErro(
        error.response?.data?.message ||
          "Erro ao excluir venda."
      );
    }
  }

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarDataInput(data) {
    if (!data) {
      return new Date().toISOString().slice(0, 10);
    }

    if (
      typeof data === "string" &&
      data.includes("T")
    ) {
      return data.slice(0, 10);
    }

    if (
      typeof data === "string" &&
      data.length >= 10
    ) {
      return data.slice(0, 10);
    }

    return new Date(data)
      .toISOString()
      .slice(0, 10);
  }

  function formatarDataExibicao(data) {
    if (!data) return "Não informada";

    const texto =
      typeof data === "string"
        ? data.slice(0, 10)
        : data;

    const [ano, mes, dia] =
      String(texto).split("-");

    if (ano && mes && dia) {
      return `${dia}/${mes}/${ano}`;
    }

    return new Date(data).toLocaleDateString(
      "pt-BR"
    );
  }

  function gerarNumeroPedido(venda) {
    return String(venda.id).padStart(9, "0");
  }

  function escaparHtml(valor) {
    return String(valor || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function abrirEdicao(venda) {
    setVendaEditando(venda);

    setEditClienteNome(
      venda.cliente_nome || ""
    );

    setEditDataVenda(
      formatarDataInput(
        venda.data_venda ||
          venda.data_criacao
      )
    );

    setEditTextoOriginal(
      venda.texto_original || ""
    );

    setEditValorTotal(
      Number(venda.valor_total || 0).toFixed(2)
    );

    setErro("");
    setMensagem("");
  }

  function fecharEdicao() {
    setVendaEditando(null);
    setEditClienteNome("");
    setEditDataVenda("");
    setEditTextoOriginal("");
    setEditValorTotal("");
  }

  async function salvarEdicaoVenda() {
    if (!vendaEditando) return;

    try {
      setErro("");
      setMensagem("");

      if (!editTextoOriginal.trim()) {
        setErro(
          "A mensagem original é obrigatória."
        );
        return;
      }

      const valorNumero =
        Number(editValorTotal);

      if (
        Number.isNaN(valorNumero) ||
        valorNumero <= 0
      ) {
        setErro(
          "Informe um valor total válido."
        );
        return;
      }

      setSalvandoEdicao(true);

      await api.put(
        `/sales/${vendaEditando.id}`,
        {
          cliente_nome:
            editClienteNome.trim() || null,

          data_venda:
            editDataVenda,

          mensagem_original:
            editTextoOriginal,

          valor_total:
            valorNumero,
        }
      );

      fecharEdicao();

      setMensagem(
        "Venda atualizada com sucesso."
      );

      await carregarHistorico();
    } catch (error) {
      console.error(
        "Erro ao atualizar venda:",
        error
      );

      setErro(
        error.response?.data?.message ||
          "Erro ao atualizar venda."
      );
    } finally {
      setSalvandoEdicao(false);
    }
  }

  function montarHtmlPedido(venda) {
    const nomeCliente =
      venda.cliente_nome ||
      "Cliente não informado";

    const total =
      Number(venda.valor_total || 0);

    const dataVenda =
      formatarDataExibicao(
        venda.data_venda ||
          venda.data_criacao
      );

    const vendedor =
      venda.usuario_nome ||
      "Não informado";

    return `
      <section class="pedido">

        <div class="cliente-topo">
          ${escaparHtml(nomeCliente)}
        </div>

        <h1>
          PEDIDO - ${gerarNumeroPedido(venda)}
        </h1>

        <div class="informacoes">
          <p>
            <strong>Data:</strong>
            ${escaparHtml(dataVenda)}
          </p>

          <p>
            <strong>Vendedor:</strong>
            ${escaparHtml(vendedor)}
          </p>
        </div>

        <h2>Pedido</h2>

        <pre>${
          escaparHtml(
            venda.texto_original ||
              "Mensagem não disponível."
          )
        }</pre>

        <div class="totais">
          <p class="total">
            Total:
            ${formatarMoeda(total)}
          </p>
        </div>

      </section>
    `;
  }

  function imprimirVendas(listaVendas) {
    if (
      !listaVendas ||
      listaVendas.length === 0
    ) {
      setErro(
        "Nenhuma venda para exportar."
      );
      return;
    }

    const conteudo =
      listaVendas
        .map(montarHtmlPedido)
        .join("");

    const janela =
      window.open("", "_blank");

    if (!janela) {
      setErro(
        "Não foi possível abrir a janela de impressão."
      );
      return;
    }

    janela.document.write(`
      <!DOCTYPE html>

      <html>
        <head>
          <title>Pedidos</title>

          <style>

            * {
              box-sizing: border-box;
            }

            body {
              font-family:
                Arial,
                Helvetica,
                sans-serif;

              color: #111;
              margin: 0;
              padding: 32px;
              background: #fff;
            }

            .pedido {
              width: 100%;
              max-width: 720px;
              margin: 0 auto;
              padding-bottom: 36px;
              page-break-after: always;
            }

            .pedido:last-child {
              page-break-after: auto;
            }

            .cliente-topo {
              font-size: 34px;
              line-height: 1.1;
              font-weight: 900;
              text-transform: uppercase;
              margin-bottom: 10px;
              color: #111;
              word-break: break-word;
            }

            h1 {
              font-size: 20px;
              margin: 0 0 20px;
              font-weight: 800;
              color: #444;
            }

            h2 {
              font-size: 17px;
              margin: 22px 0 10px;
              font-weight: 800;
            }

            p {
              font-size: 15px;
              line-height: 1.5;
              margin: 5px 0;
            }

            .informacoes {
              margin-bottom: 22px;
            }

            pre {
              font-family:
                Arial,
                Helvetica,
                sans-serif;

              white-space: pre-wrap;
              word-break: break-word;

              background: #f5f5f5;

              border-radius: 12px;

              padding: 14px;

              font-size: 14px;

              line-height: 1.6;

              border:
                1px solid #e6e6e6;
            }

            .totais {
              margin-top: 18px;
            }

            .total {
              font-weight: 900;
              font-size: 20px;
              margin-top: 8px;
            }

            @media print {

              body {
                padding: 24px;
              }

              .cliente-topo {
                font-size: 30px;
              }

            }

          </style>
        </head>

        <body>

          ${conteudo}

          <script>

            window.onload = function () {
              window.print();
            };

          </script>

        </body>
      </html>
    `);

    janela.document.close();
  }

  function exportarVendaPdf(venda) {
    imprimirVendas([venda]);
  }

  function exportarTodasVendasPdf() {
    imprimirVendas(vendas);
  }

  return (
    <div style={styles.page}>

      <header
        style={styles.pageHeader(isMobile)}
      >

        <div>

          <p style={styles.pageMini}>
            Vendas
          </p>

          <h1
            style={styles.pageTitle(
              isMobile
            )}
          >
            Histórico
          </h1>

          <p style={styles.pageSubtitle}>
            Pesquise, edite e acompanhe
            todas as vendas registradas.
          </p>

        </div>

        <div style={styles.headerActions}>

          <div style={styles.totalBadge}>
            {vendas.length}{" "}
            {vendas.length === 1
              ? "venda"
              : "vendas"}
          </div>

          <button
            type="button"
            onClick={
              exportarTodasVendasPdf
            }
            style={styles.exportButton}
          >
            Exportar PDF
          </button>

        </div>

      </header>

      {erro && (
        <div style={styles.alertError}>
          {erro}
        </div>
      )}

      {mensagem && (
        <div style={styles.alertSuccess}>
          {mensagem}
        </div>
      )}

      <section style={styles.tableCard}>

        <form
          onSubmit={handleBuscar}
          style={styles.toolbar(
            isMobile
          )}
        >

          <div style={styles.searchBox}>

            <span
              style={styles.searchIcon}
            >
              ⌕
            </span>

            <input
              type="text"
              placeholder="Buscar por nome do cliente..."
              value={clienteBusca}
              onChange={(e) =>
                setClienteBusca(
                  e.target.value
                )
              }
              style={styles.searchInput}
            />

          </div>

          <div style={styles.dateBox}>

            <input
              type="date"
              value={dataBusca}
              onChange={(e) =>
                setDataBusca(
                  e.target.value
                )
              }
              style={styles.dateInput}
            />

          </div>

          <button
            type="submit"
            style={styles.searchButton}
          >
            Buscar
          </button>

          <button
            type="button"
            onClick={limparFiltros}
            style={styles.clearButton}
          >
            Limpar
          </button>

        </form>

        <div
          style={styles.listViewport(
            isMobile
          )}
        >

          {loading ? (

            <div style={styles.emptyBox}>
              <p style={styles.emptyTitle}>
                Carregando histórico...
              </p>
            </div>

          ) : vendas.length === 0 ? (

            <div style={styles.emptyBox}>

              <p style={styles.emptyTitle}>
                Nenhuma venda encontrada
              </p>

              <p style={styles.emptyText}>
                Tente alterar os filtros
                ou registre uma nova venda.
              </p>

            </div>

          ) : (

            <div style={styles.rows}>

              {vendas.map((venda) => (

                <article
                  key={venda.id}
                  style={styles.saleCard(
                    isMobile
                  )}
                >

                  <div
                    style={styles.saleHeader(
                      isMobile
                    )}
                  >

                    <div
                      style={
                        styles.saleIdentity
                      }
                    >

                      <div
                        style={
                          styles.orderNumber
                        }
                      >
                        #
                        {gerarNumeroPedido(
                          venda
                        )}
                      </div>

                      <div>

                        <h3
                          style={
                            styles.clientName
                          }
                        >
                          {venda.cliente_nome ||
                            "Cliente não informado"}
                        </h3>

                        <p
                          style={
                            styles.saleMeta
                          }
                        >
                          Vendedor:{" "}
                          {venda.usuario_nome ||
                            "Não informado"}
                        </p>

                        <p
                          style={
                            styles.saleMeta
                          }
                        >
                          Data:{" "}
                          {formatarDataExibicao(
                            venda.data_venda ||
                              venda.data_criacao
                          )}
                        </p>

                      </div>

                    </div>

                    <div
                      style={
                        styles.saleTotalBox
                      }
                    >

                      <span
                        style={
                          styles.totalLabel
                        }
                      >
                        Total
                      </span>

                      <strong
                        style={
                          styles.totalValue
                        }
                      >
                        {formatarMoeda(
                          venda.valor_total
                        )}
                      </strong>

                    </div>

                  </div>

                  <div
                    style={
                      styles.messageBox
                    }
                  >

                    <span
                      style={
                        styles.messageLabel
                      }
                    >
                      Pedido
                    </span>

                    <p
                      style={
                        styles.messageText
                      }
                    >
                      {venda.texto_original ||
                        "Mensagem não disponível."}
                    </p>

                  </div>

                  <div
                    style={styles.saleFooter(
                      isMobile
                    )}
                  >

                    <div
                      style={
                        styles.saleStatus
                      }
                    >

                      <span
                        style={
                          styles.statusBadge
                        }
                      >
                        Venda registrada
                      </span>

                      {venda.editada && (
                        <span
                          style={
                            styles.editedBadge
                          }
                        >
                          Editada
                        </span>
                      )}

                    </div>

                    <div
                      style={
                        styles.actionGroup
                      }
                    >

                      <button
                        type="button"
                        onClick={() =>
                          abrirEdicao(venda)
                        }
                        style={
                          styles.editButton
                        }
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          exportarVendaPdf(
                            venda
                          )
                        }
                        style={
                          styles.pdfButton
                        }
                      >
                        PDF
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          excluirVenda(
                            venda.id
                          )
                        }
                        style={
                          styles.deleteButton
                        }
                      >
                        Excluir
                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </div>

      </section>

      {vendaEditando && (

        <div style={styles.overlay}>

          <div
            style={styles.modal(
              isMobile
            )}
          >

            <div
              style={
                styles.modalHeader
              }
            >

              <div>

                <p
                  style={
                    styles.pageMini
                  }
                >
                  Editar venda
                </p>

                <h2
                  style={
                    styles.modalTitle
                  }
                >
                  Pedido{" "}
                  {gerarNumeroPedido(
                    vendaEditando
                  )}
                </h2>

              </div>

              <button
                type="button"
                onClick={fecharEdicao}
                style={
                  styles.closeButton
                }
              >
                Fechar
              </button>

            </div>

            <div
              style={styles.modalGrid(
                isMobile
              )}
            >

              <div>

                <div
                  style={
                    styles.fieldGroup
                  }
                >

                  <label
                    style={
                      styles.label
                    }
                  >
                    Nome do cliente
                  </label>

                  <input
                    type="text"
                    value={
                      editClienteNome
                    }
                    onChange={(e) =>
                      setEditClienteNome(
                        e.target.value
                      )
                    }
                    placeholder="Nome do cliente"
                    style={
                      styles.input
                    }
                  />

                </div>

                <div
                  style={
                    styles.fieldGroup
                  }
                >

                  <label
                    style={
                      styles.label
                    }
                  >
                    Data da venda
                  </label>

                  <input
                    type="date"
                    value={
                      editDataVenda
                    }
                    onChange={(e) =>
                      setEditDataVenda(
                        e.target.value
                      )
                    }
                    style={
                      styles.input
                    }
                  />

                </div>

                <div
                  style={
                    styles.fieldGroup
                  }
                >

                  <label
                    style={
                      styles.label
                    }
                  >
                    Valor da venda
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={
                      editValorTotal
                    }
                    onChange={(e) =>
                      setEditValorTotal(
                        e.target.value
                      )
                    }
                    style={
                      styles.input
                    }
                  />

                </div>

                <div
                  style={
                    styles.summaryCard
                  }
                >

                  <p
                    style={
                      styles.summaryMini
                    }
                  >
                    Valor registrado
                  </p>

                  <h3
                    style={
                      styles.summaryValue
                    }
                  >
                    {formatarMoeda(
                      editValorTotal
                    )}
                  </h3>

                  <p
                    style={
                      styles.summaryText
                    }
                  >
                    Esse valor será usado
                    no dashboard, ranking e
                    desempenho da equipe.
                  </p>

                </div>

              </div>

              <div
                style={
                  styles.messageEditor
                }
              >

                <label
                  style={
                    styles.label
                  }
                >
                  Mensagem original
                </label>

                <textarea
                  value={
                    editTextoOriginal
                  }
                  onChange={(e) =>
                    setEditTextoOriginal(
                      e.target.value
                    )
                  }
                  style={
                    styles.textarea
                  }
                />

              </div>

            </div>

            <div
              style={
                styles.modalActions
              }
            >

              <button
                type="button"
                onClick={fecharEdicao}
                style={
                  styles.cancelButton
                }
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  salvarEdicaoVenda
                }
                disabled={
                  salvandoEdicao
                }
                style={{
                  ...styles.saveButton,

                  ...(salvandoEdicao
                    ? styles.disabledButton
                    : {}),
                }}
              >
                {salvandoEdicao
                  ? "Salvando..."
                  : "Salvar alterações"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  pageHeader: (isMobile) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile
      ? "flex-start"
      : "center",
    flexDirection: isMobile
      ? "column"
      : "row",
    gap: 16,
    flexWrap: "wrap",
  }),

  pageMini: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#7b7b7b",
    fontWeight: 700,
    marginBottom: 6,
  },

  pageTitle: (isMobile) => ({
    fontSize: isMobile
      ? 28
      : 34,
    fontWeight: 900,
    letterSpacing: "-0.05em",
    color: "#111",
  }),

  pageSubtitle: {
    color: "#666",
    fontSize: 15,
    marginTop: 6,
    lineHeight: 1.6,
  },

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  totalBadge: {
    padding: "11px 15px",
    borderRadius: 999,
    background:
      "rgba(31,79,163,0.10)",
    color: "#1f4fa3",
    fontSize: 13,
    fontWeight: 800,
  },

  exportButton: {
    height: 42,
    padding: "0 16px",
    borderRadius: 999,
    border: "none",
    background: "#111",
    color: "#fff",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
  },

  alertError: {
    background:
      "rgba(176,0,32,0.08)",
    color: "#b00020",
    border:
      "1px solid rgba(176,0,32,0.12)",
    borderRadius: 14,
    padding: "12px 14px",
    fontWeight: 700,
    fontSize: 14,
  },

  alertSuccess: {
    background:
      "rgba(10,125,50,0.08)",
    color: "#0a7d32",
    border:
      "1px solid rgba(10,125,50,0.12)",
    borderRadius: 14,
    padding: "12px 14px",
    fontWeight: 700,
    fontSize: 14,
  },

  tableCard: {
    background: "#fff",
    borderRadius: 24,
    padding: 22,
    boxShadow:
      "0 6px 18px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: 18,
    minHeight: 520,
  },

  toolbar: (isMobile) => ({
    display: "grid",
    gridTemplateColumns:
      isMobile
        ? "1fr"
        : "1.4fr 220px auto auto",
    alignItems: "center",
    gap: 12,
  }),

  searchBox: {
    width: "100%",
    height: 52,
    background: "#f5f2ec",
    borderRadius: 16,
    display: "grid",
    gridTemplateColumns:
      "24px 1fr",
    alignItems: "center",
    gap: 10,
    padding: "0 14px",
    border:
      "1px solid #ece5da",
  },

  searchIcon: {
    fontSize: 18,
    color: "#7b7b7b",
    textAlign: "center",
  },

  searchInput: {
    height: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 14,
    color: "#111",
    minWidth: 0,
  },

  dateBox: {
    width: "100%",
    height: 52,
    background: "#f5f2ec",
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    padding: "0 14px",
    border:
      "1px solid #ece5da",
  },

  dateInput: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#111",
    fontSize: 14,
  },

  searchButton: {
    height: 52,
    padding: "0 20px",
    borderRadius: 14,
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },

  clearButton: {
    height: 52,
    padding: "0 20px",
    borderRadius: 14,
    border: "1px solid #ddd",
    background: "#fff",
    color: "#111",
    fontWeight: 800,
    cursor: "pointer",
  },

  listViewport: (isMobile) => ({
    maxHeight: isMobile
      ? "none"
      : "calc(100vh - 350px)",
    overflowY: isMobile
      ? "visible"
      : "auto",
    paddingRight: isMobile
      ? 0
      : 4,
  }),

  rows: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

  saleCard: (isMobile) => ({
    background: "#f8f6f2",
    borderRadius: 20,
    padding: isMobile
      ? 15
      : 18,
    border:
      "1px solid #eee8df",
    display: "flex",
    flexDirection: "column",
    gap: 15,
  }),

  saleHeader: (isMobile) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile
      ? "stretch"
      : "flex-start",
    gap: 16,
    flexDirection: isMobile
      ? "column"
      : "row",
  }),

  saleIdentity: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    minWidth: 0,
  },

  orderNumber: {
    minWidth: 46,
    height: 46,
    padding: "0 8px",
    borderRadius: 13,
    background: "#171921",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    fontWeight: 900,
    flexShrink: 0,
  },

  clientName: {
    fontSize: 20,
    fontWeight: 900,
    color: "#111",
    letterSpacing:
      "-0.03em",
    marginBottom: 4,
  },

  saleMeta: {
    color: "#777",
    fontSize: 13,
    lineHeight: 1.5,
  },

  saleTotalBox: {
    background: "#fff",
    border:
      "1px solid #ebe3d8",
    borderRadius: 16,
    padding: "11px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 145,
  },

  totalLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#888",
    fontWeight: 800,
  },

  totalValue: {
    fontSize: 19,
    color: "#111",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },

  messageBox: {
    background: "#fff",
    borderRadius: 16,
    padding: 14,
    border:
      "1px solid #ebe3d8",
  },

  messageLabel: {
    display: "block",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#8a8a8a",
    fontWeight: 800,
    marginBottom: 8,
  },

  messageText: {
    color: "#444",
    fontSize: 13,
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    maxHeight: 150,
    overflowY: "auto",
  },

  saleFooter: (isMobile) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile
      ? "stretch"
      : "center",
    flexDirection: isMobile
      ? "column"
      : "row",
    gap: 12,
  }),

  saleStatus: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  statusBadge: {
    padding: "8px 11px",
    borderRadius: 999,
    background:
      "rgba(31,79,163,0.10)",
    color: "#1f4fa3",
    fontSize: 11,
    fontWeight: 800,
  },

  editedBadge: {
    padding: "8px 11px",
    borderRadius: 999,
    background:
      "rgba(241,203,58,0.25)",
    color: "#6f5700",
    fontSize: 11,
    fontWeight: 800,
  },

  actionGroup: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  editButton: {
    padding: "10px 14px",
    borderRadius: 999,
    border: "none",
    background:
      "rgba(17,17,17,0.10)",
    color: "#111",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
  },

  pdfButton: {
    padding: "10px 14px",
    borderRadius: 999,
    border: "none",
    background:
      "rgba(31,79,163,0.10)",
    color: "#1f4fa3",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
  },

  deleteButton: {
    padding: "10px 14px",
    borderRadius: 999,
    border: "none",
    background:
      "rgba(176,0,32,0.10)",
    color: "#b00020",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
  },

  emptyBox: {
    borderRadius: 20,
    background: "#f8f6f2",
    padding: 32,
    textAlign: "center",
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: "#111",
    marginBottom: 8,
  },

  emptyText: {
    color: "#666",
    fontSize: 14,
  },

  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background:
      "rgba(0,0,0,0.45)",
    padding: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  modal: (isMobile) => ({
    width: "100%",
    maxWidth: 920,
    maxHeight:
      "calc(100vh - 40px)",
    background: "#fff",
    borderRadius: 24,
    padding: isMobile
      ? 18
      : 24,
    boxShadow:
      "0 22px 70px rgba(0,0,0,0.24)",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    overflowY: "auto",
  }),

  modalHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent:
      "space-between",
    gap: 16,
  },

  modalTitle: {
    fontSize: 27,
    fontWeight: 900,
    color: "#111",
    letterSpacing:
      "-0.04em",
  },

  closeButton: {
    height: 42,
    padding: "0 16px",
    borderRadius: 999,
    border:
      "1px solid #ddd",
    background: "#fff",
    color: "#111",
    fontWeight: 800,
    cursor: "pointer",
  },

  modalGrid: (isMobile) => ({
    display: "grid",
    gridTemplateColumns:
      isMobile
        ? "1fr"
        : "300px minmax(0, 1fr)",
    gap: 18,
  }),

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 14,
  },

  label: {
    fontSize: 13,
    fontWeight: 700,
    color: "#444",
  },

  input: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    border:
      "1px solid #ddd",
    padding: "0 14px",
    background: "#fff",
    color: "#111",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },

  summaryCard: {
    background: "#171921",
    color: "#fff",
    borderRadius: 20,
    padding: 18,
    marginTop: 18,
  },

  summaryMini: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color:
      "rgba(255,255,255,0.55)",
    fontWeight: 700,
    marginBottom: 8,
  },

  summaryValue: {
    fontSize: 30,
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing:
      "-0.05em",
    marginBottom: 9,
  },

  summaryText: {
    color:
      "rgba(255,255,255,0.62)",
    fontSize: 13,
    lineHeight: 1.55,
  },

  messageEditor: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    minHeight: 0,
  },

  textarea: {
    width: "100%",
    minHeight: 330,
    flex: 1,
    resize: "vertical",
    borderRadius: 16,
    border:
      "1px solid #ddd",
    padding: 15,
    background: "#f8f6f2",
    color: "#111",
    fontSize: 14,
    lineHeight: 1.7,
    outline: "none",
    boxSizing: "border-box",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
  },

  cancelButton: {
    height: 50,
    padding: "0 18px",
    borderRadius: 14,
    border:
      "1px solid #ddd",
    background: "#fff",
    color: "#111",
    fontWeight: 800,
    cursor: "pointer",
  },

  saveButton: {
    height: 50,
    padding: "0 20px",
    borderRadius: 14,
    border: "none",
    background:
      "linear-gradient(135deg, #c91f28 0%, #9f161e 100%)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },

  disabledButton: {
    opacity: 0.65,
    cursor: "not-allowed",
  },
};

export default SalesHistory;