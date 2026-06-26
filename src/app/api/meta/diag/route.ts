import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Endpoint TEMPORÁRIO de diagnóstico — descobre, na conta real, quais action_types
 * as campanhas produzem e quais métricas de Instagram estão disponíveis (o Meta
 * depreciou várias em 2025). Protegido pelo META_SYNC_SECRET. Remover após o ajuste.
 */

const V = process.env.META_GRAPH_VERSION || "v25.0";
const BASE = `https://graph.facebook.com/${V}`;

/* eslint-disable @typescript-eslint/no-explicit-any */
async function g(path: string, params: Record<string, string>) {
  const url = new URL(`${BASE}/${path}`);
  url.searchParams.set("access_token", process.env.META_SYSTEM_USER_TOKEN || "");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { cache: "no-store", signal: AbortSignal.timeout(30_000) });
  const json: any = await res.json();
  return { ok: res.ok, status: res.status, json };
}

export async function GET(request: NextRequest) {
  const secret = process.env.META_SYNC_SECRET;
  const provided =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    request.nextUrl.searchParams.get("secret");
  if (!secret || provided !== secret) {
    return NextResponse.json({ ok: false, error: "não autorizado" }, { status: 401 });
  }

  const acct = process.env.META_AD_ACCOUNT_ID || "";
  const ig = process.env.META_IG_USER_ID || "";

  // 1) Campanhas (últimos 30d) com actions + cost_per_action_type
  const camp = await g(`${acct}/insights`, {
    level: "campaign",
    fields: "campaign_name,objective,spend,actions,cost_per_action_type",
    date_preset: "last_30d",
    limit: "300",
  });
  const campaigns = (camp.json?.data || []).map((c: any) => ({
    nome: c.campaign_name,
    objective: c.objective,
    spend: c.spend,
    actions: (c.actions || []).map((a: any) => `${a.action_type}=${a.value}`),
    cost_per_action_type: (c.cost_per_action_type || []).map(
      (a: any) => `${a.action_type}=${a.value}`
    ),
  }));
  const actionTypesGlobais = [
    ...new Set(
      (camp.json?.data || []).flatMap((c: any) =>
        (c.actions || []).map((a: any) => a.action_type)
      )
    ),
  ].sort();

  // 2) Probe das métricas de Instagram (várias foram depreciadas em 2025)
  const metricsToTry = [
    "reach",
    "views",
    "impressions",
    "profile_views",
    "website_clicks",
    "accounts_engaged",
    "total_interactions",
    "follower_count",
    "online_followers",
    "profile_links_taps",
  ];
  const igResults: Record<string, any> = {};
  for (const metric of metricsToTry) {
    const r1 = await g(`${ig}/insights`, { metric, period: "day" });
    if (r1.ok) {
      igResults[metric] = {
        variante: "period=day",
        amostra: r1.json?.data?.[0]?.values?.slice(-2) ?? r1.json?.data,
      };
      continue;
    }
    const r2 = await g(`${ig}/insights`, { metric, period: "day", metric_type: "total_value" });
    if (r2.ok) {
      igResults[metric] = { variante: "total_value", amostra: r2.json?.data };
      continue;
    }
    igResults[metric] = { erro: r1.json?.error?.message || r2.json?.error?.message };
  }

  // 3) Perfil IG básico
  const igProfile = await g(`${ig}`, { fields: "followers_count,media_count,username" });

  return NextResponse.json(
    {
      ok: true,
      contas: { ad_account: acct, ig_user: ig },
      totalCampanhas: campaigns.length,
      campaigns,
      actionTypesGlobais,
      igResults,
      igProfile: igProfile.json,
    },
    { status: 200 }
  );
}
