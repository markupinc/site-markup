/**
 * Cliente server-side da API do Kommo (CRM). Só no servidor.
 * Env: KOMMO_SUBDOMAIN, KOMMO_ACCESS_TOKEN.
 */

export class KommoConfigError extends Error {}

// Funis de VENDA (produto = funil) — descobertos na conta.
export const SALES_PIPELINES = [11523647, 11872179, 13035483];
const PRODUTO: Record<number, string> = {
  11523647: "salsa",
  11872179: "up",
  13035483: "horizon",
};
export const produtoFromPipeline = (pid: number) => PRODUTO[pid] || "outro";

export type Bucket =
  | "novo"
  | "tentativa_contato"
  | "em_atendimento"
  | "qualificado"
  | "ganho"
  | "perdido";

/* eslint-disable @typescript-eslint/no-explicit-any */
async function kget(path: string): Promise<any> {
  const sub = process.env.KOMMO_SUBDOMAIN;
  const token = process.env.KOMMO_ACCESS_TOKEN;
  if (!sub || !token) throw new KommoConfigError("KOMMO_SUBDOMAIN / KOMMO_ACCESS_TOKEN não configurados");
  const res = await fetch(`https://${sub}.kommo.com/api/v4/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  if (res.status === 204) return {}; // sem conteúdo
  const json = await res.json();
  if (!res.ok) throw new Error(`Kommo API ${res.status}: ${json?.title || json?.detail || res.statusText}`);
  return json;
}

// Bucket padrão a partir do status (regra automática; o usuário pode sobrescrever no banco)
export function bucketDefault(statusId: number, nome: string, tipo: number): Bucket {
  const n = nome || "";
  if (statusId === 142) return "ganho";
  if (statusId === 143) return "perdido";
  if (tipo === 1) return "novo";
  if (/qualificad|oferta feita|negocia/i.test(n)) return "qualificado";
  if (/trabalhando/i.test(n)) return "em_atendimento";
  // follow-ups: "1ª/2ª... tentativa de contato" e "2º/3º... contato"
  if (/tentativa de contato|\d+\s*[ºªo]\s*contato/i.test(n)) return "tentativa_contato";
  return "em_atendimento";
}

export interface Stage {
  status_id: number;
  pipeline_id: number;
  pipeline_nome: string;
  status_nome: string;
  tipo: number;
  cor: string | null;
  bucket: Bucket;
}

export async function fetchStages(): Promise<Stage[]> {
  const json = await kget("leads/pipelines");
  const out: Stage[] = [];
  for (const p of json?._embedded?.pipelines || []) {
    if (!SALES_PIPELINES.includes(p.id)) continue;
    for (const s of p._embedded?.statuses || []) {
      out.push({
        status_id: s.id,
        pipeline_id: p.id,
        pipeline_nome: p.name,
        status_nome: s.name,
        tipo: s.type,
        cor: s.color ?? null,
        bucket: bucketDefault(s.id, s.name, s.type),
      });
    }
  }
  return out;
}

export interface KommoLead {
  id: number;
  pipeline_id: number;
  status_id: number;
  responsavel_id: number | null;
  valor: number;
  nome: string | null;
  fonte: string;
  created_at: string | null;
  closed_at: string | null;
}

const tsIso = (epoch?: number | null) => (epoch ? new Date(epoch * 1000).toISOString() : null);
function fonteFromNome(nome?: string): string {
  const n = nome || "";
  if (/facebook|instagram|^ig |meta/i.test(n)) return "facebook";
  if (/site|formul|web/i.test(n)) return "site";
  return "outro";
}

/** Leads dos funis de venda. updatedFrom (epoch s) p/ incremental; sem ele = backfill total. */
export async function fetchSalesLeads(updatedFrom?: number): Promise<KommoLead[]> {
  const out: KommoLead[] = [];
  let page = 1;
  const limit = 250;
  // monta filtro de pipelines + (opcional) updated_at
  const pipeFilter = SALES_PIPELINES.map((id, i) => `filter[pipeline_id][${i}]=${id}`).join("&");
  for (;;) {
    let path = `leads?limit=${limit}&page=${page}&${pipeFilter}&order[updated_at]=desc`;
    if (updatedFrom) path += `&filter[updated_at][from]=${updatedFrom}`;
    const json = await kget(path);
    const leads = json?._embedded?.leads || [];
    for (const l of leads) {
      out.push({
        id: l.id,
        pipeline_id: l.pipeline_id,
        status_id: l.status_id,
        responsavel_id: l.responsible_user_id ?? null,
        valor: Number(l.price) || 0,
        nome: l.name ?? null,
        fonte: fonteFromNome(l.name),
        created_at: tsIso(l.created_at),
        closed_at: tsIso(l.closed_at),
      });
    }
    if (leads.length < limit) break;
    page++;
    if (page > 80) break; // trava de segurança (~20k leads)
  }
  return out;
}
