// utils/semana.js
//
// REGRA DA SEMANA
// - A semana vai de SEGUNDA 07:00 até a PRÓXIMA SEGUNDA 07:00 (fuso de São Paulo).
// - Toda segunda às 07:00 a semana reseta e começa uma nova.
// - Segunda antes das 07:00 ainda pertence à semana que está terminando.
// - A venda pertence à semana da sua DATA DA VENDA (data_venda), nunca à data
//   do registro. Como data_venda é só uma data (sem hora), uma venda datada de
//   segunda conta na semana que começa naquela segunda.

const FUSO = "America/Sao_Paulo";
const RESET_HORA = 7; // segunda 07:00

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
// (semana = segunda a domingo)
// ------------------------------------------------------
function segundaDaSemanaDaData(dataStr) {
  const dow = diaDaSemana(dataStr);
  const recuo = dow === 0 ? 6 : dow - 1;
  return somarDias(dataStr, -recuo);
}

// ------------------------------------------------------
// Segunda-feira da semana ATIVA agora
// Segunda antes das 07:00 ainda é a semana anterior.
// ------------------------------------------------------
function segundaDaSemanaAtiva(agora = agoraBrasil()) {
  const segunda = segundaDaSemanaDaData(agora.data);

  if (agora.diaSemana === 1 && agora.hora < RESET_HORA) {
    return somarDias(segunda, -7);
  }

  return segunda;
}

// ------------------------------------------------------
// Monta o intervalo completo de uma semana
// ------------------------------------------------------
function montarSemana(segunda, agora = agoraBrasil()) {
  const ativa = segundaDaSemanaAtiva(agora);
  const domingo = somarDias(segunda, 6);

  return {
    inicio: segunda, // segunda-feira (07:00)
    fim: domingo, // domingo (a semana vira na segunda 07:00)
    // Intervalo usado nas consultas SQL (por data_venda):
    consultaDe: segunda,
    consultaAte: domingo,
    atual: segunda === ativa,
    encerrada: segunda < ativa,
    futura: segunda > ativa,
    abertura: "Segunda 07:00",
    fechamento: "Próxima segunda 07:00",
  };
}

// ------------------------------------------------------
// Resolve o parâmetro vindo da URL:
//   vazio ou "atual"      -> semana ativa
//   "passada"             -> semana anterior à ativa
//   "YYYY-MM-DD" (qualquer dia da semana) -> semana daquela data
//   inválido              -> null
// ------------------------------------------------------
function resolverSemana(parametro) {
  const agora = agoraBrasil();
  const valor = String(parametro || "").trim();

  if (!valor || valor === "atual") {
    return montarSemana(segundaDaSemanaAtiva(agora), agora);
  }

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