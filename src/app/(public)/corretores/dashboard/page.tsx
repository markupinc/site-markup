import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCorretorId } from "@/lib/auth/corretor";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
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
  pre_lancamento: "Pré-lançamento",
  lancamento: "Lançamento",
  em_obras: "Em obras",
  entregue: "Entregue",
};

export default async function CorretorDashboardPage() {
  const corretorId = await getCorretorId();
  const supabase = createAdminClient();

  const [empRes, corretorRes, tabRes] = await Promise.all([
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("tabelas_precos") as any)
      .select("slug, nome, empreendimento, entrega_prevista")
      .eq("publicada", true)
      .order("created_at", { ascending: false }),
  ]);

  const empreendimentos = (empRes.data as Empreendimento[]) || [];
  const nome = corretorRes.data?.nome || "";
  const tabelas =
    (tabRes.data as { slug: string; nome: string; empreendimento: string; entrega_prevista: string | null }[]) || [];

  return (
    <>
      <Navbar logoSrc="/assets/logo.png" />

      {/* Hero */}
      <section
        style={{
          backgroundColor: "#1a1a1a",
          padding: "160px 20px 40px",
          textAlign: "center",
        }}
      >
        <h1
          className="font-serif"
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "40px",
            color: "#ffffff",
            fontWeight: 400,
            marginBottom: "8px",
          }}
        >
          Materiais dos Empreendimentos
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
          Selecione um empreendimento para acessar folders, tabelas e materiais de divulgação.
        </p>
      </section>

      <CorretorHeader nome={nome} />

      {/* Tabelas de Preços publicadas */}
      {tabelas.length > 0 && (
        <section style={{ backgroundColor: "#ffffff", padding: "40px 20px 0" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <h2
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "24px",
                color: "#1a1a1a",
                fontWeight: 400,
                marginBottom: "6px",
              }}
            >
              Tabelas de Preços
            </h2>
            <p style={{ fontSize: "13px", color: "#8a7d72", marginBottom: "20px" }}>
              Valores e condições de pagamento atualizados. Abra para filtrar por disponibilidade ou gerar o PDF.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "14px",
              }}
            >
              {tabelas.map((t) => (
                <Link
                  key={t.slug}
                  href={`/tabela/${t.slug}`}
                  style={{
                    display: "block",
                    padding: "18px",
                    borderRadius: "12px",
                    border: "1px solid rgba(0,0,0,0.08)",
                    backgroundColor: "#fafbfc",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#00aeef",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Tabela {t.nome}
                  </span>
                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#1a1a1a",
                      margin: "6px 0 4px",
                    }}
                  >
                    {t.empreendimento}
                  </p>
                  {t.entrega_prevista && (
                    <p style={{ fontSize: "12px", color: "#8a7d72", margin: 0 }}>
                      Entrega: {t.entrega_prevista}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <main style={{ backgroundColor: "#ffffff", minHeight: "60vh" }}>
        <section
          style={{
            padding: "60px 20px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >

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
                          : emp.status === "pre_lancamento"
                          ? "#b8945f"
                          : "rgba(255,255,255,0.9)",
                      color:
                        emp.status === "lancamento" ||
                        emp.status === "pre_lancamento"
                          ? "#fff"
                          : "#1a1a1a",
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

      <Footer logoSrc="/assets/logo.png" />
    </>
  );
}
