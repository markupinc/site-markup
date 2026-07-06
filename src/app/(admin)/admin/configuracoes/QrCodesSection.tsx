"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface QrCode {
  id: string;
  slug: string;
  destino_url: string;
  descricao: string | null;
  ativo: boolean;
}
interface Acesso {
  qr_slug: string;
  created_at: string;
  user_agent: string | null;
}

const BASE_URL = "https://markupincorporacoes.com.br";
const BLUE = "#00aeef";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

export default function QrCodesSection() {
  const supabase = createClient();
  const [codes, setCodes] = useState<QrCode[]>([]);
  const [acessos, setAcessos] = useState<Acesso[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [newDestino, setNewDestino] = useState("");
  const [newDescricao, setNewDescricao] = useState("");
  const [error, setError] = useState("");
  const [copiedSlug, setCopiedSlug] = useState("");

  async function load() {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const [codesRes, acessosRes] = await Promise.all([
      supabase.from("qr_codes").select("*").order("created_at", { ascending: false }),
      (supabase.from("qr_acessos") as any)
        .select("qr_slug, created_at, user_agent")
        .order("created_at", { ascending: false })
        .limit(20000),
    ]);
    /* eslint-enable @typescript-eslint/no-explicit-any */
    if (codesRes.data) setCodes(codesRes.data as QrCode[]);
    setAcessos((acessosRes.data as Acesso[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const porSlug = useMemo(() => {
    const m = new Map<string, Acesso[]>();
    acessos.forEach((a) => {
      if (!m.has(a.qr_slug)) m.set(a.qr_slug, []);
      m.get(a.qr_slug)!.push(a);
    });
    return m;
  }, [acessos]);

  const totalAcessos = acessos.length;
  const hoje = new Date().toISOString().slice(0, 10);
  const acessosHoje = acessos.filter((a) => a.created_at.slice(0, 10) === hoje).length;
  const seteDias = new Date(Date.now() - 7 * 864e5).toISOString();
  const acessos7d = acessos.filter((a) => a.created_at >= seteDias).length;

  const handleCreate = async () => {
    setError("");
    const slug = slugify(newSlug);
    if (!slug) return setError("Informe um nome válido.");
    if (!newDestino.trim()) return setError("Informe a URL de destino.");
    setCreating(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase.from("qr_codes") as any).insert({
      slug,
      destino_url: newDestino.trim(),
      descricao: newDescricao.trim() || null,
    });
    setCreating(false);
    if (insertError) {
      setError(insertError.code === "23505" ? "Já existe um QR Code com esse nome." : insertError.message);
      return;
    }
    setNewSlug("");
    setNewDestino("");
    setNewDescricao("");
    load();
  };

  const handleUpdate = async (id: string, patch: Partial<QrCode>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("qr_codes") as any).update(patch).eq("id", id);
    setCodes((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const handleDelete = async (id: string, slug: string) => {
    if (!confirm(`Remover o QR Code /qr/${slug}?`)) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("qr_codes") as any).delete().eq("id", id);
    setCodes((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCopy = async (slug: string) => {
    await navigator.clipboard.writeText(`${BASE_URL}/qr/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(""), 2000);
  };

  return (
    <div style={cardBox}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 500, color: "#fff", marginBottom: 6 }}>QR Codes</h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
            Redirecionamentos editáveis com tracking de acessos. URL:{" "}
            <code style={{ color: "rgba(255,255,255,0.7)" }}>{BASE_URL}/qr/nome</code>.
          </p>
        </div>
        {!loading && (
          <div style={{ display: "flex", gap: 20 }}>
            <MiniStat label="Acessos totais" valor={totalAcessos} accent />
            <MiniStat label="Últimos 7 dias" valor={acessos7d} />
            <MiniStat label="Hoje" valor={acessosHoje} />
          </div>
        )}
      </div>

      {/* Novo */}
      <div style={novoBox}>
        <p style={novoLabel}>Novo QR Code</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 2fr auto", gap: 8 }}>
          <input type="text" placeholder="nome (ex: horizon)" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="URL de destino" value={newDestino} onChange={(e) => setNewDestino(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="descrição (opcional)" value={newDescricao} onChange={(e) => setNewDescricao(e.target.value)} style={inputStyle} />
          <button onClick={handleCreate} disabled={creating} style={{ ...btnCriar, opacity: creating ? 0.5 : 1 }}>
            {creating ? "..." : "Criar"}
          </button>
        </div>
        {newSlug && (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>
            URL gerada: {BASE_URL}/qr/<strong style={{ color: "#fff" }}>{slugify(newSlug)}</strong>
          </p>
        )}
        {error && <p style={{ fontSize: 12, color: "#e88", marginTop: 8 }}>{error}</p>}
      </div>

      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Carregando...</p>
      ) : codes.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Nenhum QR Code criado ainda.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {codes.map((code) => (
            <QrCodeRow
              key={code.id}
              code={code}
              acessos={porSlug.get(code.slug) || []}
              copied={copiedSlug === code.slug}
              onCopy={() => handleCopy(code.slug)}
              onUpdate={(patch) => handleUpdate(code.id, patch)}
              onDelete={() => handleDelete(code.id, code.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function QrCodeRow({
  code,
  acessos,
  copied,
  onCopy,
  onUpdate,
  onDelete,
}: {
  code: QrCode;
  acessos: Acesso[];
  copied: boolean;
  onCopy: () => void;
  onUpdate: (patch: Partial<QrCode>) => void;
  onDelete: () => void;
}) {
  const [destino, setDestino] = useState(code.destino_url);
  const [descricao, setDescricao] = useState(code.descricao || "");
  const [aberto, setAberto] = useState(false);
  const dirty = destino !== code.destino_url || descricao !== (code.descricao || "");

  return (
    <div style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: 12, display: "grid", gridTemplateColumns: "1.5fr 2fr 1.5fr auto", gap: 8, alignItems: "center" }}>
        <div style={{ overflow: "hidden" }}>
          <code style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", fontFamily: "monospace", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={`${BASE_URL}/qr/${code.slug}`}>
            /qr/<span style={{ color: "#fff", fontWeight: 600 }}>{code.slug}</span>
          </code>
          <button onClick={() => setAberto((v) => !v)} style={contadorBtn}>
            <b style={{ color: BLUE }}>{acessos.length.toLocaleString("pt-BR")}</b> acessos {aberto ? "▲" : "▾"}
          </button>
        </div>
        <input type="text" value={destino} onChange={(e) => setDestino(e.target.value)} onBlur={() => dirty && onUpdate({ destino_url: destino })} style={inputStyle} />
        <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} onBlur={() => dirty && onUpdate({ descricao: descricao.trim() || null })} placeholder="descrição" style={inputStyle} />
        <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "flex-end" }}>
          <button onClick={onCopy} style={{ ...miniButtonStyle, color: copied ? "#6b9f6b" : "#fff" }} title="Copiar URL">
            {copied ? "✓" : "Copiar"}
          </button>
          <ToggleSwitch ativo={code.ativo} onChange={() => onUpdate({ ativo: !code.ativo })} />
          <button onClick={onDelete} style={{ ...miniButtonStyle, color: "#e88" }} title="Remover">
            ✕
          </button>
        </div>
      </div>
      {aberto && <QrStats acessos={acessos} />}
    </div>
  );
}

// ---- Estatísticas de um QR ----
function QrStats({ acessos }: { acessos: Acesso[] }) {
  const stats = useMemo(() => {
    if (acessos.length === 0) return null;
    // BRT = UTC-3
    const brt = (iso: string) => new Date(new Date(iso).getTime() - 3 * 3600000);

    const porDiaMap = new Map<string, number>();
    const horas = Array.from({ length: 24 }, (_, h) => ({ h, label: `${String(h).padStart(2, "0")}h`, n: 0 }));
    const semanaLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const semana = semanaLabels.map((label) => ({ label, n: 0 }));
    let mobile = 0;

    acessos.forEach((a) => {
      const d = brt(a.created_at);
      const dia = d.toISOString().slice(0, 10);
      porDiaMap.set(dia, (porDiaMap.get(dia) || 0) + 1);
      horas[d.getUTCHours()].n += 1;
      semana[d.getUTCDay()].n += 1;
      if (/mobile|android|iphone|ipad/i.test(a.user_agent || "")) mobile += 1;
    });

    const porDia = [...porDiaMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([dia, n]) => ({ dia, label: `${dia.slice(8, 10)}/${dia.slice(5, 7)}`, n }));
    const dias = porDiaMap.size;
    const media = dias > 0 ? acessos.length / dias : 0;
    const picoHora = [...horas].sort((a, b) => b.n - a.n)[0];
    const ultimo = brt(acessos[0].created_at); // ordenado desc
    return { porDia, horas, semana, media, dias, mobile, desktop: acessos.length - mobile, picoHora, ultimo };
  }, [acessos]);

  if (!stats) {
    return <div style={statsWrap}><p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Nenhum acesso registrado ainda para este QR.</p></div>;
  }

  return (
    <div style={statsWrap}>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 16 }}>
        <MiniStat label="Média / dia" valor={stats.media.toFixed(1)} accent />
        <MiniStat label="Dias com acesso" valor={stats.dias} />
        <MiniStat label="Pico de horário" valor={stats.picoHora.label} />
        <MiniStat label="Mobile / Desktop" valor={`${stats.mobile} / ${stats.desktop}`} />
        <MiniStat label="Último acesso" valor={`${String(stats.ultimo.getUTCDate()).padStart(2, "0")}/${String(stats.ultimo.getUTCMonth() + 1).padStart(2, "0")} ${String(stats.ultimo.getUTCHours()).padStart(2, "0")}h`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <ChartBox titulo="Acessos por dia">
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={stats.porDia} margin={chartM}>
              <defs>
                <linearGradient id="qrArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BLUE} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={BLUE} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" {...axis} />
              <YAxis {...axis} width={28} allowDecimals={false} />
              <Tooltip {...ttip} />
              <Area dataKey="n" name="Acessos" stroke={BLUE} strokeWidth={2} fill="url(#qrArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox titulo="Por hora do dia">
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={stats.horas} margin={chartM}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" {...axis} interval={2} />
              <YAxis {...axis} width={28} allowDecimals={false} />
              <Tooltip {...ttip} />
              <Bar dataKey="n" name="Acessos" fill={BLUE} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox titulo="Por dia da semana">
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={stats.semana} margin={chartM}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" {...axis} />
              <YAxis {...axis} width={28} allowDecimals={false} />
              <Tooltip {...ttip} />
              <Bar dataKey="n" name="Acessos" fill="#b8945f" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      </div>
    </div>
  );
}

function MiniStat({ label, valor, accent }: { label: string; valor: string | number; accent?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 300, color: accent ? BLUE : "#fff", fontFamily: "var(--font-playfair)", lineHeight: 1 }}>{valor}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.4px", marginTop: 3 }}>{label}</div>
    </div>
  );
}
function ChartBox({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: 12 }}>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 10 }}>{titulo}</p>
      {children}
    </div>
  );
}

function ToggleSwitch({ ativo, onChange }: { ativo: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      title={ativo ? "Ativo — clique para desativar" : "Inativo — clique para ativar"}
      style={{ width: 44, height: 24, borderRadius: 12, border: "none", backgroundColor: ativo ? "#22a355" : "#c0392b", position: "relative", cursor: "pointer", transition: "background-color 0.2s", padding: 0, flexShrink: 0 }}
    >
      <span style={{ position: "absolute", top: 2, left: ativo ? 22 : 2, width: 20, height: 20, borderRadius: "50%", backgroundColor: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
    </button>
  );
}

const cardBox: React.CSSProperties = { backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 24 };
const novoBox: React.CSSProperties = { backgroundColor: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.12)", borderRadius: 8, padding: 16, margin: "20px 0 24px" };
const novoLabel: React.CSSProperties = { fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" };
const statsWrap: React.CSSProperties = { borderTop: "1px solid rgba(255,255,255,0.08)", padding: 16, background: "rgba(0,0,0,0.15)" };
const btnCriar: React.CSSProperties = { padding: "10px 16px", backgroundColor: BLUE, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" };
const contadorBtn: React.CSSProperties = { marginTop: 4, background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 11, color: "rgba(255,255,255,0.55)" };
const inputStyle: React.CSSProperties = { padding: "10px 12px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", minWidth: 0 };
const miniButtonStyle: React.CSSProperties = { padding: "8px 12px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#fff", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" };
const axis = { stroke: "rgba(255,255,255,0.3)", fontSize: 10, tickLine: false } as const;
const ttip = { contentStyle: { background: "#0c1218", border: "1px solid rgba(0,174,239,0.25)", borderRadius: 8, fontSize: 12, color: "#fff" }, cursor: { fill: "rgba(0,174,239,0.06)" } } as const;
const chartM = { top: 8, right: 8, left: -18, bottom: 0 };
