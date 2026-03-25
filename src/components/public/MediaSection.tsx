import FadeInOnScroll from "./FadeInOnScroll";

interface MediaMention {
  source: string;
  headline: string;
  url: string;
}

const mediaMentions: MediaMention[] = [
  {
    source: "S.Mag",
    headline:
      "Markup Incorporações lança Salsa Home Resort, sucesso de vendas à beira-mar de Guaxuma",
    url: "https://www.smag.al/2025/03/markup-incorporacoes-lanca-salsa-home-resort-sucesso-de-vendas-a-beira-mar-de-guaxuma/",
  },
  {
    source: "CRECI-AL",
    headline:
      "Encontro com Construtor do CRECI tem apresentação do Salsa Home Resort",
    url: "https://creci-al.gov.br/portal/encontro-com-construtor-do-creci-tem-apresentacao-do-salsa-home-resort/",
  },
];

export default function MediaSection() {
  return (
    <section
      style={{
        backgroundColor: "#ffffff",
        padding: "80px 60px",
      }}
    >
      <FadeInOnScroll>
        <h2
          className="font-serif"
          style={{
            fontSize: "30px",
            fontWeight: 400,
            color: "#1a1a1a",
            marginBottom: "48px",
          }}
        >
          Markup na mídia.
        </h2>
      </FadeInOnScroll>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
          textAlign: "center",
        }}
      >
        {mediaMentions.map((mention) => (
          <FadeInOnScroll key={mention.url}>
            <a
              href={mention.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
              style={{ textDecoration: "none" }}
            >
              <p
                style={{
                  fontSize: "11px",
                  color: "#b8945f",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontWeight: 500,
                  marginBottom: "12px",
                }}
              >
                {mention.source}
              </p>
              <p
                className="group-hover:text-accent-gold"
                style={{
                  fontSize: "14px",
                  lineHeight: 1.6,
                  color: "#1a1a1a",
                  transition: "color 0.3s ease",
                }}
              >
                {mention.headline}
              </p>
            </a>
          </FadeInOnScroll>
        ))}
      </div>

      {/* Decorative divider */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
          marginTop: "60px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "3px",
            backgroundColor: "#1a1a1a",
          }}
        />
        <div
          style={{
            width: "40px",
            height: "3px",
            backgroundColor: "#ccc",
          }}
        />
      </div>
    </section>
  );
}
