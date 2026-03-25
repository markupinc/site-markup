import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ToggleAtivoButton from "./ToggleAtivoButton";

const statusConfig: Record<string, { label: string; color: string }> = {
  lancamento: { label: "Lancamento", color: "#b8945f" },
  em_obras: { label: "Em Obras", color: "#5b8fd4" },
  entregue: { label: "Entregue", color: "#6b9f6b" },
};

export default async function EmpreendimentosPage() {
  const supabase = await createClient();

  const { data: empreendimentos, error } = await (supabase.from("empreendimentos") as any)
    .select("id, nome, slug, status, destaque, ativo, imagem_destaque_url, ordem, created_at")
    .order("ordem", { ascending: true });

  if (error) {
    return (
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 300, color: "#fff", marginBottom: "8px" }}>
          Empreendimentos
        </h1>
        <p style={{ fontSize: "13px", color: "#d45b5b" }}>
          Erro ao carregar empreendimentos: {error.message}
        </p>
      </div>
    );
  }

  const items = (empreendimentos ?? []) as Array<{
    id: string;
    nome: string;
    slug: string;
    status: string;
    destaque: boolean;
    ativo: boolean;
    imagem_destaque_url: string | null;
    ordem: number;
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
            Empreendimentos
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            {items.length} empreendimento{items.length !== 1 ? "s" : ""} cadastrado
            {items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/empreendimentos/novo"
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
          + Novo empreendimento
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
              Nenhum empreendimento cadastrado.
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Imagem", "Nome", "Status", "Destaque", "Ativo", "Acoes"].map((h) => (
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
                const status = statusConfig[item.status] || {
                  label: item.status,
                  color: "#999",
                };
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
                          alt={item.nome}
                          style={{
                            width: "56px",
                            height: "40px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "56px",
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

                    {/* Nome */}
                    <td
                      style={{
                        padding: "10px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <div style={{ fontSize: "13px", color: "#fff", fontWeight: 500 }}>
                        {item.nome}
                      </div>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>
                        /{item.slug}
                      </div>
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
                          backgroundColor: `${status.color}22`,
                          color: status.color,
                        }}
                      >
                        {status.label}
                      </span>
                    </td>

                    {/* Destaque */}
                    <td
                      style={{
                        padding: "10px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        fontSize: "13px",
                        color: item.destaque ? "#b8945f" : "rgba(255,255,255,0.2)",
                      }}
                    >
                      {item.destaque ? "Sim" : "Nao"}
                    </td>

                    {/* Ativo toggle */}
                    <td
                      style={{
                        padding: "10px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <ToggleAtivoButton id={item.id} ativo={item.ativo} />
                    </td>

                    {/* Actions */}
                    <td
                      style={{
                        padding: "10px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <Link
                        href={`/admin/empreendimentos/${item.id}`}
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
