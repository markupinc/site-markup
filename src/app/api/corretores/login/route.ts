import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CORRETOR_COOKIE,
  normalizeCpf,
  normalizeCreci,
  signCorretorToken,
} from "@/lib/auth/corretor";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const cpf = normalizeCpf(String(body.cpf || ""));
  const creci = normalizeCreci(String(body.creci || ""));

  if (!cpf || !creci) {
    return NextResponse.json(
      { error: "Informe CPF e CRECI." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("corretores")
    .select("id, nome, creci, ativo")
    .eq("cpf", cpf)
    .eq("creci", creci)
    .maybeSingle<{ id: string; nome: string; creci: string; ativo: boolean }>();

  if (!data) {
    return NextResponse.json(
      { error: "CPF ou CRECI não encontrados. Verifique os dados ou cadastre-se." },
      { status: 401 }
    );
  }

  if (!data.ativo) {
    return NextResponse.json(
      { error: "Seu cadastro está inativo. Entre em contato com a Markup." },
      { status: 403 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("corretores") as any)
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", data.id);

  const token = await signCorretorToken({
    id: data.id,
    nome: data.nome,
    creci: data.creci,
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(CORRETOR_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
