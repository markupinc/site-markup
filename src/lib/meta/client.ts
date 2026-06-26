/**
 * Cliente server-side da Meta Graph / Marketing API.
 * Usado SOMENTE no servidor (rota /api/meta/sync). Nunca expor o token no client.
 *
 * Env vars necessárias (server-only — NÃO usar prefixo NEXT_PUBLIC_):
 *   META_SYSTEM_USER_TOKEN  – token long-lived de um System User com permissão ads_read
 *   META_AD_ACCOUNT_ID      – id da conta de anúncios, formato "act_1234567890"
 *   META_PAGE_ID            – id da Página do Facebook (métricas de seguidores)
 *   META_IG_USER_ID         – id da conta Instagram Business (linkada à Página)
 *   META_GRAPH_VERSION      – opcional, default "v25.0"
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

async function graphGet<T>(
  path: string,
  params: Record<string, string>
): Promise<T> {
  const url = new URL(`${BASE}/${path}`);
  url.searchParams.set("access_token", token());
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), {
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json?.error?.message || res.statusText;
    throw new Error(`Meta API ${res.status}: ${msg}`);
  }
  return json as T;
}

// ---- Objetivo de campanha -> bucket do dashboard --------------------------

export type Bucket = "lead" | "reconhecimento" | "outro";

export function objetivoParaBucket(objective?: string): Bucket {
  const o = (objective || "").toUpperCase();
  if (o === "OUTCOME_LEADS" || o === "LEAD_GENERATION") return "lead";
  if (
    o === "OUTCOME_AWARENESS" ||
    o === "BRAND_AWARENESS" ||
    o === "REACH"
  ) {
    return "reconhecimento";
  }
  return "outro";
}

// action_types que contam como "lead". Varia por tipo de formulário/conta —
// CONFIRMAR contra a resposta real de /insights desta conta antes de fechar.
const LEAD_ACTION_TYPES = new Set([
  "lead",
  "leadgen_grouped",
  "onsite_conversion.lead_grouped",
  "onsite_conversion.lead",
]);

interface InsightAction {
  action_type: string;
  value: string;
}

interface RawInsightRow {
  date_start: string;
  date_stop: string;
  campaign_id: string;
  campaign_name?: string;
  objective?: string;
  spend?: string;
  impressions?: string;
  reach?: string;
  frequency?: string;
  clicks?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  actions?: InsightAction[];
  account_currency?: string;
}

export interface CampanhaInsight {
  data: string; // YYYY-MM-DD
  campaign_id: string;
  campaign_name: string | null;
  objetivo: string | null;
  bucket: Bucket;
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
  moeda: string;
}

const num = (v?: string) => (v ? Number(v) : 0);

/**
 * Insights por campanha, com linhas diárias (time_increment=1).
 * datePreset ex.: "today" | "yesterday" | "last_7d" | "last_14d" | "last_30d".
 */
export async function fetchCampaignInsights(
  datePreset = "last_14d"
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
    "account_currency",
  ].join(",");

  const rows: CampanhaInsight[] = [];
  let after: string | undefined;

  do {
    const params: Record<string, string> = {
      level: "campaign",
      fields,
      time_increment: "1",
      date_preset: datePreset,
      limit: "200",
    };
    if (after) params.after = after;

    const page = await graphGet<{
      data: RawInsightRow[];
      paging?: { cursors?: { after?: string }; next?: string };
    }>(`${account}/insights`, params);

    for (const r of page.data) {
      const leads = (r.actions || [])
        .filter((a) => LEAD_ACTION_TYPES.has(a.action_type))
        .reduce((sum, a) => sum + num(a.value), 0);
      const gasto = num(r.spend);
      rows.push({
        data: r.date_start,
        campaign_id: r.campaign_id,
        campaign_name: r.campaign_name ?? null,
        objetivo: r.objective ?? null,
        bucket: objetivoParaBucket(r.objective),
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
        moeda: r.account_currency || "BRL",
      });
    }

    after = page.paging?.next ? page.paging?.cursors?.after : undefined;
  } while (after);

  return rows;
}

// ---- Seguidores -----------------------------------------------------------

export interface SeguidoresSnapshot {
  plataforma: "instagram" | "facebook";
  seguidores_total: number | null;
  novos_seguidores: number | null;
  alcance: number | null;
}

export async function fetchInstagramSeguidores(): Promise<SeguidoresSnapshot> {
  const ig = requireEnv("META_IG_USER_ID");

  const profile = await graphGet<{ followers_count?: number }>(ig, {
    fields: "followers_count",
  });

  let novos: number | null = null;
  let alcance: number | null = null;
  try {
    const insights = await graphGet<{
      data: Array<{ name: string; values: Array<{ value: number }> }>;
    }>(`${ig}/insights`, {
      metric: "follower_count,reach",
      period: "day",
    });
    for (const m of insights.data) {
      const v = m.values?.[0]?.value ?? null;
      if (m.name === "follower_count") novos = v;
      if (m.name === "reach") alcance = v;
    }
  } catch {
    // métricas de insights podem falhar (conta nova / <100 seguidores) — segue só com o total
  }

  return {
    plataforma: "instagram",
    seguidores_total: profile.followers_count ?? null,
    novos_seguidores: novos,
    alcance,
  };
}

export async function fetchFacebookSeguidores(): Promise<SeguidoresSnapshot> {
  const page = requireEnv("META_PAGE_ID");
  const data = await graphGet<{
    followers_count?: number;
    fan_count?: number;
  }>(page, { fields: "followers_count,fan_count" });

  return {
    plataforma: "facebook",
    seguidores_total: data.followers_count ?? data.fan_count ?? null,
    novos_seguidores: null,
    alcance: null,
  };
}
