import { MapPin, Phone, Mail } from "lucide-react";
import FadeInOnScroll from "./FadeInOnScroll";

interface ContactItem {
  icon: typeof MapPin;
  label: string;
  value: string;
  href?: string;
}

const contactItems: ContactItem[] = [
  {
    icon: MapPin,
    label: "Escritório Corporativo",
    value:
      "Empresarial Ocean Tower - Tv. Dr. Antônio Gouveia, 61 - Pajuçara, Maceió - AL, 57030-170, Sala 307",
  },
  {
    icon: Phone,
    label: "Central de Relacionamento",
    value: "+55 82 98229-4001",
    href: "tel:+5582982294001",
  },
  {
    icon: Mail,
    label: "E-mail Comercial",
    value: "comercial@markupinc.com.br",
    href: "mailto:comercial@markupinc.com.br",
  },
];

export default function ContactSection() {
  return (
    <section
      id="contato"
      style={{
        backgroundColor: "#1a1a1a",
        padding: "80px 60px",
      }}
    >
      <FadeInOnScroll>
        <p
          style={{
            fontSize: "12px",
            letterSpacing: "2px",
            color: "#b8945f",
            textTransform: "uppercase",
            marginBottom: "20px",
          }}
        >
          EXCLUSIVIDADE E ATENDIMENTO PREMIUM
        </p>

        <h2
          className="font-serif"
          style={{
            fontSize: "36px",
            fontWeight: 400,
            color: "#ffffff",
            lineHeight: 1.3,
            marginBottom: "16px",
          }}
        >
          Entre em contato com a Markup Incorporações.
        </h2>

        <p
          style={{
            fontSize: "13px",
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.5)",
            maxWidth: "600px",
            marginBottom: "48px",
          }}
        >
          Nosso time de consultores está pronto para apresentar as melhores
          oportunidades de investimento imobiliário em Maceió. Atendimento
          personalizado e exclusivo.
        </p>
      </FadeInOnScroll>

      <FadeInOnScroll>
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            padding: "40px",
            maxWidth: "600px",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              color: "#b8945f",
              fontWeight: 500,
              marginBottom: "32px",
            }}
          >
            Atendimento Exclusivo
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {contactItems.map((item) => {
              const Icon = item.icon;
              const valueContent = item.href ? (
                <a
                  href={item.href}
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.7)",
                    textDecoration: "none",
                    transition: "color 0.3s ease",
                  }}
                  className="hover:text-accent-gold"
                >
                  {item.value}
                </a>
              ) : (
                <span
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {item.value}
                </span>
              );

              return (
                <div
                  key={item.label}
                  style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "9999px",
                      backgroundColor: "rgba(184,148,95,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} style={{ color: "#b8945f" }} />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.5)",
                        marginBottom: "4px",
                      }}
                    >
                      {item.label}
                    </p>
                    {valueContent}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </FadeInOnScroll>
    </section>
  );
}
