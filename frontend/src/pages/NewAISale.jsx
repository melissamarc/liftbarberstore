import { useMemo, useState } from "react";
import api from "../services/api";

import "./NewAISale.css";

function NewAISale() {
  const [clienteNome, setClienteNome] = useState("");
  const [dataVenda, setDataVenda] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");

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

    if (!valores || valores.length === 0) {
      return 0;
    }

    if (linhaTotal) {
      return Number(
        valores[0]
          .replace(/\./g, "")
          .replace(",", ".")
      );
    }

    return valores.reduce((acc, valor) => {
      return (
        acc +
        Number(
          valor
            .replace(/\./g, "")
            .replace(",", ".")
        )
      );
    }, 0);
  }, [mensagem]);

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  async function confirmarVenda() {
    try {
      setErro("");
      setMensagemSucesso("");

      if (!mensagem.trim()) {
        setErro(
          "Cole a mensagem do pedido antes de salvar."
        );
        return;
      }

      if (
        !valorDetectado ||
        valorDetectado <= 0
      ) {
        setErro(
          "Não encontrei um valor válido na mensagem."
        );
        return;
      }

      setSalvando(true);

      await api.post("/sales/ia", {
        cliente_nome:
          clienteNome.trim() || null,

        data_venda: dataVenda,

        mensagem_original: mensagem,
      });

      setMensagemSucesso(
        "Venda registrada com sucesso."
      );

      setClienteNome("");

      setDataVenda(
        new Date()
          .toISOString()
          .slice(0, 10)
      );

      setMensagem("");
    } catch (error) {
      setErro(
        error.response?.data?.message ||
          "Erro ao salvar venda."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="ai-sale-page">

      <header className="ai-sale-header">
        <div>
          <p className="ai-sale-eyebrow">
            Pedido por texto
          </p>

          <h1 className="ai-sale-title">
            Registrar venda
          </h1>

          <p className="ai-sale-subtitle">
            Cole a mensagem gerada pelo catálogo.
            O sistema identifica o total e registra
            a venda automaticamente.
          </p>
        </div>

        <div className="ai-sale-header-status">
          <span />
          Leitura automática
        </div>
      </header>

      {erro && (
        <div className="ai-sale-alert error">
          {erro}
        </div>
      )}

      {mensagemSucesso && (
        <div className="ai-sale-alert success">
          {mensagemSucesso}
        </div>
      )}

      <section className="ai-sale-layout">

        <aside className="ai-sale-sidebar">

          <div className="ai-sale-info">
            <div className="ai-sale-info-icon">
              ✦
            </div>

            <div>
              <p className="ai-sale-section-eyebrow">
                Venda rápida
              </p>

              <h2>
                Pedido do catálogo
              </h2>

              <p>
                Não é necessário selecionar produtos.
                Basta colar o pedido e confirmar o valor
                identificado.
              </p>
            </div>
          </div>

          <div className="ai-sale-summary">

            <div className="ai-sale-field">
              <label>
                Cliente
              </label>

              <input
                type="text"
                placeholder="Nome do cliente"
                value={clienteNome}
                onChange={(e) =>
                  setClienteNome(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="ai-sale-field">
              <label>
                Data da venda
              </label>

              <input
                type="date"
                value={dataVenda}
                onChange={(e) =>
                  setDataVenda(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="ai-sale-total">
              <span>
                Total detectado
              </span>

              <strong>
                {formatarMoeda(
                  valorDetectado
                )}
              </strong>

              <p>
                Esse valor entra no dashboard,
                ranking e desempenho da equipe.
              </p>
            </div>

            <button
              type="button"
              onClick={confirmarVenda}
              disabled={
                salvando ||
                !mensagem.trim()
              }
              className="ai-sale-confirm"
            >
              {salvando
                ? "Salvando..."
                : "Registrar venda"}
            </button>
          </div>
        </aside>

        <main className="ai-sale-content">

          <div className="ai-sale-content-header">
            <div>
              <p className="ai-sale-section-eyebrow">
                Mensagem
              </p>

              <h2>
                Cole o pedido
              </h2>

              <p>
                Copie a mensagem gerada pelo carrinho
                do catálogo e cole abaixo.
              </p>
            </div>

            {mensagem.trim() && (
              <span className="ai-sale-detected">
                Total identificado
              </span>
            )}
          </div>

          <textarea
            className="ai-sale-textarea"
            placeholder={`Exemplo:

Pedido de João

2x Pomada Matte - R$ 40,00
1x Gel Cola - R$ 25,00

Total: R$ 65,00`}
            value={mensagem}
            onChange={(e) =>
              setMensagem(
                e.target.value
              )
            }
          />

          <div className="ai-sale-preview">

            <div className="ai-sale-preview-header">
              <p>
                Prévia do pedido
              </p>

              {mensagem.trim() && (
                <span>
                  {mensagem.length} caracteres
                </span>
              )}
            </div>

            {mensagem.trim() ? (
              <pre>
                {mensagem}
              </pre>
            ) : (
              <p className="ai-sale-preview-empty">
                Nenhuma mensagem colada ainda.
              </p>
            )}
          </div>
        </main>
      </section>
    </div>
  );
}

export default NewAISale;