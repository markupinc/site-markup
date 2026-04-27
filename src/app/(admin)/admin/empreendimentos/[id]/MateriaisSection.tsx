"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Categoria = "folder" | "tabela" | "divulgacao" | "outros";

interface Material {
  id: string;
  titulo: string;
  categoria: Categoria;
  drive_url: string;
  descricao: string | null;
  ordem: number;
  ativo: boolean;
}

const categoriaLabels: Record<Categoria, string> = {
  folder: "Folder",
  tabela: "Tabela",
  divulgacao: "Divulgação",
  outros: "Outros",
};

export default function MateriaisSection({
  empreendimentoId,
}: {
  empreendimentoId: string;
}) {
  const supabase = createClient();
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [novo, setNovo] = useState<{
    titulo: string;
    categoria: Categoria;
    drive_url: string;
    descricao: string;
  }>({ titulo: "", categoria: "folder", drive_url: "", descricao: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const { data } = await supabase
      .from("empreendimento_materiais")
      .select("*")
      .eq("empreendimento_id", empreendimentoId)
      .order("ordem", { ascending: true });
    setMateriais((data as Material[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [empreendimentoId]);

  async function addMaterial() {
    setError("");
    if (!novo.titulo.trim() || !novo.drive_url.trim()) {
      setError("Título e URL são obrigatórios.");
      return;
    }
    setSaving(true);
    const ordem = materiais.length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: err } = await (supabase.from("empreendimento_materiais") as any)
      .insert({
        empreendimento_id: empreendimentoId,
        titulo: novo.titulo.trim(),
        categoria: novo.categoria,
        drive_url: novo.drive_url.trim(),
        descricao: novo.descricao.trim() || null,
        ordem,
      })
      .select()
      .single();
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data) setMateriais((prev) => [...prev, data as Material]);
    setNovo({ titulo: "", categoria: "folder", drive_url: "", descricao: "" });
  }

  async function updateMaterial(id: string, patch: Partial<Material>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("empreendimento_materiais") as any).update(patch).eq("id", id);
    setMateriais((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  async function removeMaterial(id: string) {
    if (!confirm("Remover este material?")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("empreendimento_materiais") as any).delete().eq("id", id);
    setMateriais((prev) => prev.filter((m) => m.id !== id));
  }

  if (loading) {
    return (
      <div style={cardStyle}>
        <h2 style={sectionTitle}>Materiais (Área do Corretor)</h2>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Carregando...</p>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <h2 style={sectionTitle}>Materiais (Área do Corretor)</h2>
      <p
        style={{
          fontSize: "12px",
          color: "rgba(255,255,255,0.4)",
          marginTop: "-8px",
          marginBottom: "20px",
        }}
      >
        Links do Drive que corretores cadastrados poderão acessar.
      </p>

      {/* Add new */}
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          border: "1px dashed rgba(255,255,255,0.12)",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <input
            type="text"
            placeholder="Título (ex: Tabela de preços)"
            value={novo.titulo}
            onChange={(e) => setNovo({ ...novo, titulo: e.target.value })}
            style={inputStyle}
          />
          <select
            value={novo.categoria}
            onChange={(e) =>
              setNovo({ ...novo, categoria: e.target.value as Categoria })
            }
            style={{ ...inputStyle, colorScheme: "dark" }}
          >
            <option value="folder" style={optionStyle}>Folder</option>
            <option value="tabela" style={optionStyle}>Tabela</option>
            <option value="divulgacao" style={optionStyle}>Divulgação</option>
            <option value="outros" style={optionStyle}>Outros</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="URL do Drive (https://drive.google.com/...)"
          value={novo.drive_url}
          onChange={(e) => setNovo({ ...novo, drive_url: e.target.value })}
          style={{ ...inputStyle, marginBottom: "8px" }}
        />
        <input
          type="text"
          placeholder="Descrição (opcional)"
          value={novo.descricao}
          onChange={(e) => setNovo({ ...novo, descricao: e.target.value })}
          style={{ ...inputStyle, marginBottom: "8px" }}
        />
        {error && (
          <p style={{ fontSize: "12px", color: "#e88", marginBottom: "8px" }}>
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={addMaterial}
          disabled={saving}
          style={{
            padding: "8px 16px",
            backgroundColor: "#fff",
            color: "#000",
            border: "none",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 500,
            cursor: "pointer",
            opacity: saving ? 0.5 : 1,
          }}
        >
          {saving ? "Adicionando..." : "Adicionar material"}
        </button>
      </div>

      {/* List */}
      {materiais.length === 0 ? (
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
          Nenhum material cadastrado.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {materiais.map((m) => (
            <div
              key={m.id}
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "12px",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto auto",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  padding: "4px 8px",
                  backgroundColor: "rgba(184,148,95,0.15)",
                  color: "#b8945f",
                  borderRadius: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontWeight: 500,
                }}
              >
                {categoriaLabels[m.categoria]}
              </span>
              <div>
                <div style={{ fontSize: "13px", color: "#fff" }}>{m.titulo}</div>
                <a
                  href={m.drive_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.4)",
                    textDecoration: "none",
                  }}
                >
                  {m.drive_url.length > 60 ? m.drive_url.slice(0, 60) + "..." : m.drive_url}
                </a>
              </div>
              <ToggleSwitch
                ativo={m.ativo}
                onChange={() => updateMaterial(m.id, { ativo: !m.ativo })}
              />
              <button
                type="button"
                onClick={() => removeMaterial(m.id)}
                style={deleteBtnStyle}
              >
                Remover
              </button>
            </div>
          ))}
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
      type="button"
      onClick={onChange}
      style={{
        width: "38px",
        height: "22px",
        borderRadius: "11px",
        border: "none",
        backgroundColor: ativo ? "#22a355" : "#c0392b",
        position: "relative",
        cursor: "pointer",
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "2px",
          left: ativo ? "18px" : "2px",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  padding: "24px",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 500,
  color: "#fff",
  marginBottom: "16px",
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
  boxSizing: "border-box",
};

const optionStyle: React.CSSProperties = {
  backgroundColor: "#1a1a1a",
  color: "#fff",
};

const deleteBtnStyle: React.CSSProperties = {
  padding: "6px 10px",
  backgroundColor: "transparent",
  border: "1px solid rgba(212,91,91,0.3)",
  borderRadius: "6px",
  color: "#d45b5b",
  fontSize: "11px",
  cursor: "pointer",
};
