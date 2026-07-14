/**
 * Leitor da planilha de PREÇOS (.xlsx padrão, .csv também).
 *
 * Desafios reais do arquivo do cliente (tabelaup.xlsx):
 *  - o cabeçalho NÃO é a primeira linha (vem título e linhas vazias antes)
 *  - há sub-cabeçalhos abaixo do cabeçalho (linhas sem unidade) — são ignorados
 *  - os números podem vir em formato US (R$ 20,102.98) ou BR (R$ 20.102,98)
 *  - no .xlsx os números vêm como número puro (sem ambiguidade)
 *
 * Colunas necessárias: Unidade/Apartamento + Valor.  Opcionais: Área, Torre, Tipo.
 */
import * as XLSX from "xlsx";

export type Celula = string | number;

export interface UnidadePreco {
  apartamento: string;
  torre: string | null;
  tipo: string | null;
  area_m2: number;
  valor: number;
}

export interface ParseResult {
  unidades: UnidadePreco[];
  linhaCabecalho: number; // 1-based (para mostrar ao usuário)
  colunas: { unidade: string; area: string; valor: string };
  duplicadas: number;
  erro?: string;
}

// ---------- leitura do arquivo ----------
export async function linhasDoArquivo(file: File): Promise<Celula[][]> {
  const nome = file.name.toLowerCase();
  const buf = await file.arrayBuffer();

  if (nome.endsWith(".xlsx") || nome.endsWith(".xls")) {
    const wb = XLSX.read(buf, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    // raw: true → números vêm como number (sem ambiguidade de formato)
    return XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: "" }) as Celula[][];
  }

  let texto = new TextDecoder("utf-8", { fatal: false }).decode(buf);
  if (texto.includes("�")) texto = new TextDecoder("windows-1252").decode(buf);
  return parseCSV(texto);
}

function detectarSep(texto: string): string {
  const amostra = texto.split("\n").slice(0, 10).join("\n");
  const c = { ";": 0, ",": 0, "\t": 0 };
  for (const ch of amostra) if (ch in c) c[ch as keyof typeof c]++;
  if (c["\t"] > c[";"] && c["\t"] > c[","]) return "\t";
  return c[";"] >= c[","] ? ";" : ",";
}

function parseCSV(text: string): string[][] {
  const t = text.replace(/^﻿/, "");
  const sep = detectarSep(t);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let q = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (q) {
      if (ch === '"') {
        if (t[i + 1] === '"') {
          field += '"';
          i++;
        } else q = false;
      } else field += ch;
    } else if (ch === '"') q = true;
    else if (ch === sep) {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") field += ch;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// ---------- número (BR, US ou já-numérico) ----------
export function num(v: Celula | undefined | null): number {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return isFinite(v) ? v : 0;

  let s = String(v).replace(/R\$|\s|%/gi, "").trim();
  if (!s) return 0;
  const negativo = /^\(.*\)$/.test(s) || s.startsWith("-");
  s = s.replace(/[()\-]/g, "");

  const lc = s.lastIndexOf(",");
  const ld = s.lastIndexOf(".");

  if (lc > -1 && ld > -1) {
    // o ÚLTIMO separador é o decimal
    if (lc > ld) s = s.replace(/\./g, "").replace(",", "."); // BR: 1.234,56
    else s = s.replace(/,/g, ""); // US: 1,234.56
  } else if (lc > -1) {
    const casas = s.length - lc - 1;
    s = casas === 3 ? s.replace(/,/g, "") : s.replace(",", "."); // 1,234 = milhar · 12,5 = decimal
  } else if (ld > -1) {
    const casas = s.length - ld - 1;
    // 3 casas + número "grande" ⇒ separador de milhar (ex.: 903.226). "44.93" continua decimal.
    if (casas === 3 && s.replace(/\./g, "").length >= 4) s = s.replace(/\./g, "");
  }

  const n = parseFloat(s);
  if (isNaN(n)) return 0;
  return negativo ? -n : n;
}

// ---------- cabeçalho ----------
const norm = (v: Celula | undefined) =>
  String(v ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

const ehUnidade = (h: string) => h.startsWith("unidade") || h.startsWith("apartamento") || h === "apto" || h === "unid";
const ehValor = (h: string) =>
  h.startsWith("valor") && !h.startsWith("valordo") && !h.includes("m2") && !h.includes("venda") && !h.includes("desconto");
const ehArea = (h: string) => h.startsWith("area");
const ehTorre = (h: string) => h === "torre" || h === "bloco";
const ehTipo = (h: string) => h === "tipo";

/** Acha a linha do cabeçalho (não é necessariamente a primeira). */
function acharCabecalho(rows: Celula[][]): number {
  const limite = Math.min(rows.length, 40);
  for (let i = 0; i < limite; i++) {
    const H = (rows[i] || []).map(norm);
    if (H.some(ehUnidade) && H.some(ehValor)) return i;
  }
  return -1;
}

export function parsePlanilhaPrecos(rows: Celula[][]): ParseResult {
  const vazio = { unidades: [], linhaCabecalho: -1, colunas: { unidade: "", area: "", valor: "" }, duplicadas: 0 };

  const iH = acharCabecalho(rows);
  if (iH < 0) {
    return {
      ...vazio,
      erro:
        "Não encontrei o cabeçalho nas primeiras 40 linhas. A planilha precisa ter uma linha com uma coluna de Unidade/Apartamento e outra de Valor.",
    };
  }

  const H = rows[iH].map(norm);
  const orig = rows[iH].map((v) => String(v ?? "").trim());
  const iU = H.findIndex(ehUnidade);
  const iV = H.findIndex(ehValor);
  const iA = H.findIndex(ehArea);
  const iT = H.findIndex(ehTorre);
  const iTipo = H.findIndex(ehTipo);

  const unidades: UnidadePreco[] = [];
  const vistos = new Set<string>();
  let duplicadas = 0;

  for (let r = iH + 1; r < rows.length; r++) {
    const row = rows[r] || [];
    const apartamento = String(row[iU] ?? "").trim();
    const valor = num(row[iV]);
    if (!apartamento || valor <= 0) continue; // pula sub-cabeçalhos, totais e linhas vazias
    if (vistos.has(apartamento)) {
      duplicadas++;
      continue;
    }
    vistos.add(apartamento);
    unidades.push({
      apartamento,
      torre: iT >= 0 ? String(row[iT] ?? "").trim() || null : null,
      tipo: iTipo >= 0 ? String(row[iTipo] ?? "").trim() || null : null,
      area_m2: iA >= 0 ? num(row[iA]) : 0,
      valor,
    });
  }

  return {
    unidades,
    linhaCabecalho: iH + 1,
    colunas: {
      unidade: orig[iU] || "—",
      area: iA >= 0 ? orig[iA] || "—" : "(não encontrada)",
      valor: orig[iV] || "—",
    },
    duplicadas,
    erro: unidades.length === 0 ? "Cabeçalho encontrado, mas nenhuma linha com unidade + valor válidos." : undefined,
  };
}
