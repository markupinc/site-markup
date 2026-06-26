import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Endpoint TEMPORÁRIO de diagnóstico. Protegido pelo META_SYNC_SECRET. Remover após.
 * v2: caça os CAMPOS dedicados de visitas ao perfil / seguidores em anúncios
 * (instagram_profile_visits e candidatos a "Instagram follows").
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

  // 1) Campo dedicado: instagram_profile_visits por campanha (últimos 30d)
  const profileVisits = await g(`${acct}/insights`, {
    level: "campaign",
    fields: "campaign_name,objective,spend,instagram_profile_visits,cost_per_action_type",
    date_preset: "last_30d",
    limit: "300",
  });
  const profileVisitsResult = profileVisits.ok
    ? (profileVisits.json?.data || [])
        .filter((c: any) => Number(c.instagram_profile_visits) > 0)
        .map((c: any) => ({
          nome: c.campaign_name,
          spend: c.spend,
          instagram_profile_visits: c.instagram_profile_visits,
          custo_por_visita:
            Number(c.instagram_profile_visits) > 0
              ? (Number(c.spend) / Number(c.instagram_profile_visits)).toFixed(2)
              : null,
        }))
    : { erro: profileVisits.json?.error?.message };

  // 2) Candidatos a CAMPO de seguidores (cada um numa chamada separada — nome instável)
  const followerFieldCandidates = [
    "instagram_follows",
    "follows",
    "instagram_followers",
    "onsite_conversion_ig_follow",
  ];
  const followerFieldResults: Record<string, any> = {};
  for (const f of followerFieldCandidates) {
    const r = await g(`${acct}/insights`, {
      level: "campaign",
      fields: `campaign_name,${f}`,
      date_preset: "last_30d",
      limit: "50",
    });
    if (r.ok) {
      const comValor = (r.json?.data || [])
        .filter((c: any) => c[f] != null && Number(c[f]) > 0)
        .map((c: any) => `${c.campaign_name}=${c[f]}`);
      followerFieldResults[f] = { ok: true, exemplos: comValor.slice(0, 5), totalComValor: comValor.length };
    } else {
      followerFieldResults[f] = { erro: r.json?.error?.message };
    }
  }

  // 3) Histórico: qualquer action_type suspeito de follow/profile em TODO o período
  const campMax = await g(`${acct}/insights`, {
    level: "campaign",
    fields: "campaign_name,actions",
    date_preset: "maximum",
    limit: "500",
  });
  const actionTypesMax = ([
    ...new Set(
      (campMax.json?.data || []).flatMap((c: any) =>
        (c.actions || []).map((a: any) => String(a.action_type))
      )
    ),
  ] as string[]).sort();
  const suspeitos = actionTypesMax.filter((t) =>
    /follow|profile|visit|ig_/i.test(t)
  );

  return NextResponse.json(
    {
      ok: true,
      "1_instagram_profile_visits_field": profileVisitsResult,
      "2_follower_field_candidates": followerFieldResults,
      "3_action_types_historico_suspeitos": suspeitos,
      "3b_total_action_types_historico": actionTypesMax.length,
    },
    { status: 200 }
  );
}
