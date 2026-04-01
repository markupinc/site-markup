import NewsletterForm from "./NewsletterForm";

interface FooterProps {
  logoSrc: string;
}

const sitemapLinks = [
  { label: "Empreendimentos", href: "#empreendimentos" },
  { label: "Sobre a Markup", href: "/sobre" },
  { label: "O Padrão Markup", href: "/padrao-markup" },
  { label: "Sustentabilidade", href: "/sustentabilidade" },
  { label: "Contato", href: "#contato" },
  { label: "Política de Privacidade", href: "/privacidade" },
  { label: "Termos de Uso", href: "/termos" },
];

const projectLinks = [
  { label: "Up! Studios", href: "/empreendimentos/up" },
  { label: "Salsa Home Resort", href: "/empreendimentos/salsa" },
];

const contactLinks = [
  {
    label: "WhatsApp",
    href: "https://wa.me/5582982294001",
    external: true,
  },
  {
    label: "E-mail",
    href: "mailto:comercial@markupinc.com.br",
    external: false,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/markupinc",
    external: true,
  },
];

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com/markupinc" },
  { label: "Instagram", href: "https://instagram.com/markupinc" },
  { label: "Youtube", href: "https://youtube.com/@markupinc" },
  { label: "WhatsApp", href: "https://wa.me/5582982294001" },
];

const linkStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "rgba(255,255,255,0.75)",
  textDecoration: "none",
  transition: "color 0.3s ease",
  display: "flex",
  alignItems: "center",
  padding: "8px 0",
  minHeight: "44px",
};

export default function Footer({ logoSrc }: FooterProps) {
  return (
    <footer
      style={{
        backgroundColor: "#1a1a1a",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "40px 20px 20px",
      }}
    >
      <style>{`
        @media (min-width: 768px) {
          footer {
            padding: 60px 60px 30px !important;
          }
        }
      `}</style>

      {/* Top grid: Logo + 3 link columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "40px",
          paddingBottom: "48px",
        }}
      >
        {/* Logo */}
        <div>
          <img
            src={logoSrc}
            alt="Markup Incorporações"
            style={{
              height: "60px",
              width: "auto",
              filter: "brightness(0) invert(1)",
            }}
          />
        </div>

        {/* Column: Mapa do site */}
        <div>
          <p
            style={{
              fontSize: "13px",
              color: "#ffffff",
              fontWeight: 500,
              marginBottom: "16px",
            }}
          >
            Mapa do site
          </p>
          {sitemapLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-white"
              style={linkStyle}
              aria-label={link.label === "Empreendimentos" ? "Ir para seção Empreendimentos" : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Column: Empreendimentos */}
        <div>
          <p
            style={{
              fontSize: "13px",
              color: "#ffffff",
              fontWeight: 500,
              marginBottom: "16px",
            }}
          >
            Empreendimentos
          </p>
          {projectLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-white"
              style={linkStyle}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Column: Contato */}
        <div>
          <p
            style={{
              fontSize: "13px",
              color: "#ffffff",
              fontWeight: 500,
              marginBottom: "16px",
            }}
          >
            Contato
          </p>
          {contactLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="hover:text-white"
              style={linkStyle}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* Middle section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "60px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: "48px",
          paddingBottom: "48px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <style>{`
          @media (min-width: 768px) {
            div[style*="grid-template-columns: 1fr"][style*="gap: 60px"] {
              grid-template-columns: 1fr 1fr !important;
            }
          }
        `}</style>
        {/* Left: Sede */}
        <div>
          <h3
            className="font-serif"
            style={{
              fontSize: "22px",
              color: "#ffffff",
              fontWeight: 400,
              marginBottom: "16px",
            }}
          >
            Sede Markup
          </h3>
          <p
            style={{
              fontSize: "12px",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.75)",
              marginBottom: "20px",
            }}
          >
            Empresarial Ocean Tower
            <br />
            Tv. Dr. Antônio Gouveia, 61 - Pajuçara
            <br />
            Maceió - AL, 57030-170, Sala 307
          </p>
          <a
            href="tel:+5582982294001"
            className="font-serif hover:text-accent-gold"
            style={{
              fontSize: "24px",
              color: "#ffffff",
              textDecoration: "none",
              transition: "color 0.3s ease",
            }}
          >
            +55 82 98229-4001
          </a>
        </div>

        {/* Right: Newsletter */}
        <div>
          <h3
            className="font-serif"
            style={{
              fontSize: "22px",
              color: "#ffffff",
              fontWeight: 400,
              marginBottom: "16px",
            }}
          >
            Inscreva-se
          </h3>
          <p
            style={{
              fontSize: "12px",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.5)",
              marginBottom: "24px",
            }}
          >
            Receba em primeira mão as novidades sobre nossos empreendimentos,
            lançamentos exclusivos e oportunidades de investimento.
          </p>

          <NewsletterForm />
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: "24px",
          gap: "16px",
          textAlign: "center",
        }}
      >
        <style>{`
          @media (min-width: 768px) {
            div[style*="flex-direction: column"][style*="gap: 16px"] {
              flex-direction: row !important;
              justify-content: space-between !important;
              align-items: center !important;
              text-align: left !important;
            }
          }
        `}</style>

        {/* Social text links */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.5)",
                textDecoration: "none",
                transition: "color 0.3s ease",
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p
          style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.4)",
            margin: 0,
          }}
        >
          &copy; Markup Incorporações 2025
        </p>
      </div>
    </footer>
  );
}
