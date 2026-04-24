import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CORRETOR_COOKIE, normalizeCpf } from "@/lib/auth/corretor";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const cpf = normalizeCpf(String(body.cpf || ""));

  if (!cpf) {
    return NextResponse.json({ error: "Informe o CPF." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("corretores")
    .select("id, ativo")
    .eq("cpf", cpf)
    .maybeSingle<{ id: string; ativo: boolean }>();

  if (!data) {
    return NextResponse.json(
      { error: "CPF não encontrado. Verifique o número ou cadastre-se." },
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

  const response = NextResponse.json({ ok: true });
  response.cookies.set(CORRETOR_COOKIE, data.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
