import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";
import FadeInOnScroll from "@/components/public/FadeInOnScroll";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sustentabilidade | Markup Incorporações",
  description:
    "Conheça o compromisso da Markup Incorporações com a sustentabilidade: reaproveitamento de água, energia solar, áreas verdes e práticas responsáveis em todos os empreendimentos.",
};

const LOGO_SRC = "/assets/logo.png";

const praticas = [
  {
    icone: "\u{1F4A7}",
    titulo: "Reaproveitamento de Água",
    descricao:
      "Sistemas de captação e reuso de água pluvial em todos os empreendimentos, reduzindo o consumo e o impacto ambiental.",
  },
  {
    icone: "\u2600\uFE0F",
    titulo: "Energia Solar",
    descricao:
      "Infraestrutura preparada para energia fotovoltaica, incentivando a geração limpa e a economia na conta de energia dos moradores.",
  },
  {
    icone: "\u{1F333}",
    titulo: "Áreas Verdes Integradas",
    descricao:
      "Projetos paisagísticos que preservam e ampliam áreas verdes, promovendo qualidade de vida e equilíbrio ambiental.",
  },
  {
    icone: "\u{1F4A1}",
    titulo: "Eficiência Energética",
    descricao:
      "Design arquitetônico que maximiza ventilação e iluminação natural, reduzindo a necessidade de climatização artificial.",
  },
  {
    icone: "\u267B\uFE0F",
    titulo: "Materiais Sustentáveis",
    descricao:
      "Prioridade para materiais de baixo impacto ambiental e fornecedores comprometidos com práticas responsáveis.",
  },
  {
    icone: "\u{1F5D1}\uFE0F",
    titulo: "Gestão de Resíduos",
    descricao:
      "Controle rigoroso de resíduos durante a obra, com destinação correta e reciclagem sempre que possível.",
  },
];

export default function SustentabilidadePage() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (max-width: 640px) {
          .praticas-grid { grid-template-columns: 1fr !important; }
        }
      `,
        }}
      />
      <Navbar logoSrc={LOGO_SRC} />

      {/* Hero */}
      <section
        style={{
          backgroundColor: "#1a1a1a",
          paddingTop: "160px",
          paddingBottom: "80px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "40px",
            color: "#ffffff",
            fontWeight: 400,
            marginBottom: "16px",
          }}
        >
          Sustentabilidade
        </h1>
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "16px",
            color: "rgba(255,255,255,0.6)",
            maxWidth: "600px",
            margin: "0 auto",
            padding: "0 24px",
          }}
        >
          Construir o futuro exige responsabilidade com o presente
        </p>
      </section>

      {/* Compromisso */}
      <section style={{ backgroundColor: "#ffffff", padding: "80px 24px" }}>
        <FadeInOnScroll>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "32px",
                color: "#1a1a1a",
                fontWeight: 400,
                marginBottom: "32px",
                textAlign: "center",
              }}
            >
              Nosso Compromisso
            </h2>

            <div
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "16px",
                lineHeight: 1.8,
                color: "#444444",
              }}
            >
              <p style={{ marginBottom: "20px" }}>
                Na Markup Incorporações, sustentabilidade não é tendência — é
                princípio. Desde a concepção de cada empreendimento até a entrega
                das chaves, todas as decisões são orientadas pelo compromisso com
                o meio ambiente e com as gerações futuras. Acreditamos que
                desenvolver imóveis de alto padrão e preservar os recursos
                naturais não são objetivos opostos, mas complementares.
              </p>

              <p style={{ marginBottom: "20px" }}>
                Cada projeto da Markup integra soluções sustentáveis reais:
                sistemas de reaproveitamento de água, infraestrutura para energia
                solar, áreas verdes planejadas e design que prioriza a eficiência
                energética. Não se trata de marketing — são práticas concretas
                que fazem parte do DNA da empresa e que entregam benefícios
                tangíveis para moradores, investidores e para a cidade.
              </p>

              <p>
                Nosso compromisso é provar, a cada novo empreendimento, que o
                mercado imobiliário pode ser um agente de transformação positiva.
                Construir com responsabilidade é construir com inteligência — e é
                assim que a Markup quer ser lembrada.
              </p>
            </div>
          </div>
        </FadeInOnScroll>
      </section>

      {/* Nossas Práticas */}
      <section style={{ backgroundColor: "#f8f8f8", padding: "80px 24px" }}>
        <FadeInOnScroll>
          <h2
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "32px",
              color: "#1a1a1a",
              fontWeight: 400,
              marginBottom: "48px",
              textAlign: "center",
            }}
          >
            Nossas Práticas
          </h2>

          <div
            className="praticas-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "32px",
              maxWidth: "1000px",
              margin: "0 auto",
            }}
          >
            {praticas.map((pratica) => (
              <div
                key={pratica.titulo}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  padding: "32px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(45,143,78,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    marginBottom: "20px",
                  }}
                >
                  {pratica.icone}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "20px",
                    color: "#2D8F4E",
                    fontWeight: 400,
                    marginBottom: "12px",
                  }}
                >
                  {pratica.titulo}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "14px",
                    color: "#666666",
                    lineHeight: 1.7,
                  }}
                >
                  {pratica.descricao}
                </p>
              </div>
            ))}
          </div>
        </FadeInOnScroll>
      </section>

      {/* Visão de Futuro */}
      <section
        style={{
          backgroundColor: "#1a1a1a",
          padding: "80px 24px",
        }}
      >
        <FadeInOnScroll>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "32px",
                color: "#ffffff",
                fontWeight: 400,
                marginBottom: "32px",
                textAlign: "center",
              }}
            >
              Nosso compromisso com o amanhã
            </h2>

            <div
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "16px",
                lineHeight: 1.8,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              <p style={{ marginBottom: "20px" }}>
                A Markup Incorporações está em constante evolução. Buscamos
                continuamente novas certificações, tecnologias inovadoras e
                parcerias que impulsionem uma construção cada vez mais
                sustentável. Nosso objetivo é claro: cada novo projeto deve
                superar o anterior em responsabilidade ambiental, eficiência e
                impacto positivo para a comunidade.
              </p>

              <p
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "20px",
                  color: "#ffffff",
                  lineHeight: 1.6,
                  fontStyle: "italic",
                }}
              >
                &ldquo;Acreditamos que o mercado imobiliário tem o poder de
                transformar cidades — e essa transformação precisa ser
                sustentável.&rdquo;
              </p>
            </div>
          </div>
        </FadeInOnScroll>
      </section>

      {/* Call to Action */}
      <section
        style={{
          backgroundColor: "#1CB8E8",
          padding: "64px 24px",
          textAlign: "center",
        }}
      >
        <FadeInOnScroll>
          <h2
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "28px",
              color: "#ffffff",
              fontWeight: 400,
              marginBottom: "24px",
            }}
          >
            Conheça nossos empreendimentos sustentáveis
          </h2>
          <a
            href="/empreendimentos"
            style={{
              display: "inline-block",
              fontFamily: "var(--font-inter)",
              fontSize: "14px",
              fontWeight: 500,
              color: "#1CB8E8",
              backgroundColor: "#ffffff",
              padding: "14px 40px",
              borderRadius: "6px",
              textDecoration: "none",
              letterSpacing: "0.5px",
              transition: "opacity 0.2s",
            }}
          >
            Ver Empreendimentos
          </a>
        </FadeInOnScroll>
      </section>

      <Footer logoSrc={LOGO_SRC} />
      <WhatsAppButton />
    </>
  );
}
