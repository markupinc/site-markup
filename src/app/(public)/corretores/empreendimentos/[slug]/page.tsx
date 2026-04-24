import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCorretorId } from "@/lib/auth/corretor";
import CorretorHeader from "../../CorretorHeader";
import MaterialLink from "./MaterialLink";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Materiais | Área do Corretor",
};

interface Empreendimento {
  id: string;
  slug: string;
  nome: string;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  imagem_destaque_url: string | null;
}

interface Material {
  id: string;
  titulo: string;
  categoria: "folder" | "tabela" | "divulgacao" | "outros";
  drive_url: string;
  descricao: string | null;
}

const categoriaLabels: Record<string, string> = {
  folder: "Folders",
  tabela: "Tabelas",
  divulgacao: "Material de Divulgação",
  outros: "Outros",
};

const categoriaOrdem: Material["categoria"][] = [
  "folder",
  "tabela",
  "divulgacao",
  "outros",
];

export default async function CorretorEmpreendimentoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const corretorId = await getCorretorId();
  const supabase = createAdminClient();

  const [empRes, corretorRes] = await Promise.all([
    supabase
      .from("empreendimentos")
      .select("id, slug, nome, bairro, cidade, estado, imagem_destaque_url")
      .eq("slug", slug)
      .eq("ativo", true)
      .maybeSingle<Empreendimento>(),
    corretorId
      ? supabase
          .from("corretores")
          .select("nome")
          .eq("id", corretorId)
          .maybeSingle<{ nome: string }>()
      : Promise.resolve({ data: null }),
  ]);

  const emp = empRes.data;
  const nome = corretorRes.data?.nome || "";

  if (!emp) notFound();

  const { data: materiaisData } = await supabase
    .from("empreendimento_materiais")
    .select("id, titulo, categoria, drive_url, descricao")
    .eq("empreendimento_id", emp.id)
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  const materiais = (materiaisData as Material[]) || [];

  const agrupados: Record<string, Material[]> = {};
  materiais.forEach((m) => {
    agrupados[m.categoria] = agrupados[m.categoria] || [];
    agrupados[m.categoria].push(m);
  });

  return (
    <main style={{ backgroundColor: "#f5ebe1", minHeight: "100vh" }}>
      <CorretorHeader nome={nome} />

      <section
        style={{
          padding: "40px 20px 20px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <Link
          href="/corretores/dashboard"
          style={{
            fontSize: "13px",
            color: "#8a7d72",
            textDecoration: "none",
            marginBottom: "24px",
            display: "inline-block",
          }}
        >
          ← Voltar
        </Link>
        <h1
          className="font-serif"
          style={{
            fontSize: "36px",
            color: "#1a1a1a",
            fontWeight: 400,
            marginBottom: "8px",
          }}
        >
          {emp.nome}
        </h1>
        <p style={{ fontSize: "14px", color: "#8a7d72", marginBottom: "40px" }}>
          {[emp.bairro, emp.cidade, emp.estado].filter(Boolean).join(", ")}
        </p>

        {materiais.length === 0 ? (
          <p
            style={{
              fontSize: "14px",
              color: "#8a7d72",
              padding: "32px",
              textAlign: "center",
              backgroundColor: "#ffffff",
              borderRadius: "8px",
            }}
          >
            Nenhum material disponível ainda. Fale com a Markup para receber os
            materiais.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {categoriaOrdem.map((cat) => {
              const items = agrupados[cat];
              if (!items || items.length === 0) return null;
              return (
                <div key={cat}>
                  <h2
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#8a7d72",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "12px",
                    }}
                  >
                    {categoriaLabels[cat]}
                  </h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    {items.map((m) => (
                      <MaterialLink key={m.id} material={m} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
