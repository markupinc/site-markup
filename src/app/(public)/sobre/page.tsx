import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";
import FadeInOnScroll from "@/components/public/FadeInOnScroll";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre a Markup | Markup Incorporações",
  description:
    "Conheça a Markup Incorporações: 15 anos de experiência transformando o mercado imobiliário em Maceió/AL com projetos arrojados e alta rentabilidade.",
};

const LOGO_SRC = "/assets/logo.png";

const valores = [
  {
    titulo: "Excelência",
    descricao: "Somos obcecados por entregar o melhor em cada projeto",
  },
  {
    titulo: "Transparência",
    descricao: "Relacionamento claro e honesto com investidores e parceiros",
  },
  {
    titulo: "Inovação",
    descricao: "Projetos arrojados que antecipam e criam tendências do mercado",
  },
  {
    titulo: "Compromisso",
    descricao: "Prazos e qualidade são inegociáveis",
  },
];

const numeros = [
  { valor: "15", label: "Anos de experiência" },
  { valor: "200+", label: "Investidores" },
  { valor: "2", label: "Empreendimentos" },
  { valor: "200+", label: "Unidades" },
];

export default function SobrePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 640px) {
          .valores-grid { grid-template-columns: 1fr !important; }
        }
      `}} />
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
          Sobre a Markup
        </h1>
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "16px",
            color: "rgba(255,255,255,0.6)",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          Construindo o futuro do mercado imobiliário em Alagoas
        </p>
      </section>

      {/* Nossa História */}
      <section style={{ backgroundColor: "#ffffff", padding: "80px 24px" }}>
        <FadeInOnScroll>
          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
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
              Nossa História
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
                A Markup Incorporações nasceu com a missão de transformar o
                mercado imobiliário em Maceió, Alagoas. Fundada por
                profissionais apaixonados pelo desenvolvimento urbano e pela
                criação de empreendimentos que realmente fazem a diferença, a
                empresa se consolidou como referência em projetos de alto padrão
                na capital alagoana.
              </p>

              <p style={{ marginBottom: "20px" }}>
                Com mais de 15 anos de experiência no desenvolvimento
                imobiliário, construídos por meio de parcerias estratégicas com
                os principais players do setor, a Markup direciona toda a sua
                expertise para oferecer produtos arrojados, com alto padrão de
                qualidade e elevada rentabilidade para seus investidores. Cada
                empreendimento é concebido com estudo aprofundado de mercado,
                localização privilegiada e design contemporâneo.
              </p>

              <p style={{ marginBottom: "20px" }}>
                Sediada na Pajuçara, um dos bairros mais valorizados e
                tradicionais de Maceió, a Markup tem se destacado pela qualidade
                inquestionável de seus projetos e pelo compromisso inabalável
                com investidores e parceiros. Nossa sede no Empresarial Ocean
                Tower reflete o posicionamento da empresa: moderno, estratégico
                e voltado para o futuro.
              </p>

              <p>
                Acreditamos que o mercado imobiliário é mais do que construir
                edifícios — é sobre criar oportunidades de investimento sólidas,
                desenvolver espaços que elevem a qualidade de vida e contribuir
                para o crescimento sustentável de Maceió. Essa é a essência da
                Markup Incorporações.
              </p>
            </div>
          </div>
        </FadeInOnScroll>
      </section>

      {/* Nossos Valores */}
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
            Nossos Valores
          </h2>

          <div
            className="valores-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "32px",
              maxWidth: "1000px",
              margin: "0 auto",
            }}
          >
            {valores.map((valor) => (
              <div
                key={valor.titulo}
                style={{
                  textAlign: "center",
                  padding: "32px 24px",
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "22px",
                    color: "#1CB8E8",
                    fontWeight: 400,
                    marginBottom: "12px",
                  }}
                >
                  {valor.titulo}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "14px",
                    color: "#666666",
                    lineHeight: 1.6,
                  }}
                >
                  {valor.descricao}
                </p>
              </div>
            ))}
          </div>
        </FadeInOnScroll>
      </section>

      {/* Números */}
      <section
        style={{
          backgroundColor: "#1a1a1a",
          padding: "60px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "60px",
            flexWrap: "wrap",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          {numeros.map((item) => (
            <div key={item.label} style={{ textAlign: "center" }}>
              <p
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "36px",
                  color: "#ffffff",
                  fontWeight: 400,
                  marginBottom: "4px",
                }}
              >
                {item.valor}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: "0.5px",
                }}
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Localização */}
      <section style={{ backgroundColor: "#ffffff", padding: "80px 24px" }}>
        <FadeInOnScroll>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "32px",
                color: "#1a1a1a",
                fontWeight: 400,
                marginBottom: "24px",
                textAlign: "center",
              }}
            >
              Localização
            </h2>

            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "16px",
                color: "#666666",
                textAlign: "center",
                marginBottom: "32px",
                lineHeight: 1.6,
              }}
            >
              Empresarial Ocean Tower - Tv. Dr. Antônio Gouveia, 61 - Pajuçara,
              Maceió - AL, 57030-170, Sala 307
            </p>

            <div
              style={{
                width: "100%",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3933.1!2d-35.7139!3d-9.6658!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7014578fb7c0633%3A0x4a3b1e1a0bce9e3!2sEmpresarial%20Ocean%20Tower!5e0!3m2!1spt-BR!2sbr!4v1711000000000"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização da Markup Incorporações"
              />
            </div>
          </div>
        </FadeInOnScroll>
      </section>

      <Footer logoSrc={LOGO_SRC} />
      <WhatsAppButton />
    </>
  );
}
