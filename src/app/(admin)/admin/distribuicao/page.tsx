"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

/**
 * Distribuição de Leads (Kommo) — leads do funil de distribuição enviados às imobiliárias.
 * Empreendimento = funil/estágio no Kommo; imobiliária = tag do lead.
 */

interface Lead {
  id: number;
  pipeline_nome: string | null;
  status_nome: string | null;
  responsavel_nome: string | null;
  tags: string[] | null;
  created_at: string | null;
}

const AZUL = "#00aeef";

const fmtLocal = (dt: Date) =>
  `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
const fmtInt = (n: number) => Math.round(n).toLocaleString("pt-BR");
function fmtData(d: string) {
  const [y, m, dd] = d.split("-");
  return `${dd}/${m}/${y}`;
}

// "Distribuição Salsa" -> "Salsa"; "Distribuição" -> "Distribuição"
function limpaFunil(nome: string) {
  const limpo = nome.replace(/distribui[çc][ãa]o|distribui[çc][õo]es/gi, "").replace(/^[\s\-–—|:·]+|[\s\-–—|:·]+$/g, "");
  return limpo || nome;
}

interface Linha {
  nome: string;
  total: number;
  ontem: number;
  d7: number;
}

function agrupa(leads: Lead[], chaves: (l: Lead) => string[], ontem: string, corte7: string): Linha[] {
  const m = new Map<string, Linha>();
  for (const l of leads) {
    const dia = l.created_at ? fmtLocal(new Date(l.created_at)) : null;
    for (const k of chaves(l)) {
      const o = m.get(k) || { nome: k, total: 0, ontem: 0, d7: 0 };
      o.total += 1;
      if (dia === ontem) o.ontem += 1;
      if (dia && dia >= corte7) o.d7 += 1;
      m.set(k, o);
    }
  }
  return [...m.values()].sort((a, b) => b.total - a.total);
}

export default function DistribuicaoPage() {
  const supabase = createClient();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEmp, setFiltroEmp] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [syncErro, setSyncErro] = useState(false);

  async function load() {
    setLoading(true);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const { data } = await (supabase.from("kommo_distribuicao_leads") as any)
      .select("id, pipeline_nome, status_nome, responsavel_nome, tags, created_at")
      .order("created_at", { ascending: false })
      .limit(50000);
    /* eslint-enable @typescript-eslint/no-explicit-any */
    setLeads((data as Lead[]) || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sincronizar(backfill = false) {
    setSyncing(true);
    setSyncMsg(null);
    setSyncErro(false);
    try {
      const res = await fetch(`/api/kommo/distribuicao/sync${backfill ? "?backfill=1" : ""}`, { method: "POST" });
      const json = await res.json();
      if (json.ok) {
        setSyncMsg(`Sincronizado: ${fmtInt(json.leads)} leads de ${json.funis?.length || 0} funil(is).`);
        load();
      } else {
        setSyncErro(true);
        setSyncMsg(json.error || "Falha ao sincronizar.");
      }
    } catch (e) {
      setSyncErro(true);
      setSyncMsg(e instanceof Error ? e.message : "Erro de rede.");
    }
    setSyncing(false);
  }

  // Datas de referência (fuso local)
  const hoje = fmtLocal(new Date());
  const ontem = fmtLocal(new Date(Date.now() - 864e5));
  const corte7 = fmtLocal(new Date(Date.now() - 6 * 864e5)); // últimos 7 dias incluindo hoje

  // Empreendimento: se há vários funis de distribuição, usa o nome do funil; senão, o estágio
  const usaFunil = useMemo(() => new Set(leads.map((l) => l.pipeline_nome).filter(Boolean)).size > 1, [leads]);
  const empDe = (l: Lead) => (usaFunil ? limpaFunil(l.pipeline_nome || "—") : l.status_nome || "—");

  const empreendimentos = useMemo(() => [...new Set(leads.map(empDe))].sort(), [leads, usaFunil]); // eslint-disable-line react-hooks/exhaustive-deps

  // Base filtrada (cards, gráfico, imobiliárias e responsáveis respeitam o filtro)
  const base = useMemo(() => (filtroEmp ? leads.filter((l) => empDe(l) === filtroEmp) : leads), [leads, filtroEmp, usaFunil]); // eslint-disable-line react-hooks/exhaustive-deps

  const cards = useMemo(() => {
    let total = 0, nHoje = 0, nOntem = 0, n7 = 0;
    for (const l of base) {
      total += 1;
      const dia = l.created_at ? fmtLocal(new Date(l.created_at)) : null;
      if (dia === hoje) nHoje += 1;
      if (dia === ontem) nOntem += 1;
      if (dia && dia >= corte7) n7 += 1;
    }
    const imobs = new Set(base.flatMap((l) => l.tags || []));
    return { total, nHoje, nOntem, n7, imobs: imobs.size };
  }, [base, hoje, ontem, corte7]);

  const porEmp = useMemo(() => agrupa(leads, (l) => [empDe(l)], ontem, corte7), [leads, ontem, corte7, usaFunil]); // eslint-disable-line react-hooks/exhaustive-deps
  const porImob = useMemo(
    () => agrupa(base, (l) => (l.tags && l.tags.length > 0 ? l.tags : ["Sem tag"]), ontem, corte7),
    [base, ontem, corte7]
  );
  const porResp = useMemo(() => agrupa(base, (l) => [l.responsavel_nome || "Sem responsável"], ontem, corte7), [base, ontem, corte7]);

  // Leads por dia — últimos 30 dias (preenche dias vazios)
  const porDia = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of base) {
      if (!l.created_at) continue;
      const dia = fmtLocal(new Date(l.created_at));
      m.set(dia, (m.get(dia) || 0) + 1);
    }
    const out: { dia: string; label: string; leads: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 864e5);
      const key = fmtLocal(d);
      out.push({ dia: key, label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`, leads: m.get(key) || 0 });
    }
    return out;
  }, [base]);

  if (loading) return <div style={{ padding: 40, color: "#fff" }}>Carregando…</div>;

  return (
    <div style={page}>
      {/* Header */}
      <div style={hero}>
        <div>
          <span style={kicker}>Kommo CRM</span>
          <h1 style={heroTitle}>Distribuição de Leads</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
            Leads distribuídos às imobiliárias por empreendimento
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {empreendimentos.length > 1 && (
            <select value={filtroEmp} onChange={(e) => setFiltroEmp(e.target.value)} style={selectLight}>
              <option value="" style={{ background: "#0c1c3a" }}>Todos os empreendimentos</option>
              {empreendimentos.map((e) => (
                <option key={e} value={e} style={{ background: "#0c1c3a" }}>{e}</option>
              ))}
            </select>
          )}
          <button onClick={() => sincronizar(false)} disabled={syncing} style={{ ...btnPrimary, opacity: syncing ? 0.6 : 1 }}>
            {syncing ? "Sincronizando…" : "Sincronizar"}
          </button>
        </div>
      </div>

      {syncMsg && (
        <div style={{ ...card, marginBottom: 18, padding: "12px 16px", fontSize: 13, color: syncErro ? "#d9534f" : "#2e7d52" }}>
          {syncMsg}
        </div>
      )}

      {leads.length === 0 ? (
        <div style={{ ...card, textAlign: "center", color: "#5b6573" }}>
          <p style={{ marginBottom: 14 }}>Nenhum lead sincronizado ainda.</p>
          <button onClick={() => sincronizar(true)} disabled={syncing} style={{ ...btnPrimary, background: "#0c1c3a" }}>
            {syncing ? "Importando…" : "Fazer primeira carga (backfill)"}
          </button>
        </div>
      ) : (
        <>
          {/* Cards */}
          <div style={cardsGrid}>
            <StatCard label="Leads distribuídos" valor={fmtInt(cards.total)} destaque />
            <StatCard label="Hoje" valor={fmtInt(cards.nHoje)} />
            <StatCard label={`Ontem (${fmtData(ontem).slice(0, 5)})`} valor={fmtInt(cards.nOntem)} cor={AZUL} />
            <StatCard label="Últimos 7 dias" valor={fmtInt(cards.n7)} cor={AZUL} />
            <StatCard label="Imobiliárias (tags)" valor={fmtInt(cards.imobs)} />
          </div>

          {/* Leads por dia */}
          <div style={{ ...card, marginBottom: 18 }}>
            <h2 style={secTitle}>Leads por dia · últimos 30 dias{filtroEmp ? ` · ${filtroEmp}` : ""}</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={porDia} margin={{ top: 10, right: 14, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" />
                <XAxis dataKey="label" stroke="#9aa3ad" fontSize={10} tickLine={false} interval={2} />
                <YAxis stroke="#9aa3ad" fontSize={11} tickLine={false} width={34} allowDecimals={false} />
                <Tooltip formatter={(v) => [v, "Leads"]} labelFormatter={(l) => `Dia ${l}`} />
                <Bar dataKey="leads" fill={AZUL} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={duasColunas}>
            {/* Por empreendimento */}
            <div style={card}>
              <h2 style={secTitle}>Por empreendimento</h2>
              <Tabela linhas={porEmp} nomeCol="Empreendimento" />
            </div>

            {/* Por imobiliária */}
            <div style={card}>
              <h2 style={secTitle}>Por imobiliária{filtroEmp ? ` · ${filtroEmp}` : ""}</h2>
              <Tabela linhas={porImob} nomeCol="Imobiliária" />
            </div>
          </div>

          {/* Por responsável */}
          {porResp.length > 1 && (
            <div style={{ ...card, marginTop: 18 }}>
              <h2 style={secTitle}>Por responsável{filtroEmp ? ` · ${filtroEmp}` : ""}</h2>
              <Tabela linhas={porResp} nomeCol="Responsável" />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, valor, cor, destaque }: { label: string; valor: string; cor?: string; destaque?: boolean }) {
  return (
    <div style={{ ...card, padding: "16px 18px", textAlign: "center" }}>
      <div style={{ fontSize: destaque ? 26 : 22, fontWeight: 700, color: cor || "#0c1c3a", fontFamily: "var(--font-playfair)" }}>{valor}</div>
      <div style={{ fontSize: 11, color: "#8a93a0", textTransform: "uppercase", letterSpacing: "0.4px", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function Tabela({ linhas, nomeCol }: { linhas: Linha[]; nomeCol: string }) {
  const max = Math.max(1, ...linhas.map((l) => l.total));
  return (
    <div>
      <div style={{ ...tRow, fontSize: 10.5, color: "#8a93a0", textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: "1px solid #eef1f5" }}>
        <span>{nomeCol}</span>
        <span style={tNum}>Total</span>
        <span style={tNum}>Ontem</span>
        <span style={tNum}>7 dias</span>
      </div>
      <div style={{ maxHeight: 420, overflowY: "auto" }}>
        {linhas.map((l) => (
          <div key={l.nome} style={{ ...tRow, borderBottom: "1px solid #f3f5f8", position: "relative" }}>
            <span style={{ color: "#0c1c3a", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={l.nome}>
              {l.nome}
            </span>
            <span style={{ ...tNum, fontWeight: 700, color: "#0c1c3a" }}>{fmtInt(l.total)}</span>
            <span style={{ ...tNum, color: l.ontem > 0 ? AZUL : "#9aa3ad", fontWeight: l.ontem > 0 ? 700 : 400 }}>{l.ontem > 0 ? `+${l.ontem}` : "—"}</span>
            <span style={{ ...tNum, color: l.d7 > 0 ? "#0c1c3a" : "#9aa3ad" }}>{l.d7 > 0 ? l.d7 : "—"}</span>
            <div style={{ position: "absolute", left: 0, bottom: 0, height: 2, width: `${(l.total / max) * 100}%`, background: "rgba(0,174,239,0.35)", borderRadius: 2 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- estilos ----------
const page: React.CSSProperties = { background: "#eef1f5", borderRadius: 16, padding: 20, margin: "-8px 0", color: "#1a2332" };
const hero: React.CSSProperties = {
  background: "linear-gradient(135deg, #0c1c3a 0%, #13294d 100%)",
  borderRadius: 14,
  padding: "22px 24px",
  marginBottom: 18,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
};
const kicker: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: AZUL, textTransform: "uppercase", letterSpacing: "1.5px" };
const heroTitle: React.CSSProperties = { fontFamily: "var(--font-playfair)", fontSize: 28, fontWeight: 500, color: "#fff", margin: "4px 0 0" };
const card: React.CSSProperties = { background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(12,28,58,0.08)" };
const secTitle: React.CSSProperties = { fontSize: 14, fontWeight: 700, color: "#0c1c3a", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.5px" };
const cardsGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 18 };
const duasColunas: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 18 };
const tRow: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 64px 64px 64px", gap: 8, padding: "9px 10px", fontSize: 13, alignItems: "center" };
const tNum: React.CSSProperties = { textAlign: "right", fontVariantNumeric: "tabular-nums" };
const selectLight: React.CSSProperties = { padding: "9px 12px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 9, color: "#fff", fontSize: 13, outline: "none", colorScheme: "dark" };
const btnPrimary: React.CSSProperties = { padding: "9px 18px", background: AZUL, color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" };
