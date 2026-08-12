import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchDistribPipelines, fetchDistribLeads, fetchUsersMap, KommoConfigError } from "@/lib/kommo/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sincroniza o funil de DISTRIBUIÇÃO do Kommo (leads → imobiliárias) para o cache no Supabase.
 * Auth: Bearer META_SYNC_SECRET / ?secret= (cron) OU sessão de admin (botão no painel).
 * ?backfill=1 substitui tudo; sem ele, incremental (últimos 3 dias).
 * ?discover=1 só lista os funis/estágios/tags encontrados, sem gravar.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
async function autorizado(request: NextRequest): Promise<boolean> {
  const secret = process.env.META_SYNC_SECRET;
  const provided =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    request.nextUrl.searchParams.get("secret");
  if (secret && provided === secret) return true;
  const auth = await createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  return !!user;
}

async function handle(request: NextRequest) {
  if (!(await autorizado(request))) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }

  const backfill = request.nextUrl.searchParams.get("backfill") === "1";
  const discover = request.nextUrl.searchParams.get("discover") === "1";
  const supabase = createAdminClient();
  const agora = new Date().toISOString();

  try {
    const pipelines = await fetchDistribPipelines();
    if (pipelines.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Nenhum funil com 'distribui' no nome foi encontrado no Kommo." },
        { status: 404 }
      );
    }

    // Só inspeção: mostra o que seria sincronizado
    if (discover) {
      const amostra = await fetchDistribLeads(pipelines.map((p) => p.id), Math.floor(Date.now() / 1000) - 30 * 86400);
      const tags = [...new Set(amostra.flatMap((l) => l.tags))].sort();
      return NextResponse.json({ ok: true, pipelines, leads_30d: amostra.length, tags });
    }

    const pipeNome = new Map(pipelines.map((p) => [p.id, p.nome]));
    const statusNome = new Map(pipelines.flatMap((p) => p.statuses.map((s) => [s.id, s.nome] as [number, string])));
    const users = await fetchUsersMap();

    const updatedFrom = backfill ? undefined : Math.floor(Date.now() / 1000) - 3 * 86400;
    const leads = await fetchDistribLeads(pipelines.map((p) => p.id), updatedFrom);

    if (backfill) {
      // substitui tudo (remove leads que saíram do funil / foram excluídos)
      const del = await (supabase.from("kommo_distribuicao_leads") as any).delete().gte("id", 0);
      if (del.error) throw new Error(`Erro ao limpar: ${del.error.message}`);
    }

    const rows = leads.map((l) => ({
      id: l.id,
      pipeline_id: l.pipeline_id,
      pipeline_nome: pipeNome.get(l.pipeline_id) || null,
      status_id: l.status_id,
      status_nome: statusNome.get(l.status_id) || null,
      responsavel_id: l.responsavel_id,
      responsavel_nome: l.responsavel_id ? users.get(l.responsavel_id) || null : null,
      tags: l.tags,
      nome: l.nome,
      valor: l.valor,
      created_at: l.created_at,
      updated_at: l.updated_at,
      atualizado_em: agora,
    }));
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await (supabase.from("kommo_distribuicao_leads") as any).upsert(rows.slice(i, i + 500), { onConflict: "id" });
      if (error) throw new Error(error.message);
    }

    await log(supabase, backfill ? "distribuicao_backfill" : "distribuicao", "ok", `${pipelines.length} funis, ${leads.length} leads`, leads.length);
    return NextResponse.json({
      ok: true,
      sincronizado_em: agora,
      backfill,
      funis: pipelines.map((p) => p.nome),
      leads: leads.length,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await log(supabase, "distribuicao", "erro", msg, 0);
    const code = err instanceof KommoConfigError ? 503 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status: code });
  }
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
