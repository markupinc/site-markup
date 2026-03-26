import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";
import FadeInOnScroll from "@/components/public/FadeInOnScroll";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "O Padrão Markup | Markup Incorporações",
  description:
    "Conheça o padrão de excelência da Markup Incorporações. 15 anos construindo patrimônio com obsessão pelo detalhe, inteligência imobiliária e compromisso inegociável.",
};

const LOGO_SRC = "/assets/logo.png";

const pilares = [
  {
    numero: "01",
    titulo: "Obsessão pelo Detalhe",
    descricao:
      "Do acabamento ao atendimento, cada ponto de contato com a Markup é pensado para superar expectativas. Não entregamos o suficiente — entregamos o excepcional.",
  },
  {
    numero: "02",
    titulo: "Inteligência Imobiliária",
    descricao:
      "15 anos de experiência em desenvolvimento imobiliário nos ensinaram que o melhor investimento combina localização estratégica, projeto arrojado e rentabilidade comprovada.",
  },
  {
    numero: "03",
    titulo: "Compromisso Inegociável",
    descricao:
      "Prazo é prazo. Qualidade é qualidade. Não fazemos concessões no que importa. Cada promessa feita é um compromisso assumido.",
  },
];

const etapas = [
  {
    numero: "01",
    titulo: "Curadoria de Terrenos",
    descricao:
      "Selecionamos apenas localizações premium com potencial comprovado de valorização.",
  },
  {
    numero: "02",
    titulo: "Projeto Autoral",
    descricao:
      "Cada empreendimento tem identidade própria, pensado para se destacar no mercado.",
  },
  {
    numero: "03",
    titulo: "Execução Rigorosa",
    descricao:
      "Controle de qualidade em cada etapa da obra, sem atalhos.",
  },
  {
    numero: "04",
    titulo: "Entrega Impecável",
    descricao:
      "O momento da entrega é quando nosso padrão fica mais evidente.",
  },
  {
    numero: "05",
    titulo: "Relacionamento Contínuo",
    descricao:
      "Nossa responsabilidade não termina na entrega das chaves.",
  },
];

export default function PadraoMarkupPage() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media (max-width: 768px) {
            .pilares-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
            .hero-title { font-size: 36px !important; }
            .hero-subtitle { font-size: 17px !important; }
            .manifesto-quote { font-size: 24px !important; padding: 0 24px !important; }
            .section-pad { padding: 64px 24px !important; }
            .etapa-item { padding-left: 32px !important; }
            .etapa-line { left: 6px !important; }
            .etapa-dot { left: 0 !important; }
          }
        `,
        }}
      />

      <Navbar logoSrc={LOGO_SRC} />

      {/* ── Hero ── */}
      <section
        style={{
          backgroundColor: "#1a1a1a",
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "120px 24px 80px",
        }}
      >
        <div>
          <h1
            className="hero-title"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: 48,
              fontWeight: 400,
              color: "#ffffff",
              margin: 0,
              letterSpacing: "-0.5px",
              lineHeight: 1.2,
            }}
          >
            O Padrão Markup
          </h1>
          <p
            className="hero-subtitle"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 20,
              color: "rgba(255,255,255,0.55)",
              marginTop: 28,
              fontWeight: 300,
              lineHeight: 1.6,
              maxWidth: 520,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Excelência não é meta. É ponto de partida.
          </p>
        </div>
      </section>

      {/* ── O que nos define ── */}
      <section
        className="section-pad"
        style={{
          backgroundColor: "#ffffff",
          padding: "100px 24px",
        }}
      >
        <FadeInOnScroll>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 14,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "#1CB8E8",
                marginBottom: 12,
                fontWeight: 500,
              }}
            >
              O que nos define
            </p>
            <h2
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: 36,
                fontWeight: 400,
                color: "#1a1a1a",
                margin: "0 0 64px",
                lineHeight: 1.3,
              }}
            >
              Três pilares. Nenhuma concessão.
            </h2>

            <div
              className="pilares-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 56,
              }}
            >
              {pilares.map((pilar) => (
                <div
                  key={pilar.numero}
                  style={{
                    borderLeft: "2px solid #1CB8E8",
                    paddingLeft: 28,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: 14,
                      letterSpacing: 2,
                      color: "#1CB8E8",
                      fontWeight: 500,
                      display: "block",
                      marginBottom: 16,
                    }}
                  >
                    {pilar.numero}
                  </span>
                  <h3
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#1a1a1a",
                      margin: "0 0 16px",
                      lineHeight: 1.3,
                    }}
                  >
                    {pilar.titulo}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: 15,
                      lineHeight: 1.75,
                      color: "#555555",
                      margin: 0,
                    }}
                  >
                    {pilar.descricao}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeInOnScroll>
      </section>

      {/* ── Como entregamos ── */}
      <section
        className="section-pad"
        style={{
          backgroundColor: "#f8f8f8",
          padding: "100px 24px",
        }}
      >
        <FadeInOnScroll>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 14,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "#1CB8E8",
                marginBottom: 12,
                fontWeight: 500,
              }}
            >
              Como entregamos
            </p>
            <h2
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: 36,
                fontWeight: 400,
                color: "#1a1a1a",
                margin: "0 0 64px",
                lineHeight: 1.3,
              }}
            >
              Da visão à realidade
            </h2>

            <div style={{ position: "relative" }}>
              {/* Vertical connecting line */}
              <div
                className="etapa-line"
                style={{
                  position: "absolute",
                  left: 8,
                  top: 8,
                  bottom: 8,
                  width: 1,
                  backgroundColor: "#d9d9d9",
                }}
              />

              <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
                {etapas.map((etapa) => (
                  <div
                    key={etapa.numero}
                    className="etapa-item"
                    style={{
                      position: "relative",
                      paddingLeft: 48,
                    }}
                  >
                    {/* Dot on the line */}
                    <div
                      className="etapa-dot"
                      style={{
                        position: "absolute",
                        left: 2,
                        top: 6,
                        width: 13,
                        height: 13,
                        borderRadius: "50%",
                        backgroundColor: "#1CB8E8",
                        border: "3px solid #f8f8f8",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: 14,
                        letterSpacing: 2,
                        color: "#1CB8E8",
                        fontWeight: 500,
                        display: "block",
                        marginBottom: 10,
                      }}
                    >
                      {etapa.numero}
                    </span>
                    <h3
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#1a1a1a",
                        margin: "0 0 10px",
                        lineHeight: 1.3,
                      }}
                    >
                      {etapa.titulo}
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: 15,
                        lineHeight: 1.75,
                        color: "#555555",
                        margin: 0,
                      }}
                    >
                      {etapa.descricao}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeInOnScroll>
      </section>

      {/* ── Manifesto / Quote ── */}
      <section
        style={{
          backgroundColor: "#1a1a1a",
          padding: "100px 24px",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FadeInOnScroll>
          <blockquote
            className="manifesto-quote"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: 32,
              fontWeight: 400,
              color: "#ffffff",
              lineHeight: 1.55,
              maxWidth: 700,
              margin: "0 auto",
              fontStyle: "normal",
              padding: 0,
              border: "none",
            }}
          >
            &ldquo;Enquanto outros constroem prédios, nós construímos
            patrimônio. Enquanto outros prometem, nós entregamos. Esse é o
            padrão que nos define — e do qual nunca abriremos mão.&rdquo;
          </blockquote>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 14,
              color: "rgba(255,255,255,0.4)",
              marginTop: 36,
              letterSpacing: 1,
              fontWeight: 400,
            }}
          >
            — Markup Incorporações
          </p>
        </FadeInOnScroll>
      </section>

      {/* ── CTA ── */}
      <section
        className="section-pad"
        style={{
          backgroundColor: "#ffffff",
          padding: "100px 24px",
          textAlign: "center",
        }}
      >
        <FadeInOnScroll>
          <h2
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: 30,
              fontWeight: 400,
              color: "#1a1a1a",
              margin: "0 0 36px",
              lineHeight: 1.3,
            }}
          >
            Conheça o que estamos construindo
          </h2>
          <Link
            href="/empreendimentos"
            style={{
              display: "inline-block",
              fontFamily: "var(--font-inter)",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: "#ffffff",
              backgroundColor: "#1CB8E8",
              padding: "16px 44px",
              borderRadius: 0,
              textDecoration: "none",
              transition: "background-color 0.3s ease",
            }}
          >
            Conheça nossos empreendimentos
          </Link>
        </FadeInOnScroll>
      </section>

      <Footer logoSrc={LOGO_SRC} />
      <WhatsAppButton />
    </>
  );
}
