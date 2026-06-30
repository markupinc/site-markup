import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseEspelhoCSV } from "@/lib/espelho/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Importa o CSV do Trilote para o Espelho de Vendas.
 * Auth: precisa de sessão de admin (cookie). Cada import SUBSTITUI as linhas do dia.
 * Body JSON: { csv: string, data?: "YYYY-MM-DD" }
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export async function POST(request: NextRequest) {
  const auth = await createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const csv: string | undefined = body?.csv;
  const data: string = body?.data || new Date().toISOString().slice(0, 10);
  if (!csv || typeof csv !== "string") {
    return NextResponse.json({ ok: false, error: "CSV não enviado." }, { status: 400 });
  }

  const parsed = parseEspelhoCSV(csv);
  if (parsed.erro) {
    return NextResponse.json({ ok: false, error: parsed.erro }, { status: 400 });
  }
  if (parsed.unidades.length === 0) {
    return NextResponse.json({ ok: false, error: "Nenhuma unidade encontrada no CSV." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Substitui os dados desse dia
  const del = await (admin.from("espelho_unidades") as any).delete().eq("data", data);
  if (del.error) {
    return NextResponse.json({ ok: false, error: `Erro ao limpar o dia: ${del.error.message}` }, { status: 500 });
  }

  const rows = parsed.unidades.map((u) => ({ ...u, data }));
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await (admin.from("espelho_unidades") as any).insert(rows.slice(i, i + 500));
    if (error) {
      return NextResponse.json({ ok: false, error: `Erro ao gravar: ${error.message}` }, { status: 500 });
    }
  }

  // Cadastra empreendimentos novos (preserva logo/ordem dos já existentes)
  const { data: existing } = await (admin.from("espelho_empreendimentos") as any).select("nome");
  const known = new Set((existing || []).map((e: any) => e.nome));
  const novos = parsed.empreendimentos
    .filter((n) => !known.has(n))
    .map((nome, idx) => ({ nome, ordem: (existing?.length || 0) + idx }));
  if (novos.length > 0) {
    await (admin.from("espelho_empreendimentos") as any).insert(novos);
  }

  return NextResponse.json({
    ok: true,
    data,
    total: parsed.unidades.length,
    empreendimentos: parsed.empreendimentos,
    statusDesconhecidos: parsed.statusDesconhecidos,
  });
}
