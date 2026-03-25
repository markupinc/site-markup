import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function BlogListPage() {
  const supabase = await createClient();

  const { data: posts, error } = await (supabase.from("blog_posts") as any)
    .select("id, titulo, slug, categoria, publicado, data_publicacao, imagem_destaque_url, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 300, color: "#fff", marginBottom: "8px" }}>
          Blog
        </h1>
        <p style={{ fontSize: "13px", color: "#d45b5b" }}>
          Erro ao carregar posts: {error.message}
        </p>
      </div>
    );
  }

  const items = (posts ?? []) as Array<{
    id: string;
    titulo: string;
    slug: string;
    categoria: string | null;
    publicado: boolean;
    data_publicacao: string | null;
    imagem_destaque_url: string | null;
    created_at: string;
  }>;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 300, color: "#fff", marginBottom: "8px" }}>
            Blog
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            {items.length} post{items.length !== 1 ? "s" : ""} cadastrado
            {items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/blog/novo"
          style={{
            padding: "10px 24px",
            backgroundColor: "#fff",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          + Novo post
        </Link>
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {items.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
              Nenhum post cadastrado.
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Imagem", "Titulo", "Categoria", "Status", "Data", "Acoes"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.3)",
                      fontWeight: 500,
                      padding: "14px 16px",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const formattedDate = item.data_publicacao
                  ? new Date(item.data_publicacao).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : item.created_at
                  ? new Date(item.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—";

                return (
                  <tr key={item.id}>
                    {/* Thumbnail */}
                    <td
                      style={{
                        padding: "10px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      {item.imagem_destaque_url ? (
                        <img
                          src={item.imagem_destaque_url}
                          alt={item.titulo}
                          style={{
                            width: "60px",
                            height: "40px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "60px",
                            height: "40px",
                            borderRadius: "6px",
                            backgroundColor: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            color: "rgba(255,255,255,0.2)",
                          }}
                        >
                          sem img
                        </div>
                      )}
                    </td>

                    {/* Titulo */}
                    <td
                      style={{
                        padding: "10px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <div style={{ fontSize: "13px", color: "#fff", fontWeight: 500 }}>
                        {item.titulo}
                      </div>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>
                        /{item.slug}
                      </div>
                    </td>

                    {/* Categoria */}
                    <td
                      style={{
                        padding: "10px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.5)",
                      }}
                    >
                      {item.categoria || "—"}
                    </td>

                    {/* Status */}
                    <td
                      style={{
                        padding: "10px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "3px 10px",
                          borderRadius: "4px",
                          backgroundColor: item.publicado
                            ? "rgba(107,159,107,0.15)"
                            : "rgba(255,255,255,0.06)",
                          color: item.publicado ? "#6b9f6b" : "rgba(255,255,255,0.4)",
                        }}
                      >
                        {item.publicado ? "Publicado" : "Rascunho"}
                      </span>
                    </td>

                    {/* Data */}
                    <td
                      style={{
                        padding: "10px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      {formattedDate}
                    </td>

                    {/* Acoes */}
                    <td
                      style={{
                        padding: "10px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <Link
                        href={`/admin/blog/${item.id}`}
                        style={{
                          fontSize: "12px",
                          color: "#b8945f",
                          textDecoration: "none",
                        }}
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
