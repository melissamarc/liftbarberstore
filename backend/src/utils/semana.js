// utils/semana.js
//
// REGRA DA SEMANA
// - A semana de vendas vai de SEGUNDA 07:00 até SÁBADO 22:00 (fuso de São Paulo).
// - Passou de sábado 22:00, o site entra na semana seguinte.
// - A venda pertence à semana da sua DATA DA VENDA (data_venda), nunca à data do registro.
// - Domingo não faz parte da semana que fecha: uma venda datada de domingo
//   entra na semana seguinte.

const FUSO = "America/Sao_Paulo";
const FIM_DIA_SEMANA = 6; // sábado
const FIM_HORA = 22; // 22:00

// ------------------------------------------------------
// Data/hora atual no fuso de São Paulo
// ------------------------------------------------------
function agoraBrasil(base = new Date()) {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(base);

  const get = (tipo) => partes.find((p) => p.type === tipo).value;
  const mapaDia = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  return {
    data: `${get("year")}-${get("month")}-${get("day")}`,
    diaSemana: mapaDia[get("weekday")],
    hora: Number(get("hour")),
    minuto: Number(get("minute")),
  };
}

// ------------------------------------------------------
// Aritmética de datas "YYYY-MM-DD" (sem depender de fuso)
// ------------------------------------------------------
function dataValida(dataStr) {
  const m = String(dataStr || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return false;
  const [a, mes, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(a, mes - 1, d));
  return (
    dt.getUTCFullYear() === a &&
    dt.getUTCMonth() === mes - 1 &&
    dt.getUTCDate() === d
  );
}

function somarDias(dataStr, dias) {
  const [a, m, d] = dataStr.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

function diaDaSemana(dataStr) {
  const [a, m, d] = dataStr.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay(); // 0=dom ... 6=sáb
}

// ------------------------------------------------------
// Segunda-feira da semana a que uma DATA pertence
// (domingo cai na semana seguinte)
// ------------------------------------------------------
function segundaDaSemanaDaData(dataStr) {
  const dow = diaDaSemana(dataStr);
  if (dow === 0) return somarDias(dataStr, 1);
  return somarDias(dataStr, -(dow - 1));
}

// ------------------------------------------------------
// Segunda-feira da semana ATIVA agora
// Depois de sábado 22:00 já é a semana seguinte.
// ------------------------------------------------------
function segundaDaSemanaAtiva(agora = agoraBrasil()) {
  if (agora.diaSemana === FIM_DIA_SEMANA && agora.hora >= FIM_HORA) {
    return somarDias(agora.data, 2); // próxima segunda
  }
  return segundaDaSemanaDaData(agora.data);
}

// ------------------------------------------------------
// Monta o intervalo completo de uma semana
// ------------------------------------------------------
function montarSemana(segunda, agora = agoraBrasil()) {
  const ativa = segundaDaSemanaAtiva(agora);

  return {
    inicio: segunda, // segunda-feira (07:00)
    fim: somarDias(segunda, 5), // sábado (22:00)
    // Intervalo usado nas consultas SQL (inclui o domingo anterior,
    // que pertence a esta semana):
    consultaDe: somarDias(segunda, -1),
    consultaAte: somarDias(segunda, 5),
    atual: segunda === ativa,
    encerrada: segunda < ativa,
    futura: segunda > ativa,
    abertura: "Segunda 07:00",
    fechamento: "Sábado 22:00",
  };
}

// ------------------------------------------------------
// Resolve o parâmetro vindo da URL:
//   vazio ou "atual"      -> semana ativa
//   "passada"            -> semana anterior à ativa
//   "YYYY-MM-DD" (qualquer dia da semana) -> semana daquela data
//   inválido              -> null
// ------------------------------------------------------
function resolverSemana(parametro) {
  const agora = agoraBrasil();
  const valor = String(parametro || "").trim();

  if (!valor || valor === "atual") {
    return montarSemana(segundaDaSemanaAtiva(agora), agora);
  }

  // semana imediatamente anterior à semana ativa
  if (valor === "passada") {
    return montarSemana(
      somarDias(segundaDaSemanaAtiva(agora), -7),
      agora
    );
  }

  if (!dataValida(valor)) return null;

  return montarSemana(segundaDaSemanaDaData(valor), agora);
}

module.exports = {
  agoraBrasil,
  dataValida,
  somarDias,
  segundaDaSemanaDaData,
  segundaDaSemanaAtiva,
  montarSemana,
  resolverSemana,
};