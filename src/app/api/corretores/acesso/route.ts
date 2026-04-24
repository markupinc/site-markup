import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCorretorId } from "@/lib/auth/corretor";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const corretorId = await getCorretorId();
  if (!corretorId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const materialId = body?.material_id;

  if (!materialId || typeof materialId !== "string") {
    return NextResponse.json({ error: "material_id obrigatório." }, { status: 400 });
  }

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("material_acessos") as any).insert({
    corretor_id: corretorId,
    material_id: materialId,
  });

  return NextResponse.json({ ok: true });
}
