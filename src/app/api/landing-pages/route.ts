import { NextRequest, NextResponse } from "next/server";
import AdmZip from "adm-zip";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { contentTypeDe } from "@/lib/landing-pages/mime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Landing pages por ZIP (Admin → Configurações).
 * POST: multipart { file: zip, slug, titulo } — extrai e sobe para o bucket
 *       'landing-pages' sob {slug}/ (substitui o conteúdo anterior do slug).
 * PATCH: { slug, ativo } — liga/desliga.
 * DELETE: ?slug= — apaga arquivos do bucket e o registro.
 * Auth: sessão de admin.
 */

const BUCKET = "landing-pages";
const MAX_ZIP = 60 * 1024 * 1024; // 60MB
const MAX_ARQUIVOS = 800;
const MAX_DESCOMPRIMIDO = 200 * 1024 * 1024; // proteção contra zip bomb

/* eslint-disable @typescript-eslint/no-explicit-any */
async function admin(): Promise<boolean> {
  const auth = await createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  return !!user;
}

const erroJson = (msg: string, status = 400) => NextResponse.json({ ok: false, error: msg }, { status });

// Lista recursivamente os paths de um prefixo do bucket
async function listarTudo(supabase: any, prefixo: string): Promise<string[]> {
  const out: string[] = [];
  const pilha = [prefixo];
  while (pilha.length > 0) {
    const dir = pilha.pop()!;
    for (let offset = 0; ; offset += 100) {
      const { data, error } = await supabase.storage.from(BUCKET).list(dir, { limit: 100, offset });
      if (error || !data || data.length === 0) break;
      for (const item of data) {
        if (item.id) out.push(`${dir}/${item.name}`);
        else pilha.push(`${dir}/${item.name}`); // pasta
      }
      if (data.length < 100) break;
    }
  }
  return out;
}

async function apagarSlug(supabase: any, slug: string) {
  const paths = await listarTudo(supabase, slug);
  for (let i = 0; i < paths.length; i += 100) {
    await supabase.storage.from(BUCKET).remove(paths.slice(i, i + 100));
  }
  return paths.length;
}

export async function POST(request: NextRequest) {
  if (!(await admin())) return erroJson("Não autorizado.", 401);

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const slug = String(form?.get("slug") || "").trim().toLowerCase();
  const titulo = String(form?.get("titulo") || "").trim();

  if (!(file instanceof File)) return erroJson("Envie o arquivo .zip.");
  if (!/^[a-z0-9][a-z0-9-]{0,59}$/.test(slug)) {
    return erroJson("Slug inválido: use letras minúsculas, números e hífens (ex.: horizon-verao).");
  }
  if (file.size > MAX_ZIP) return erroJson(`ZIP muito grande (máx. ${MAX_ZIP / 1024 / 1024}MB).`);

  let zip: AdmZip;
  try {
    zip = new AdmZip(Buffer.from(await file.arrayBuffer()));
  } catch {
    return erroJson("Não foi possível ler o ZIP — o arquivo está corrompido?");
  }

  // Entradas válidas (sem pastas, lixo de SO, dotfiles e path traversal)
  const entradas = zip.getEntries().filter((e) => {
    if (e.isDirectory) return false;
    const nome = e.entryName.replace(/\\/g, "/");
    if (nome.includes("..") || nome.startsWith("/")) return false;
    if (/(^|\/)(__MACOSX|\.DS_Store|Thumbs\.db|\.git)(\/|$)/.test(nome)) return false;
    if (/(^|\/)\./.test(nome)) return false; // arquivos/pastas ocultos
    return true;
  });
  if (entradas.length === 0) return erroJson("ZIP vazio (nenhum arquivo válido encontrado).");
  if (entradas.length > MAX_ARQUIVOS) return erroJson(`ZIP com arquivos demais (máx. ${MAX_ARQUIVOS}).`);

  // Se tudo estiver dentro de uma única pasta raiz (ex.: minha-lp/...), remove o prefixo
  const nomes = entradas.map((e) => e.entryName.replace(/\\/g, "/"));
  const primeiraPasta = nomes[0].includes("/") ? nomes[0].split("/")[0] : null;
  const raizComum = primeiraPasta && nomes.every((n) => n.startsWith(`${primeiraPasta}/`)) ? `${primeiraPasta}/` : "";

  const arquivos = entradas.map((e) => ({
    path: e.entryName.replace(/\\/g, "/").slice(raizComum.length),
    data: e.getData(),
  }));

  const totalBytes = arquivos.reduce((a, f) => a + f.data.length, 0);
  if (totalBytes > MAX_DESCOMPRIMIDO) return erroJson("Conteúdo descomprimido grande demais (máx. 200MB).");

  // Arquivo principal: index.html na raiz; senão o .html de caminho mais curto
  const htmls = arquivos.filter((f) => /\.html?$/i.test(f.path)).sort((a, b) => a.path.length - b.path.length);
  if (htmls.length === 0) return erroJson("O ZIP não contém nenhum arquivo .html.");
  const principal = htmls.find((f) => f.path.toLowerCase() === "index.html") || htmls[0];

  const supabase = createAdminClient();

  // Substitui o conteúdo anterior do slug (se houver)
  await apagarSlug(supabase, slug);

  for (const f of arquivos) {
    const { error } = await supabase.storage.from(BUCKET).upload(`${slug}/${f.path}`, f.data, {
      contentType: contentTypeDe(f.path),
      upsert: true,
    });
    if (error) return erroJson(`Erro ao subir ${f.path}: ${error.message}`, 500);
  }

  const { error: dbError } = await (supabase.from("landing_pages") as any).upsert(
    {
      slug,
      titulo: titulo || slug,
      arquivo_principal: principal.path,
      ativo: true,
      total_arquivos: arquivos.length,
      tamanho_bytes: totalBytes,
      atualizado_em: new Date().toISOString(),
    },
    { onConflict: "slug" }
  );
  if (dbError) return erroJson(`Arquivos subiram, mas falhou ao registrar: ${dbError.message}`, 500);

  return NextResponse.json({
    ok: true,
    slug,
    url: `/lp/${slug}`,
    arquivos: arquivos.length,
    principal: principal.path,
  });
}

export async function PATCH(request: NextRequest) {
  if (!(await admin())) return erroJson("Não autorizado.", 401);
  const body = await request.json().catch(() => null);
  const slug = String(body?.slug || "");
  if (!slug) return erroJson("Slug não informado.");
  const supabase = createAdminClient();
  const { error } = await (supabase.from("landing_pages") as any)
    .update({ ativo: !!body?.ativo, atualizado_em: new Date().toISOString() })
    .eq("slug", slug);
  if (error) return erroJson(error.message, 500);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!(await admin())) return erroJson("Não autorizado.", 401);
  const slug = request.nextUrl.searchParams.get("slug") || "";
  if (!slug) return erroJson("Slug não informado.");
  const supabase = createAdminClient();
  const removidos = await apagarSlug(supabase, slug);
  const { error } = await (supabase.from("landing_pages") as any).delete().eq("slug", slug);
  if (error) return erroJson(error.message, 500);
  return NextResponse.json({ ok: true, removidos });
}
