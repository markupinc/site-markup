import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchStages, fetchSalesLeads, produtoFromPipeline, KommoConfigError } from "@/lib/kommo/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sincroniza o funil de vendas do Kommo para o cache no Supabase.
 * Auth: Bearer META_SYNC_SECRET ou ?secret=. ?backfill=1 puxa todos os leads;
 * sem ele, puxa só os atualizados nos últimos 3 dias (incremental).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
async function handle(request: NextRequest) {
  const secret = process.env.META_SYNC_SECRET;
  const provided =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    request.nextUrl.searchParams.get("secret");
  if (!secret || provided !== secret) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }

  const backfill = request.nextUrl.searchParams.get("backfill") === "1";
  const supabase = createAdminClient();
  const agora = new Date().toISOString();
  const resultado: Record<string, unknown> = {};

  try {
    // 1) Estágios: mantém o bucket já editado pelo admin; aplica default só nos novos
    const { data: existing } = await (supabase.from("kommo_pipeline_stages") as any).select("status_id, bucket");
    const existingBucket = new Map<number, string>((existing || []).map((r: any) => [r.status_id, r.bucket]));
    const stages = await fetchStages();
    const stageRows = stages.map((s) => ({
      ...s,
      bucket: existingBucket.get(s.status_id) || s.bucket,
      atualizado_em: agora,
    }));
    await (supabase.from("kommo_pipeline_stages") as any).upsert(stageRows, { onConflict: "status_id" });
    const bucketMap = new Map<number, string>(stageRows.map((s) => [s.status_id, s.bucket]));
    resultado.stages = stageRows.length;

    // 2) Leads (backfill ou incremental dos últimos 3 dias)
    const updatedFrom = backfill ? undefined : Math.floor(Date.now() / 1000) - 3 * 86400;
    const leads = await fetchSalesLeads(updatedFrom);
    if (leads.length > 0) {
      const rows = leads.map((l) => ({
        ...l,
        produto: produtoFromPipeline(l.pipeline_id),
        bucket: bucketMap.get(l.status_id) || "em_atendimento",
        atualizado_em: agora,
      }));
      // upsert em lotes de 500
      for (let i = 0; i < rows.length; i += 500) {
        const { error } = await (supabase.from("kommo_leads") as any).upsert(rows.slice(i, i + 500), { onConflict: "id" });
        if (error) throw new Error(error.message);
      }
    }
    resultado.leads = leads.length;
    await log(supabase, backfill ? "backfill" : "incremental", "ok", `${stageRows.length} estágios, ${leads.length} leads`, leads.length);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    resultado.erro = msg;
    await log(supabase, "sync", "erro", msg, 0);
    const code = err instanceof KommoConfigError ? 503 : 200;
    return NextResponse.json({ ok: false, error: msg, resultado }, { status: code });
  }

  return NextResponse.json({ ok: true, sincronizado_em: agora, backfill, resultado });
}

async function log(supabase: ReturnType<typeof createAdminClient>, tipo: string, status: string, mensagem: string, linhas: number) {
  await (supabase.from("kommo_sync_log") as any).insert({ tipo, status, mensagem, linhas_afetadas: linhas }).then(() => {}).catch(() => {});
}

export async function GET(request: NextRequest) {
  return handle(request);
}
export async function POST(request: NextRequest) {
  return handle(request);
}
