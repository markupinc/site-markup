/**
 * Parser da planilha de PREÇOS da tabela (upload dedicado).
 * Diferente do CSV do Espelho — aqui vem o valor ATUAL de todas as unidades
 * (o espelho congela o preço da unidade vendida).
 *
 * Tolerante: detecta separador (; ou ,), BOM, números BR (1.234.567,89),
 * e as colunas pelo NOME do cabeçalho (acento/maiúsculas irrelevantes).
 *
 * Colunas necessárias: Unidade/Apartamento · Área · Valor (Total)
 * Opcionais: Torre · Tipo
 */

export interface UnidadePreco {
  apartamento: string;
  torre: string | null;
  tipo: string | null;
  area_m2: number;
  valor: number;
}

export interface ParsePrecoResult {
  unidades: UnidadePreco[];
  colunas: { unidade: string; area: string; valor: string };
  erro?: string;
}

function detectarSep(linha: string): ";" | "," {
  const pv = (linha.match(/;/g) || []).length;
  const v = (linha.match(/,/g) || []).length;
  return pv >= v ? ";" : ",";
}

function parseRows(text: string, sep: string): string[][] {
  const t = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          field += '"';
          i++;
        } else q = false;
      } else field += c;
    } else if (c === '"') q = true;
    else if (c === sep) {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") field += c;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const norm = (s: string) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

/** Número BR: 1.234.567,89 → 1234567.89 (também aceita 1234567.89) */
function parseNum(s?: string): number {
  if (!s) return 0;
  let v = s.replace(/R\$|\s/g, "").trim();
  if (v.includes(",")) v = v.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

export function parsePrecosCSV(text: string): ParsePrecoResult {
  const linhas = text.split("\n").filter((l) => l.trim());
  if (linhas.length < 2) {
    return { unidades: [], colunas: { unidade: "", area: "", valor: "" }, erro: "Planilha vazia." };
  }
  const sep = detectarSep(linhas[0]);
  const rows = parseRows(text, sep).filter((r) => r.some((c) => c.trim() !== ""));
  const headers = rows[0];
  const H = headers.map(norm);

  const acha = (test: (h: string) => boolean) => H.findIndex(test);

  const iUnidade = acha((h) => h.startsWith("unidade") || h.startsWith("apartamento"));
  const iArea = acha((h) => h.startsWith("area"));
  // "Valor Total" > "Valor (R$)" > "Valor" — nunca "Valor do m²", "Venda" ou "Desconto"
  const valorOk = (h: string) =>
    h.startsWith("valor") && !h.startsWith("valordo") && !h.includes("venda") && !h.includes("desconto");
  const iValor =
    acha((h) => h === "valortotal") >= 0
      ? acha((h) => h === "valortotal")
      : acha(valorOk);
  const iTorre = acha((h) => h === "torre");
  const iTipo = acha((h) => h === "tipo");

  if (iUnidade < 0 || iValor < 0) {
    return {
      unidades: [],
      colunas: { unidade: "", area: "", valor: "" },
      erro: `Cabeçalho não reconhecido. Preciso de uma coluna de Unidade/Apartamento e uma de Valor. Encontrei: ${headers.filter(Boolean).join(", ")}`,
    };
  }

  const get = (r: string[], i: number) => (i >= 0 && i < r.length ? (r[i] || "").trim() : "");
  const unidades: UnidadePreco[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const apartamento = get(r, iUnidade);
    const valor = parseNum(get(r, iValor));
    if (!apartamento || valor <= 0) continue;
    unidades.push({
      apartamento,
      torre: get(r, iTorre) || null,
      tipo: get(r, iTipo) || null,
      area_m2: parseNum(get(r, iArea)),
      valor,
    });
  }

  return {
    unidades,
    colunas: {
      unidade: headers[iUnidade] || "",
      area: iArea >= 0 ? headers[iArea] : "(não encontrada)",
      valor: headers[iValor] || "",
    },
    erro: unidades.length === 0 ? "Nenhuma unidade com valor encontrada." : undefined,
  };
}
