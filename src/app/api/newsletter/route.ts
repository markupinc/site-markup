import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const newsletterSchema = z.object({
  email: z.string().email("E-mail invalido"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = newsletterSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { success: false, error: firstIssue.message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const supabase = createAdminClient();

    // Check if email already exists
    const { data: existing } = await (supabase.from("newsletter") as any)
      .select("id, ativo")
      .eq("email", email)
      .single();

    if (existing) {
      if (existing.ativo) {
        return NextResponse.json(
          { success: false, error: "Este email ja esta inscrito na newsletter." },
          { status: 409 }
        );
      }

      // Reactivate inactive subscription
      const { error: updateError } = await (supabase.from("newsletter") as any)
        .update({ ativo: true })
        .eq("id", existing.id);

      if (updateError) {
        console.error("Newsletter reactivate error:", updateError);
        return NextResponse.json(
          { success: false, error: "Erro ao reativar inscricao." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true }, { status: 201 });
    }

    // Insert new subscription
    const { error: insertError } = await (supabase.from("newsletter") as any)
      .insert({ email, ativo: true });

    if (insertError) {
      console.error("Newsletter insert error:", insertError);
      return NextResponse.json(
        { success: false, error: "Erro ao salvar inscricao." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Newsletter API error:", err);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
