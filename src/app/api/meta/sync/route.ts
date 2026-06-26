import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  fetchCampaignInsights,
  fetchInstagramSeguidores,
  fetchFacebookSeguidores,
  MetaConfigError,
  type SeguidoresSnapshot,
} from "@/lib/meta/client";

export const runtime = "nodejs";
// Não cachear: é um endpoint de sincronização disparado por agendador.
export const dynamic = "force-dynamic";

/**
 * Sincroniza métricas do Meta Ads para o cache no Supabase.
 * Disparar por agendador (Supabase pg_cron / cron externo) a cada ~10-15 min.
 *
 * Autenticação: header `Authorization: Bearer <META_SYNC_SECRET>` OU `?secret=<...>`.
 * Janela de insights: ?preset=last_14d (default) — repuxa os últimos N dias para
 * corrigir os valores de "hoje/ontem" que o Meta ainda está consolidando.
 */
async function handle(request: NextRequest) {
  const secret = process.env.META_SYNC_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "META_SYNC_SECRET não configurado no servidor." },
      { status: 503 }
    );
  }

  const auth = request.headers.get("authorization");
  const qsSecret = request.nextUrl.searchParams.get("secret");
  const provided = auth?.replace(/^Bearer\s+/i, "") || qsSecret;
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }

  const preset = request.nextUrl.searchParams.get("preset") || "last_14d";
  const supabase = createAdminClient();
  const hoje = new Date().toISOString().slice(0, 10);
  const resultado: Record<string, unknown> = {};

  // ---- Insights por campanha ----
  try {
    const insights = await fetchCampaignInsights(preset);
    if (insights.length > 0) {
      const { error } = await (supabase.from("meta_campanha_insights") as any).upsert(
        insights.map((r) => ({ ...r, atualizado_em: new Date().toISOString() })),
        { onConflict: "data,campaign_id" }
      );
      if (error) throw new Error(error.message);
    }
    resultado.insights = { ok: true, linhas: insights.length };
    await logSync(supabase, "insights", "ok", `${insights.length} linhas`, insights.length);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    resultado.insights = { ok: false, erro: msg };
    await logSync(supabase, "insights", "erro", msg, 0);
    if (err instanceof MetaConfigError) {
      return NextResponse.json(
        { ok: false, error: msg, dica: "Configure as env vars do Meta." },
        { status: 503 }
      );
    }
  }

  // ---- Seguidores (IG + Página) ----
  try {
    const snaps: SeguidoresSnapshot[] = [];
    for (const fn of [fetchInstagramSeguidores, fetchFacebookSeguidores]) {
      try {
        snaps.push(await fn());
      } catch (e) {
        // uma plataforma falhar não derruba a outra
        await logSync(
          supabase,
          "seguidores",
          "erro",
          e instanceof Error ? e.message : String(e),
          0
        );
      }
    }
    if (snaps.length > 0) {
      const { error } = await (supabase.from("meta_seguidores") as any).upsert(
        snaps.map((s) => ({ ...s, data: hoje, atualizado_em: new Date().toISOString() })),
        { onConflict: "data,plataforma" }
      );
      if (error) throw new Error(error.message);
    }
    resultado.seguidores = { ok: true, plataformas: snaps.length };
    await logSync(supabase, "seguidores", "ok", `${snaps.length} plataformas`, snaps.length);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    resultado.seguidores = { ok: false, erro: msg };
    await logSync(supabase, "seguidores", "erro", msg, 0);
  }

  return NextResponse.json({ ok: true, sincronizado_em: new Date().toISOString(), resultado });
}

async function logSync(
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
