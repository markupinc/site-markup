"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  LineChart,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface Insight {
  data: string;
  campaign_id: string;
  campaign_name: string | null;
  objetivo: string | null;
  bucket: string;
  gasto: number;
  impressoes: number;
  alcance: number;
  frequencia: number;
  cliques: number;
  ctr: number;
  cpc: number;
  cpm: number;
  leads: number;
  custo_por_lead: number | null;
  moeda: string;
}

interface Seguidor {
  data: string;
  plataforma: string;
  seguidores_total: number | null;
  novos_seguidores: number | null;
  alcance: number | null;
}

interface SyncLog {
  tipo: string;
  status: string;
  mensagem: string | null;
  executado_em: string;
}

const RANGES = [
  { label: "Últimos 7 dias", value: 7 },
  { label: "Últimos 14 dias", value: 14 },
  { label: "Últimos 30 dias", value: 30 },
];

const BUCKET_LABEL: Record<string, string> = {
  lead: "Geração de leads",
  reconhecimento: "Reconhecimento",
  outro: "Outros objetivos",
};

export default function MarketingPage() {
  const supabase = createClient();
  const [range, setRange] = useState(14);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [seguidores, setSeguidores] = useState<Seguidor[]>([]);
  const [syncLog, setSyncLog] = useState<SyncLog[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErro(null);

      const sinceDate = new Date(Date.now() - range * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

      /* eslint-disable @typescript-eslint/no-explicit-any */
      const [insRes, segRes, logRes] = await Promise.all([
        (supabase.from("meta_campanha_insights") as any)
          .select("*")
          .gte("data", sinceDate)
          .order("data", { ascending: true }),
        (supabase.from("meta_seguidores") as any)
          .select("*")
          .gte("data", sinceDate)
          .order("data", { ascending: true }),
        (supabase.from("meta_sync_log") as any)
          .select("tipo, status, mensagem, executado_em")
          .order("executado_em", { ascending: false })
          .limit(10),
      ]);
      /* eslint-enable @typescript-eslint/no-explicit-any */

      if (insRes.error) {
        setErro(insRes.error.message);
        setLoading(false);
        return;
      }

      setInsights((insRes.data as Insight[]) || []);
      setSeguidores((segRes.data as Seguidor[]) || []);
      setSyncLog((logRes.data as SyncLog[]) || []);
      setLoading(false);
    }
    load();
  }, [range]);

  // ---- Agregações -----------------------------------------------------------
  const totals = useMemo(() => {
    let gasto = 0,
      imp = 0,
      clq = 0,
      leads = 0;
    insights.forEach((r) => {
      gasto += Number(r.gasto) || 0;
      imp += Number(r.impressoes) || 0;
      clq += Number(r.cliques) || 0;
      leads += Number(r.leads) || 0;
    });
    return {
      gasto,
      imp,
      clq,
      leads,
      ctr: imp > 0 ? (clq / imp) * 100 : 0,
      cpl: leads > 0 ? gasto / leads : null,
      moeda: insights[0]?.moeda || "BRL",
    };
  }, [insights]);

  const porBucket = useMemo(() => {
    const m = new Map<string, { gasto: number; leads: number; alc: number }>();
    insights.forEach((r) => {
      const b = r.bucket || "outro";
      const o = m.get(b) || { gasto: 0, leads: 0, alc: 0 };
      o.gasto += Number(r.gasto) || 0;
      o.leads += Number(r.leads) || 0;
      o.alc += Number(r.alcance) || 0;
      m.set(b, o);
    });
    return m;
  }, [insights]);

  const campanhas = useMemo(() => {
    const m = new Map<
      string,
      {
        campaign_id: string;
        nome: string | null;
        bucket: string;
        gasto: number;
        leads: number;
        imp: number;
        clq: number;
      }
    >();
    insights.forEach((r) => {
      const o = m.get(r.campaign_id) || {
        campaign_id: r.campaign_id,
        nome: r.campaign_name,
        bucket: r.bucket,
        gasto: 0,
        leads: 0,
        imp: 0,
        clq: 0,
      };
      o.gasto += Number(r.gasto) || 0;
      o.leads += Number(r.leads) || 0;
      o.imp += Number(r.impressoes) || 0;
      o.clq += Number(r.cliques) || 0;
      if (!o.nome) o.nome = r.campaign_name;
      m.set(r.campaign_id, o);
    });
    return [...m.values()]
      .map((o) => ({
        ...o,
        cpl: o.leads > 0 ? o.gasto / o.leads : null,
        ctr: o.imp > 0 ? (o.clq / o.imp) * 100 : 0,
      }))
      .sort((a, b) => b.gasto - a.gasto);
  }, [insights]);

  const porDia = useMemo(() => {
    const m = new Map<string, { data: string; gasto: number; leads: number }>();
    insights.forEach((r) => {
      const o = m.get(r.data) || { data: r.data, gasto: 0, leads: 0 };
      o.gasto += Number(r.gasto) || 0;
      o.leads += Number(r.leads) || 0;
      m.set(r.data, o);
    });
    return [...m.values()]
      .sort((a, b) => a.data.localeCompare(b.data))
      .map((d) => ({ ...d, label: diaLabel(d.data) }));
  }, [insights]);

  const ig = useMemo(
    () =>
      seguidores
        .filter((s) => s.plataforma === "instagram")
        .sort((a, b) => a.data.localeCompare(b.data))
        .map((s) => ({ ...s, label: diaLabel(s.data) })),
    [seguidores]
  );
  const fb = useMemo(
    () =>
      seguidores
        .filter((s) => s.plataforma === "facebook")
        .sort((a, b) => a.data.localeCompare(b.data)),
    [seguidores]
  );
  const igAtual = ig[ig.length - 1];
  const fbAtual = fb[fb.length - 1];

  const ultimaSync = syncLog[0];
  const semDados = !loading && !erro && insights.length === 0 && seguidores.length === 0;
  const m = totals.moeda;

  return (
    <div>
      {/* Header */}
      <div style={headerRow}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 300, color: "#fff", marginBottom: 8 }}>
            Marketing
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            Desempenho do Meta Ads e crescimento no Instagram. Dados em cache,
            atualizados a cada sincronização.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {ultimaSync && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              <span
                style={{
                  display: "inline-block",
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  backgroundColor: ultimaSync.status === "ok" ? "#4caf7d" : "#d9737a",
                  marginRight: 6,
                }}
              />
              sync {tempoRelativo(ultimaSync.executado_em)}
            </span>
          )}
          <select
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
            style={{ ...inputStyle, colorScheme: "dark", minWidth: 160 }}
          >
            {RANGES.map((r) => (
              <option key={r.value} value={r.value} style={optionStyle}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Avisos de setup */}
      {erro && (
        <Aviso tom="erro">
          Não foi possível ler as métricas: <code>{erro}</code>.{" "}
          {/relation|does not exist|não existe/i.test(erro)
            ? "As tabelas ainda não existem — aplique a migration 006_meta_metrics.sql no Supabase."
            : "Verifique as permissões/RLS."}
        </Aviso>
      )}
      {semDados && (
        <Aviso tom="info">
          Aguardando a primeira sincronização com a Meta. Confirme as variáveis de
          ambiente e dispare <code>/api/meta/sync</code> (o agendador faz isso
          automaticamente a cada ~15 min).
        </Aviso>
      )}

      {/* Cards de totais */}
      <div style={cardGrid}>
        <Card label={`Investimento (${m})`} value={brl(totals.gasto, m)} loading={loading} />
        <Card label="Impressões" value={int(totals.imp)} loading={loading} />
        <Card label="Cliques" value={int(totals.clq)} loading={loading} />
        <Card label="CTR médio" value={`${totals.ctr.toFixed(2)}%`} loading={loading} />
        <Card label="Leads (Meta)" value={int(totals.leads)} loading={loading} accent />
        <Card
          label="Custo por lead"
          value={totals.cpl != null ? brl(totals.cpl, m) : "—"}
          loading={loading}
          accent
        />
      </div>

      {/* Split por objetivo */}
      <div style={{ ...twoCol, marginTop: 8 }}>
        <ObjetivoCard
          titulo={BUCKET_LABEL.lead}
          dados={porBucket.get("lead")}
          moeda={m}
          metricaLabel="Leads"
          metrica={porBucket.get("lead")?.leads ?? 0}
        />
        <ObjetivoCard
          titulo={BUCKET_LABEL.reconhecimento}
          dados={porBucket.get("reconhecimento")}
          moeda={m}
          metricaLabel="Alcance"
          metrica={porBucket.get("reconhecimento")?.alc ?? 0}
        />
      </div>

      {/* Gráfico investimento × leads por dia */}
      <Section title="Investimento e leads por dia">
        {porDia.length === 0 ? (
          <Vazio loading={loading} />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={porDia} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={11} />
              <YAxis yAxisId="l" stroke="rgba(255,255,255,0.3)" fontSize={11} />
              <YAxis yAxisId="r" orientation="right" stroke="rgba(255,255,255,0.3)" fontSize={11} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) => {
                  const v = Number(Array.isArray(value) ? value[0] : value);
                  return (
                    name === "Investimento"
                      ? [brl(v, m), String(name)]
                      : [int(v), String(name)]
                  ) as [string, string];
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="l" dataKey="gasto" name="Investimento" fill="#b8945f" radius={[4, 4, 0, 0]} />
              <Line yAxisId="r" dataKey="leads" name="Leads" stroke="#5b9bd5" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* Tabela por campanha */}
      <Section title="Por campanha">
        {campanhas.length === 0 ? (
          <Vazio loading={loading} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ color: "rgba(255,255,255,0.5)", textAlign: "left" }}>
                  <th style={th}>Campanha</th>
                  <th style={th}>Objetivo</th>
                  <th style={thNum}>Investimento</th>
                  <th style={thNum}>Leads</th>
                  <th style={thNum}>CPL</th>
                  <th style={thNum}>CTR</th>
                </tr>
              </thead>
              <tbody>
                {campanhas.map((c) => (
                  <tr key={c.campaign_id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <td style={{ ...td, color: "#fff", maxWidth: 260 }} title={c.nome || c.campaign_id}>
                      <span style={ellipsis}>{c.nome || c.campaign_id}</span>
                    </td>
                    <td style={td}>
                      <Tag bucket={c.bucket} />
                    </td>
                    <td style={tdNum}>{brl(c.gasto, m)}</td>
                    <td style={tdNum}>{int(c.leads)}</td>
                    <td style={tdNum}>{c.cpl != null ? brl(c.cpl, m) : "—"}</td>
                    <td style={tdNum}>{c.ctr.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Instagram */}
      <h2 style={{ fontSize: 16, fontWeight: 500, color: "#fff", margin: "32px 0 16px" }}>
        Instagram
      </h2>
      <div style={cardGrid}>
        <Card
          label="Seguidores (Instagram)"
          value={igAtual?.seguidores_total != null ? int(igAtual.seguidores_total) : "—"}
          loading={loading}
          accent
        />
        <Card
          label="Novos seguidores (último dia)"
          value={igAtual?.novos_seguidores != null ? int(igAtual.novos_seguidores) : "—"}
          loading={loading}
        />
        <Card
          label="Alcance IG (último dia)"
          value={igAtual?.alcance != null ? int(igAtual.alcance) : "—"}
          loading={loading}
        />
        <Card
          label="Seguidores (Facebook)"
          value={fbAtual?.seguidores_total != null ? int(fbAtual.seguidores_total) : "—"}
          loading={loading}
        />
      </div>

      <div style={twoCol}>
        <Section title="Crescimento de seguidores (Instagram)">
          {ig.length === 0 ? (
            <Vazio loading={loading} />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={ig} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} domain={["auto", "auto"]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line dataKey="seguidores_total" name="Seguidores" stroke="#b8945f" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Section>

        <Section title="Novos seguidores por dia (Instagram)">
          {ig.length === 0 ? (
            <Vazio loading={loading} />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ig} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="novos_seguidores" name="Novos seguidores" fill="#5b9bd5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>
      </div>

      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 24 }}>
        Os números de hoje ainda estão sendo consolidados pela Meta (atraso de
        ~15–30 min); dias fechados são definitivos.
      </p>
    </div>
  );
}

// ---- Componentes ------------------------------------------------------------

function Card({
  label,
  value,
  loading,
  accent,
}: {
  label: string;
  value: string;
  loading: boolean;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        backgroundColor: "rgba(255,255,255,0.04)",
        border: `1px solid ${accent ? "rgba(184,148,95,0.3)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 12,
        padding: 20,
      }}
    >
      <p style={cardLabel}>{label}</p>
      <p style={{ fontSize: 26, color: accent ? "#b8945f" : "#fff", fontWeight: 300, margin: 0 }}>
        {loading ? "—" : value}
      </p>
    </div>
  );
}

function ObjetivoCard({
  titulo,
  dados,
  moeda,
  metricaLabel,
  metrica,
}: {
  titulo: string;
  dados?: { gasto: number; leads: number; alc: number };
  moeda: string;
  metricaLabel: string;
  metrica: number;
}) {
  return (
    <div
      style={{
        backgroundColor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: 20,
      }}
    >
      <p style={cardLabel}>{titulo}</p>
      <div style={{ display: "flex", gap: 24, marginTop: 8 }}>
        <div>
          <p style={miniLabel}>Investimento</p>
          <p style={miniValue}>{dados ? brl(dados.gasto, moeda) : "—"}</p>
        </div>
        <div>
          <p style={miniLabel}>{metricaLabel}</p>
          <p style={miniValue}>{int(metrica)}</p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: 20,
        marginTop: 16,
      }}
    >
      <h2 style={{ fontSize: 14, fontWeight: 500, color: "#fff", marginBottom: 16 }}>{title}</h2>
      {children}
    </div>
  );
}

function Aviso({ tom, children }: { tom: "erro" | "info"; children: React.ReactNode }) {
  const cor = tom === "erro" ? "217,115,122" : "184,148,95";
  return (
    <div
      style={{
        backgroundColor: `rgba(${cor},0.08)`,
        border: `1px solid rgba(${cor},0.25)`,
        borderRadius: 8,
        padding: "12px 16px",
        marginBottom: 24,
        fontSize: 12,
        color: "rgba(255,255,255,0.75)",
      }}
    >
      {children}
    </div>
  );
}

function Tag({ bucket }: { bucket: string }) {
  const map: Record<string, string> = {
    lead: "184,148,95",
    reconhecimento: "91,155,213",
    outro: "255,255,255",
  };
  const cor = map[bucket] || map.outro;
  return (
    <span
      style={{
        fontSize: 11,
        color: `rgb(${cor})`,
        backgroundColor: `rgba(${cor},0.12)`,
        border: `1px solid rgba(${cor},0.25)`,
        borderRadius: 999,
        padding: "2px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {BUCKET_LABEL[bucket] || bucket}
    </span>
  );
}

function Vazio({ loading }: { loading: boolean }) {
  return (
    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
      {loading ? "Carregando..." : "Sem dados no período."}
    </p>
  );
}

// ---- Helpers ----------------------------------------------------------------

function brl(n: number, moeda: string) {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda }).format(n);
  } catch {
    return `${moeda} ${n.toFixed(2)}`;
  }
}
const int = (n: number) => Math.round(n).toLocaleString("pt-BR");

function diaLabel(dateStr: string) {
  const [, mo, d] = dateStr.split("-");
  return `${d}/${mo}`;
}

function tempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

// ---- Estilos ----------------------------------------------------------------

const headerRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  marginBottom: 32,
  flexWrap: "wrap",
};

const cardGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
  marginBottom: 16,
};

const twoCol: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
  gap: 16,
};

const cardLabel: React.CSSProperties = {
  fontSize: 11,
  color: "rgba(255,255,255,0.5)",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: 8,
};

const miniLabel: React.CSSProperties = { fontSize: 10, color: "rgba(255,255,255,0.4)", margin: 0 };
const miniValue: React.CSSProperties = { fontSize: 20, color: "#fff", fontWeight: 300, margin: "2px 0 0" };

const th: React.CSSProperties = { padding: "8px 8px", fontWeight: 500 };
const thNum: React.CSSProperties = { ...th, textAlign: "right" };
const td: React.CSSProperties = { padding: "10px 8px", color: "rgba(255,255,255,0.85)" };
const tdNum: React.CSSProperties = { ...td, textAlign: "right", whiteSpace: "nowrap" };
const ellipsis: React.CSSProperties = {
  display: "block",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "#1a1a1a",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  fontSize: 12,
  color: "#fff",
};

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "#fff",
  fontSize: 13,
  outline: "none",
};

const optionStyle: React.CSSProperties = { backgroundColor: "#1a1a1a", color: "#fff" };
