import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";
import FadeInOnScroll from "@/components/public/FadeInOnScroll";
import LeadForm from "@/components/public/LeadForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contato | Markup Incorporações",
  description:
    "Entre em contato com a Markup Incorporações. Estamos prontos para ajudar você a encontrar o investimento ideal em Maceió/AL.",
};

const LOGO_SRC = "/assets/logo.png";

const WHATSAPP_URL =
  "https://wa.me/5582982294001?text=Ol%C3%A1!%20Gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20os%20empreendimentos%20da%20Markup.";

const MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3933.0!2d-35.7138!3d-9.6658!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7014578f5f0c4e1%3A0x0!2sEmpresarial+Ocean+Tower+-+Tv.+Dr.+Ant%C3%B4nio+Gouv%C3%AAia%2C+61+-+Paju%C3%A7ara%2C+Macei%C3%B3+-+AL!5e0!3m2!1spt-BR!2sbr!4v1700000000000";

function MapPinIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1CB8E8"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: 2 }}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1CB8E8"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: 2 }}
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1CB8E8"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: 2 }}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1CB8E8"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: 2 }}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="white"
      style={{ flexShrink: 0 }}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

export default function ContatoPage() {
  return (
    <>
      <Navbar logoSrc={LOGO_SRC} />

      <main style={{ backgroundColor: "#ffffff" }}>
        {/* Two-column section */}
        <section
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "80px 40px 60px",
          }}
        >
          <FadeInOnScroll>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "45% 55%",
                gap: 48,
                alignItems: "start",
              }}
              className="contato-grid"
            >
              {/* LEFT COLUMN — Contact info */}
              <div>
                <h1
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: 36,
                    fontWeight: 700,
                    color: "#1a1a1a",
                    marginBottom: 12,
                    lineHeight: 1.2,
                  }}
                >
                  Fale conosco
                </h1>
                <p
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 16,
                    color: "#8a7d72",
                    lineHeight: 1.6,
                    marginBottom: 40,
                  }}
                >
                  Estamos prontos para ajudar voc&ecirc; a encontrar o
                  investimento ideal.
                </p>

                {/* Contact items */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 24,
                    marginBottom: 36,
                  }}
                >
                  {/* Address */}
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <MapPinIcon />
                    <div>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#1a1a1a",
                          marginBottom: 2,
                          letterSpacing: "0.3px",
                        }}
                      >
                        Endere&ccedil;o
                      </p>
                      <p
                        style={{
                          fontSize: 14,
                          color: "#5a5a5a",
                          lineHeight: 1.5,
                        }}
                      >
                        Empresarial Ocean Tower
                        <br />
                        Tv. Dr. Ant&ocirc;nio Gouv&ecirc;ia, 61 - Paju&ccedil;ara
                        <br />
                        Macei&oacute; - AL, 57030-170
                        <br />
                        Sala 307
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <PhoneIcon />
                    <div>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#1a1a1a",
                          marginBottom: 2,
                          letterSpacing: "0.3px",
                        }}
                      >
                        Telefone
                      </p>
                      <a
                        href="tel:+5582982294001"
                        style={{
                          fontSize: 14,
                          color: "#5a5a5a",
                          textDecoration: "none",
                          transition: "color 0.2s ease",
                        }}
                        className="contato-link"
                      >
                        (82) 98229-4001
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <MailIcon />
                    <div>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#1a1a1a",
                          marginBottom: 2,
                          letterSpacing: "0.3px",
                        }}
                      >
                        E-mail
                      </p>
                      <a
                        href="mailto:comercial@markupinc.com.br"
                        style={{
                          fontSize: 14,
                          color: "#5a5a5a",
                          textDecoration: "none",
                          transition: "color 0.2s ease",
                        }}
                        className="contato-link"
                      >
                        comercial@markupinc.com.br
                      </a>
                    </div>
                  </div>

                  {/* Hours */}
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <ClockIcon />
                    <div>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#1a1a1a",
                          marginBottom: 2,
                          letterSpacing: "0.3px",
                        }}
                      >
                        Hor&aacute;rio
                      </p>
                      <p style={{ fontSize: 14, color: "#5a5a5a", lineHeight: 1.5 }}>
                        Seg a Sex, 9h &agrave;s 18h
                      </p>
                    </div>
                  </div>
                </div>

                {/* WhatsApp CTA */}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contato-whatsapp-btn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    width: "100%",
                    padding: "16px 24px",
                    backgroundColor: "#25D366",
                    color: "#ffffff",
                    fontSize: 15,
                    fontWeight: 600,
                    letterSpacing: "0.3px",
                    borderRadius: 8,
                    textDecoration: "none",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    boxShadow: "0 2px 8px rgba(37, 211, 102, 0.3)",
                    marginBottom: 32,
                  }}
                >
                  <WhatsAppIcon />
                  Falar pelo WhatsApp
                </a>

                {/* Social links */}
                <div
                  style={{
                    display: "flex",
                    gap: 24,
                    alignItems: "center",
                  }}
                >
                  <a
                    href="https://www.instagram.com/markup_inc/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contato-social-link"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#8a7d72",
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                    }}
                  >
                    <InstagramIcon />
                    Instagram
                  </a>
                  <a
                    href="https://www.facebook.com/profile.php?id=61575200364485"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contato-social-link"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#8a7d72",
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                    }}
                  >
                    <FacebookIcon />
                    Facebook
                  </a>
                  <a
                    href="https://www.youtube.com/@MarkupIncorporacoes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contato-social-link"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#8a7d72",
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                    }}
                  >
                    <YouTubeIcon />
                    YouTube
                  </a>
                </div>
              </div>

              {/* RIGHT COLUMN — Lead Form */}
              <div
                style={{
                  backgroundColor: "#1a1a1a",
                  borderRadius: 12,
                  padding: "36px 32px",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: 22,
                    fontWeight: 600,
                    color: "#ffffff",
                    marginBottom: 4,
                  }}
                >
                  Envie sua mensagem
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.5)",
                    marginBottom: 28,
                    lineHeight: 1.5,
                  }}
                >
                  Preencha o formul&aacute;rio e retornaremos em breve.
                </p>
                <LeadForm />
              </div>
            </div>
          </FadeInOnScroll>
        </section>

        {/* Google Maps */}
        <section
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 40px 80px",
          }}
        >
          <FadeInOnScroll>
            <div
              style={{
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
            >
              <iframe
                src={MAPS_EMBED_URL}
                width="100%"
                height="400"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização Markup Incorporações - Empresarial Ocean Tower, Maceió/AL"
              />
            </div>
          </FadeInOnScroll>
        </section>
      </main>

      {/* Responsive styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .contato-link:hover {
              color: #1CB8E8 !important;
            }
            .contato-whatsapp-btn:hover {
              transform: scale(1.03) !important;
              box-shadow: 0 4px 16px rgba(37, 211, 102, 0.4) !important;
            }
            .contato-social-link:hover {
              color: #1CB8E8 !important;
            }
            @media (max-width: 768px) {
              .contato-grid {
                grid-template-columns: 1fr !important;
                gap: 40px !important;
              }
            }
          `,
        }}
      />

      <Footer logoSrc={LOGO_SRC} />
      <WhatsAppButton />
    </>
  );
}
