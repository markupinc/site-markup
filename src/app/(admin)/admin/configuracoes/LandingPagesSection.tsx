"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Landing pages estáticas por ZIP — servidas em /lp/{slug}.
 * O ZIP deve conter um index.html (na raiz ou numa pasta única) + assets.
 */

interface Lp {
  slug: string;
  titulo: string | null;
  arquivo_principal: string;
  ativo: boolean;
  total_arquivos: number;
  tamanho_bytes: number;
  atualizado_em: string;
}

const card: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  padding: "24px",
};
const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "13px",
  outline: "none",
};
const label: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  color: "rgba(255,255,255,0.4)",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};
const btn: React.CSSProperties = {
  padding: "10px 20px",
  backgroundColor: "#fff",
  color: "#000",
  border: "none",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
};
const btnMini: React.CSSProperties = {
  padding: "6px 12px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "7px",
  color: "rgba(255,255,255,0.85)",
  fontSize: "12px",
  cursor: "pointer",
};

const fmtBytes = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default function LandingPagesSection() {
  const supabase = createClient();
  const [lps, setLps] = useState<Lp[]>([]);
  const [slug, setSlug] = useState("");
  const [titulo, setTitulo] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<{ texto: string; erro: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const { data } = await (supabase.from("landing_pages") as any).select("*").order("atualizado_em", { ascending: false });
    setLps((data as Lp[]) || []);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function enviar() {
    if (!file || !slug) return;
    setEnviando(true);
    setMsg(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("slug", slug);
      form.append("titulo", titulo);
      const res = await fetch("/api/landing-pages", { method: "POST", body: form });
      const json = await res.json();
      if (json.ok) {
        setMsg({ texto: `Publicada em /lp/${json.slug} (${json.arquivos} arquivos).`, erro: false });
        setSlug("");
        setTitulo("");
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";
        load();
      } else {
        setMsg({ texto: json.error || "Falha no upload.", erro: true });
      }
    } catch (e) {
      setMsg({ texto: e instanceof Error ? e.message : "Erro de rede.", erro: true });
    }
    setEnviando(false);
  }

  async function toggleAtivo(lp: Lp) {
    await fetch("/api/landing-pages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: lp.slug, ativo: !lp.ativo }),
    });
    load();
  }

  async function excluir(lp: Lp) {
    if (!window.confirm(`Excluir a landing page /lp/${lp.slug}? Os arquivos serão apagados.`)) return;
    await fetch(`/api/landing-pages?slug=${encodeURIComponent(lp.slug)}`, { method: "DELETE" });
    load();
  }

  return (
    <div style={card}>
      <h2 style={{ fontSize: "14px", fontWeight: 500, color: "#fff", marginBottom: "6px" }}>Landing Pages (ZIP)</h2>
      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "20px" }}>
        Suba um .zip com o HTML e os arquivos da página (imagens, CSS, JS). Ela fica no ar em{" "}
        <code style={{ color: "#7cc7ef" }}>markupincorporacoes.com.br/lp/SEU-SLUG</code>. Para substituir uma página,
        suba outro ZIP com o mesmo slug.
      </p>

      {/* Upload */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
        <div>
          <label style={label}>Slug (vira a URL)</label>
          <input
            type="text"
            value={slug}
            placeholder="ex.: horizon-verao"
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            style={input}
          />
        </div>
        <div>
          <label style={label}>Título (interno)</label>
          <input type="text" value={titulo} placeholder="ex.: Campanha Horizon — verão" onChange={(e) => setTitulo(e.target.value)} style={input} />
        </div>
      </div>
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <input
          ref={fileRef}
          type="file"
          accept=".zip,application/zip,application/x-zip-compressed"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ ...input, width: "auto", flex: 1, minWidth: 220, padding: "8px 12px" }}
        />
        <button
          onClick={enviar}
          disabled={enviando || !file || !slug}
          style={{ ...btn, opacity: enviando || !file || !slug ? 0.5 : 1, cursor: enviando || !file || !slug ? "default" : "pointer" }}
        >
          {enviando ? "Enviando…" : "Publicar"}
        </button>
      </div>
      {msg && (
        <p style={{ fontSize: "12.5px", marginTop: "10px", color: msg.erro ? "#d9737a" : "#6b9f6b" }}>{msg.texto}</p>
      )}

      {/* Lista */}
      {lps.length > 0 && (
        <div style={{ marginTop: "24px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "8px" }}>
          {lps.map((lp) => (
            <div
              key={lp.slug}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "12px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 200 }}>
                <a
                  href={`/lp/${lp.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "13.5px", color: lp.ativo ? "#7cc7ef" : "rgba(255,255,255,0.35)", textDecoration: "none", fontWeight: 500 }}
                >
                  /lp/{lp.slug} ↗
                </a>
                <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.35)", marginTop: "3px" }}>
                  {lp.titulo || "—"} · {lp.total_arquivos} arquivos · {fmtBytes(lp.tamanho_bytes)} ·{" "}
                  {new Date(lp.atualizado_em).toLocaleDateString("pt-BR")}
                  {!lp.ativo && " · DESATIVADA"}
                </div>
              </div>
              <button onClick={() => toggleAtivo(lp)} style={btnMini}>
                {lp.ativo ? "Desativar" : "Ativar"}
              </button>
              <button onClick={() => excluir(lp)} style={{ ...btnMini, color: "#d9737a", borderColor: "rgba(217,115,122,0.35)" }}>
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
