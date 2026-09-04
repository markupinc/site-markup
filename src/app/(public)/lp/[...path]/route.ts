import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { contentTypeDe, ehHtml } from "@/lib/landing-pages/mime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Serve as landing pages estáticas subidas por ZIP: /lp/{slug}[/arquivo...].
 * Proxy do bucket 'landing-pages' ({slug}/{arquivo}), então os caminhos
 * relativos do HTML (css/, images/, ...) funcionam naturalmente.
 * /lp sem slug continua sendo a LP de campanha (page.tsx acima).
 */

const BUCKET = "landing-pages";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function GET(_request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const [slug, ...resto] = path.map((p) => decodeURIComponent(p));
  if (!slug || path.some((p) => p.includes(".."))) {
    return new NextResponse("Não encontrado", { status: 404 });
  }

  const supabase = createAdminClient();
  const { data: lp } = await (supabase.from("landing_pages") as any)
    .select("slug, arquivo_principal, ativo")
    .eq("slug", slug)
    .maybeSingle();
  if (!lp || !lp.ativo) return new NextResponse("Não encontrado", { status: 404 });

  const pedido = resto.join("/");
  // raiz do slug → arquivo principal; senão o arquivo pedido,
  // com fallbacks p/ links sem extensão (obrigado → obrigado.html | obrigado/index.html)
  const candidatos = pedido
    ? [pedido, ...(pedido.includes(".") ? [] : [`${pedido}.html`, `${pedido}/index.html`])]
    : [lp.arquivo_principal as string];

  for (const arquivo of candidatos) {
    const { data, error } = await supabase.storage.from(BUCKET).download(`${slug}/${arquivo}`);
    if (error || !data) continue;
    let buf = Buffer.from(await data.arrayBuffer());
    // A página é servida em /lp/{slug} (sem barra final), então caminhos relativos
    // como "img/foto.webp" resolveriam para /lp/img/... — o <base> corrige a raiz.
    if (ehHtml(arquivo)) {
      let html = buf.toString("utf-8");
      if (!/<base[\s>]/i.test(html)) {
        const dir = arquivo.includes("/") ? arquivo.slice(0, arquivo.lastIndexOf("/") + 1) : "";
        const baseTag = `<base href="/lp/${slug}/${dir}">`;
        html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => `${m}${baseTag}`) : `${baseTag}${html}`;
        buf = Buffer.from(html, "utf-8");
      }
    }
    return new NextResponse(buf as any, {
      status: 200,
      headers: {
        "Content-Type": contentTypeDe(arquivo),
        // HTML curto (troca de versão aparece rápido); assets mais longos
        "Cache-Control": ehHtml(arquivo) ? "public, max-age=60" : "public, max-age=3600",
        "X-Robots-Tag": "noindex", // páginas de campanha não entram no Google
      },
    });
  }
  return new NextResponse("Não encontrado", { status: 404 });
}
