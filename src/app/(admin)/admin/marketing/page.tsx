"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  LineChart,
  BarChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// ---- Identidade visual Markup ----
const BLUE = "#00aeef";
const GOLD = "#b8945f";
const PIE_COLORS = ["#00aeef", "#b8945f", "#4caf7d", "#7cc7ef"];
const BAR_BLUE = "linear-gradient(90deg, rgba(0,174,239,0.45), #00aeef)";
const BAR_GOLD = "linear-gradient(90deg, rgba(184,148,95,0.45), #b8945f)";
const BAR_RED = "linear-gradient(90deg, rgba(193,91,82,0.45), #c15b52)";

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
interface KommoLead {
  produto: string;
  bucket: string;
  created_at: string | null;
}
interface DistLead {
  id: number;
  pipeline_nome: string | null;
  status_nome: string | null;
  responsavel_nome: string | null;
  tags: string[] | null;
  created_at: string | null;
}

const RANGES = [
  { label: "Últimos 7 dias", value: "7" },
  { label: "Últimos 14 dias", value: "14" },
  { label: "Últimos 30 dias", value: "30" },
  { label: "Últimos 90 dias", value: "90" },
  { label: "Mês passado", value: "mes_passado" },
  { label: "Máximo", value: "maximo" },
];
const PRODUTO_LABEL: Record<string, string> = { salsa: "Salsa", up: "Up!", horizon: "Horizon", outro: "Outros" };

export default function MarketingPage() {
  const supabase = createClient();
  const [periodo, setPeriodo] = useState("30");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [seguidores, setSeguidores] = useState<Seguidor[]>([]);
  const [syncLog, setSyncLog] = useState<SyncLog[]>([]);
  const [kommoLeads, setKommoLeads] = useState<KommoLead[]>([]);
  const [distLeads, setDistLeads] = useState<DistLead[]>([]);
  const [distLoading, setDistLoading] = useState(true);
  const [distSyncing, setDistSyncing] = useState(false);
  const [distMsg, setDistMsg] = useState<{ texto: string; erro: boolean } | null>(null);
  const [tagCfg, setTagCfg] = useState<Map<string, boolean>>(new Map());
  const [showTags, setShowTags] = useState(false);

  // Distribuição (Kommo): acumulado geral — independe do período selecionado
  async function loadDist() {
    setDistLoading(true);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const [res, tagsRes] = await Promise.all([
      (supabase.from("kommo_distribuicao_leads") as any)
        .select("id, pipeline_nome, status_nome, responsavel_nome, tags, created_at")
        .order("created_at", { ascending: false })
        .limit(50000),
      (supabase.from("kommo_distribuicao_tags") as any).select("tag, imobiliaria"),
    ]);
    setDistLeads(res.error ? [] : (res.data as DistLead[]) || []);
    setTagCfg(new Map(((tagsRes.data as any[]) || []).map((t) => [t.tag as string, !!t.imobiliaria])));
    /* eslint-enable @typescript-eslint/no-explicit-any */
    setDistLoading(false);
  }

  async function toggleTag(tag: string, val: boolean) {
    setTagCfg((prev) => new Map(prev).set(tag, val)); // otimista
    /* eslint-disable @typescript-eslint/no-explicit-any */
    await (supabase.from("kommo_distribuicao_tags") as any).upsert(
      { tag, imobiliaria: val, atualizado_em: new Date().toISOString() },
      { onConflict: "tag" }
    );
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }
  useEffect(() => {
    loadDist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sincronizarDist() {
    setDistSyncing(true);
    setDistMsg(null);
    try {
      // primeira carga = backfill completo; depois, incremental
      const backfill = distLeads.length === 0 ? "?backfill=1" : "";
      const res = await fetch(`/api/kommo/distribuicao/sync${backfill}`, { method: "POST" });
      const json = await res.json();
      if (json.ok) {
        setDistMsg({ texto: `sincronizado: ${int(json.leads)} leads`, erro: false });
        loadDist();
      } else {
        setDistMsg({ texto: json.error || "falha ao sincronizar", erro: true });
      }
    } catch (e) {
      setDistMsg({ texto: e instanceof Error ? e.message : "erro de rede", erro: true });
    }
    setDistSyncing(false);
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErro(null);

      // Janela: preset (N dias até hoje) ou personalizada (datas escolhidas)
      const hoje = new Date().toISOString().slice(0, 10);
      const fmtLocal = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
      let since: string;
      let until = hoje;
      if (periodo === "custom") {
        if (!dataInicio || !dataFim) {
          setLoading(false);
          return;
        }
        since = dataInicio;
        until = dataFim;
      } else if (periodo === "maximo") {
        since = "2020-01-01";
      } else if (periodo === "mes_passado") {
        const d = new Date();
        const ultimo = new Date(d.getFullYear(), d.getMonth(), 0); // último dia do mês passado
        const primeiro = new Date(ultimo.getFullYear(), ultimo.getMonth(), 1);
        since = fmtLocal(primeiro);
        until = fmtLocal(ultimo);
      } else {
        since = new Date(Date.now() - Number(periodo) * 864e5).toISOString().slice(0, 10);
      }
      // limite superior exclusivo p/ timestamps (inclui o dia inteiro de "until")
      const untilExcl = new Date(new Date(`${until}T00:00:00Z`).getTime() + 864e5).toISOString().slice(0, 10);

      /* eslint-disable @typescript-eslint/no-explicit-any */
      const [insRes, segRes, logRes, kommoRes] = await Promise.all([
        (supabase.from("meta_campanha_insights") as any).select("*").gte("data", since).lte("data", until).order("data").limit(20000),
        (supabase.from("meta_seguidores") as any).select("*").gte("data", since).lte("data", until).order("data"),
        (supabase.from("meta_sync_log") as any)
          .select("status, executado_em")
          .order("executado_em", { ascending: false })
          .limit(1),
        (supabase.from("kommo_leads") as any)
          .select("produto, bucket, created_at")
          .gte("created_at", since)
          .lt("created_at", untilExcl)
          .limit(20000),
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
      setKommoLeads(kommoRes.error ? [] : (kommoRes.data as KommoLead[]) || []);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo, dataInicio, dataFim]);

  // ---- Agregações (lógica inalterada) ----
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

  const custoSeguidorBlended = ig.novosPeriodo > 0 ? social.gasto / ig.novosPeriodo : null;

  // Vendas (Kommo) — funil + custo por lead cruzando com gasto Meta por produto
  const vendas = useMemo(() => {
    const b: Record<string, number> = {
      novo: 0,
      tentativa_contato: 0,
      em_atendimento: 0,
      qualificado: 0,
      ganho: 0,
      perdido: 0,
    };
    kommoLeads.forEach((l) => {
      if (l.bucket in b) b[l.bucket] += 1;
    });

    const total = kommoLeads.length;
    const pc = (v: number) => (total > 0 ? `${Math.round((v / total) * 100)}%` : "0%");
    const funilRows = [
      { label: "Leads", valor: total, pct: "100%", cor: BAR_BLUE },
      { label: "Novos", valor: b.novo, pct: pc(b.novo), cor: BAR_BLUE },
      { label: "Tentativa de contato", valor: b.tentativa_contato, pct: pc(b.tentativa_contato), cor: BAR_BLUE },
      { label: "Em atendimento", valor: b.em_atendimento, pct: pc(b.em_atendimento), cor: BAR_BLUE },
      { label: "Qualificados", valor: b.qualificado, pct: pc(b.qualificado), cor: BAR_BLUE },
      { label: "Ganhos", valor: b.ganho, pct: pc(b.ganho), cor: BAR_GOLD },
      { label: "Perdidos", valor: b.perdido, pct: pc(b.perdido), cor: BAR_RED },
    ];

    const metaGasto: Record<string, number> = {};
    insights.forEach((r) => {
      metaGasto[r.produto] = (metaGasto[r.produto] || 0) + (+r.gasto || 0);
    });
    const porProduto = (["salsa", "up", "horizon"] as const).map((p) => {
      const ls = kommoLeads.filter((l) => l.produto === p);
      const leads = ls.length;
      const qualif = ls.filter((l) => l.bucket === "qualificado" || l.bucket === "ganho").length;
      const ganhos = ls.filter((l) => l.bucket === "ganho").length;
      const gasto = metaGasto[p] || 0;
      return {
        produto: p,
        leads,
        qualif,
        ganhos,
        gasto,
        custoLead: leads > 0 ? gasto / leads : null,
        custoQualif: qualif > 0 ? gasto / qualif : null,
      };
    });

    const gastoTotal = porProduto.reduce((a, p) => a + p.gasto, 0);
    const leadsPorProduto = porProduto
      .filter((p) => p.leads > 0)
      .map((p) => ({ nome: PRODUTO_LABEL[p.produto], value: p.leads }));
    return {
      b,
      funilRows,
      porProduto,
      total,
      ganhos: b.ganho,
      perdidos: b.perdido,
      taxaConv: total > 0 ? (b.ganho / total) * 100 : 0,
      custoMedio: total > 0 ? gastoTotal / total : null,
      leadsPorProduto,
    };
  }, [kommoLeads, insights]);

  // Distribuição de leads às imobiliárias — funil/estágio = empreendimento, tag = imobiliária
  const dist = useMemo(() => {
    const fmtD = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    const hojeS = fmtD(new Date());
    const ontemS = fmtD(new Date(Date.now() - 864e5));
    const corte7 = fmtD(new Date(Date.now() - 6 * 864e5)); // últimos 7 dias incluindo hoje
    const diaDe = (l: DistLead) => (l.created_at ? fmtD(new Date(l.created_at)) : null);

    // vários funis de distribuição → empreendimento = nome do funil; funil único → estágio
    const usaFunil = new Set(distLeads.map((l) => l.pipeline_nome).filter(Boolean)).size > 1;
    const empDe = (l: DistLead) => (usaFunil ? limpaFunil(l.pipeline_nome || "—") : l.status_nome || "—");

    let hoje = 0, ontem = 0, d7 = 0;
    const agrupa = (chaves: (l: DistLead) => string[]) => {
      const m = new Map<string, { nome: string; total: number; ontem: number; d7: number }>();
      for (const l of distLeads) {
        const dia = diaDe(l);
        for (const k of chaves(l)) {
          const o = m.get(k) || { nome: k, total: 0, ontem: 0, d7: 0 };
          o.total += 1;
          if (dia === ontemS) o.ontem += 1;
          if (dia && dia >= corte7) o.d7 += 1;
          m.set(k, o);
        }
      }
      return [...m.values()].sort((a, b) => b.total - a.total);
    };
    for (const l of distLeads) {
      const dia = diaDe(l);
      if (dia === hojeS) hoje += 1;
      if (dia === ontemS) ontem += 1;
      if (dia && dia >= corte7) d7 += 1;
    }
    // Só tags marcadas como imobiliária contam; sem nenhuma marcada, todas contam (fallback)
    const marcadas = new Set([...tagCfg.entries()].filter(([, v]) => v).map(([k]) => k));
    const filtroAtivo = marcadas.size > 0;
    const imobDe = (l: DistLead) => {
      const ts = (l.tags || []).filter((t) => !filtroAtivo || marcadas.has(t));
      return ts.length > 0 ? ts : ["Sem imobiliária"];
    };
    const imobs = new Set(distLeads.flatMap((l) => (l.tags || []).filter((t) => !filtroAtivo || marcadas.has(t))));
    return {
      total: distLeads.length,
      hoje,
      ontem,
      d7,
      imobs: imobs.size,
      filtroAtivo,
      porEmp: agrupa((l) => [empDe(l)]),
      porImob: agrupa(imobDe),
      porResp: agrupa((l) => [l.responsavel_nome || "Sem responsável"]),
    };
  }, [distLeads, tagCfg]);

  // Todas as tags vistas nos leads (para o painel de configuração), com contagem
  const todasTags = useMemo(() => {
    const m = new Map<string, number>();
    distLeads.forEach((l) => (l.tags || []).forEach((t) => m.set(t, (m.get(t) || 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [distLeads]);

  const ultimaSync = syncLog[0];
  const semDados = !loading && !erro && insights.length === 0 && seguidores.length === 0;
  const m = t.moeda;

  const onPeriodo = (v: string) => {
    setPeriodo(v);
    if (v === "custom") {
      if (!dataInicio) setDataInicio(new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10));
      if (!dataFim) setDataFim(new Date().toISOString().slice(0, 10));
    }
  };

  return (
    <div>
      {/* HERO */}
      <div style={hero}>
        <div style={heroStripes} />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
          <div>
            <span style={kicker}>Meta Ads · Instagram</span>
            <h1 style={heroTitle}>Marketing</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "6px 0 0", maxWidth: 480 }}>
              Desempenho de campanhas e crescimento social, em tempo quase real.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {ultimaSync && (
              <span style={syncPill}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: ultimaSync.status === "ok" ? BLUE : "#d9737a", boxShadow: `0 0 8px ${ultimaSync.status === "ok" ? BLUE : "#d9737a"}` }} />
                {rel(ultimaSync.executado_em)}
              </span>
            )}
            <select value={periodo} onChange={(e) => onPeriodo(e.target.value)} style={select}>
              {RANGES.map((r) => (
                <option key={r.value} value={r.value} style={{ background: "#0c1218" }}>
                  {r.label}
                </option>
              ))}
              <option value="custom" style={{ background: "#0c1218" }}>
                Personalizado…
              </option>
            </select>
            {periodo === "custom" && (
              <>
                <input
                  type="date"
                  value={dataInicio}
                  max={dataFim || undefined}
                  onChange={(e) => setDataInicio(e.target.value)}
                  style={select}
                />
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>até</span>
                <input
                  type="date"
                  value={dataFim}
                  min={dataInicio || undefined}
                  onChange={(e) => setDataFim(e.target.value)}
                  style={select}
                />
              </>
            )}
          </div>
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

      {/* VISÃO GERAL */}
      <H>Visão geral</H>
      <div style={grid}>
        <Card label={`Investimento`} value={brl(t.gasto, m)} loading={loading} accent />
        <Card label="Impressões" value={int(t.imp)} loading={loading} />
        <Card label="Cliques" value={int(t.clq)} loading={loading} />
        <Card label="CTR médio" value={`${t.ctr.toFixed(2)}%`} loading={loading} />
        <Card label="Leads (Meta)" value={int(t.leads)} loading={loading} accent />
      </div>

      {/* LEADS */}
      <H>Geração de leads</H>
      <div style={grid}>
        <Card label="Leads" sub="campanhas de lead" value={int(lead.leads)} loading={loading} accent />
        <Card label="Investimento em lead" value={brl(lead.gasto, m)} loading={loading} />
        <Card label="Custo por lead" sub="só campanhas de lead" value={lead.cpl != null ? brl(lead.cpl, m) : "—"} loading={loading} accent />
      </div>
      <div style={{ ...grid, marginTop: 14 }}>
        {lead.porProduto
          .filter((p) => p.produto !== "outro" || p.leads > 0)
          .map((p) => (
            <div key={p.produto} style={produtoCard}>
              <div style={produtoTag}>{PRODUTO_LABEL[p.produto]}</div>
              <p style={{ fontFamily: "var(--font-playfair)", fontSize: 32, color: "#fff", fontWeight: 400, margin: "10px 0 2px" }}>
                {int(p.leads)}
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "0 0 12px" }}>leads</p>
              <div style={{ display: "flex", gap: 18, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                <span>Inv. <b style={{ color: "#fff", fontWeight: 500 }}>{brl(p.gasto, m)}</b></span>
                <span>CPL <b style={{ color: GOLD, fontWeight: 500 }}>{p.cpl != null ? brl(p.cpl, m) : "—"}</b></span>
              </div>
            </div>
          ))}
      </div>

      {/* DISTRIBUIÇÃO DE LEADS (KOMMO) */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "34px 0 14px", flexWrap: "wrap" }}>
        <span style={{ width: 3, height: 18, background: BLUE, borderRadius: 2 }} />
        <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: 19, fontWeight: 500, color: "#fff", margin: 0 }}>
          Distribuição de leads — imobiliárias
        </h2>
        <button onClick={sincronizarDist} disabled={distSyncing} style={{ ...distBtn, opacity: distSyncing ? 0.6 : 1 }}>
          {distSyncing ? "Sincronizando…" : "Sincronizar"}
        </button>
        <button onClick={() => setShowTags((s) => !s)} style={{ ...distBtn, ...(showTags ? { background: "rgba(0,174,239,0.28)" } : {}) }}>
          Tags {dist.filtroAtivo ? `(${[...tagCfg.values()].filter(Boolean).length})` : "(todas)"}
        </button>
        {distMsg && (
          <span style={{ fontSize: 11, color: distMsg.erro ? "#d9737a" : "rgba(255,255,255,0.5)" }}>{distMsg.texto}</span>
        )}
      </div>
      {showTags && (
        <Panel title="Quais tags são imobiliárias?">
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 14px" }}>
            Marque as tags que representam imobiliárias — só elas entram no ranking &quot;Leads por imobiliária&quot;.
            {!dist.filtroAtivo && " Enquanto nenhuma estiver marcada, todas as tags contam."}
          </p>
          {todasTags.length === 0 ? (
            <Vazio loading={distLoading} />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
              {todasTags.map(([tag, qtd]) => {
                const on = tagCfg.get(tag) === true;
                return (
                  <label
                    key={tag}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      borderRadius: 9,
                      cursor: "pointer",
                      fontSize: 12.5,
                      background: on ? "rgba(0,174,239,0.10)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${on ? "rgba(0,174,239,0.35)" : "rgba(255,255,255,0.08)"}`,
                      color: on ? "#fff" : "rgba(255,255,255,0.65)",
                    }}
                  >
                    <input type="checkbox" checked={on} onChange={(e) => toggleTag(tag, e.target.checked)} style={{ accentColor: BLUE }} />
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={tag}>
                      {tag}
                    </span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{int(qtd)}</span>
                  </label>
                );
              })}
            </div>
          )}
        </Panel>
      )}
      {!distLoading && distLeads.length === 0 && (
        <Aviso tom="info">
          Sem leads de distribuição ainda. Clique em <b>Sincronizar</b> acima (a primeira carga puxa tudo) ou rode{" "}
          <code>/api/kommo/distribuicao/sync?backfill=1</code>.
        </Aviso>
      )}
      <div style={grid}>
        <Card label="Leads distribuídos" sub="acumulado geral" value={int(dist.total)} loading={distLoading} accent />
        <Card label="Ontem" sub="leads gerados" value={int(dist.ontem)} loading={distLoading} accent />
        <Card label="Últimos 7 dias" sub="acumulado" value={int(dist.d7)} loading={distLoading} accent />
        <Card label="Hoje" sub="parcial" value={int(dist.hoje)} loading={distLoading} />
        <Card label="Imobiliárias" sub={dist.filtroAtivo ? "tags marcadas com leads" : "todas as tags"} value={int(dist.imobs)} loading={distLoading} />
      </div>
      <div style={twoCol}>
        <Panel title="Leads por empreendimento">
          {dist.porEmp.length === 0 ? (
            <Vazio loading={distLoading} />
          ) : (
            <Tabela
              head={["Empreendimento", "Total", "Ontem", "7 dias"]}
              rows={dist.porEmp.map((e) => [e.nome, int(e.total), e.ontem > 0 ? `+${e.ontem}` : "—", e.d7 > 0 ? int(e.d7) : "—"])}
            />
          )}
        </Panel>
        <Panel title="Leads por imobiliária">
          {dist.porImob.length === 0 ? (
            <Vazio loading={distLoading} />
          ) : (
            <Tabela
              head={["Imobiliária", "Total", "Ontem", "7 dias"]}
              rows={dist.porImob.map((e) => [e.nome, int(e.total), e.ontem > 0 ? `+${e.ontem}` : "—", e.d7 > 0 ? int(e.d7) : "—"])}
            />
          )}
        </Panel>
        {dist.porResp.length > 1 && (
          <Panel title="Leads por responsável">
            <Tabela
              head={["Responsável", "Total", "Ontem", "7 dias"]}
              rows={dist.porResp.map((e) => [e.nome, int(e.total), e.ontem > 0 ? `+${e.ontem}` : "—", e.d7 > 0 ? int(e.d7) : "—"])}
            />
          </Panel>
        )}
      </div>
      <p style={muted}>
        Distribuição = funil de distribuição do Kommo (empreendimento pelo funil/estágio; imobiliária pela tag do lead —
        configure quais tags contam no botão &quot;Tags&quot;). Números acumulados — não seguem o período selecionado no topo.
        &quot;Ontem&quot; e &quot;7 dias&quot; usam a data de criação do lead.
      </p>

      {/* VENDAS (KOMMO) */}
      <H>Vendas — funil (Kommo)</H>
      {vendas.total === 0 && !loading && (
        <Aviso tom="info">
          Sem leads do Kommo no período. Rode <code>/api/kommo/sync?backfill=1</code> para popular.
        </Aviso>
      )}
      <div style={grid}>
        <Card label="Total de leads" value={int(vendas.total)} loading={loading} accent />
        <Card label="Ganhos" value={int(vendas.ganhos)} loading={loading} accent />
        <Card label="Perdidos" value={int(vendas.perdidos)} loading={loading} />
        <Card label="Taxa de conversão" value={`${vendas.taxaConv.toFixed(1)}%`} loading={loading} accent />
        <Card
          label="Custo médio / lead"
          value={vendas.custoMedio != null ? brl(vendas.custoMedio, m) : "—"}
          loading={loading}
        />
      </div>

      <div style={twoCol}>
        <Panel title="Funil de vendas">
          {vendas.total === 0 ? <Vazio loading={loading} /> : <Funil rows={vendas.funilRows} />}
        </Panel>

        <Panel title="Leads por produto">
          {vendas.leadsPorProduto.length === 0 ? (
            <Vazio loading={loading} />
          ) : (
            <ResponsiveContainer width="100%" height={290}>
              <PieChart>
                <Pie
                  data={vendas.leadsPorProduto}
                  dataKey="value"
                  nameKey="nome"
                  innerRadius={62}
                  outerRadius={98}
                  paddingAngle={3}
                  stroke="none"
                >
                  {vendas.leadsPorProduto.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...ttip} />
                <Legend wrapperStyle={legend} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Panel>
      </div>

      <Panel title="Custo por lead por produto (Meta × Kommo)">
        {vendas.porProduto.every((p) => p.leads === 0) ? (
          <Vazio loading={loading} />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={vendas.porProduto.map((p) => ({
                nome: PRODUTO_LABEL[p.produto],
                custoLead: p.custoLead ?? 0,
                custoQualif: p.custoQualif ?? 0,
              }))}
              margin={chartM}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="nome" {...axis} />
              <YAxis {...axis} />
              <Tooltip {...ttip} formatter={(v, n) => [brl(Number(v), m), String(n)] as [string, string]} />
              <Legend wrapperStyle={legend} />
              <Bar dataKey="custoLead" name="Custo / lead" fill={BLUE} radius={[5, 5, 0, 0]} maxBarSize={50} />
              <Bar dataKey="custoQualif" name="Custo / lead qualificado" fill={GOLD} radius={[5, 5, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Panel>

      <Panel title="Detalhamento por produto">
        <Tabela
          head={["Produto", "Gasto Meta", "Leads", "Custo / lead", "Qualificados", "Custo / lead qualif."]}
          rows={vendas.porProduto.map((p) => [
            PRODUTO_LABEL[p.produto] || p.produto,
            brl(p.gasto, m),
            int(p.leads),
            p.custoLead != null ? brl(p.custoLead, m) : "—",
            int(p.qualif),
            p.custoQualif != null ? brl(p.custoQualif, m) : "—",
          ])}
        />
      </Panel>
      <p style={muted}>
        Funil = distribuição atual por etapa dos leads criados no período. &quot;Em atendimento&quot; = Trabalhando lead;
        &quot;Tentativa de contato&quot; = follow-ups. Custo/lead = gasto Meta do produto ÷ leads do funil (todas as origens).
      </p>

      {/* RECONHECIMENTO */}
      <H>Reconhecimento</H>
      <div style={grid}>
        <Card label="Investimento" value={brl(reconh.gasto, m)} loading={loading} />
        <Card label="Alcance" sub="soma diária" value={int(reconh.alc)} loading={loading} />
      </div>

      {/* POSTS DO INSTAGRAM */}
      <H>Posts do Instagram</H>
      <div style={grid}>
        <Card label="Investimento" value={brl(social.gasto, m)} loading={loading} />
        <Card label="Visitas ao perfil" value={int(social.visitas)} loading={loading} accent />
        <Card label="Custo / visita" value={social.custoVisita != null ? brl(social.custoVisita, m) : "—"} loading={loading} accent />
        <Card label="Custo / seguidor" sub="estimado" value={custoSeguidorBlended != null ? brl(custoSeguidorBlended, m) : "—"} loading={loading} />
      </div>
      <Panel title="Custo por visita ao perfil — por post">
        {social.campanhas.length === 0 ? (
          <Vazio loading={loading} />
        ) : (
          <Tabela
            head={["Post", "Investimento", "Visitas", "Custo/visita"]}
            rows={social.campanhas.map((c) => [c.nome || "—", brl(c.gasto, m), int(c.visitas), c.custoVisita != null ? brl(c.custoVisita, m) : "—"])}
          />
        )}
      </Panel>
      <p style={muted}>
        ⚠️ O Meta não expõe &quot;novos seguidores&quot; por campanha nesta conta — o custo por seguidor é uma estimativa
        (mistura orgânico + pago). O custo por visita ao perfil é real (campo dedicado da API).
      </p>

      {/* GRÁFICO INVESTIMENTO x LEADS */}
      <Panel title="Investimento e leads por dia">
        {porDia.length === 0 ? (
          <Vazio loading={loading} />
        ) : (
          <ResponsiveContainer width="100%" height={290}>
            <ComposedChart data={porDia} margin={chartM}>
              <defs>{grad("gGasto", BLUE)}</defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" {...axis} />
              <YAxis yAxisId="l" {...axis} />
              <YAxis yAxisId="r" orientation="right" {...axis} />
              <Tooltip {...ttip} formatter={(v, n) => [n === "Investimento" ? brl(Number(v), m) : int(Number(v)), String(n)] as [string, string]} />
              <Legend wrapperStyle={legend} />
              <Bar yAxisId="l" dataKey="gasto" name="Investimento" fill="url(#gGasto)" radius={[5, 5, 0, 0]} maxBarSize={26} />
              <Line yAxisId="r" dataKey="leads" name="Leads" stroke={GOLD} strokeWidth={2.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Panel>

      {/* INSTAGRAM ORGÂNICO */}
      <H>Instagram</H>
      <div style={grid}>
        <Card label="Seguidores" value={ig.totalAtual != null ? int(ig.totalAtual) : "—"} loading={loading} accent />
        <Card label="Novos seguidores" sub="no período" value={int(ig.novosPeriodo)} loading={loading} accent />
        <Card label="Visualizações" sub="no período" value={int(ig.viewsPeriodo)} loading={loading} />
        <Card label="Visitas ao perfil" sub="no período" value={int(ig.visitasPeriodo)} loading={loading} />
        <Card label="Facebook" sub="seguidores" value={fbAtual != null ? int(fbAtual) : "—"} loading={loading} />
      </div>

      <div style={twoCol}>
        <Panel title="Evolução de seguidores">
          {ig.serie.length === 0 ? (
            <Vazio loading={loading} />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={ig.serie} margin={chartM}>
                <defs>{gradArea("gAcc", BLUE)}</defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" {...axis} />
                <YAxis {...axis} />
                <Tooltip {...ttip} />
                <Legend wrapperStyle={legend} />
                <Area dataKey="acumulado" name="Acumulado" stroke={BLUE} strokeWidth={2.5} fill="url(#gAcc)" />
                <Bar dataKey="novos" name="Novos/dia" fill={GOLD} radius={[4, 4, 0, 0]} maxBarSize={20} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Alcance e visualizações por dia">
          {ig.serie.length === 0 ? (
            <Vazio loading={loading} />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={ig.serie} margin={chartM}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" {...axis} />
                <YAxis {...axis} />
                <Tooltip {...ttip} />
                <Legend wrapperStyle={legend} />
                <Line dataKey="alcance" name="Alcance" stroke={BLUE} strokeWidth={2.5} dot={false} />
                <Line dataKey="views" name="Visualizações" stroke={GOLD} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Visitas ao perfil por dia">
          {ig.serie.length === 0 ? (
            <Vazio loading={loading} />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ig.serie} margin={chartM}>
                <defs>{grad("gVis", BLUE)}</defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" {...axis} />
                <YAxis {...axis} />
                <Tooltip {...ttip} />
                <Bar dataKey="profile_views" name="Visitas ao perfil" fill="url(#gVis)" radius={[4, 4, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>
      </div>

      <p style={muted}>Números de hoje ainda consolidam na Meta (~15–30 min); dias fechados são definitivos.</p>
    </div>
  );
}

// ---- Componentes ----
function Card({ label, sub, value, loading, accent }: { label: string; sub?: string; value: string; loading: boolean; accent?: boolean }) {
  return (
    <div style={cardBox(accent)}>
      {accent && <div style={cardAccentBar} />}
      <p style={cardLabel}>{label}</p>
      {sub && <p style={cardSub}>{sub}</p>}
      <p style={{ fontFamily: "var(--font-playfair)", fontSize: 30, color: accent ? BLUE : "#fff", fontWeight: 400, margin: "8px 0 0", lineHeight: 1 }}>
        {loading ? "—" : value}
      </p>
    </div>
  );
}
function H({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "34px 0 14px" }}>
      <span style={{ width: 3, height: 18, background: BLUE, borderRadius: 2 }} />
      <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: 19, fontWeight: 500, color: "#fff", margin: 0 }}>{children}</h2>
    </div>
  );
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ ...cardBox(false), marginTop: 16 }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 18, textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</h3>
      {children}
    </div>
  );
}
function Aviso({ tom, children }: { tom: "erro" | "info"; children: React.ReactNode }) {
  const c = tom === "erro" ? "217,115,122" : "0,174,239";
  return (
    <div style={{ background: `rgba(${c},0.08)`, border: `1px solid rgba(${c},0.25)`, borderRadius: 10, padding: "12px 16px", margin: "0 0 24px", fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
      {children}
    </div>
  );
}
function Tabela({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
        <thead>
          <tr style={{ color: "rgba(255,255,255,0.4)", textAlign: "left" }}>
            {head.map((h, i) => (
              <th key={i} style={{ padding: "8px 10px", fontWeight: 500, textAlign: i === 0 ? "left" : "right", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.4px" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {r.map((c, j) => (
                <td key={j} style={{ padding: "11px 10px", color: j === 0 ? "#fff" : j === r.length - 1 ? BLUE : "rgba(255,255,255,0.8)", fontWeight: j === r.length - 1 ? 600 : 400, textAlign: j === 0 ? "left" : "right", maxWidth: j === 0 ? 300 : undefined, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={String(c)}>
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
  return <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", padding: "8px 0" }}>{loading ? "Carregando..." : "Sem dados no período."}</p>;
}

function Funil({ rows }: { rows: Array<{ label: string; valor: number; pct: string; cor: string }> }) {
  const max = Math.max(...rows.map((r) => r.valor), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 4 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 124,
              flexShrink: 0,
              fontSize: 12.5,
              color: "rgba(255,255,255,0.8)",
              fontWeight: 500,
              textAlign: "right",
            }}
          >
            {r.label}
          </div>
          <div style={{ flex: 1, height: 26, background: "rgba(255,255,255,0.04)", borderRadius: 8, overflow: "hidden" }}>
            <div
              style={{
                width: `${r.valor > 0 ? Math.max((r.valor / max) * 100, 5) : 0}%`,
                height: "100%",
                background: r.cor,
                borderRadius: 8,
                transition: "width .4s ease",
              }}
            />
          </div>
          <div style={{ width: 60, flexShrink: 0, textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-playfair)", fontSize: 18, color: "#fff", lineHeight: 1 }}>{int(r.valor)}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{r.pct}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Helpers ----
// "Distribuição Salsa" -> "Salsa"; "Distribuição" -> "Distribuição"
function limpaFunil(nome: string) {
  const limpo = nome.replace(/distribui[çc][ãa]o|distribui[çc][õo]es/gi, "").replace(/^[\s\-–—|:·]+|[\s\-–—|:·]+$/g, "");
  return limpo || nome;
}
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
const grad = (id: string, color: string) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor={color} stopOpacity={0.95} />
    <stop offset="100%" stopColor={color} stopOpacity={0.35} />
  </linearGradient>
);
const gradArea = (id: string, color: string) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor={color} stopOpacity={0.35} />
    <stop offset="100%" stopColor={color} stopOpacity={0.02} />
  </linearGradient>
);

// ---- Estilos ----
const hero: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
  borderRadius: 18,
  padding: "30px 30px 26px",
  marginBottom: 8,
  background: "linear-gradient(135deg, #0c1c28 0%, #0a0a0a 65%)",
  border: "1px solid rgba(0,174,239,0.18)",
};
const heroStripes: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundImage: "repeating-linear-gradient(118deg, rgba(0,174,239,0.06) 0px, rgba(0,174,239,0.06) 2px, transparent 2px, transparent 15px)",
  maskImage: "linear-gradient(90deg, transparent 35%, black 100%)",
  WebkitMaskImage: "linear-gradient(90deg, transparent 35%, black 100%)",
  pointerEvents: "none",
};
const kicker: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: BLUE, textTransform: "uppercase", letterSpacing: "1.5px" };
const heroTitle: React.CSSProperties = { fontFamily: "var(--font-playfair)", fontSize: 36, fontWeight: 500, color: "#fff", margin: "6px 0 0", lineHeight: 1 };
const syncPill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  fontSize: 11,
  color: "rgba(255,255,255,0.6)",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 999,
  padding: "6px 12px",
};
const select: React.CSSProperties = {
  padding: "9px 14px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(0,174,239,0.25)",
  borderRadius: 10,
  color: "#fff",
  fontSize: 13,
  outline: "none",
  colorScheme: "dark",
};
const cardBox = (accent?: boolean): React.CSSProperties => ({
  position: "relative",
  overflow: "hidden",
  background: accent ? "linear-gradient(160deg, rgba(0,174,239,0.10), rgba(255,255,255,0.015))" : "rgba(255,255,255,0.03)",
  border: `1px solid ${accent ? "rgba(0,174,239,0.28)" : "rgba(255,255,255,0.07)"}`,
  borderRadius: 14,
  padding: 20,
});
const cardAccentBar: React.CSSProperties = { position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${BLUE}, transparent)` };
const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(178px, 1fr))", gap: 14 };
const twoCol: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 16 };
const cardLabel: React.CSSProperties = { fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.6px", margin: 0 };
const cardSub: React.CSSProperties = { fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "3px 0 0" };
const produtoCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 14,
  padding: 20,
};
const produtoTag: React.CSSProperties = {
  display: "inline-block",
  fontSize: 11,
  fontWeight: 600,
  color: BLUE,
  background: "rgba(0,174,239,0.12)",
  border: "1px solid rgba(0,174,239,0.25)",
  borderRadius: 999,
  padding: "3px 12px",
  letterSpacing: "0.3px",
};
const muted: React.CSSProperties = { fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 18, lineHeight: 1.6 };
const distBtn: React.CSSProperties = {
  marginLeft: 6,
  padding: "6px 14px",
  background: "rgba(0,174,239,0.12)",
  border: "1px solid rgba(0,174,239,0.3)",
  borderRadius: 999,
  color: BLUE,
  fontSize: 11.5,
  fontWeight: 600,
  cursor: "pointer",
};
const axis = { stroke: "rgba(255,255,255,0.25)", fontSize: 11, tickLine: false } as const;
const legend = { fontSize: 12 } as const;
const ttip = {
  contentStyle: { background: "#0c1218", border: "1px solid rgba(0,174,239,0.25)", borderRadius: 10, fontSize: 12, color: "#fff" },
  cursor: { fill: "rgba(0,174,239,0.06)" },
} as const;
const chartM = { top: 10, right: 10, left: 0, bottom: 0 };
