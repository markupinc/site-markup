"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Treinamento {
  id: string;
  titulo: string;
  slug: string;
  modalidade: "presencial" | "online";
  status: "rascunho" | "publicado" | "encerrado";
  created_at: string;
}

const STATUS_COR: Record<Treinamento["status"], { label: string; color: string }> = {
  rascunho: { label: "Rascunho", color: "rgba(255,255,255,0.5)" },
  publicado: { label: "Publicado", color: "#6b9f6b" },
  encerrado: { label: "Encerrado", color: "#d45b5b" },
};

const BASE_URL = "https://markupincorporacoes.com.br";

export default function TreinamentosAdminPage() {
  const supabase = createClient();
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState("");

  async function load() {
    const { data } = await supabase
      .from("treinamentos")
      .select("id, titulo, slug, modalidade, status, created_at")
      .order("created_at", { ascending: false });
    if (data) setTreinamentos(data as Treinamento[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCopy(slug: string) {
    await navigator.clipboard.writeText(`${BASE_URL}/treinamentos/${slug}`);
    setCopiado(slug);
    setTimeout(() => setCopiado(""), 2000);
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 300, color: "#fff", marginBottom: "8px" }}>
            Treinamentos
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            Crie eventos com horários e gere links públicos para os corretores se inscreverem.
          </p>
        </div>
        <Link
          href="/admin/treinamentos/novo"
          style={{
            padding: "10px 18px",
            backgroundColor: "#fff",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          + Novo treinamento
        </Link>
      </div>

      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>Carregando...</p>
      ) : treinamentos.length === 0 ? (
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "48px",
            textAlign: "center",
            color: "rgba(255,255,255,0.4)",
            fontSize: "13px",
          }}
        >
          Nenhum treinamento criado ainda.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {treinamentos.map((t) => {
            const st = STATUS_COR[t.status];
            return (
              <div
                key={t.id}
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto auto",
                  gap: "16px",
                  alignItems: "center",
                }}
              >
                <div>
                  <Link
                    href={`/admin/treinamentos/${t.id}`}
                    style={{
                      fontSize: "15px",
                      color: "#fff",
                      fontWeight: 500,
                      textDecoration: "none",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    {t.titulo}
                  </Link>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    /treinamentos/{t.slug} ·{" "}
                    {t.modalidade === "presencial" ? "Presencial" : "Online"}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: st.color,
                    backgroundColor: `${st.color}22`,
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {st.label}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(t.slug)}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "transparent",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "6px",
                    color: copiado === t.slug ? "#6b9f6b" : "#fff",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  {copiado === t.slug ? "✓ Copiado" : "Copiar link"}
                </button>
                <Link
                  href={`/admin/treinamentos/${t.id}`}
                  style={{
                    padding: "8px 14px",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "6px",
                    color: "#fff",
                    fontSize: "11px",
                    textDecoration: "none",
                  }}
                >
                  Gerenciar →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
