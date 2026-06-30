/**
 * Parser do CSV do Trilote (Relatório de Apartamentos).
 * Separador ';', campos com aspas, BOM, números no formato BR (573.997,19).
 * Detecta colunas pelo NOME do cabeçalho (tolerante a acento/maiúsculas).
 */

export interface UnidadeParsed {
  empreendimento: string;
  apartamento: string;
  torre: string;
  tipo: string;
  matricula: string;
  inscricao_municipal: string;
  area_m2: number;
  valor: number;
  desconto: number;
  venda: number;
  situacao_raw: string;
  status: "vendida" | "reservada" | "disponivel" | "outros";
}

export interface ParseResult {
  unidades: UnidadeParsed[];
  empreendimentos: string[];
  statusDesconhecidos: string[]; // valores de Situação que caíram em "outros"
  erro?: string;
}

// CSV com ';' e aspas duplas; remove BOM (﻿)
function parseRows(text: string): string[][] {
  const t = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (inQuotes) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ";") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const norm = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

function parseBR(s?: string): number {
  if (!s) return 0;
  const cleaned = s.trim().replace(/\./g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

export function classificaStatus(situacao: string): UnidadeParsed["status"] {
  const s = norm(situacao);
  if (s.includes("vend")) return "vendida";
  if (s.includes("reserv")) return "reservada";
  if (s.includes("dispon")) return "disponivel";
  return "outros";
}

function findCol(headers: string[], test: (h: string) => boolean): number {
  return headers.findIndex((h) => test(norm(h)));
}

export function parseEspelhoCSV(text: string): ParseResult {
  const rows = parseRows(text).filter((r) => r.some((c) => c.trim() !== ""));
  if (rows.length < 2) {
    return { unidades: [], empreendimentos: [], statusDesconhecidos: [], erro: "CSV vazio ou sem linhas de dados." };
  }

  const headers = rows[0];
  const col = {
    apartamento: findCol(headers, (h) => h.startsWith("apartamento")),
    torre: findCol(headers, (h) => h === "torre"),
    tipo: findCol(headers, (h) => h === "tipo"),
    matricula: findCol(headers, (h) => h.includes("matricula")),
    inscricao: findCol(headers, (h) => h.includes("municipal") || h.includes("inscricao")),
    area: findCol(headers, (h) => h.startsWith("area")),
    empreendimento: findCol(headers, (h) => h.includes("empreendimento")),
    valor: findCol(headers, (h) => h.startsWith("valor")),
    desconto: findCol(headers, (h) => h.startsWith("desconto")),
    venda: findCol(headers, (h) => h.startsWith("venda")),
    situacao: findCol(headers, (h) => h.startsWith("situacao")),
  };

  if (col.empreendimento < 0 || col.apartamento < 0 || col.situacao < 0) {
    return {
      unidades: [],
      empreendimentos: [],
      statusDesconhecidos: [],
      erro: "Cabeçalho não reconhecido: faltam colunas Empreendimento / Apartamento / Situação.",
    };
  }

  const get = (r: string[], i: number) => (i >= 0 && i < r.length ? (r[i] || "").trim() : "");
  const unidades: UnidadeParsed[] = [];
  const empSet = new Set<string>();
  const desconhecidos = new Set<string>();

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const empreendimento = get(r, col.empreendimento);
    if (!empreendimento) continue;
    const situacao_raw = get(r, col.situacao);
    const status = classificaStatus(situacao_raw);
    if (status === "outros" && situacao_raw) desconhecidos.add(situacao_raw);
    empSet.add(empreendimento);
    unidades.push({
      empreendimento,
      apartamento: get(r, col.apartamento),
      torre: get(r, col.torre),
      tipo: get(r, col.tipo),
      matricula: get(r, col.matricula),
      inscricao_municipal: get(r, col.inscricao),
      area_m2: parseBR(get(r, col.area)),
      valor: parseBR(get(r, col.valor)),
      desconto: parseBR(get(r, col.desconto)),
      venda: parseBR(get(r, col.venda)),
      situacao_raw,
      status,
    });
  }

  return {
    unidades,
    empreendimentos: [...empSet].sort(),
    statusDesconhecidos: [...desconhecidos],
  };
}
