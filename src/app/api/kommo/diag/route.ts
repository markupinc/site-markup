import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Endpoint TEMPORÁRIO de descoberta do Kommo. Protegido pelo META_SYNC_SECRET.
 * Lê os pipelines/status reais da conta + uma amostra de leads (pra achar os
 * campos de UTM). Remover após o mapeamento.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
async function kget(path: string) {
  const sub = process.env.KOMMO_SUBDOMAIN;
  const token = process.env.KOMMO_ACCESS_TOKEN;
  if (!sub || !token) throw new Error("KOMMO_SUBDOMAIN / KOMMO_ACCESS_TOKEN não configurados");
  const res = await fetch(`https://${sub}.kommo.com/api/v4/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  const json: any = res.status === 204 ? {} : await res.json();
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

  try {
    // 1) Conta (confirma conexão)
    const acc = await kget("account");
    if (!acc.ok) {
      return NextResponse.json(
        { ok: false, etapa: "account", status: acc.status, erro: acc.json?.title || acc.json },
        { status: 200 }
      );
    }

    // 2) Pipelines + status (a estrutura que vamos mapear)
    const pipes = await kget("leads/pipelines");
    const pipelines = (pipes.json?._embedded?.pipelines || []).map((p: any) => ({
      id: p.id,
      nome: p.name,
      principal: p.is_main,
      status: (p._embedded?.statuses || [])
        .sort((a: any, b: any) => a.sort - b.sort)
        .map((s: any) => ({ id: s.id, nome: s.name, tipo: s.type, cor: s.color })),
    }));

    // 3) Amostra de leads (pra ver status, responsável, valor, datas e campos de UTM)
    const leadsRes = await kget("leads?limit=10&order[updated_at]=desc&with=contacts");
    const leads = (leadsRes.json?._embedded?.leads || []).map((l: any) => ({
      id: l.id,
      nome: l.name,
      pipeline_id: l.pipeline_id,
      status_id: l.status_id,
      responsavel: l.responsible_user_id,
      valor: l.price,
      created_at: l.created_at,
      closed_at: l.closed_at,
      campos: (l.custom_fields_values || []).map(
        (f: any) => `${f.field_code || f.field_name} [${f.field_type}] = ${(f.values || []).map((v: any) => v.value).join("|")}`
      ),
    }));

    // 4) Campos de UTM/tracking detectados na amostra
    const utmFields = new Set<string>();
    for (const l of leadsRes.json?._embedded?.leads || []) {
      for (const f of l.custom_fields_values || []) {
        if (f.field_type === "tracking_data" || /utm|fbclid|gclid|referrer|source|campaign/i.test(f.field_code || f.field_name || "")) {
          utmFields.add(`${f.field_code || f.field_name} (id ${f.field_id}, type ${f.field_type})`);
        }
      }
    }

    return NextResponse.json(
      {
        ok: true,
        conta: { id: acc.json?.id, nome: acc.json?.name, subdominio: acc.json?.subdomain },
        pipelines,
        amostra_leads: leads,
        campos_utm_detectados: [...utmFields],
        total_leads_amostra: leads.length,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ ok: false, erro: err instanceof Error ? err.message : String(err) }, { status: 200 });
  }
}
