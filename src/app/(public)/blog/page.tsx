import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";
import FadeInOnScroll from "@/components/public/FadeInOnScroll";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Markup Incorporações",
  description:
    "Fique por dentro das novidades do mercado imobiliário, dicas de investimento e atualizações dos nossos empreendimentos.",
};

// Cache blog list for 30 minutes
export const revalidate = 1800;

const POSTS_PER_PAGE = 9;
const LOGO_SRC = "/assets/logo.png";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const supabase = await createClient();

  // Fetch total count for pagination
  const { count } = await (supabase
    .from("blog_posts")
    .select("id", { count: "exact", head: true })
    .eq("publicado", true) as any);

  const totalPosts = count || 0;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  // Fetch posts for current page
  const from = (currentPage - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  const { data: posts } = await (supabase
    .from("blog_posts")
    .select("id, titulo, slug, resumo, imagem_destaque_url, categoria, data_publicacao")
    .eq("publicado", true)
    .order("data_publicacao", { ascending: false })
    .range(from, to) as any);

  const allPosts = (posts || []) as Array<{
    id: string;
    titulo: string;
    slug: string;
    resumo: string | null;
    imagem_destaque_url: string | null;
    categoria: string | null;
    data_publicacao: string | null;
  }>;

  const featuredPost = currentPage === 1 ? allPosts[0] : null;
  const gridPosts = currentPage === 1 ? allPosts.slice(1) : allPosts;

  return (
    <>
      <Navbar logoSrc={LOGO_SRC} />
      <WhatsAppButton />

      {/* Hero Banner */}
      <section
        style={{
          backgroundColor: "#1a1a1a",
          paddingTop: "140px",
          paddingBottom: "60px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: "40px",
            fontWeight: 400,
            color: "#ffffff",
            margin: "0 0 12px",
          }}
        >
          Blog
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.55)",
            maxWidth: "480px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Novidades, insights e atualizações sobre o mercado imobiliário e nossos
          empreendimentos.
        </p>
      </section>

      {/* Content */}
      <main
        style={{
          backgroundColor: "#f8f8f8",
          padding: "60px 60px 80px",
          minHeight: "60vh",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Featured Post */}
          {featuredPost && (
            <FadeInOnScroll>
              <a
                href={`/blog/${featuredPost.slug}`}
                style={{
                  display: "block",
                  textDecoration: "none",
                  marginBottom: "48px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  position: "relative",
                  backgroundColor: "#1a1a1a",
                }}
              >
                <div style={{ position: "relative", height: "400px" }}>
                  {featuredPost.imagem_destaque_url ? (
                    <Image
                      src={featuredPost.imagem_destaque_url}
                      alt={`${featuredPost.titulo} - Post em destaque`}
                      fill
                      quality={85}
                      priority
                      sizes="1200px"
                      style={{
                        objectFit: "cover",
                        opacity: 0.6,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background:
                          "linear-gradient(135deg, #1a1a1a 0%, #333 100%)",
                      }}
                    />
                  )}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "40px",
                      background:
                        "linear-gradient(transparent, rgba(0,0,0,0.8))",
                    }}
                  >
                    {featuredPost.categoria && (
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: "10px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          color: "#1CB8E8",
                          marginBottom: "12px",
                        }}
                      >
                        {featuredPost.categoria}
                      </span>
                    )}
                    <h2
                      style={{
                        fontFamily: "var(--font-playfair), serif",
                        fontSize: "28px",
                        fontWeight: 400,
                        color: "#ffffff",
                        margin: "0 0 8px",
                        lineHeight: 1.3,
                      }}
                    >
                      {featuredPost.titulo}
                    </h2>
                    {featuredPost.data_publicacao && (
                      <time
                        dateTime={featuredPost.data_publicacao}
                        style={{
                          fontSize: "12px",
                          color: "rgba(255,255,255,0.5)",
                        }}
                      >
                        {formatDate(featuredPost.data_publicacao)}
                      </time>
                    )}
                  </div>
                </div>
              </a>
            </FadeInOnScroll>
          )}

          {/* Posts Grid */}
          {gridPosts.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "32px",
              }}
            >
              {gridPosts.map((post) => (
                <FadeInOnScroll key={post.id}>
                  <a
                    href={`/blog/${post.slug}`}
                    style={{
                      display: "block",
                      textDecoration: "none",
                      borderRadius: "8px",
                      overflow: "hidden",
                      backgroundColor: "#ffffff",
                      transition: "box-shadow 0.3s ease",
                    }}
                  >
                    <div
                      style={{
                        height: "220px",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      {post.imagem_destaque_url ? (
                        <Image
                          src={post.imagem_destaque_url}
                          alt={`${post.titulo} - Imagem do artigo`}
                          fill
                          quality={80}
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          style={{
                            objectFit: "cover",
                            transition: "transform 0.4s ease",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background:
                              "linear-gradient(135deg, #e0e0e0 0%, #c0c0c0 100%)",
                          }}
                        />
                      )}
                    </div>
                    <div style={{ padding: "20px" }}>
                      {post.categoria && (
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "10px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            color: "#1CB8E8",
                            marginBottom: "8px",
                          }}
                        >
                          {post.categoria}
                        </span>
                      )}
                      <h3
                        style={{
                          fontSize: "15px",
                          fontWeight: 400,
                          color: "#1a1a1a",
                          margin: "0 0 8px",
                          lineHeight: 1.4,
                        }}
                      >
                        {post.titulo}
                      </h3>
                      {post.data_publicacao && (
                        <time
                          dateTime={post.data_publicacao}
                          style={{
                            fontSize: "11px",
                            color: "#999",
                            display: "block",
                            marginBottom: "8px",
                          }}
                        >
                          {formatDate(post.data_publicacao)}
                        </time>
                      )}
                      {post.resumo && (
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#666",
                            lineHeight: 1.5,
                            margin: 0,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {post.resumo}
                        </p>
                      )}
                    </div>
                  </a>
                </FadeInOnScroll>
              ))}
            </div>
          )}

          {/* Empty State */}
          {allPosts.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ fontSize: "16px", color: "#999" }}>
                Nenhuma publicação encontrada.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                marginTop: "48px",
              }}
              aria-label="Paginação do blog"
            >
              {currentPage > 1 && (
                <a
                  href={`/blog?page=${currentPage - 1}`}
                  aria-label="Página anterior"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "48px",
                    height: "48px",
                    padding: "0 12px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#1a1a1a",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e0e0e0",
                    textDecoration: "none",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  Anterior
                </a>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <a
                    key={page}
                    href={`/blog?page=${page}`}
                    aria-label={`Página ${page}`}
                    aria-current={page === currentPage ? "page" : undefined}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "48px",
                      height: "48px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: page === currentPage ? 600 : 400,
                      color: page === currentPage ? "#ffffff" : "#1a1a1a",
                      backgroundColor:
                        page === currentPage ? "#1CB8E8" : "#ffffff",
                      border:
                        page === currentPage
                          ? "1px solid #1CB8E8"
                          : "1px solid #e0e0e0",
                      textDecoration: "none",
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    {page}
                  </a>
                )
              )}
              {currentPage < totalPages && (
                <a
                  href={`/blog?page=${currentPage + 1}`}
                  aria-label="Próxima página"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "48px",
                    height: "48px",
                    padding: "0 12px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#1a1a1a",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e0e0e0",
                    textDecoration: "none",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  Próxima
                </a>
              )}
            </nav>
          )}
        </div>
      </main>

      <Footer logoSrc={LOGO_SRC} />

      {/* Card hover styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            a:has(> div > img):hover img {
              transform: scale(1.03) !important;
            }
          `,
        }}
      />
    </>
  );
}
