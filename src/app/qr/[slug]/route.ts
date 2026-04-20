import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FALLBACK_URL = "/";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("qr_codes")
    .select("destino_url, ativo")
    .eq("slug", slug)
    .eq("ativo", true)
    .maybeSingle<{ destino_url: string; ativo: boolean }>();

  const destino = data?.destino_url?.trim() || FALLBACK_URL;
  const base = new URL(request.url).origin;
  const target = /^https?:\/\//i.test(destino)
    ? destino
    : new URL(destino, base).toString();

  return NextResponse.redirect(target, { status: 302 });
}
