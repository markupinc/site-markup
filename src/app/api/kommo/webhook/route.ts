import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SALES_PIPELINES, produtoFromPipeline } from "@/lib/kommo/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Receptor de webhooks do Kommo. Atualiza o espelho em segundos quando um lead
 * é criado ou muda de etapa. Configurar no Kommo apontando para:
 *   https://markupincorporacoes.com.br/api/kommo/webhook?secret=<META_SYNC_SECRET>
 * O Kommo manda x-www-form-urlencoded: leads[status|add|update][i][campo]=valor.
 * Responde 2xx rápido (o Kommo exige <2s).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
const tsIso = (epoch?: string) => (epoch ? new Date(Number(epoch) * 1000).toISOString() : undefined);

export async function POST(request: NextRequest) {
  const secret = process.env.META_SYNC_SECRET;
  if (!secret || request.nextUrl.searchParams.get("secret") !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const body = await request.text();
    const params = new URLSearchParams(body);

    // agrupa leads[<evento>][<idx>][<campo>] = valor
    const grupos = new Map<string, Record<string, string>>();
    for (const [k, v] of params) {
      const m = k.match(/^leads\[(status|add|update)\]\[(\d+)\]\[(\w+)\]$/);
      if (!m) continue;
      const gkey = `${m[1]}_${m[2]}`;
      if (!grupos.has(gkey)) grupos.set(gkey, {});
      grupos.get(gkey)![m[3]] = v;
    }

    const supabase = createAdminClient();
    // mapeamento status -> bucket
    const { data: stages } = await (supabase.from("kommo_pipeline_stages") as any).select("status_id, bucket");
    const bucketMap = new Map<number, string>((stages || []).map((s: any) => [s.status_id, s.bucket]));

    const rows: any[] = [];
    for (const g of grupos.values()) {
      const pipeline_id = Number(g.pipeline_id);
      const id = Number(g.id);
      if (!id || !SALES_PIPELINES.includes(pipeline_id)) continue;
      const status_id = Number(g.status_id);
      const row: any = {
        id,
        pipeline_id,
        status_id,
        produto: produtoFromPipeline(pipeline_id),
        bucket: bucketMap.get(status_id) || "em_atendimento",
        atualizado_em: new Date().toISOString(),
      };
      if (g.name) row.nome = g.name;
      if (g.price) row.valor = Number(g.price) || 0;
      if (g.responsible_user_id) row.responsavel_id = Number(g.responsible_user_id);
      if (g.created_at) row.created_at = tsIso(g.created_at);
      rows.push(row);
    }

    if (rows.length > 0) {
      await (supabase.from("kommo_leads") as any).upsert(rows, { onConflict: "id" });
    }
    return NextResponse.json({ ok: true, processados: rows.length });
  } catch {
    // mesmo em erro, responde 200 pra o Kommo não desabilitar o webhook; o poll corrige
    return NextResponse.json({ ok: true });
  }
}
