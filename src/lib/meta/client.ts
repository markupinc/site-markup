/**
 * Cliente server-side da Meta Graph / Marketing API (v25). Só no servidor.
 * Env: META_SYSTEM_USER_TOKEN, META_AD_ACCOUNT_ID (act_...), META_PAGE_ID,
 *      META_IG_USER_ID, META_GRAPH_VERSION (default v25.0).
 */

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v25.0";
const BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export class MetaConfigError extends Error {}

function token(): string {
  const t = process.env.META_SYSTEM_USER_TOKEN;
  if (!t) throw new MetaConfigError("META_SYSTEM_USER_TOKEN não configurado");
  return t;
}
function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new MetaConfigError(`${name} não configurado`);
  return v;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function graphGet<T = any>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}/${path}`);
  url.searchParams.set("access_token", token());
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { cache: "no-store", signal: AbortSignal.timeout(30_000) });
  const json: any = await res.json();
  if (!res.ok) throw new Error(`Meta API ${res.status}: ${json?.error?.message || res.statusText}`);
  return json as T;
}

const num = (v?: string | number | null) => (v == null ? 0 : Number(v));

// ---- Classificação de campanha --------------------------------------------

export type Bucket = "lead" | "reconhecimento" | "social" | "trafego" | "outro";
export type Produto = "salsa" | "up" | "horizon" | "outro";

export function classificaBucket(objective?: string, nome?: string): Bucket {
  if (/^post do instagram/i.test(nome || "")) return "social";
  const o = (objective || "").toUpperCase();
  if (o === "OUTCOME_LEADS" || o === "LEAD_GENERATION") return "lead";
  if (o === "OUTCOME_AWARENESS" || o === "BRAND_AWARENESS" || o === "REACH") return "reconhecimento";
  if (o === "LINK_CLICKS" || o === "OUTCOME_TRAFFIC") return "trafego";
  return "outro";
}

export function classificaProduto(nome?: string): Produto {
  const n = nome || "";
  if (/salsa/i.test(n)) return "salsa";
  if (/horizon/i.test(n)) return "horizon";
  if (/\bup!?\b|up\s*studios/i.test(n)) return "up";
  return "outro";
}

// Conta de leads: 'lead' já é o TOTAL agregado (instant form + pixel). NÃO somar
// com os _grouped (duplicaria). Usa um único valor canônico.
function contaLeads(actions: Array<{ action_type: string; value: string }>): number {
  const get = (t: string) => actions.find((a) => a.action_type === t)?.value;
  const v =
    get("lead") ??
    get("onsite_conversion.lead_grouped") ??
    get("leadgen_grouped") ??
    get("offsite_conversion.fb_pixel_lead");
  return num(v);
}

// ---- Insights por campanha -------------------------------------------------

export interface CampanhaInsight {
  data: string;
  campaign_id: string;
  campaign_name: string | null;
  objetivo: string | null;
  bucket: Bucket;
  produto: Produto;
  gasto: number;
  impressoes: number;
  alcance: number;
  frequencia: number;
  cliques: number;
  ctr: number;
  cpc: number;
  cpm: number;
  leads: number;
  custo_por_lead: number | null;
  visitas_perfil: number;
  custo_por_visita: number | null;
  moeda: string;
}

export async function fetchCampaignInsights(
  datePreset = "last_30d",
  timeRange?: { since: string; until: string }
): Promise<CampanhaInsight[]> {
  const account = requireEnv("META_AD_ACCOUNT_ID");
  const fields = [
    "campaign_id",
    "campaign_name",
    "objective",
    "spend",
    "impressions",
    "reach",
    "frequency",
    "clicks",
    "ctr",
    "cpc",
    "cpm",
    "actions",
    "instagram_profile_visits",
    "account_currency",
  ].join(",");

  const rows: CampanhaInsight[] = [];
  let after: string | undefined;
  do {
    const params: Record<string, string> = {
      level: "campaign",
      fields,
      time_increment: "1",
      limit: "200",
    };
    if (timeRange) params.time_range = JSON.stringify(timeRange);
    else params.date_preset = datePreset;
    if (after) params.after = after;
    const page = await graphGet(`${account}/insights`, params);
    for (const r of page.data || []) {
      const gasto = num(r.spend);
      const leads = contaLeads(r.actions || []);
      const visitas = num(r.instagram_profile_visits);
      rows.push({
        data: r.date_start,
        campaign_id: r.campaign_id,
        campaign_name: r.campaign_name ?? null,
        objetivo: r.objective ?? null,
        bucket: classificaBucket(r.objective, r.campaign_name),
        produto: classificaProduto(r.campaign_name),
        gasto,
        impressoes: num(r.impressions),
        alcance: num(r.reach),
        frequencia: num(r.frequency),
        cliques: num(r.clicks),
        ctr: num(r.ctr),
        cpc: num(r.cpc),
        cpm: num(r.cpm),
        leads,
        custo_por_lead: leads > 0 ? Number((gasto / leads).toFixed(2)) : null,
        visitas_perfil: visitas,
        custo_por_visita: visitas > 0 ? Number((gasto / visitas).toFixed(2)) : null,
        moeda: r.account_currency || "BRL",
      });
    }
    after = page.paging?.next ? page.paging?.cursors?.after : undefined;
  } while (after);

  return rows;
}

// ---- Instagram orgânico ----------------------------------------------------

// Janela [00:00, 24:00) UTC de uma data YYYY-MM-DD
function dayRange(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const since = Math.floor(Date.UTC(y, m - 1, d) / 1000);
  return { since, until: since + 86400 };
}

export function listarDias(n: number): string[] {
  const dias: string[] = [];
  const hoje = Date.now();
  for (let i = n - 1; i >= 0; i--) {
    dias.push(new Date(hoje - i * 86400_000).toISOString().slice(0, 10));
  }
  return dias;
}

export interface IgMetricasDia {
  data: string;
  alcance: number | null;
  views: number | null;
  profile_views: number | null;
  total_interactions: number | null;
  accounts_engaged: number | null;
}

// Métricas total_value de um dia (1 chamada agrupando as métricas)
export async function fetchIgMetricasDia(dateStr: string): Promise<IgMetricasDia> {
  const ig = requireEnv("META_IG_USER_ID");
  const { since, until } = dayRange(dateStr);
  const r = await graphGet(`${ig}/insights`, {
    metric: "reach,views,profile_views,total_interactions,accounts_engaged",
    period: "day",
    metric_type: "total_value",
    since: String(since),
    until: String(until),
  });
  const val: Record<string, number | null> = {};
  for (const m of r.data || []) val[m.name] = m.total_value?.value ?? null;
  return {
    data: dateStr,
    alcance: val.reach ?? null,
    views: val.views ?? null,
    profile_views: val.profile_views ?? null,
    total_interactions: val.total_interactions ?? null,
    accounts_engaged: val.accounts_engaged ?? null,
  };
}

// Série diária de NOVOS seguidores (follower_count). 1 chamada cobre até 30 dias.
export async function fetchIgNovosSeguidores(dias: number): Promise<Array<{ data: string; novos_seguidores: number }>> {
  const ig = requireEnv("META_IG_USER_ID");
  const until = Math.floor(Date.now() / 1000);
  const since = until - Math.min(dias, 30) * 86400;
  try {
    const r = await graphGet(`${ig}/insights`, {
      metric: "follower_count",
      period: "day",
      since: String(since),
      until: String(until),
    });
    const values = r.data?.[0]?.values || [];
    return values.map((v: any) => ({
      // end_time marca o fim do dia; atribui ao dia que terminou (-12h)
      data: new Date(Date.parse(v.end_time) - 43_200_000).toISOString().slice(0, 10),
      novos_seguidores: num(v.value),
    }));
  } catch {
    return []; // conta <100 seguidores ou métrica indisponível
  }
}

export async function fetchInstagramTotal(): Promise<number | null> {
  const ig = requireEnv("META_IG_USER_ID");
  const r = await graphGet(`${ig}`, { fields: "followers_count" });
  return r.followers_count ?? null;
}

export async function fetchFacebookTotal(): Promise<number | null> {
  const page = requireEnv("META_PAGE_ID");
  const r = await graphGet(`${page}`, { fields: "followers_count,fan_count" });
  return r.followers_count ?? r.fan_count ?? null;
}
