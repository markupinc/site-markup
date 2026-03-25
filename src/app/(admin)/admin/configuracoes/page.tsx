"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ConfigItem {
  chave: string;
  valor: string | null;
}

const configGroups = [
  {
    title: "Estatísticas",
    fields: [
      { key: "stats_titulo", label: "Título" },
      { key: "stats_subtitulo", label: "Subtítulo", textarea: true },
      { key: "stats_anos", label: "Anos de experiência" },
      { key: "stats_investidores", label: "Investidores" },
      { key: "stats_empreendimentos", label: "Empreendimentos" },
      { key: "stats_unidades", label: "Unidades" },
    ],
  },
  {
    title: "Contato",
    fields: [
      { key: "email_comercial", label: "E-mail comercial" },
      { key: "telefone", label: "Telefone" },
      { key: "whatsapp_number", label: "WhatsApp (número)" },
      { key: "endereco", label: "Endereço", textarea: true },
    ],
  },
  {
    title: "Redes Sociais",
    fields: [
      { key: "instagram", label: "Instagram URL" },
      { key: "facebook", label: "Facebook URL" },
      { key: "youtube", label: "YouTube URL" },
    ],
  },
  {
    title: "Tracking",
    fields: [
      { key: "gtm_id", label: "Google Tag Manager ID" },
      { key: "meta_pixel_id", label: "Meta Pixel ID" },
    ],
  },
  {
    title: "Hero",
    fields: [{ key: "hero_tagline", label: "Tagline do Hero" }],
  },
];

export default function ConfiguracoesPage() {
  const supabase = createClient();
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("configuracoes").select("*");
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((item: ConfigItem) => {
          map[item.chave] = item.valor || "";
        });
        setConfigs(map);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleChange = (key: string, value: string) => {
    setConfigs((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const updates = Object.entries(configs).map(([chave, valor]) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("configuracoes") as any).update({ valor }).eq("chave", chave)
    );
    await Promise.all(updates);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
        Carregando...
      </p>
    );
  }

  return (
    <div>
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
            Configurações
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            Gerencie as informações exibidas no site.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "10px 24px",
            backgroundColor: saved ? "#6b9f6b" : "#fff",
            color: saved ? "#fff" : "#000",
            border: "none",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s",
            opacity: saving ? 0.5 : 1,
          }}
        >
          {saving ? "Salvando..." : saved ? "Salvo ✓" : "Salvar alterações"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {configGroups.map((group) => (
          <div
            key={group.title}
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              padding: "24px",
            }}
          >
            <h2
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#fff",
                marginBottom: "20px",
              }}
            >
              {group.title}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "16px",
              }}
            >
              {group.fields.map((field) => (
                <div
                  key={field.key}
                  style={{
                    gridColumn: field.textarea ? "1 / -1" : undefined,
                  }}
                >
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
                    {field.label}
                  </label>
                  {field.textarea ? (
                    <textarea
                      value={configs[field.key] || ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        backgroundColor: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "13px",
                        outline: "none",
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={configs[field.key] || ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        backgroundColor: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
