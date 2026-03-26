"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

interface Subscriber {
  id: string;
  email: string;
  ativo: boolean;
  created_at: string;
}

// ─── Style constants ─────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  padding: "24px",
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "13px",
  outline: "none",
  fontFamily: "inherit",
};

export default function NewsletterPage() {
  const supabase = createClient();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Load subscribers
  useEffect(() => {
    (async () => {
      const { data, error: fetchError } = await (supabase.from("newsletter") as any)
        .select("id, email, ativo, created_at")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      setSubscribers((data ?? []) as Subscriber[]);
      setLoading(false);
    })();
  }, []);

  // Stats
  const total = subscribers.length;
  const ativos = subscribers.filter((s) => s.ativo).length;
  const inativos = total - ativos;

  // Filtered list
  const filtered = useMemo(() => {
    if (!search.trim()) return subscribers;
    const term = search.toLowerCase();
    return subscribers.filter((s) => s.email.toLowerCase().includes(term));
  }, [subscribers, search]);

  // CSV export
  const handleExportCSV = async () => {
    const { data } = await (supabase.from("newsletter") as any)
      .select("email")
      .eq("ativo", true)
      .order("email", { ascending: true });

    if (!data || data.length === 0) {
      alert("Nenhum email ativo para exportar.");
      return;
    }

    const emails = (data as Array<{ email: string }>).map((r) => r.email);
    const csvContent = "email\n" + emails.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `newsletter_ativos_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ padding: "48px", textAlign: "center" }}>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Carregando...</p>
      </div>
    );
  }

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
            Newsletter
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            Gerencie os inscritos na newsletter.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCSV}
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
          Exportar CSV
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "rgba(212,91,91,0.1)",
            border: "1px solid rgba(212,91,91,0.3)",
            borderRadius: "8px",
            marginBottom: "24px",
            fontSize: "13px",
            color: "#d45b5b",
          }}
        >
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {[
          { label: "Total inscritos", value: total },
          { label: "Ativos", value: ativos, color: "#6b9f6b" },
          { label: "Inativos", value: inativos, color: "rgba(255,255,255,0.4)" },
        ].map((stat) => (
          <div key={stat.label} style={cardStyle}>
            <p
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "8px",
              }}
            >
              {stat.label}
            </p>
            <p
              style={{
                fontSize: "28px",
                fontWeight: 300,
                color: stat.color || "#fff",
              }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: "24px", maxWidth: "400px" }}>
        <input
          type="text"
          placeholder="Buscar por email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
        />
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
        {filtered.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
              {search ? "Nenhum resultado encontrado." : "Nenhum inscrito na newsletter."}
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Email", "Status", "Data de inscricao"].map((h) => (
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
              {filtered.map((sub) => {
                const formattedDate = sub.created_at
                  ? new Date(sub.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—";

                return (
                  <tr key={sub.id}>
                    {/* Email */}
                    <td
                      style={{
                        padding: "10px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        fontSize: "13px",
                        color: "#fff",
                        fontWeight: 500,
                      }}
                    >
                      {sub.email}
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
                          backgroundColor: sub.ativo
                            ? "rgba(107,159,107,0.15)"
                            : "rgba(255,255,255,0.06)",
                          color: sub.ativo ? "#6b9f6b" : "rgba(255,255,255,0.4)",
                        }}
                      >
                        {sub.ativo ? "Ativo" : "Inativo"}
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
