import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  fetchCampaignInsights,
  fetchIgMetricasDia,
  fetchIgNovosSeguidores,
  fetchInstagramTotal,
  fetchFacebookTotal,
  listarDias,
  MetaConfigError,
} from "@/lib/meta/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sincroniza Meta Ads + Instagram para o cache no Supabase.
 * Auth: header Authorization: Bearer <META_SYNC_SECRET> ou ?secret=.
 * Params: ?preset=last_30d  ?backfill=N (N dias de métricas diárias de IG; default 3).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
async function handle(request: NextRequest) {
  const secret = process.env.META_SYNC_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "META_SYNC_SECRET não configurado." }, { status: 503 });
  }
  const provided =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    request.nextUrl.searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }

  const preset = request.nextUrl.searchParams.get("preset") || "last_30d";
  const backfill = Math.min(Number(request.nextUrl.searchParams.get("backfill")) || 0, 30);
  const igMetricDias = backfill > 0 ? backfill : 3; // re-puxa só os últimos dias no sync normal
  const supabase = createAdminClient();
  const agora = new Date().toISOString();
  const hoje = agora.slice(0, 10);
  const resultado: Record<string, unknown> = {};

  // ---- Anúncios (insights por campanha) ----
  try {
    const insights = await fetchCampaignInsights(preset);
    if (insights.length > 0) {
      const { error } = await (supabase.from("meta_campanha_insights") as any).upsert(
        insights.map((r) => ({ ...r, atualizado_em: agora })),
        { onConflict: "data,campaign_id" }
      );
      if (error) throw new Error(error.message);
    }
    resultado.insights = { ok: true, linhas: insights.length };
    await log(supabase, "insights", "ok", `${insights.length} linhas`, insights.length);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    resultado.insights = { ok: false, erro: msg };
    await log(supabase, "insights", "erro", msg, 0);
    if (err instanceof MetaConfigError) {
      return NextResponse.json({ ok: false, error: msg }, { status: 503 });
    }
  }

  // ---- Instagram orgânico (métricas diárias + seguidores) ----
  try {
    const rows = new Map<string, any>();
    const get = (d: string) => {
      if (!rows.has(d)) rows.set(d, { data: d, plataforma: "instagram", atualizado_em: agora });
      return rows.get(d);
    };

    // Métricas total_value, dia a dia (1 chamada por dia)
    for (const dia of listarDias(igMetricDias)) {
      try {
        const m = await fetchIgMetricasDia(dia);
        const r = get(dia);
        r.alcance = m.alcance;
        r.views = m.views;
        r.profile_views = m.profile_views;
        r.total_interactions = m.total_interactions;
        r.accounts_engaged = m.accounts_engaged;
      } catch {
        /* dia individual pode falhar; segue */
      }
    }

    // Ganho de seguidores diário (sempre 30 dias, 1 chamada) — alimenta o gráfico de evolução
    for (const s of await fetchIgNovosSeguidores(30)) {
      get(s.data).novos_seguidores = s.novos_seguidores;
    }

    // Total atual de seguidores (snapshot de hoje)
    const igTotal = await fetchInstagramTotal();
    if (igTotal != null) get(hoje).seguidores_total = igTotal;

    if (rows.size > 0) {
      const { error } = await (supabase.from("meta_seguidores") as any).upsert([...rows.values()], {
        onConflict: "data,plataforma",
      });
      if (error) throw new Error(error.message);
    }
    resultado.instagram = { ok: true, dias: rows.size };
    await log(supabase, "instagram", "ok", `${rows.size} dias`, rows.size);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    resultado.instagram = { ok: false, erro: msg };
    await log(supabase, "instagram", "erro", msg, 0);
  }

  // ---- Facebook (total de seguidores) ----
  try {
    const fbTotal = await fetchFacebookTotal();
    if (fbTotal != null) {
      const { error } = await (supabase.from("meta_seguidores") as any).upsert(
        [{ data: hoje, plataforma: "facebook", seguidores_total: fbTotal, atualizado_em: agora }],
        { onConflict: "data,plataforma" }
      );
      if (error) throw new Error(error.message);
    }
    resultado.facebook = { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    resultado.facebook = { ok: false, erro: msg };
    await log(supabase, "facebook", "erro", msg, 0);
  }

  return NextResponse.json({ ok: true, sincronizado_em: agora, backfill, resultado });
}

async function log(
  supabase: ReturnType<typeof createAdminClient>,
  tipo: string,
  status: string,
  mensagem: string,
  linhas: number
) {
  await (supabase.from("meta_sync_log") as any)
    .insert({ tipo, status, mensagem, linhas_afetadas: linhas })
    .then(() => {})
    .catch(() => {});
}

export async function GET(request: NextRequest) {
  return handle(request);
}
export async function POST(request: NextRequest) {
  return handle(request);
}
