import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const leadSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  telefone: z.string().min(10, "Telefone é obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  mensagem: z.string().optional(),
  empreendimento_id: z.string().uuid("ID inválido").optional(),
  origem: z.string().optional(),
  pagina_origem: z.string().optional(),
  referrer: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_content: z.string().optional(),
  utm_term: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { success: false, error: firstIssue.message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const supabase = createAdminClient();

    const insertData: Record<string, unknown> = {
      nome: data.nome,
      telefone: data.telefone,
    };

    if (data.email && data.email !== "") insertData.email = data.email;
    if (data.mensagem) insertData.mensagem = data.mensagem;
    if (data.empreendimento_id)
      insertData.empreendimento_id = data.empreendimento_id;
    if (data.origem) insertData.origem = data.origem;
    if (data.pagina_origem) insertData.pagina_origem = data.pagina_origem;
    if (data.referrer) insertData.referrer = data.referrer;
    if (data.utm_source) insertData.utm_source = data.utm_source;
    if (data.utm_medium) insertData.utm_medium = data.utm_medium;
    if (data.utm_campaign) insertData.utm_campaign = data.utm_campaign;
    if (data.utm_content) insertData.utm_content = data.utm_content;
    if (data.utm_term) insertData.utm_term = data.utm_term;

    const { error } = await supabase
      .from("leads")
      .insert(insertData as any);

    if (error) {
      console.error("Lead insert error:", error);
      return NextResponse.json(
        { success: false, error: "Erro ao salvar lead." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Lead API error:", err);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
