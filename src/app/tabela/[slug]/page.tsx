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
    (admin.from("tabela_unidades") as any)
      .select("apartamento, torre, tipo, area_m2, valor")
      .eq("tabela_id", tabela.id)
      .order("ordem")
      .limit(5000),
  ]);

  // Status vem do Espelho de Vendas (snapshot mais recente do empreendimento)
  const statusMap: Record<string, string> = {};
  const { data: dd } = await (admin.from("espelho_unidades") as any)
    .select("data")
    .eq("empreendimento", tabela.empreendimento)
    .order("data", { ascending: false })
    .limit(1);
  const ultima = (dd as { data: string }[] | null)?.[0]?.data;
  if (ultima) {
    const { data: st } = await (admin.from("espelho_unidades") as any)
      .select("apartamento, status")
      .eq("empreendimento", tabela.empreendimento)
      .eq("data", ultima)
      .limit(5000);
    ((st as { apartamento: string; status: string }[]) || []).forEach((s) => {
      statusMap[s.apartamento] = s.status;
    });
  }

  const unidades = ((uniRes.data as any[]) || []).map((u) => ({ ...u, status: statusMap[u.apartamento] }));

  return { tabela, componentes: compRes.data || [], unidades, statusEm: ultima || null };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = await getTabela(slug);
  if (!r) return { title: "Tabela não encontrada" };
  return {
    title: `${r.tabela.empreendimento} — Tabela de Preços ${r.tabela.nome}`,
    robots: { index: false, follow: false }, // compartilhável por link, fora do Google
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await getTabela(slug);
  if (!r) notFound();
  return <TabelaView tabela={r.tabela} componentes={r.componentes} unidades={r.unidades} statusEm={r.statusEm} />;
}
