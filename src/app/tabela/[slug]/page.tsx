import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import TabelaView from "./TabelaView";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
async function getTabela(slug: string) {
  const admin = createAdminClient();
  const { data: tabela } = await (admin.from("tabelas_precos") as any)
    .select("*")
    .eq("slug", slug)
    .eq("publicada", true)
    .maybeSingle();
  if (!tabela) return null;

  const [compRes, uniRes] = await Promise.all([
    (admin.from("tabela_componentes") as any).select("*").eq("tabela_id", tabela.id).order("ordem"),
    (admin.from("espelho_unidades") as any)
      .select("apartamento, torre, tipo, area_m2, valor, status")
      .eq("empreendimento", tabela.empreendimento)
      .eq("data", tabela.data_espelho)
      .order("apartamento")
      .limit(5000),
  ]);

  return { tabela, componentes: compRes.data || [], unidades: uniRes.data || [] };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = await getTabela(slug);
  if (!r) return { title: "Tabela não encontrada" };
  return {
    title: `${r.tabela.empreendimento} — Tabela de Preços ${r.tabela.nome}`,
    robots: { index: false, follow: false }, // link compartilhável, mas fora do Google
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await getTabela(slug);
  if (!r) notFound();
  return <TabelaView tabela={r.tabela} componentes={r.componentes} unidades={r.unidades} />;
}
