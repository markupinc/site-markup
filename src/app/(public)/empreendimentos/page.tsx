import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";
import FadeInOnScroll from "@/components/public/FadeInOnScroll";

export const metadata: Metadata = {
  title: "Empreendimentos | Markup Incorporações",
  description:
    "Conheça os empreendimentos da Markup Incorporações em Maceió. Projetos de alto padrão com alta rentabilidade para investidores.",
  openGraph: {
    title: "Empreendimentos | Markup Incorporações",
    description:
      "Conheça os empreendimentos da Markup Incorporações em Maceió. Projetos de alto padrão com alta rentabilidade para investidores.",
    type: "website",
  },
};

const statusLabels: Record<string, string> = {
  lancamento: "Lançamento",
  em_obras: "Em obras",
  entregue: "Entregue",
};

export default async function EmpreendimentosPage() {
  const supabase = await createClient();

  const { data: empreendimentos } = await supabase
    .from("empreendimentos")
    .select("*")
    .eq("ativo", true)
    .order("ordem", { ascending: true }) as any;

  const items = empreendimentos ?? [];

  return (
    <main style={{ backgroundColor: "#f5ebe1", minHeight: "100vh" }}>
      <Navbar logoSrc="/assets/logo.png" />

      {/* Hero Banner */}
      <section
        style={{
          backgroundColor: "#1a1a1a",
          padding: "160px 60px 80px",
          textAlign: "center",
        }}
      >
        <h1
          className="font-[var(--font-playfair)]"
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: "40px",
            fontWeight: 400,
            color: "#ffffff",
            marginBottom: "16px",
          }}
        >
          Empreendimentos
        </h1>
        <p
          style={{
            fontSize: "15px",
            color: "rgba(255,255,255,0.6)",
            maxWidth: "500px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Projetos pensados para quem busca alto padrão, localização
          privilegiada e retorno sólido.
        </p>
      </section>

      {/* Cards Grid */}
      <section style={{ padding: "80px 60px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "40px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {items.map((emp: any) => (
            <FadeInOnScroll key={emp.id}>
              <Link
                href={`/empreendimentos/${emp.slug}`}
                style={{ textDecoration: "none", display: "block" }}
              >
                <article
                  style={{
                    borderRadius: "8px",
                    overflow: "hidden",
                    backgroundColor: "#ffffff",
                    transition: "box-shadow 0.3s ease",
                  }}
                >
                  {/* Image */}
                  <div
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      height: "400px",
                    }}
                  >
                    <img
                      src={emp.imagem_destaque_url ?? "https://placehold.co/800x400?text=Sem+imagem"}
                      alt={emp.nome}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s ease",
                      }}
                      onMouseEnter={undefined}
                    />
                    {/* Status badge */}
                    <span
                      style={{
                        position: "absolute",
                        top: "16px",
                        left: "16px",
                        padding: "6px 14px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        color: emp.status === "lancamento" ? "#ffffff" : "#1a1a1a",
                        backgroundColor:
                          emp.status === "lancamento"
                            ? "#b8945f"
                            : emp.status === "em_obras"
                            ? "rgba(255,255,255,0.9)"
                            : "rgba(255,255,255,0.7)",
                      }}
                    >
                      {statusLabels[emp.status] ?? emp.status}
                    </span>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: "24px" }}>
                    <h2
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#1a1a1a",
                        marginBottom: "6px",
                      }}
                    >
                      {emp.nome}
                    </h2>
                    {(emp.bairro || emp.cidade) && (
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#8a7d72",
                          marginBottom: "10px",
                        }}
                      >
                        {[emp.bairro, emp.cidade, emp.estado]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                    {emp.descricao_curta && (
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#8a7d72",
                          lineHeight: 1.6,
                        }}
                      >
                        {emp.descricao_curta}
                      </p>
                    )}
                  </div>
                </article>
              </Link>
            </FadeInOnScroll>
          ))}
        </div>

        {items.length === 0 && (
          <p
            style={{
              textAlign: "center",
              color: "#8a7d72",
              fontSize: "15px",
              padding: "60px 0",
            }}
          >
            Nenhum empreendimento disponível no momento.
          </p>
        )}
      </section>

      <Footer logoSrc="/assets/logo.png" />
      <WhatsAppButton />

      {/* Inline responsive styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 768px) {
              section > div[style*="grid-template-columns"] {
                grid-template-columns: 1fr !important;
              }
            }
            article:hover img {
              transform: scale(1.03) !important;
            }
          `,
        }}
      />
    </main>
  );
}
