import FadeInOnScroll from "./FadeInOnScroll";

interface MidiaItem {
  fonte: string;
  titulo: string;
  url: string;
}

interface MediaSectionProps {
  midia: MidiaItem[];
}

export default function MediaSection({ midia }: MediaSectionProps) {
  if (midia.length === 0) return null;
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
        {midia.map((item) => (
          <FadeInOnScroll key={item.url}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
              style={{ textDecoration: "none" }}
              aria-label={`Ler em ${item.fonte}: ${item.titulo} (abre em nova aba)`}
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
                {item.fonte}
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
                {item.titulo}
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
