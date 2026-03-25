import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";
import FadeInOnScroll from "@/components/public/FadeInOnScroll";
import LeadForm from "@/components/public/LeadForm";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: emp } = (await supabase
    .from("empreendimentos")
    .select("nome, meta_title, meta_description, og_image_url")
    .eq("slug", slug)
    .eq("ativo", true)
    .single()) as any;

  if (!emp) {
    return { title: "Empreendimento não encontrado" };
  }

  return {
    title: emp.meta_title ?? `${emp.nome} | Markup Incorporações`,
    description:
      emp.meta_description ??
      `Conheça o ${emp.nome}, um empreendimento Markup Incorporações.`,
    openGraph: {
      title: emp.meta_title ?? `${emp.nome} | Markup Incorporações`,
      description:
        emp.meta_description ??
        `Conheça o ${emp.nome}, um empreendimento Markup Incorporações.`,
      images: emp.og_image_url ? [{ url: emp.og_image_url }] : undefined,
      type: "website",
    },
  };
}

const statusLabels: Record<string, string> = {
  lancamento: "Lançamento",
  em_obras: "Em obras",
  entregue: "Entregue",
};

function formatRange(min: number | null, max: number | null, suffix = "") {
  if (min != null && max != null && min !== max)
    return `${min} a ${max}${suffix}`;
  if (min != null) return `${min}${suffix}`;
  if (max != null) return `${max}${suffix}`;
  return null;
}

export default async function EmpreendimentoDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: emp } = (await supabase
    .from("empreendimentos")
    .select("*")
    .eq("slug", slug)
    .eq("ativo", true)
    .single()) as any;

  if (!emp) notFound();

  const { data: imagens } = (await supabase
    .from("empreendimento_imagens")
    .select("*")
    .eq("empreendimento_id", emp.id)
    .order("ordem", { ascending: true })) as any;

  const { data: diferenciais } = (await supabase
    .from("empreendimento_diferenciais")
    .select("*")
    .eq("empreendimento_id", emp.id)
    .order("ordem", { ascending: true })) as any;

  const gallery = imagens ?? [];
  const features = diferenciais ?? [];

  const location = [emp.bairro, emp.cidade, emp.estado]
    .filter(Boolean)
    .join(", ");

  const specs = [
    {
      label: "Área",
      value: formatRange(emp.area_min, emp.area_max, " m²"),
    },
    {
      label: "Quartos",
      value: formatRange(emp.quartos_min, emp.quartos_max),
    },
    {
      label: "Suítes",
      value: formatRange(emp.suites_min, emp.suites_max),
    },
    {
      label: "Vagas",
      value: formatRange(emp.vagas_min, emp.vagas_max),
    },
    {
      label: "Andares",
      value: emp.andares != null ? String(emp.andares) : null,
    },
    {
      label: "Total de unidades",
      value: emp.total_unidades != null ? String(emp.total_unidades) : null,
    },
  ].filter((s) => s.value != null);

  const whatsappLink = `https://wa.me/5582982294001?text=${encodeURIComponent(
    `Olá! Tenho interesse no ${emp.nome}`
  )}`;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: emp.nome,
    description: emp.descricao ?? emp.descricao_curta ?? "",
    image: emp.imagem_destaque_url ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: emp.endereco ?? undefined,
      addressLocality: emp.cidade ?? undefined,
      addressRegion: emp.estado ?? undefined,
      addressCountry: "BR",
    },
    ...(emp.latitude && emp.longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: emp.latitude,
            longitude: emp.longitude,
          },
        }
      : {}),
  };

  return (
    <main style={{ minHeight: "100vh" }}>
      <Navbar logoSrc="/assets/logo.png" />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section
        style={{
          position: "relative",
          height: "60vh",
          minHeight: "400px",
          overflow: "hidden",
        }}
      >
        <img
          src={
            emp.imagem_destaque_url ??
            "https://placehold.co/1440x800?text=Sem+imagem"
          }
          alt={emp.nome}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(26,26,26,0.85) 0%, rgba(26,26,26,0.3) 50%, transparent 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            left: "60px",
            right: "60px",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: "48px",
              fontWeight: 400,
              color: "#ffffff",
              marginBottom: "8px",
            }}
          >
            {emp.nome}
          </h1>
          {location && (
            <p
              style={{
                fontSize: "15px",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              {location}
            </p>
          )}
        </div>
      </section>

      {/* Info Bar */}
      <section
        style={{
          backgroundColor: "#1a1a1a",
          padding: "24px 60px",
          display: "flex",
          alignItems: "center",
          gap: "40px",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "6px 16px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            color: emp.status === "lancamento" ? "#ffffff" : "#1a1a1a",
            backgroundColor:
              emp.status === "lancamento" ? "#b8945f" : "rgba(255,255,255,0.9)",
          }}
        >
          {statusLabels[emp.status] ?? emp.status}
        </span>
        {emp.previsao_entrega && (
          <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
            Previsão de entrega:{" "}
            <strong style={{ color: "#ffffff" }}>
              {emp.previsao_entrega}
            </strong>
          </span>
        )}
        {emp.total_unidades != null && (
          <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
            Total de unidades:{" "}
            <strong style={{ color: "#ffffff" }}>{emp.total_unidades}</strong>
          </span>
        )}
      </section>

      {/* Description */}
      {emp.descricao && (
        <FadeInOnScroll>
          <section
            style={{
              backgroundColor: "#f5ebe1",
              padding: "80px 60px",
            }}
          >
            <div
              style={{
                maxWidth: "700px",
                margin: "0 auto",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-playfair), serif",
                  fontSize: "28px",
                  fontWeight: 400,
                  color: "#1a1a1a",
                  marginBottom: "24px",
                }}
              >
                Sobre o empreendimento
              </h2>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: 1.8,
                  color: "#8a7d72",
                  whiteSpace: "pre-line",
                }}
              >
                {emp.descricao}
              </p>
            </div>
          </section>
        </FadeInOnScroll>
      )}

      {/* Specs Grid */}
      {specs.length > 0 && (
        <FadeInOnScroll>
          <section
            style={{
              backgroundColor: "#1a1a1a",
              padding: "60px",
            }}
          >
            <div
              style={{
                maxWidth: "900px",
                margin: "0 auto",
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(specs.length, 4)}, 1fr)`,
                gap: "32px",
                textAlign: "center",
              }}
            >
              {specs.map((spec) => (
                <div key={spec.label}>
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      color: "#b8945f",
                      marginBottom: "8px",
                    }}
                  >
                    {spec.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-playfair), serif",
                      fontSize: "24px",
                      fontWeight: 400,
                      color: "#ffffff",
                    }}
                  >
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </FadeInOnScroll>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <FadeInOnScroll>
          <section
            style={{
              backgroundColor: "#f5ebe1",
              padding: "80px 60px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: "28px",
                fontWeight: 400,
                color: "#1a1a1a",
                textAlign: "center",
                marginBottom: "48px",
              }}
            >
              Galeria
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
                maxWidth: "1200px",
                margin: "0 auto",
              }}
            >
              {gallery.map((img: any) => (
                <div
                  key={img.id}
                  style={{
                    borderRadius: "6px",
                    overflow: "hidden",
                    aspectRatio: "4/3",
                  }}
                >
                  <img
                    src={img.url}
                    alt={img.alt_text ?? emp.nome}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
        </FadeInOnScroll>
      )}

      {/* Diferenciais */}
      {features.length > 0 && (
        <FadeInOnScroll>
          <section
            style={{
              backgroundColor: "#1a1a1a",
              padding: "80px 60px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: "28px",
                fontWeight: 400,
                color: "#ffffff",
                textAlign: "center",
                marginBottom: "48px",
              }}
            >
              Diferenciais
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "32px",
                maxWidth: "1000px",
                margin: "0 auto",
              }}
            >
              {features.map((dif: any) => (
                <div
                  key={dif.id}
                  style={{
                    padding: "32px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "rgba(255,255,255,0.03)",
                  }}
                >
                  {dif.icone && (
                    <span
                      style={{
                        fontSize: "28px",
                        display: "block",
                        marginBottom: "16px",
                      }}
                    >
                      {dif.icone}
                    </span>
                  )}
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#ffffff",
                      marginBottom: "8px",
                    }}
                  >
                    {dif.titulo}
                  </h3>
                  {dif.descricao && (
                    <p
                      style={{
                        fontSize: "13px",
                        lineHeight: 1.6,
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      {dif.descricao}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </FadeInOnScroll>
      )}

      {/* Video */}
      {emp.video_url && (
        <FadeInOnScroll>
          <section
            style={{
              backgroundColor: "#f5ebe1",
              padding: "80px 60px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: "28px",
                fontWeight: 400,
                color: "#1a1a1a",
                textAlign: "center",
                marginBottom: "48px",
              }}
            >
              Vídeo
            </h2>
            <div
              style={{
                maxWidth: "900px",
                margin: "0 auto",
                aspectRatio: "16/9",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <iframe
                src={emp.video_url}
                title={`Vídeo - ${emp.nome}`}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </section>
        </FadeInOnScroll>
      )}

      {/* CTA / Lead Form */}
      <section
        id="interesse"
        style={{
          backgroundColor: "#1a1a1a",
          padding: "80px 60px",
        }}
      >
        <FadeInOnScroll>
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h2
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: "32px",
                fontWeight: 400,
                color: "#ffffff",
                textAlign: "center",
                marginBottom: "12px",
              }}
            >
              Tenho interesse
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.6)",
                textAlign: "center",
                marginBottom: "40px",
                lineHeight: 1.6,
              }}
            >
              Preencha o formulário abaixo ou fale diretamente pelo{" "}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#b8945f", textDecoration: "underline" }}
              >
                WhatsApp
              </a>
              .
            </p>
            <LeadForm
              empreendimentoId={emp.id}
              empreendimentoNome={emp.nome}
            />
          </div>
        </FadeInOnScroll>
      </section>

      <Footer logoSrc="/assets/logo.png" />
      <WhatsAppButton />

      {/* Responsive styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 768px) {
              section div[style*="grid-template-columns: repeat(3"] {
                grid-template-columns: 1fr !important;
              }
            }
          `,
        }}
      />
    </main>
  );
}
