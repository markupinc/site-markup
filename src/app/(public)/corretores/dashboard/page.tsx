import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCorretorId } from "@/lib/auth/corretor";
import CorretorHeader from "../CorretorHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | Área do Corretor",
  description: "Materiais dos empreendimentos Markup.",
};

interface Empreendimento {
  id: string;
  slug: string;
  nome: string;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  status: string;
  imagem_destaque_url: string | null;
}

const statusLabels: Record<string, string> = {
  lancamento: "Lançamento",
  em_obras: "Em obras",
  entregue: "Entregue",
};

export default async function CorretorDashboardPage() {
  const corretorId = await getCorretorId();
  const supabase = createAdminClient();

  const [empRes, corretorRes] = await Promise.all([
    supabase
      .from("empreendimentos")
      .select("id, slug, nome, bairro, cidade, estado, status, imagem_destaque_url")
      .eq("ativo", true)
      .order("ordem", { ascending: true }),
    corretorId
      ? supabase
          .from("corretores")
          .select("nome")
          .eq("id", corretorId)
          .maybeSingle<{ nome: string }>()
      : Promise.resolve({ data: null }),
  ]);

  const empreendimentos = (empRes.data as Empreendimento[]) || [];
  const nome = corretorRes.data?.nome || "";

  return (
    <main style={{ backgroundColor: "#f5ebe1", minHeight: "100vh" }}>
      <CorretorHeader nome={nome} />

      <section
        style={{
          padding: "60px 20px 40px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1
          className="font-serif"
          style={{
            fontSize: "36px",
            color: "#1a1a1a",
            fontWeight: 400,
            marginBottom: "8px",
          }}
        >
          Materiais dos empreendimentos
        </h1>
        <p style={{ fontSize: "14px", color: "#8a7d72", marginBottom: "40px" }}>
          Selecione um empreendimento para acessar folders, tabelas e materiais
          de divulgação.
        </p>

        {empreendimentos.length === 0 ? (
          <p style={{ fontSize: "14px", color: "#8a7d72" }}>
            Nenhum empreendimento disponível no momento.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {empreendimentos.map((emp) => (
              <Link
                key={emp.id}
                href={`/corretores/empreendimentos/${emp.slug}`}
                style={{
                  textDecoration: "none",
                  display: "block",
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    height: "200px",
                    backgroundColor: "#e8dfd4",
                  }}
                >
                  {emp.imagem_destaque_url && (
                    <img
                      src={emp.imagem_destaque_url}
                      alt={emp.nome}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <span
                    style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      backgroundColor:
                        emp.status === "lancamento"
                          ? "#2563eb"
                          : "rgba(255,255,255,0.9)",
                      color: emp.status === "lancamento" ? "#fff" : "#1a1a1a",
                    }}
                  >
                    {statusLabels[emp.status] ?? emp.status}
                  </span>
                </div>
                <div style={{ padding: "20px" }}>
                  <h2
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#1a1a1a",
                      marginBottom: "4px",
                    }}
                  >
                    {emp.nome}
                  </h2>
                  <p style={{ fontSize: "13px", color: "#8a7d72" }}>
                    {[emp.bairro, emp.cidade, emp.estado]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
