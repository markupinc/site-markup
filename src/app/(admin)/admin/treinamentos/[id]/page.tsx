"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import HorariosManager from "./HorariosManager";
import InscritosManager from "./InscritosManager";

interface Treinamento {
  id: string;
  titulo: string;
  descricao: string | null;
  local: string | null;
  modalidade: "presencial" | "online";
  mapa_url: string | null;
  online_url: string | null;
  slug: string;
  status: "rascunho" | "publicado" | "encerrado";
  cor: string | null;
}

const BASE_URL = "https://markupincorporacoes.com.br";

const STATUS_LABEL: Record<Treinamento["status"], string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
  encerrado: "Encerrado",
};

export default function EditarTreinamentoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const supabase = createClient();

  const [treinamento, setTreinamento] = useState<Treinamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Treinamento>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("treinamentos")
      .select("*")
      .eq("id", id)
      .maybeSingle<Treinamento>();
    if (data) {
      setTreinamento(data);
      setForm(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSave() {
    setSaving(true);
    setErro("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("treinamentos") as any)
      .update({
        titulo: form.titulo?.trim(),
        descricao: form.descricao?.trim() || null,
        modalidade: form.modalidade,
        local: form.local?.trim() || null,
        mapa_url: form.modalidade === "presencial" ? form.mapa_url?.trim() || null : null,
        online_url: form.modalidade === "online" ? form.online_url?.trim() || null : null,
        cor: form.cor || null,
        status: form.status,
      })
      .eq("id", id);
    setSaving(false);
    if (error) {
      setErro(error.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    load();
  }

  async function handleStatus(novoStatus: Treinamento["status"]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("treinamentos") as any)
      .update({ status: novoStatus })
      .eq("id", id);
    setForm((prev) => ({ ...prev, status: novoStatus }));
    if (treinamento) setTreinamento({ ...treinamento, status: novoStatus });
  }

  async function handleDelete() {
    if (!confirm("Excluir este treinamento e todos os horários/reservas?")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("treinamentos") as any).delete().eq("id", id);
    router.push("/admin/treinamentos");
  }

  async function handleCopyLink() {
    if (!treinamento) return;
    await navigator.clipboard.writeText(`${BASE_URL}/treinamentos/${treinamento.slug}`);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (loading)
    return <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>Carregando...</p>;
  if (!treinamento)
    return <p style={{ color: "#e88" }}>Treinamento não encontrado.</p>;

  return (
    <div style={{ maxWidth: "960px" }}>
      <Link
        href="/admin/treinamentos"
        style={{
          fontSize: "12px",
          color: "rgba(255,255,255,0.4)",
          textDecoration: "none",
          marginBottom: "12px",
          display: "inline-block",
        }}
      >
        ← Voltar
      </Link>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          marginBottom: "32px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 300,
              color: "#fff",
              marginBottom: "8px",
            }}
          >
            {treinamento.titulo}
          </h1>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
            /treinamentos/{treinamento.slug} · Status: {STATUS_LABEL[treinamento.status]}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleCopyLink}
            style={btnSecondary}
          >
            {copiado ? "✓ Copiado" : "Copiar link público"}
          </button>
          {treinamento.status === "publicado" ? (
            <button
              type="button"
              onClick={() => handleStatus("encerrado")}
              style={btnDanger}
            >
              Encerrar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleStatus("publicado")}
              style={btnPrimary}
            >
              Publicar
            </button>
          )}
        </div>
      </div>

      {/* Dados */}
      <Card>
        <h2 style={sectionTitle}>Dados do treinamento</h2>
        <Field label="Título *">
          <input
            value={form.titulo || ""}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            style={inputStyle}
          />
        </Field>
        <Field label="Descrição">
          <textarea
            value={form.descricao || ""}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            rows={4}
            style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
          />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "16px" }}>
          <Field label="Modalidade">
            <select
              value={form.modalidade || "presencial"}
              onChange={(e) =>
                setForm({
                  ...form,
                  modalidade: e.target.value as "presencial" | "online",
                })
              }
              style={{ ...inputStyle, colorScheme: "dark" }}
            >
              <option value="presencial" style={optionStyle}>Presencial</option>
              <option value="online" style={optionStyle}>Online</option>
            </select>
          </Field>
          <Field label="Cor">
            <input
              type="color"
              value={form.cor || "#00aeef"}
              onChange={(e) => setForm({ ...form, cor: e.target.value })}
              style={{ ...inputStyle, padding: "4px", height: "42px" }}
            />
          </Field>
        </div>

        {form.modalidade === "presencial" ? (
          <>
            <Field label="Endereço">
              <input
                value={form.local || ""}
                onChange={(e) => setForm({ ...form, local: e.target.value })}
                style={inputStyle}
              />
            </Field>
            <Field label="Link do Google Maps">
              <input
                value={form.mapa_url || ""}
                onChange={(e) => setForm({ ...form, mapa_url: e.target.value })}
                placeholder="https://maps.app.goo.gl/..."
                style={inputStyle}
              />
            </Field>
          </>
        ) : (
          <>
            <Field label="Plataforma">
              <input
                value={form.local || ""}
                onChange={(e) => setForm({ ...form, local: e.target.value })}
                style={inputStyle}
              />
            </Field>
            <Field label="Link da reunião">
              <input
                value={form.online_url || ""}
                onChange={(e) => setForm({ ...form, online_url: e.target.value })}
                placeholder="https://meet.google.com/..."
                style={inputStyle}
              />
            </Field>
          </>
        )}

        {erro && (
          <p style={{ fontSize: "12px", color: "#e88" }}>{erro}</p>
        )}

        <div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              ...btnPrimary,
              backgroundColor: saved ? "#6b9f6b" : "#fff",
              color: saved ? "#fff" : "#000",
            }}
          >
            {saving ? "Salvando..." : saved ? "Salvo ✓" : "Salvar alterações"}
          </button>
        </div>
      </Card>

      <div style={{ height: "24px" }} />

      {/* Horários */}
      <HorariosManager treinamentoId={id} />

      <div style={{ height: "24px" }} />

      {/* Inscritos */}
      <InscritosManager treinamentoId={id} treinamentoTitulo={treinamento.titulo} />

      <div style={{ height: "24px" }} />

      {/* Danger zone */}
      <Card style={{ borderColor: "rgba(212,91,91,0.25)" }}>
        <h2 style={{ ...sectionTitle, color: "#d45b5b" }}>Zona de perigo</h2>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
          A exclusão remove o treinamento, todos os horários e reservas.
        </p>
        <div>
          <button type="button" onClick={handleDelete} style={btnDanger}>
            Excluir treinamento
          </button>
        </div>
      </Card>
    </div>
  );
}

function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        backgroundColor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "11px",
          color: "rgba(255,255,255,0.4)",
          marginBottom: "6px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const sectionTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 500,
  color: "#fff",
  marginBottom: "4px",
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

const btnPrimary: React.CSSProperties = {
  padding: "10px 18px",
  backgroundColor: "#fff",
  color: "#000",
  border: "none",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  padding: "10px 16px",
  backgroundColor: "transparent",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "8px",
  fontSize: "13px",
  cursor: "pointer",
};

const btnDanger: React.CSSProperties = {
  padding: "10px 16px",
  backgroundColor: "transparent",
  color: "#d45b5b",
  border: "1px solid rgba(212,91,91,0.3)",
  borderRadius: "8px",
  fontSize: "13px",
  cursor: "pointer",
};
