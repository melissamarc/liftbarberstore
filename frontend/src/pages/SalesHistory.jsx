import { useEffect, useState } from "react";
import api from "../services/api";

import "./SalesHistory.css";

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

    const [ano, mes, dia] = String(texto).split("-");

    if (ano && mes && dia) {
      return `${dia}/${mes}/${ano}`;
    }

    return new Date(data).toLocaleDateString("pt-BR");
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

    setEditClienteNome(venda.cliente_nome || "");

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
        setErro("A mensagem original é obrigatória.");
        return;
      }

      const valorNumero = Number(editValorTotal);

      if (
        Number.isNaN(valorNumero) ||
        valorNumero <= 0
      ) {
        setErro("Informe um valor total válido.");
        return;
      }

      setSalvandoEdicao(true);

      await api.put(
        `/sales/${vendaEditando.id}`,
        {
          cliente_nome:
            editClienteNome.trim() || null,

          data_venda: editDataVenda,

          mensagem_original:
            editTextoOriginal,

          valor_total: valorNumero,
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

        <pre>${escaparHtml(
          venda.texto_original ||
            "Mensagem não disponível."
        )}</pre>

        <div class="totais">
          <p class="total">
            Total: ${formatarMoeda(total)}
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
      setErro("Nenhuma venda para exportar.");
      return;
    }

    const conteudo = listaVendas
      .map(montarHtmlPedido)
      .join("");

    const janela = window.open("", "_blank");

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
              font-family: Arial, Helvetica, sans-serif;
              color: #222;
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
              font-size: 30px;
              line-height: 1.1;
              font-weight: 700;
              text-transform: uppercase;
              margin-bottom: 8px;
              color: #222;
              word-break: break-word;
            }

            h1 {
              font-size: 18px;
              margin: 0 0 20px;
              font-weight: 600;
              color: #666;
            }

            h2 {
              font-size: 16px;
              margin: 22px 0 10px;
              font-weight: 600;
            }

            p {
              font-size: 14px;
              line-height: 1.5;
              margin: 5px 0;
            }

            .informacoes {
              margin-bottom: 22px;
            }

            pre {
              font-family: Arial, Helvetica, sans-serif;
              white-space: pre-wrap;
              word-break: break-word;
              background: #f7f5f2;
              border-radius: 10px;
              padding: 14px;
              font-size: 14px;
              line-height: 1.6;
              border: 1px solid #ebe6df;
            }

            .totais {
              margin-top: 18px;
            }

            .total {
              font-weight: 700;
              font-size: 19px;
              margin-top: 8px;
            }

            @media print {
              body {
                padding: 24px;
              }

              .cliente-topo {
                font-size: 28px;
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
    <div className="sales-history-page">

      <header className="sales-history-header">
        <div>
          <p className="sales-history-eyebrow">
            Vendas
          </p>

          <h1 className="sales-history-title">
            Histórico
          </h1>

          <p className="sales-history-subtitle">
            Pesquise, edite e acompanhe todas as vendas registradas.
          </p>
        </div>

        <div className="sales-history-header-actions">
          <span className="sales-history-counter">
            {vendas.length}{" "}
            {vendas.length === 1
              ? "venda"
              : "vendas"}
          </span>

          <button
            type="button"
            onClick={exportarTodasVendasPdf}
            className="sales-history-export"
          >
            Exportar PDF
          </button>
        </div>
      </header>

      {erro && (
        <div className="sales-history-alert error">
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="sales-history-alert success">
          {mensagem}
        </div>
      )}

      <section className="sales-history-content">

        <form
          onSubmit={handleBuscar}
          className="sales-history-toolbar"
        >
          <div className="sales-history-search">
            <span className="sales-history-search-icon">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Buscar por nome do cliente..."
              value={clienteBusca}
              onChange={(e) =>
                setClienteBusca(e.target.value)
              }
            />
          </div>

          <div className="sales-history-date">
            <input
              type="date"
              value={dataBusca}
              onChange={(e) =>
                setDataBusca(e.target.value)
              }
            />
          </div>

          <button
            type="submit"
            className="sales-history-search-button"
          >
            Buscar
          </button>

          <button
            type="button"
            onClick={limparFiltros}
            className="sales-history-clear-button"
          >
            Limpar
          </button>
        </form>

        <div className="sales-history-list">

          {loading ? (
            <div className="sales-history-empty">
              <p>Carregando histórico...</p>
            </div>
          ) : vendas.length === 0 ? (
            <div className="sales-history-empty">
              <strong>
                Nenhuma venda encontrada
              </strong>

              <p>
                Tente alterar os filtros ou registre uma nova venda.
              </p>
            </div>
          ) : (
            vendas.map((venda) => (
              <article
                key={venda.id}
                className="sales-history-sale"
              >
                <div className="sales-history-sale-top">

                  <div className="sales-history-sale-identity">
                    <span className="sales-history-order">
                      #{gerarNumeroPedido(venda)}
                    </span>

                    <div>
                      <h3>
                        {venda.cliente_nome ||
                          "Cliente não informado"}
                      </h3>

                      <div className="sales-history-meta">
                        <span>
                          {venda.usuario_nome ||
                            "Vendedor não informado"}
                        </span>

                        <span className="sales-history-meta-dot">
                          ·
                        </span>

                        <span>
                          {formatarDataExibicao(
                            venda.data_venda ||
                              venda.data_criacao
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="sales-history-total">
                    <span>Total</span>

                    <strong>
                      {formatarMoeda(
                        venda.valor_total
                      )}
                    </strong>
                  </div>
                </div>

                <div className="sales-history-message">
                  <span className="sales-history-message-label">
                    Pedido
                  </span>

                  <p>
                    {venda.texto_original ||
                      "Mensagem não disponível."}
                  </p>
                </div>

                <div className="sales-history-sale-bottom">

                  <div className="sales-history-status">
                    <span className="sales-history-status-dot" />

                    <span>Venda registrada</span>

                    {venda.editada && (
                      <span className="sales-history-edited">
                        Editada
                      </span>
                    )}
                  </div>

                  <div className="sales-history-actions">
                    <button
                      type="button"
                      onClick={() =>
                        abrirEdicao(venda)
                      }
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        exportarVendaPdf(venda)
                      }
                    >
                      PDF
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        excluirVenda(venda.id)
                      }
                      className="danger"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {vendaEditando && (
        <div className="sales-history-modal-overlay">
          <div className="sales-history-modal">

            <div className="sales-history-modal-header">
              <div>
                <p className="sales-history-eyebrow">
                  Editar venda
                </p>

                <h2>
                  Pedido{" "}
                  {gerarNumeroPedido(
                    vendaEditando
                  )}
                </h2>
              </div>

              <button
                type="button"
                onClick={fecharEdicao}
                className="sales-history-modal-close"
              >
                Fechar
              </button>
            </div>

            <div className="sales-history-modal-grid">

              <div className="sales-history-modal-fields">

                <div className="sales-history-field">
                  <label>
                    Nome do cliente
                  </label>

                  <input
                    type="text"
                    value={editClienteNome}
                    onChange={(e) =>
                      setEditClienteNome(
                        e.target.value
                      )
                    }
                    placeholder="Nome do cliente"
                  />
                </div>

                <div className="sales-history-field">
                  <label>
                    Data da venda
                  </label>

                  <input
                    type="date"
                    value={editDataVenda}
                    onChange={(e) =>
                      setEditDataVenda(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="sales-history-field">
                  <label>
                    Valor da venda
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={editValorTotal}
                    onChange={(e) =>
                      setEditValorTotal(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="sales-history-value-preview">
                  <span>
                    Valor registrado
                  </span>

                  <strong>
                    {formatarMoeda(
                      editValorTotal
                    )}
                  </strong>

                  <p>
                    Esse valor será usado no dashboard,
                    ranking e desempenho da equipe.
                  </p>
                </div>
              </div>

              <div className="sales-history-message-editor">
                <label>
                  Mensagem original
                </label>

                <textarea
                  value={editTextoOriginal}
                  onChange={(e) =>
                    setEditTextoOriginal(
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="sales-history-modal-actions">
              <button
                type="button"
                onClick={fecharEdicao}
                className="secondary"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={salvarEdicaoVenda}
                disabled={salvandoEdicao}
                className="primary"
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

export default SalesHistory;