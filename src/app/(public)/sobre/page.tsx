import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";
import FadeInOnScroll from "@/components/public/FadeInOnScroll";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre a Markup | Markup Incorporações",
  description:
    "Conheça a Markup Incorporações: fundada em 2024 por Matheus Vilela, com 15 anos de experiência transformando o mercado imobiliário em Alagoas com projetos arrojados e alta rentabilidade.",
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
                mercado imobiliário em Alagoas. Fundada em 2024 por <strong>Matheus Vilela</strong>, é formada
                por profissionais apaixonados pelo desenvolvimento urbano e pela
                criação de empreendimentos que realmente fazem a diferença. A
                empresa se consolidou como referência em projetos de alto padrão
                em Alagoas.
              </p>

              <p style={{ marginBottom: "20px" }}>
                Com mais de 15 anos de experiência no desenvolvimento
                imobiliário através de parcerias estratégicas, a Markup
                Incorporações direciona toda a sua expertise para oferecer
                produtos arrojados, de alto padrão e com alta rentabilidade,
                transformando projetos em realidade, oferecendo conforto e
                funcionalidade para quem busca um lugar para morar ou investir.
              </p>

              <p style={{ marginBottom: "20px" }}>
                Com uma abordagem focada em soluções práticas e sustentáveis, a
                Markup adota tecnologias e materiais que garantem eficiência e
                respeito ao meio ambiente. Nosso trabalho busca sempre entregar
                resultados que atendam às expectativas de nossos clientes,
                priorizando a segurança e o bem-estar de todos os envolvidos.
              </p>

              <p style={{ marginBottom: "20px" }}>
                <strong>A Markup Incorporações se posiciona como um porto seguro para parceiros e investidores.</strong>
              </p>

              <p>
                Acreditamos que o mercado imobiliário é mais do que construir
                edifícios — é sobre criar oportunidades de investimento sólidas,
                desenvolver espaços que elevem a qualidade de vida e contribuir
                para o crescimento sustentável de Alagoas. Essa é a essência da
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
      <section style={{ width: "100%", height: "500px", padding: 0, margin: 0 }}>
        <iframe
          src="https://maps.google.com/maps?q=Empresarial+Ocean+Tower,+Pajuçara,+Maceió,+AL&t=m&z=17&output=embed"
          width="100%"
          height="100%"
          style={{ border: "none", display: "block" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Localização da Markup Incorporações"
        />
      </section>

      <Footer logoSrc={LOGO_SRC} />
      <WhatsAppButton />
    </>
  );
}
