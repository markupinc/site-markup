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
  bucket: string;
  produto: string;
  gasto: number;
  impressoes: number;
  alcance: number;
  cliques: number;
  ctr: number;
  leads: number;
  visitas_perfil: number;
  moeda: string;
}
interface Seguidor {
  data: string;
  plataforma: string;
  seguidores_total: number | null;
  novos_seguidores: number | null;
  alcance: number | null;
  views: number | null;
  profile_views: number | null;
}
interface SyncLog {
  status: string;
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
  social: "Post do Instagram",
  trafego: "Tráfego",
  outro: "Outros",
};
const PRODUTO_LABEL: Record<string, string> = { salsa: "Salsa", up: "Up!", outro: "Outros" };

export default function MarketingPage() {
  const supabase = createClient();
  const [range, setRange] = useState(30);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [seguidores, setSeguidores] = useState<Seguidor[]>([]);
  const [syncLog, setSyncLog] = useState<SyncLog[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErro(null);
      const since = new Date(Date.now() - range * 864e5).toISOString().slice(0, 10);
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const [insRes, segRes, logRes] = await Promise.all([
        (supabase.from("meta_campanha_insights") as any).select("*").gte("data", since).order("data"),
        (supabase.from("meta_seguidores") as any).select("*").gte("data", since).order("data"),
        (supabase.from("meta_sync_log") as any)
          .select("status, executado_em")
          .order("executado_em", { ascending: false })
          .limit(1),
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

  // ---- Agregações ----
  const t = useMemo(() => {
    const s = { gasto: 0, imp: 0, clq: 0, alc: 0, leads: 0 };
    insights.forEach((r) => {
      s.gasto += +r.gasto || 0;
      s.imp += +r.impressoes || 0;
      s.clq += +r.cliques || 0;
      s.alc += +r.alcance || 0;
      s.leads += +r.leads || 0;
    });
    return { ...s, ctr: s.imp > 0 ? (s.clq / s.imp) * 100 : 0, moeda: insights[0]?.moeda || "BRL" };
  }, [insights]);

  const lead = useMemo(() => {
    const rows = insights.filter((r) => r.bucket === "lead");
    const gasto = rows.reduce((a, r) => a + (+r.gasto || 0), 0);
    const leads = rows.reduce((a, r) => a + (+r.leads || 0), 0);
    const porProduto = (["salsa", "up", "outro"] as const).map((p) => {
      const pr = rows.filter((r) => r.produto === p);
      const g = pr.reduce((a, r) => a + (+r.gasto || 0), 0);
      const l = pr.reduce((a, r) => a + (+r.leads || 0), 0);
      return { produto: p, gasto: g, leads: l, cpl: l > 0 ? g / l : null };
    });
    return { gasto, leads, cpl: leads > 0 ? gasto / leads : null, porProduto };
  }, [insights]);

  const social = useMemo(() => {
    const rows = insights.filter((r) => r.bucket === "social");
    const gasto = rows.reduce((a, r) => a + (+r.gasto || 0), 0);
    const visitas = rows.reduce((a, r) => a + (+r.visitas_perfil || 0), 0);
    // agrega por campanha
    const m = new Map<string, { nome: string | null; gasto: number; visitas: number }>();
    rows.forEach((r) => {
      const o = m.get(r.campaign_id) || { nome: r.campaign_name, gasto: 0, visitas: 0 };
      o.gasto += +r.gasto || 0;
      o.visitas += +r.visitas_perfil || 0;
      if (!o.nome) o.nome = r.campaign_name;
      m.set(r.campaign_id, o);
    });
    const campanhas = [...m.values()]
      .map((o) => ({ ...o, custoVisita: o.visitas > 0 ? o.gasto / o.visitas : null }))
      .sort((a, b) => b.gasto - a.gasto);
    return { gasto, visitas, custoVisita: visitas > 0 ? gasto / visitas : null, campanhas };
  }, [insights]);

  const reconh = useMemo(() => {
    const rows = insights.filter((r) => r.bucket === "reconhecimento");
    return {
      gasto: rows.reduce((a, r) => a + (+r.gasto || 0), 0),
      alc: rows.reduce((a, r) => a + (+r.alcance || 0), 0),
    };
  }, [insights]);

  const porDia = useMemo(() => {
    const m = new Map<string, { data: string; gasto: number; leads: number }>();
    insights.forEach((r) => {
      const o = m.get(r.data) || { data: r.data, gasto: 0, leads: 0 };
      o.gasto += +r.gasto || 0;
      o.leads += +r.leads || 0;
      m.set(r.data, o);
    });
    return [...m.values()].sort((a, b) => a.data.localeCompare(b.data)).map((d) => ({ ...d, label: dia(d.data) }));
  }, [insights]);

  // Instagram orgânico
  const ig = useMemo(() => {
    const rows = seguidores.filter((s) => s.plataforma === "instagram").sort((a, b) => a.data.localeCompare(b.data));
    let acc = 0;
    const serie = rows.map((s) => {
      acc += +(s.novos_seguidores || 0);
      return {
        data: s.data,
        label: dia(s.data),
        novos: s.novos_seguidores ?? 0,
        acumulado: acc,
        alcance: s.alcance ?? null,
        views: s.views ?? null,
        profile_views: s.profile_views ?? null,
      };
    });
    const totalAtual = [...rows].reverse().find((s) => s.seguidores_total != null)?.seguidores_total ?? null;
    const novosPeriodo = rows.reduce((a, s) => a + (+(s.novos_seguidores || 0)), 0);
    const viewsPeriodo = rows.reduce((a, s) => a + (+(s.views || 0)), 0);
    const visitasPeriodo = rows.reduce((a, s) => a + (+(s.profile_views || 0)), 0);
    return { serie, totalAtual, novosPeriodo, viewsPeriodo, visitasPeriodo };
  }, [seguidores]);

  const fbAtual = useMemo(
    () =>
      [...seguidores.filter((s) => s.plataforma === "facebook")].reverse().find((s) => s.seguidores_total != null)
        ?.seguidores_total ?? null,
    [seguidores]
  );

  // custo por seguidor (blended, estimativa): gasto social ÷ novos seguidores no período
  const custoSeguidorBlended = ig.novosPeriodo > 0 ? social.gasto / ig.novosPeriodo : null;

  const ultimaSync = syncLog[0];
  const semDados = !loading && !erro && insights.length === 0 && seguidores.length === 0;
  const m = t.moeda;

  return (
    <div>
      <div style={headerRow}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 300, color: "#fff", marginBottom: 8 }}>Marketing</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            Meta Ads + Instagram. Dados em cache, atualizados a cada sincronização.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {ultimaSync && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              <span
                style={{
                  display: "inline-block",
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: ultimaSync.status === "ok" ? "#4caf7d" : "#d9737a",
                  marginRight: 6,
                }}
              />
              sync {rel(ultimaSync.executado_em)}
            </span>
          )}
          <select value={range} onChange={(e) => setRange(+e.target.value)} style={{ ...input, colorScheme: "dark" }}>
            {RANGES.map((r) => (
              <option key={r.value} value={r.value} style={{ background: "#1a1a1a" }}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {erro && (
        <Aviso tom="erro">
          Erro ao ler métricas: <code>{erro}</code>.{" "}
          {/relation|exist|não existe/i.test(erro) ? "Aplique a migration 007_meta_metrics_v2.sql." : ""}
        </Aviso>
      )}
      {semDados && (
        <Aviso tom="info">
          Sem dados ainda. Rode <code>/api/meta/sync?backfill=30</code> para popular o histórico do mês.
        </Aviso>
      )}

      {/* Totais gerais */}
      <H>Visão geral</H>
      <div style={grid}>
        <Card label={`Investimento (${m})`} value={brl(t.gasto, m)} loading={loading} />
        <Card label="Impressões" value={int(t.imp)} loading={loading} />
        <Card label="Cliques" value={int(t.clq)} loading={loading} />
        <Card label="CTR médio" value={`${t.ctr.toFixed(2)}%`} loading={loading} />
        <Card label="Leads (Meta)" value={int(t.leads)} loading={loading} accent />
      </div>

      {/* Leads */}
      <H>Geração de leads</H>
      <div style={grid}>
        <Card label="Leads (campanhas de lead)" value={int(lead.leads)} loading={loading} accent />
        <Card label="Investimento em lead" value={brl(lead.gasto, m)} loading={loading} />
        <Card
          label="Custo por lead"
          sub="só campanhas de lead"
          value={lead.cpl != null ? brl(lead.cpl, m) : "—"}
          loading={loading}
          accent
        />
      </div>
      <div style={{ ...grid, marginTop: 8 }}>
        {lead.porProduto
          .filter((p) => p.produto !== "outro" || p.leads > 0)
          .map((p) => (
            <div key={p.produto} style={cardBox(true)}>
              <p style={cardLabel}>{PRODUTO_LABEL[p.produto]} — leads</p>
              <p style={{ fontSize: 26, color: "#b8945f", fontWeight: 300, margin: "0 0 8px" }}>{int(p.leads)}</p>
              <div style={{ display: "flex", gap: 20, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                <span>Inv.: {brl(p.gasto, m)}</span>
                <span>CPL: {p.cpl != null ? brl(p.cpl, m) : "—"}</span>
              </div>
            </div>
          ))}
      </div>

      {/* Reconhecimento */}
      <H>Reconhecimento</H>
      <div style={grid}>
        <Card label="Investimento" value={brl(reconh.gasto, m)} loading={loading} />
        <Card label="Alcance (soma diária)" value={int(reconh.alc)} loading={loading} />
      </div>

      {/* Posts do Instagram */}
      <H>Posts do Instagram (impulsionados)</H>
      <div style={grid}>
        <Card label="Investimento" value={brl(social.gasto, m)} loading={loading} />
        <Card label="Visitas ao perfil" value={int(social.visitas)} loading={loading} accent />
        <Card
          label="Custo por visita ao perfil"
          value={social.custoVisita != null ? brl(social.custoVisita, m) : "—"}
          loading={loading}
          accent
        />
        <Card
          label="Custo por seguidor"
          sub="estimado (gasto ÷ seguidores no período)"
          value={custoSeguidorBlended != null ? brl(custoSeguidorBlended, m) : "—"}
          loading={loading}
        />
      </div>
      <Section title="Custo por visita ao perfil — por post">
        {social.campanhas.length === 0 ? (
          <Vazio loading={loading} />
        ) : (
          <Tabela
            head={["Post", "Investimento", "Visitas perfil", "Custo/visita"]}
            rows={social.campanhas.map((c) => [
              c.nome || "—",
              brl(c.gasto, m),
              int(c.visitas),
              c.custoVisita != null ? brl(c.custoVisita, m) : "—",
            ])}
          />
        )}
      </Section>
      <p style={muted}>
        ⚠️ O Meta não expõe &quot;novos seguidores&quot; por campanha nesta conta — o custo por seguidor acima é uma
        estimativa que mistura orgânico + pago. O custo por visita ao perfil é real (campo dedicado da API).
      </p>

      {/* Gráfico investimento × leads */}
      <Section title="Investimento e leads por dia">
        {porDia.length === 0 ? (
          <Vazio loading={loading} />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={porDia} margin={chartM}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={11} />
              <YAxis yAxisId="l" stroke="rgba(255,255,255,0.3)" fontSize={11} />
              <YAxis yAxisId="r" orientation="right" stroke="rgba(255,255,255,0.3)" fontSize={11} />
              <Tooltip
                contentStyle={tip}
                formatter={(v, n) =>
                  [n === "Investimento" ? brl(Number(v), m) : int(Number(v)), String(n)] as [string, string]
                }
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="l" dataKey="gasto" name="Investimento" fill="#b8945f" radius={[4, 4, 0, 0]} />
              <Line yAxisId="r" dataKey="leads" name="Leads" stroke="#5b9bd5" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* Instagram orgânico */}
      <H>Instagram (orgânico)</H>
      <div style={grid}>
        <Card label="Seguidores (total)" value={ig.totalAtual != null ? int(ig.totalAtual) : "—"} loading={loading} accent />
        <Card label="Novos seguidores (período)" value={int(ig.novosPeriodo)} loading={loading} accent />
        <Card label="Visualizações (período)" value={int(ig.viewsPeriodo)} loading={loading} />
        <Card label="Visitas ao perfil (período)" value={int(ig.visitasPeriodo)} loading={loading} />
        <Card label="Seguidores (Facebook)" value={fbAtual != null ? int(fbAtual) : "—"} loading={loading} />
      </div>

      <div style={twoCol}>
        <Section title="Evolução de seguidores no período">
          {ig.serie.length === 0 ? (
            <Vazio loading={loading} />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={ig.serie} margin={chartM}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <Tooltip contentStyle={tip} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="novos" name="Novos/dia" fill="#5b9bd5" radius={[4, 4, 0, 0]} />
                <Line dataKey="acumulado" name="Acumulado" stroke="#b8945f" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </Section>

        <Section title="Alcance e visualizações por dia">
          {ig.serie.length === 0 ? (
            <Vazio loading={loading} />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={ig.serie} margin={chartM}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <Tooltip contentStyle={tip} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line dataKey="alcance" name="Alcance" stroke="#b8945f" strokeWidth={2} dot={false} />
                <Line dataKey="views" name="Visualizações" stroke="#5b9bd5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Section>

        <Section title="Visitas ao perfil por dia">
          {ig.serie.length === 0 ? (
            <Vazio loading={loading} />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ig.serie} margin={chartM}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <Tooltip contentStyle={tip} />
                <Bar dataKey="profile_views" name="Visitas ao perfil" fill="#b8945f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>
      </div>

      <p style={muted}>Números de hoje ainda consolidam na Meta (~15–30 min); dias fechados são definitivos.</p>
    </div>
  );
}

// ---- Componentes ----
function Card({
  label,
  sub,
  value,
  loading,
  accent,
}: {
  label: string;
  sub?: string;
  value: string;
  loading: boolean;
  accent?: boolean;
}) {
  return (
    <div style={cardBox(accent)}>
      <p style={cardLabel}>{label}</p>
      {sub && <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", margin: "-6px 0 6px" }}>{sub}</p>}
      <p style={{ fontSize: 26, color: accent ? "#b8945f" : "#fff", fontWeight: 300, margin: 0 }}>
        {loading ? "—" : value}
      </p>
    </div>
  );
}
function H({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 15, fontWeight: 500, color: "#fff", margin: "32px 0 12px" }}>{children}</h2>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ ...cardBox(false), marginTop: 16 }}>
      <h3 style={{ fontSize: 14, fontWeight: 500, color: "#fff", marginBottom: 16 }}>{title}</h3>
      {children}
    </div>
  );
}
function Aviso({ tom, children }: { tom: "erro" | "info"; children: React.ReactNode }) {
  const c = tom === "erro" ? "217,115,122" : "184,148,95";
  return (
    <div
      style={{
        background: `rgba(${c},0.08)`,
        border: `1px solid rgba(${c},0.25)`,
        borderRadius: 8,
        padding: "12px 16px",
        margin: "0 0 24px",
        fontSize: 12,
        color: "rgba(255,255,255,0.75)",
      }}
    >
      {children}
    </div>
  );
}
function Tabela({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ color: "rgba(255,255,255,0.5)", textAlign: "left" }}>
            {head.map((h, i) => (
              <th key={i} style={{ padding: 8, fontWeight: 500, textAlign: i === 0 ? "left" : "right" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {r.map((c, j) => (
                <td
                  key={j}
                  style={{
                    padding: 8,
                    color: j === 0 ? "#fff" : "rgba(255,255,255,0.85)",
                    textAlign: j === 0 ? "left" : "right",
                    maxWidth: j === 0 ? 280 : undefined,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={String(c)}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Vazio({ loading }: { loading: boolean }) {
  return <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{loading ? "Carregando..." : "Sem dados no período."}</p>;
}

// ---- Helpers ----
function brl(n: number, moeda: string) {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda }).format(n);
  } catch {
    return `${moeda} ${n.toFixed(2)}`;
  }
}
const int = (n: number) => Math.round(n).toLocaleString("pt-BR");
function dia(d: string) {
  const [, mo, da] = d.split("-");
  return `${da}/${mo}`;
}
function rel(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  return h < 24 ? `há ${h}h` : `há ${Math.floor(h / 24)}d`;
}

// ---- Estilos ----
const cardBox = (accent?: boolean): React.CSSProperties => ({
  background: "rgba(255,255,255,0.04)",
  border: `1px solid ${accent ? "rgba(184,148,95,0.3)" : "rgba(255,255,255,0.08)"}`,
  borderRadius: 12,
  padding: 20,
});
const headerRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  marginBottom: 8,
  flexWrap: "wrap",
};
const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
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
const muted: React.CSSProperties = { fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 16 };
const input: React.CSSProperties = {
  padding: "10px 12px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "#fff",
  fontSize: 13,
  outline: "none",
};
const tip: React.CSSProperties = {
  background: "#1a1a1a",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  fontSize: 12,
  color: "#fff",
};
const chartM = { top: 8, right: 8, left: 0, bottom: 0 };
