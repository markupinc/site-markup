import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CORRETOR_COOKIE,
  isValidCpf,
  normalizeCpf,
  normalizeCreci,
} from "@/lib/auth/corretor";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const nome = String(body.nome || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const telefone = String(body.telefone || "").trim();
  const cpf = normalizeCpf(String(body.cpf || ""));
  const creci = normalizeCreci(String(body.creci || ""));
  const aceite = Boolean(body.aceite_termos);

  if (!nome || nome.length < 3) {
    return NextResponse.json({ error: "Informe um nome válido." }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
  }
  if (!telefone || telefone.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ error: "Informe um telefone válido." }, { status: 400 });
  }
  if (!isValidCpf(cpf)) {
    return NextResponse.json({ error: "CPF inválido." }, { status: 400 });
  }
  if (!creci || creci.length < 3) {
    return NextResponse.json({ error: "Informe um CRECI válido." }, { status: 400 });
  }
  if (!aceite) {
    return NextResponse.json(
      { error: "É necessário aceitar os termos de uso e política de privacidade." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const insertData = {
    nome,
    email,
    telefone,
    cpf,
    creci,
    aceite_termos: true,
    aceite_termos_em: new Date().toISOString(),
    last_login_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("corretores")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(insertData as any)
    .select("id")
    .single<{ id: string }>();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Já existe um corretor cadastrado com esse CPF ou CRECI." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

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
