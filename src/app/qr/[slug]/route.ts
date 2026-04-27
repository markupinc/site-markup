import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

  // Log do acesso (não bloqueia o redirect)
  const url = new URL(request.url);
  const headers = request.headers;
  const adminClient = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (adminClient.from("qr_acessos") as any)
    .insert({
      qr_slug: slug,
      user_agent: headers.get("user-agent") || null,
      referer: headers.get("referer") || null,
      utm_source: url.searchParams.get("utm_source"),
      utm_medium: url.searchParams.get("utm_medium"),
      utm_campaign: url.searchParams.get("utm_campaign"),
      utm_content: url.searchParams.get("utm_content"),
      utm_term: url.searchParams.get("utm_term"),
    })
    .then(() => {})
    .catch(() => {});

  return NextResponse.redirect(target, { status: 302 });
}
