import Link from "next/link";
import FadeInOnScroll from "./FadeInOnScroll";

interface BlogPost {
  category: string;
  title: string;
  date: string;
  image: string;
  slug: string;
}

const blogPosts: BlogPost[] = [
  {
    category: "Investimentos",
    title:
      "Por que investir em studios compactos é a grande tendência do mercado imobiliário em 2025",
    date: "18 de março de 2025",
    image: "/assets/up-fachada-01-nova.jpg",
    slug: "investir-studios-compactos-2025",
  },
  {
    category: "Lifestyle",
    title:
      "Maceió como destino de moradia: qualidade de vida e valorização imobiliária na capital alagoana",
    date: "10 de março de 2025",
    image: "/assets/salsa.png",
    slug: "maceio-destino-moradia",
  },
  {
    category: "Empresa",
    title:
      "15 anos de experiência: como a Markup se consolidou no mercado de incorporações de alto padrão",
    date: "28 de fevereiro de 2025",
    image: "/assets/director.png",
    slug: "markup-15-anos-experiencia",
  },
];

export default function BlogSection() {
  return (
    <section
      id="novidades"
      style={{
        backgroundColor: "#f5ebe1",
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
          Blog Markup
        </h2>
      </FadeInOnScroll>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "32px",
        }}
      >
        {blogPosts.map((post) => (
          <FadeInOnScroll key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group block"
              style={{ textDecoration: "none" }}
            >
              <div className="overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  style={{
                    width: "100%",
                    height: "220px",
                    objectFit: "cover",
                    transition: "transform 0.6s ease",
                  }}
                  className="group-hover:scale-[1.03]"
                />
              </div>
              <div style={{ marginTop: "16px" }}>
                <p
                  style={{
                    fontSize: "10px",
                    color: "#b8945f",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    fontWeight: 500,
                    marginBottom: "8px",
                  }}
                >
                  {post.category}
                </p>
                <p
                  style={{
                    fontSize: "15px",
                    lineHeight: 1.5,
                    fontWeight: 400,
                    color: "#1a1a1a",
                    marginBottom: "8px",
                  }}
                >
                  {post.title}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#8a7d72",
                  }}
                >
                  {post.date}
                </p>
              </div>
            </Link>
          </FadeInOnScroll>
        ))}
      </div>

      {/* CTA */}
      <FadeInOnScroll>
        <div style={{ marginTop: "40px" }}>
          <Link
            href="/blog"
            style={{
              fontSize: "14px",
              color: "#1a1a1a",
              borderBottom: "1px solid #1a1a1a",
              paddingBottom: "4px",
              textDecoration: "none",
            }}
          >
            Veja mais artigos &rarr;
          </Link>
        </div>
      </FadeInOnScroll>
    </section>
  );
}
