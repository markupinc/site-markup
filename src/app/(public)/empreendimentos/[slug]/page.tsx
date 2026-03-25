import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";
import FadeInOnScroll from "@/components/public/FadeInOnScroll";
import LeadForm from "@/components/public/LeadForm";
import GalleryTabs from "@/components/public/GalleryTabs";
import PlantasSection from "@/components/public/PlantasSection";

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

  if (!emp) return { title: "Empreendimento não encontrado" };

  return {
    title: emp.meta_title ?? `${emp.nome} | Markup Incorporações`,
    description: emp.meta_description ?? `Conheça o ${emp.nome}, um empreendimento Markup Incorporações.`,
    openGraph: {
      title: emp.meta_title ?? `${emp.nome} | Markup Incorporações`,
      description: emp.meta_description ?? `Conheça o ${emp.nome}, um empreendimento Markup Incorporações.`,
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
  if (min != null && max != null && min !== max) return `${min}–${max}${suffix}`;
  if (min != null) return `${min}${suffix}`;
  if (max != null) return `${max}${suffix}`;
  return null;
}

export default async function EmpreendimentoDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: emp } = (await supabase
    .from("empreendimentos").select("*").eq("slug", slug).eq("ativo", true).single()) as any;
  if (!emp) notFound();

  const { data: imagens } = (await supabase
    .from("empreendimento_imagens").select("*").eq("empreendimento_id", emp.id).order("ordem")) as any;
  const { data: diferenciais } = (await supabase
    .from("empreendimento_diferenciais").select("*").eq("empreendimento_id", emp.id).order("ordem")) as any;
  const { data: plantasData } = (await supabase
    .from("empreendimento_plantas").select("*").eq("empreendimento_id", emp.id).order("ordem")) as any;

  const gallery = (imagens ?? []).filter((img: any) => img.categoria !== "planta");
  const plantas = plantasData ?? [];
  const features = diferenciais ?? [];
  const location = [emp.bairro, emp.cidade, emp.estado].filter(Boolean).join(", ");

  const specs = [
    { label: "Área", value: formatRange(emp.area_min, emp.area_max, "m²") },
    { label: "Quartos", value: formatRange(emp.quartos_min, emp.quartos_max) },
    { label: "Suítes", value: formatRange(emp.suites_min, emp.suites_max) },
    { label: "Vagas", value: formatRange(emp.vagas_min, emp.vagas_max) },
    { label: "Andares", value: emp.andares != null ? String(emp.andares) : null },
    { label: "Unidades", value: emp.total_unidades != null ? String(emp.total_unidades) : null },
  ].filter((s) => s.value != null);

  const whatsappLink = `https://wa.me/5582982294001?text=${encodeURIComponent(`Olá! Tenho interesse no ${emp.nome}`)}`;

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
  };

  return (
    <main>
      <Navbar logoSrc="/assets/logo.png" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ═══ HERO — Full viewport ═══ */}
      <section style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
        <img
          src={emp.imagem_destaque_url ?? "https://placehold.co/1440x900?text=."}
          alt={emp.nome}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.7) 100%)",
        }} />
        <div style={{
          position: "absolute", bottom: "80px", left: "60px", right: "60px",
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        }}>
          <div>
            <span style={{
              display: "inline-block", padding: "6px 20px", fontSize: "10px", fontWeight: 600,
              letterSpacing: "2px", textTransform: "uppercase",
              color: "#fff", backgroundColor: "#1CB8E8", marginBottom: "20px",
            }}>
              {statusLabels[emp.status] ?? emp.status}
            </span>
            <h1 style={{
              fontFamily: "var(--font-playfair), serif", fontSize: "clamp(36px, 5vw, 64px)",
              fontWeight: 400, color: "#fff", lineHeight: 1.1, marginBottom: "12px",
            }}>
              {emp.nome}
            </h1>
            {location && (
              <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", letterSpacing: "1px" }}>
                {location}
              </p>
            )}
          </div>
          <a
            href="#interesse"
            style={{
              padding: "16px 40px", backgroundColor: "#1CB8E8", color: "#fff",
              fontSize: "12px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase",
              textDecoration: "none", transition: "background 0.3s",
              flexShrink: 0,
            }}
          >
            Tenho interesse
          </a>
        </div>
      </section>

      {/* ═══ SPECS BAR ═══ */}
      {specs.length > 0 && (
        <section style={{ backgroundColor: "#1a1a1a", padding: "48px 60px" }}>
          <div style={{
            maxWidth: "1100px", margin: "0 auto",
            display: "flex", justifyContent: "center", gap: "0",
          }}>
            {specs.map((spec, i) => (
              <div
                key={spec.label}
                style={{
                  flex: 1, textAlign: "center",
                  padding: "0 32px",
                  borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.08)" : "none",
                }}
              >
                <p style={{
                  fontFamily: "var(--font-playfair), serif",
                  fontSize: "28px", fontWeight: 400, color: "#fff", marginBottom: "4px",
                }}>
                  {spec.value}
                </p>
                <p style={{
                  fontSize: "10px", fontWeight: 500, letterSpacing: "2px",
                  textTransform: "uppercase", color: "#1CB8E8",
                }}>
                  {spec.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ ABOUT + DIFERENCIAIS (side by side) ═══ */}
      {(emp.descricao || features.length > 0) && (
        <FadeInOnScroll>
          <section style={{ backgroundColor: "#f8f8f8", padding: "100px 60px" }}>
            <div className="about-diff-grid" style={{
              maxWidth: "1200px", margin: "0 auto",
              display: "grid", gridTemplateColumns: features.length > 0 && emp.descricao ? "1fr 1fr" : "1fr",
              gap: "80px", alignItems: "start",
            }}>
              {/* Left — Sobre */}
              {emp.descricao && (
                <div>
                  <p style={{
                    fontSize: "10px", fontWeight: 600, letterSpacing: "3px",
                    textTransform: "uppercase", color: "#1CB8E8", marginBottom: "20px",
                  }}>
                    Sobre o empreendimento
                  </p>
                  <h2 style={{
                    fontFamily: "var(--font-playfair), serif", fontSize: "32px",
                    fontWeight: 400, color: "#1a1a1a", marginBottom: "28px", lineHeight: 1.3,
                  }}>
                    {emp.descricao_curta || "Conheça cada detalhe"}
                  </h2>
                  <p style={{
                    fontSize: "15px", lineHeight: 1.9, color: "#8a7d72", whiteSpace: "pre-line",
                  }}>
                    {emp.descricao}
                  </p>
                </div>
              )}

              {/* Right — Diferenciais */}
              {features.length > 0 && (
                <div>
                  <p style={{
                    fontSize: "10px", fontWeight: 600, letterSpacing: "3px",
                    textTransform: "uppercase", color: "#1CB8E8", marginBottom: "20px",
                  }}>
                    Diferenciais
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                    {features.map((dif: any) => (
                      <div key={dif.id} style={{
                        padding: "20px 0",
                        borderBottom: "1px solid rgba(26,26,26,0.1)",
                        display: "flex", alignItems: "flex-start", gap: "16px",
                      }}>
                        {dif.icone && (
                          <span style={{ fontSize: "20px", flexShrink: 0, marginTop: "2px" }}>
                            {dif.icone}
                          </span>
                        )}
                        <div>
                          <h3 style={{
                            fontSize: "14px", fontWeight: 600, color: "#1a1a1a",
                            marginBottom: dif.descricao ? "6px" : "0",
                          }}>
                            {dif.titulo}
                          </h3>
                          {dif.descricao && (
                            <p style={{ fontSize: "13px", lineHeight: 1.6, color: "#8a7d72" }}>
                              {dif.descricao}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </FadeInOnScroll>
      )}

      {/* ═══ GALLERY TABS ═══ */}
      {gallery.length > 0 && (
        <FadeInOnScroll>
          <section style={{ backgroundColor: "#1a1a1a", padding: "100px 60px" }}>
            <p style={{
              fontSize: "10px", fontWeight: 600, letterSpacing: "3px",
              textTransform: "uppercase", color: "#1CB8E8", textAlign: "center", marginBottom: "12px",
            }}>
              Galeria
            </p>
            <h2 style={{
              fontFamily: "var(--font-playfair), serif", fontSize: "32px",
              fontWeight: 400, color: "#fff", textAlign: "center", marginBottom: "48px",
            }}>
              Explore cada ambiente
            </h2>
            <GalleryTabs images={gallery} empNome={emp.nome} />
          </section>
        </FadeInOnScroll>
      )}

      {/* ═══ PLANTAS / TIPOLOGIAS ═══ */}
      {plantas.length > 0 && (
        <FadeInOnScroll>
          <section style={{ backgroundColor: "#f8f8f8", padding: "100px 60px" }}>
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
              <div style={{
                display: "flex", alignItems: "baseline", gap: "48px",
                marginBottom: "48px",
              }}>
                <h2 style={{
                  fontFamily: "var(--font-playfair), serif", fontSize: "32px",
                  fontWeight: 400, color: "#1a1a1a", flexShrink: 0,
                }}>
                  Plantas
                </h2>
                <div style={{
                  flex: 1, height: "1px", backgroundColor: "rgba(26,26,26,0.1)",
                }} />
              </div>
              <PlantasSection plantas={plantas} />
            </div>
          </section>
        </FadeInOnScroll>
      )}

      {/* ═══ VIDEO ═══ */}
      {emp.video_url && (
        <FadeInOnScroll>
          <section style={{ backgroundColor: "#1a1a1a", padding: "100px 60px" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto", aspectRatio: "16/9", overflow: "hidden" }}>
              <iframe
                src={emp.video_url}
                title={`Vídeo — ${emp.nome}`}
                style={{ width: "100%", height: "100%", border: "none" }}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </section>
        </FadeInOnScroll>
      )}

      {/* ═══ LEAD FORM ═══ */}
      <section id="interesse" style={{ backgroundColor: "#0a0a0a", padding: "100px 60px" }}>
        <FadeInOnScroll>
          <div style={{ maxWidth: "560px", margin: "0 auto" }}>
            <p style={{
              fontSize: "10px", fontWeight: 600, letterSpacing: "3px",
              textTransform: "uppercase", color: "#1CB8E8", textAlign: "center", marginBottom: "12px",
            }}>
              Exclusividade
            </p>
            <h2 style={{
              fontFamily: "var(--font-playfair), serif", fontSize: "32px",
              fontWeight: 400, color: "#fff", textAlign: "center", marginBottom: "12px",
            }}>
              Tenho interesse
            </h2>
            <p style={{
              fontSize: "14px", color: "rgba(255,255,255,0.5)", textAlign: "center",
              marginBottom: "48px", lineHeight: 1.7,
            }}>
              Fale com um consultor ou preencha o formulário abaixo.{" "}
              <a href={whatsappLink} target="_blank" rel="noopener"
                style={{ color: "#1CB8E8", textDecoration: "none", borderBottom: "1px solid #1CB8E8" }}>
                WhatsApp direto →
              </a>
            </p>
            <LeadForm empreendimentoId={emp.id} empreendimentoNome={emp.nome} />
          </div>
        </FadeInOnScroll>
      </section>

      {/* ═══ ENTREGA INFO (if available) ═══ */}
      {emp.previsao_entrega && (
        <section style={{
          backgroundColor: "#1CB8E8", padding: "40px 60px",
          display: "flex", justifyContent: "center", alignItems: "center", gap: "40px",
        }}>
          <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.8)" }}>
            Previsão de entrega
          </span>
          <span style={{ fontFamily: "var(--font-playfair), serif", fontSize: "24px", fontWeight: 400, color: "#fff" }}>
            {emp.previsao_entrega}
          </span>
        </section>
      )}

      <Footer logoSrc="/assets/logo.png" />
      <WhatsAppButton />

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          section > div[style*="repeat(3"] { grid-template-columns: 1fr !important; }
          .about-diff-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          section > div[style*="display: flex"][style*="justify-content: center"] {
            flex-direction: column !important; align-items: center !important;
          }
          section > div[style*="display: flex"][style*="justify-content: center"] > div {
            border-left: none !important; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 16px 0 !important;
          }
        }
      `}} />
    </main>
  );
}
