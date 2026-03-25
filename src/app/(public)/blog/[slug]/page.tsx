import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";
import FadeInOnScroll from "@/components/public/FadeInOnScroll";
import type { Metadata } from "next";

const LOGO_SRC = "/logo-markup.png";
const BASE_URL = "https://markupincorporacoes.com.br";

type BlogPost = {
  id: string;
  titulo: string;
  slug: string;
  conteudo: string;
  resumo: string | null;
  imagem_destaque_url: string | null;
  categoria: string | null;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  publicado: boolean;
  data_publicacao: string | null;
  autor_id: string | null;
  created_at: string;
  updated_at: string;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function estimateReadingTime(html: string): string {
  const text = html.replace(/<[^>]*>/g, "");
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.ceil(wordCount / 200) + " min de leitura";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await (supabase
    .from("blog_posts")
    .select("titulo, meta_title, meta_description, og_image_url, imagem_destaque_url")
    .eq("slug", slug)
    .eq("publicado", true)
    .single() as any);

  if (!post) {
    return { title: "Post não encontrado | Markup Incorporações" };
  }

  const title = post.meta_title || post.titulo;
  const description = post.meta_description || undefined;
  const ogImage = post.og_image_url || post.imagem_destaque_url || undefined;

  return {
    title: `${title} | Markup Incorporações`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `${BASE_URL}/blog/${slug}`,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await (supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("publicado", true)
    .single() as any);

  if (!post) {
    notFound();
  }

  const blogPost = post as BlogPost;

  // Fetch related posts (same category, excluding current)
  let relatedPosts: Array<{
    id: string;
    titulo: string;
    slug: string;
    resumo: string | null;
    imagem_destaque_url: string | null;
    categoria: string | null;
    data_publicacao: string | null;
  }> = [];

  if (blogPost.categoria) {
    const { data: related } = await (supabase
      .from("blog_posts")
      .select("id, titulo, slug, resumo, imagem_destaque_url, categoria, data_publicacao")
      .eq("publicado", true)
      .eq("categoria", blogPost.categoria)
      .neq("id", blogPost.id)
      .order("data_publicacao", { ascending: false })
      .limit(3) as any);

    relatedPosts = related || [];
  }

  // If fewer than 3 related from same category, fill with recent posts
  if (relatedPosts.length < 3) {
    const existingIds = [blogPost.id, ...relatedPosts.map((p) => p.id)];
    const { data: morePosts } = await (supabase
      .from("blog_posts")
      .select("id, titulo, slug, resumo, imagem_destaque_url, categoria, data_publicacao")
      .eq("publicado", true)
      .not("id", "in", `(${existingIds.join(",")})`)
      .order("data_publicacao", { ascending: false })
      .limit(3 - relatedPosts.length) as any);

    relatedPosts = [...relatedPosts, ...(morePosts || [])];
  }

  const readingTime = estimateReadingTime(blogPost.conteudo);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blogPost.titulo,
    description: blogPost.meta_description || blogPost.resumo || undefined,
    image: blogPost.og_image_url || blogPost.imagem_destaque_url || undefined,
    datePublished: blogPost.data_publicacao || blogPost.created_at,
    dateModified: blogPost.updated_at,
    url: `${BASE_URL}/blog/${blogPost.slug}`,
    publisher: {
      "@type": "Organization",
      name: "Markup Incorporações",
      url: BASE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/blog/${blogPost.slug}`,
    },
  };

  return (
    <>
      <Navbar logoSrc={LOGO_SRC} />
      <WhatsAppButton />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section
        style={{
          backgroundColor: "#1a1a1a",
          paddingTop: "140px",
          paddingBottom: "48px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px" }}>
          {blogPost.categoria && (
            <span
              style={{
                display: "inline-block",
                fontSize: "10px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                color: "#1CB8E8",
                backgroundColor: "rgba(28,184,232,0.1)",
                padding: "4px 12px",
                borderRadius: "4px",
                marginBottom: "20px",
              }}
            >
              {blogPost.categoria}
            </span>
          )}
          <h1
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: "40px",
              fontWeight: 400,
              color: "#ffffff",
              margin: "0 0 16px",
              lineHeight: 1.25,
            }}
          >
            {blogPost.titulo}
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              fontSize: "13px",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            {blogPost.data_publicacao && (
              <time dateTime={blogPost.data_publicacao}>
                {formatDate(blogPost.data_publicacao)}
              </time>
            )}
            <span>·</span>
            <span>{readingTime}</span>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {blogPost.imagem_destaque_url && (
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 60px",
          }}
        >
          <img
            src={blogPost.imagem_destaque_url}
            alt={blogPost.titulo}
            style={{
              width: "100%",
              maxHeight: "500px",
              objectFit: "cover",
              borderRadius: "0 0 8px 8px",
              display: "block",
            }}
          />
        </div>
      )}

      {/* Article Body */}
      <main
        style={{
          backgroundColor: "#ffffff",
          padding: "60px 24px 80px",
        }}
      >
        <article
          className="blog-article"
          style={{
            maxWidth: "720px",
            margin: "0 auto",
          }}
          dangerouslySetInnerHTML={{ __html: blogPost.conteudo }}
        />

        {/* Article typography styles */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .blog-article h2 {
                font-family: var(--font-playfair), serif;
                font-size: 28px;
                font-weight: 500;
                color: #1a1a1a;
                margin: 40px 0 16px;
                line-height: 1.3;
              }
              .blog-article h3 {
                font-family: var(--font-playfair), serif;
                font-size: 22px;
                font-weight: 500;
                color: #1a1a1a;
                margin: 32px 0 12px;
                line-height: 1.35;
              }
              .blog-article p {
                font-size: 16px;
                line-height: 1.8;
                color: #444;
                margin: 0 0 20px;
              }
              .blog-article a {
                color: #1CB8E8;
                text-decoration: underline;
                text-underline-offset: 2px;
              }
              .blog-article a:hover {
                color: #159ac4;
              }
              .blog-article img {
                max-width: 100%;
                height: auto;
                border-radius: 6px;
                margin: 24px 0;
                display: block;
              }
              .blog-article ul,
              .blog-article ol {
                font-size: 16px;
                line-height: 1.8;
                color: #444;
                margin: 0 0 20px;
                padding-left: 24px;
              }
              .blog-article li {
                margin-bottom: 8px;
              }
              .blog-article blockquote {
                border-left: 3px solid #1CB8E8;
                padding: 12px 0 12px 20px;
                margin: 24px 0;
                font-style: italic;
                color: #555;
                font-size: 17px;
                line-height: 1.7;
              }
              .blog-article strong {
                font-weight: 600;
                color: #1a1a1a;
              }
              .blog-article hr {
                border: none;
                border-top: 1px solid #e0e0e0;
                margin: 40px 0;
              }
              .blog-article pre {
                background: #f5f5f5;
                padding: 16px;
                border-radius: 6px;
                overflow-x: auto;
                font-size: 14px;
                margin: 24px 0;
              }
              .blog-article code {
                background: #f5f5f5;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 14px;
              }
            `,
          }}
        />

        {/* Tags */}
        {blogPost.tags && blogPost.tags.length > 0 && (
          <div
            style={{
              maxWidth: "720px",
              margin: "40px auto 0",
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {blogPost.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: "inline-block",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#666",
                  backgroundColor: "#f0f0f0",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  letterSpacing: "0.3px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Back to blog */}
        <div
          style={{
            maxWidth: "720px",
            margin: "40px auto 0",
          }}
        >
          <a
            href="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#1CB8E8",
              textDecoration: "none",
              transition: "opacity 0.2s ease",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            Voltar ao blog
          </a>
        </div>
      </main>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section
          style={{
            backgroundColor: "#f8f8f8",
            padding: "60px 60px 80px",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <h2
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: "28px",
                fontWeight: 400,
                color: "#1a1a1a",
                textAlign: "center",
                marginBottom: "40px",
              }}
            >
              Posts relacionados
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "32px",
              }}
            >
              {relatedPosts.map((rp) => (
                <FadeInOnScroll key={rp.id}>
                  <a
                    href={`/blog/${rp.slug}`}
                    style={{
                      display: "block",
                      textDecoration: "none",
                      borderRadius: "8px",
                      overflow: "hidden",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <div style={{ height: "220px", overflow: "hidden" }}>
                      {rp.imagem_destaque_url ? (
                        <img
                          src={rp.imagem_destaque_url}
                          alt={rp.titulo}
                          style={{
                            width: "100%",
                            height: "100%",
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
                      {rp.categoria && (
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
                          {rp.categoria}
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
                        {rp.titulo}
                      </h3>
                      {rp.data_publicacao && (
                        <time
                          dateTime={rp.data_publicacao}
                          style={{ fontSize: "11px", color: "#999" }}
                        >
                          {formatDate(rp.data_publicacao)}
                        </time>
                      )}
                    </div>
                  </a>
                </FadeInOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

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
