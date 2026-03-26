import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function MidiaListPage() {
  const supabase = await createClient();

  const { data: items, error } = await (supabase.from("midia") as any)
    .select("id, fonte, titulo, url, data_publicacao, thumbnail_url, ativo, ordem, created_at")
    .order("ordem", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 300, color: "#fff", marginBottom: "8px" }}>
          Midia
        </h1>
        <p style={{ fontSize: "13px", color: "#d45b5b" }}>
          Erro ao carregar noticias: {error.message}
        </p>
      </div>
    );
  }

  const noticias = (items ?? []) as Array<{
    id: string;
    fonte: string;
    titulo: string;
    url: string;
    data_publicacao: string | null;
    thumbnail_url: string | null;
    ativo: boolean;
    ordem: number | null;
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
            Midia
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            {noticias.length} noticia{noticias.length !== 1 ? "s" : ""} cadastrada
            {noticias.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/midia/novo"
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
          + Nova noticia
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
        {noticias.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
              Nenhuma noticia cadastrada.
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Thumbnail", "Fonte", "Titulo", "Data", "Ativo", "Acoes"].map((h) => (
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
              {noticias.map((item) => {
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
                      {item.thumbnail_url ? (
                        <img
                          src={item.thumbnail_url}
                          alt={item.titulo}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "50px",
                            height: "50px",
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

                    {/* Fonte */}
                    <td
                      style={{
                        padding: "10px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.5)",
                      }}
                    >
                      {item.fonte}
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
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: "11px",
                            color: "rgba(255,255,255,0.3)",
                            marginTop: "2px",
                            display: "inline-block",
                            textDecoration: "none",
                          }}
                        >
                          Link externo ↗
                        </a>
                      )}
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

                    {/* Ativo */}
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
                          backgroundColor: item.ativo
                            ? "rgba(107,159,107,0.15)"
                            : "rgba(255,255,255,0.06)",
                          color: item.ativo ? "#6b9f6b" : "rgba(255,255,255,0.4)",
                        }}
                      >
                        {item.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>

                    {/* Acoes */}
                    <td
                      style={{
                        padding: "10px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <Link
                        href={`/admin/midia/${item.id}`}
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
