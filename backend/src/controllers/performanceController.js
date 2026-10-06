const pool = require("../config/db");
const { agoraBrasil, resolverSemana } = require("../utils/semana");

// =====================================================
// HELPERS DE DATA (tudo em "YYYY-MM-DD", fuso de São Paulo)
// =====================================================
function pad(n) {
  return String(n).padStart(2, "0");
}

function subtrairMeses(dataStr, meses) {
  const [a, m, d] = dataStr.split("-").map(Number);

  const total = a * 12 + (m - 1) - meses;
  const ano = Math.floor(total / 12);
  const mes = total % 12;

  // evita datas inexistentes (ex.: 31/08 menos 6 meses -> 28/02)
  const ultimoDia = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();

  return `${ano}-${pad(mes + 1)}-${pad(Math.min(d, ultimoDia))}`;
}

// =====================================================
// INTERVALO DE CADA PERÍODO
//
// Sempre baseado em v.data_venda (data da venda),
// nunca na data em que a venda foi registrada.
//
// Retorna:
//  - inicio / fim:        o que é exibido na tela
//  - consultaDe / consultaAte: o que entra no SQL
// =====================================================
function calcularIntervalo(periodo, semanaParam) {
  const hoje = agoraBrasil().data;
  const [ano, mes] = hoje.split("-").map(Number);

  if (periodo === "dia") {
    return {
      inicio: hoje,
      fim: hoje,
      consultaDe: hoje,
      consultaAte: hoje,
    };
  }

  // Semana: segunda 07:00 até sábado 22:00.
  // Depois de sábado 22:00 já é a semana seguinte.
  // "semana_passada" é a semana imediatamente anterior à ativa.
  if (periodo === "semana" || periodo === "semana_passada") {
    const semana = resolverSemana(
      periodo === "semana_passada" ? "passada" : semanaParam
    );

    if (!semana) return null;

    return {
      inicio: semana.inicio,
      fim: semana.fim,
      consultaDe: semana.consultaDe,
      consultaAte: semana.consultaAte,
    };
  }

  if (periodo === "mes") {
    const ultimoDia = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
    const inicio = `${ano}-${pad(mes)}-01`;
    const fim = `${ano}-${pad(mes)}-${pad(ultimoDia)}`;

    return { inicio, fim, consultaDe: inicio, consultaAte: fim };
  }

  if (periodo === "6meses") {
    const inicio = subtrairMeses(hoje, 6);

    return {
      inicio,
      fim: hoje,
      consultaDe: inicio,
      consultaAte: hoje,
    };
  }

  if (periodo === "ano") {
    const inicio = `${ano}-01-01`;
    const fim = `${ano}-12-31`;

    return { inicio, fim, consultaDe: inicio, consultaAte: fim };
  }

  return null;
}

// =====================================================
// DESEMPENHO DOS FUNCIONÁRIOS
// =====================================================
async function desempenhoFuncionarios(req, res) {
  try {
    const { periodo = "semana", semana = "" } = req.query;

    const intervalo = calcularIntervalo(periodo, semana);

    if (!intervalo) {
      return res.status(400).json({
        message: "Período inválido.",
      });
    }

    // data_venda >= início  E  data_venda < dia seguinte ao fim
    // (funciona tanto se a coluna for DATE quanto DATETIME)
    const [resultado] = await pool.query(
      `
      SELECT
        u.id AS usuario_id,
        u.nome AS usuario_nome,
        u.email AS usuario_email,
        u.foto_perfil,

        COUNT(v.id) AS quantidade_vendas,

        COALESCE(
          SUM(v.valor_total),
          0
        ) AS total_vendido

      FROM usuarios u

      LEFT JOIN vendas v
        ON v.usuario_id = u.id
        AND COALESCE(v.data_venda, DATE(v.data_criacao)) >= ?
        AND COALESCE(v.data_venda, DATE(v.data_criacao)) < DATE_ADD(?, INTERVAL 1 DAY)

      WHERE u.ativo = TRUE

      GROUP BY
        u.id,
        u.nome,
        u.email,
        u.foto_perfil

      ORDER BY
        total_vendido DESC,
        quantidade_vendas DESC,
        u.nome ASC
      `,
      [intervalo.consultaDe, intervalo.consultaAte]
    );

    const desempenho = resultado.map((item, index) => ({
      posicao: index + 1,

      usuario_id: item.usuario_id,
      usuario_nome: item.usuario_nome,
      usuario_email: item.usuario_email,
      foto_perfil: item.foto_perfil,

      quantidade_vendas: Number(item.quantidade_vendas),

      total_vendido: Number(item.total_vendido),
    }));

    return res.status(200).json({
      periodo,
      intervalo: {
        inicio: intervalo.inicio,
        fim: intervalo.fim,
      },
      dados: desempenho,
    });
  } catch (error) {
    console.error(
      "Erro ao carregar desempenho dos funcionários:",
      error.message
    );

    return res.status(500).json({
      message: "Erro ao carregar desempenho dos funcionários.",
    });
  }
}

module.exports = {
  desempenhoFuncionarios,
};