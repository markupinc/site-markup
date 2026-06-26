"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";

export default function NovoTreinamentoPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    modalidade: "presencial" as "presencial" | "online",
    local: "",
    mapa_url: "",
    online_url: "",
    cor: "#00aeef",
  });
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!form.titulo.trim()) {
      setErro("Informe o título.");
      return;
    }
    setSaving(true);
    const slug = slugify(form.titulo);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("treinamentos") as any)
      .insert({
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim() || null,
        modalidade: form.modalidade,
        local: form.local.trim() || null,
        mapa_url: form.modalidade === "presencial" ? form.mapa_url.trim() || null : null,
        online_url: form.modalidade === "online" ? form.online_url.trim() || null : null,
        slug,
        status: "rascunho",
        cor: form.cor || null,
      })
      .select("id")
      .single();
    setSaving(false);
    if (error) {
      setErro(
        error.code === "23505"
          ? "Já existe um treinamento com esse título (slug duplicado). Ajuste o título."
          : error.message
      );
      return;
    }
    router.push(`/admin/treinamentos/${data.id}`);
  }

  return (
    <div style={{ maxWidth: "720px" }}>
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
      <h1 style={{ fontSize: "24px", fontWeight: 300, color: "#fff", marginBottom: "24px" }}>
        Novo treinamento
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        <Card>
          <Field label="Título *">
            <input
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Ex: Apresentação do Horizon Trade Center"
              style={inputStyle}
              required
            />
          </Field>

          <Field label="Descrição">
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              rows={4}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "16px" }}>
            <Field label="Modalidade">
              <select
                value={form.modalidade}
                onChange={(e) =>
                  setForm({
                    ...form,
                    modalidade: e.target.value as "presencial" | "online",
                  })
                }
                style={{ ...inputStyle, colorScheme: "dark" }}
              >
                <option value="presencial" style={optionStyle}>
                  Presencial
                </option>
                <option value="online" style={optionStyle}>
                  Online
                </option>
              </select>
            </Field>
            <Field label="Cor">
              <input
                type="color"
                value={form.cor}
                onChange={(e) => setForm({ ...form, cor: e.target.value })}
                style={{ ...inputStyle, padding: "4px", height: "42px" }}
              />
            </Field>
          </div>

          {form.modalidade === "presencial" ? (
            <>
              <Field label="Endereço">
                <input
                  value={form.local}
                  onChange={(e) => setForm({ ...form, local: e.target.value })}
                  placeholder="Rua, número - Bairro, Cidade"
                  style={inputStyle}
                />
              </Field>
              <Field label="Link do Google Maps (opcional)">
                <input
                  value={form.mapa_url}
                  onChange={(e) => setForm({ ...form, mapa_url: e.target.value })}
                  placeholder="https://maps.app.goo.gl/..."
                  style={inputStyle}
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="Plataforma (Zoom, Meet...)">
                <input
                  value={form.local}
                  onChange={(e) => setForm({ ...form, local: e.target.value })}
                  placeholder="Ex: Google Meet"
                  style={inputStyle}
                />
              </Field>
              <Field label="Link da reunião">
                <input
                  value={form.online_url}
                  onChange={(e) => setForm({ ...form, online_url: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  style={inputStyle}
                />
              </Field>
            </>
          )}
        </Card>

        {erro && (
          <p
            style={{
              fontSize: "12px",
              color: "#e88",
              backgroundColor: "rgba(212,91,91,0.1)",
              border: "1px solid rgba(212,91,91,0.25)",
              borderRadius: "6px",
              padding: "10px 12px",
            }}
          >
            {erro}
          </p>
        )}

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "12px 24px",
              backgroundColor: "#fff",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? "Criando..." : "Criar treinamento"}
          </button>
          <Link
            href="/admin/treinamentos"
            style={{
              padding: "12px 24px",
              backgroundColor: "transparent",
              color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "8px",
              fontSize: "13px",
              textDecoration: "none",
            }}
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
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
