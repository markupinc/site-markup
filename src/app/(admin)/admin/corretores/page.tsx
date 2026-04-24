"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Corretor {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  creci: string;
  ativo: boolean;
  created_at: string;
  last_login_at: string | null;
}

const formatCpf = (cpf: string) => {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function CorretoresAdminPage() {
  const supabase = createClient();
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [acessosPorCorretor, setAcessosPorCorretor] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    const [corretoresRes, acessosRes] = await Promise.all([
      supabase.from("corretores").select("*").order("created_at", { ascending: false }),
      supabase.from("material_acessos").select("corretor_id"),
    ]);

    if (corretoresRes.data) setCorretores(corretoresRes.data as Corretor[]);

    const acessos: Record<string, number> = {};
    (acessosRes.data as { corretor_id: string }[] | null)?.forEach((a) => {
      acessos[a.corretor_id] = (acessos[a.corretor_id] || 0) + 1;
    });
    setAcessosPorCorretor(acessos);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const handleToggleAtivo = async (id: string, ativo: boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("corretores") as any).update({ ativo: !ativo }).eq("id", id);
    setCorretores((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ativo: !ativo } : c))
    );
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return corretores;
    const q = search.toLowerCase().replace(/\D/g, "");
    const qText = search.toLowerCase();
    return corretores.filter(
      (c) =>
        c.nome.toLowerCase().includes(qText) ||
        c.email.toLowerCase().includes(qText) ||
        c.creci.toLowerCase().includes(qText) ||
        (q.length > 0 && c.cpf.includes(q))
    );
  }, [corretores, search]);

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 300, color: "#fff", marginBottom: "8px" }}>
          Corretores
        </h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
          {corretores.length} corretor{corretores.length === 1 ? "" : "es"} cadastrado
          {corretores.length === 1 ? "" : "s"}.
        </p>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nome, e-mail, CPF ou CRECI..."
        style={{
          width: "100%",
          padding: "10px 14px",
          backgroundColor: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "8px",
          color: "#fff",
          fontSize: "13px",
          outline: "none",
          marginBottom: "20px",
        }}
      />

      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>Carregando...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
          {search ? "Nenhum corretor encontrado." : "Nenhum corretor cadastrado."}
        </p>
      ) : (
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                <th style={thStyle}>Nome</th>
                <th style={thStyle}>Contato</th>
                <th style={thStyle}>CPF / CRECI</th>
                <th style={thStyle}>Cadastro</th>
                <th style={thStyle}>Último login</th>
                <th style={thStyle}>Acessos</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <td style={tdStyle}>
                    <div style={{ color: "#fff", fontSize: "13px" }}>{c.nome}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
                      {c.email}
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                      {c.telefone}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
                      {formatCpf(c.cpf)}
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                      {c.creci}
                    </div>
                  </td>
                  <td style={{ ...tdStyle, fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                    {formatDate(c.created_at)}
                  </td>
                  <td style={{ ...tdStyle, fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                    {formatDate(c.last_login_at)}
                  </td>
                  <td style={{ ...tdStyle, fontSize: "13px", color: "#fff" }}>
                    {acessosPorCorretor[c.id] || 0}
                  </td>
                  <td style={tdStyle}>
                    <ToggleSwitch
                      ativo={c.ativo}
                      onChange={() => handleToggleAtivo(c.id, c.ativo)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ToggleSwitch({
  ativo,
  onChange,
}: {
  ativo: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      title={ativo ? "Ativo — clique para desativar" : "Inativo — clique para ativar"}
      style={{
        width: "44px",
        height: "24px",
        borderRadius: "12px",
        border: "none",
        backgroundColor: ativo ? "#22a355" : "#c0392b",
        position: "relative",
        cursor: "pointer",
        transition: "background-color 0.2s",
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "2px",
          left: ativo ? "22px" : "2px",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: 500,
  color: "rgba(255,255,255,0.5)",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  verticalAlign: "top",
};
