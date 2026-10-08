import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createEventLead } from "@/lib/kommo/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cadastro de leads em eventos — recebe o formulário estático de /cadastro (public/cadastro),
 * usado pelos promotores. Substitui o enviar.php do pacote da agência: cria Lead + Contato
 * no Kommo e guarda uma cópia em Admin → Leads (origem "evento"), no lugar do dados/leads.csv.
 *
 * Resposta { ok, kommo }. ok=false faz o aparelho manter o cadastro na fila e reenviar depois,
 * então só devolvemos erro quando o cadastro não ficou guardado em lugar nenhum.
 */

const clean = (v: unknown, max = 120) =>
  String(v ?? "")
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, max);

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function POST(request: NextRequest) {
  const input = await request.json().catch(() => null);
  if (!input || typeof input !== "object") {
    return NextResponse.json({ ok: false, erro: "Requisição inválida" }, { status: 400 });
  }

  // Anti-spam: campo invisível que só robôs preenchem
  if (input.website) return NextResponse.json({ ok: true });

  const nome = clean(input.nome);
  const profissao = clean(input.profissao);
  const promotor = clean(input.promotor, 60);
  const emailRaw = String(input.email ?? "").trim();
  const email = emailRaw.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw) ? emailRaw : "";
  const digitos = String(input.telefone ?? "").replace(/\D/g, "");
  let idade = parseInt(String(input.idade ?? ""), 10) || 0;
  if (idade < 14 || idade > 99) idade = 0;

  const erros: string[] = [];
  if (nome.length < 2) erros.push("nome");
  if (digitos.length < 10 || digitos.length > 15) erros.push("telefone");
  if (profissao.length < 2) erros.push("profissao");
  if (erros.length > 0) {
    return NextResponse.json({ ok: false, erro: `Campos obrigatórios: ${erros.join(", ")}` }, { status: 422 });
  }
  const telefone = `+55${digitos.replace(/^0+/, "")}`;

  // 1) Kommo
  let kommoOk = true;
  let kommoErro = "";
  try {
    await createEventLead({ nome, telefone, email, profissao, idade, promotor });
  } catch (err) {
    kommoOk = false;
    kommoErro = err instanceof Error ? err.message : String(err);
    console.error("Cadastro de evento → Kommo falhou:", kommoErro);
  }

  // 2) Cópia em Admin → Leads (fica registrada mesmo se o Kommo falhar)
  let copiaOk = false;
  try {
    const supabase = createAdminClient();
    const { data: created, error } = await (supabase.from("leads") as any)
      .insert({ nome, telefone, email: email || null, origem: "evento", pagina_origem: "/cadastro" })
      .select("id")
      .single();
    if (error || !created) throw new Error(error?.message || "insert sem retorno");
    copiaOk = true;

    const respostas: Record<string, string> = { Profissão: profissao };
    if (idade) respostas.Idade = String(idade);
    if (promotor) respostas.Promotor = promotor;
    respostas.Kommo = kommoOk ? "enviado" : `FALHA — ${kommoErro}`.slice(0, 400);
    await (supabase.from("formulario_respostas") as any).insert({ lead_id: created.id, respostas });
  } catch (err) {
    console.error("Cadastro de evento → cópia em leads falhou:", err instanceof Error ? err.message : err);
  }

  if (!kommoOk && !copiaOk) {
    return NextResponse.json({ ok: false, erro: "Não foi possível registrar o cadastro." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, kommo: kommoOk });
}
