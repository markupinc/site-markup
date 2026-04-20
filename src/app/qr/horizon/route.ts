import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FALLBACK_URL = "/";

export async function GET(request: Request) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("configuracoes")
    .select("valor")
    .eq("chave", "qr_horizon_url")
    .maybeSingle<{ valor: string | null }>();

  const destino = data?.valor?.trim() || FALLBACK_URL;
  const base = new URL(request.url).origin;
  const target = /^https?:\/\//i.test(destino) ? destino : new URL(destino, base).toString();

  return NextResponse.redirect(target, { status: 302 });
}
