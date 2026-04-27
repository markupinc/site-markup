"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Webhook {
  id: string;
  nome: string;
  url: string;
  evento: string;
  ativo: boolean;
  ultimo_status: number | null;
  ultimo_disparo_em: string | null;
  ultimo_erro: string | null;
}

const EVENTOS = [{ value: "lead.criado", label: "Lead criado" }];

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function WebhooksSection() {
  const supabase = createClient();
  const [hooks, setHooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [novo, setNovo] = useState({ nome: "", url: "", evento: "lead.criado" });
  const [error, setError] = useState("");
  const [testingId, setTestingId] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase
      .from("webhooks")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setHooks(data as Webhook[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    setError("");
    if (!novo.nome.trim() || !novo.url.trim()) {
      setError("Nome e URL são obrigatórios.");
      return;
    }
    if (!/^https?:\/\//i.test(novo.url)) {
      setError("URL deve começar com http:// ou https://");
      return;
    }
    setCreating(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase.from("webhooks") as any).insert({
      nome: novo.nome.trim(),
      url: novo.url.trim(),
      evento: novo.evento,
    });
    setCreating(false);
    if (err) {
      setError(err.message);
      return;
    }
    setNovo({ nome: "", url: "", evento: "lead.criado" });
    load();
  }

  async function handleUpdate(id: string, patch: Partial<Webhook>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("webhooks") as any).update(patch).eq("id", id);
    setHooks((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este webhook?")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("webhooks") as any).delete().eq("id", id);
    setHooks((prev) => prev.filter((h) => h.id !== id));
  }

  async function handleTest(hook: Webhook) {
    setTestingId(hook.id);
    try {
      const res = await fetch(hook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Markup-Event": "test",
        },
        body: JSON.stringify({
          evento: "test",
          enviado_em: new Date().toISOString(),
          data: {
            nome: "Teste de Webhook",
            telefone: "82999999999",
            email: "teste@markupinc.com.br",
            mensagem: "Este é um disparo de teste.",
          },
        }),
      });
      alert(
        res.ok
          ? `OK — HTTP ${res.status}`
          : `Falhou — HTTP ${res.status}: ${res.statusText}`
      );
    } catch (e) {
      alert(`Erro: ${e instanceof Error ? e.message : "desconhecido"}`);
    } finally {
      setTestingId(null);
    }
  }

  return (
    <div
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
          marginBottom: "6px",
        }}
      >
        Webhooks
      </h2>
      <p
        style={{
          fontSize: "12px",
          color: "rgba(255,255,255,0.4)",
          marginBottom: "20px",
        }}
      >
        Dispara um POST com os dados do lead pra URL que você configurar.
        Útil pra Zapier, Make, n8n, Slack, CRMs etc.
      </p>

      {/* Novo webhook */}
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          border: "1px dashed rgba(255,255,255,0.12)",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "20px",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.5)",
            marginBottom: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Novo webhook
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr 1fr auto",
            gap: "8px",
          }}
        >
          <input
            type="text"
            placeholder="Nome (ex: Zapier)"
            value={novo.nome}
            onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="URL https://..."
            value={novo.url}
            onChange={(e) => setNovo({ ...novo, url: e.target.value })}
            style={inputStyle}
          />
          <select
            value={novo.evento}
            onChange={(e) => setNovo({ ...novo, evento: e.target.value })}
            style={{ ...inputStyle, colorScheme: "dark" }}
          >
            {EVENTOS.map((ev) => (
              <option key={ev.value} value={ev.value} style={optionStyle}>
                {ev.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleCreate}
            disabled={creating}
            style={{
              padding: "10px 16px",
              backgroundColor: "#fff",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              opacity: creating ? 0.5 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {creating ? "..." : "Adicionar"}
          </button>
        </div>
        {error && (
          <p style={{ fontSize: "12px", color: "#e88", marginTop: "8px" }}>
            {error}
          </p>
        )}
      </div>

      {/* Lista */}
      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
          Carregando...
        </p>
      ) : hooks.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
          Nenhum webhook configurado.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {hooks.map((h) => (
            <div
              key={h.id}
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "12px",
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#fff",
                    fontWeight: 500,
                    marginBottom: "2px",
                  }}
                >
                  {h.nome}
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "10px",
                      padding: "2px 6px",
                      backgroundColor: "rgba(184,148,95,0.15)",
                      color: "#b8945f",
                      borderRadius: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontWeight: 500,
                    }}
                  >
                    {h.evento}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.5)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={h.url}
                >
                  {h.url}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.4)",
                    marginTop: "4px",
                  }}
                >
                  Último disparo: {formatDate(h.ultimo_disparo_em)}
                  {h.ultimo_status !== null && (
                    <span
                      style={{
                        marginLeft: "8px",
                        color:
                          h.ultimo_status >= 200 && h.ultimo_status < 300
                            ? "#6b9f6b"
                            : "#e88",
                      }}
                    >
                      HTTP {h.ultimo_status}
                    </span>
                  )}
                  {h.ultimo_erro && (
                    <span style={{ marginLeft: "8px", color: "#e88" }}>
                      · {h.ultimo_erro}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleTest(h)}
                disabled={testingId === h.id}
                style={miniButtonStyle}
                title="Disparar payload de teste"
              >
                {testingId === h.id ? "..." : "Testar"}
              </button>
              <ToggleSwitch
                ativo={h.ativo}
                onChange={() => handleUpdate(h.id, { ativo: !h.ativo })}
              />
              <button
                onClick={() => handleDelete(h.id)}
                style={{ ...miniButtonStyle, color: "#e88" }}
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
      onClick={onChange}
      title={ativo ? "Ativo" : "Inativo"}
      style={{
        width: "44px",
        height: "24px",
        borderRadius: "12px",
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
          left: ativo ? "22px" : "2px",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}

const inputStyle: React.CSSProperties = {
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

const miniButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "12px",
  cursor: "pointer",
  whiteSpace: "nowrap",
};
