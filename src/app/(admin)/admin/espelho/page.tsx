"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

interface Unidade {
  data: string;
  empreendimento: string;
  apartamento: string;
  torre: string | null;
  tipo: string | null;
  area_m2: number | null;
  valor: number | null;
  venda: number | null;
  status: "vendida" | "reservada" | "disponivel" | "outros";
}
interface Emp {
  nome: string;
  logo_url: string | null;
  ordem: number;
}

const COR = {
  vendida: "#0098d4",
  reservada: "#e0a23b",
  disponivel: "#3fae7a",
  outros: "#9aa3ad",
};
const LABEL = { vendida: "Vendidas", reservada: "Reservadas", disponivel: "Disponíveis", outros: "Outros" };

export default function EspelhoPage() {
  const supabase = createClient();
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [emps, setEmps] = useState<Emp[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSel, setDataSel] = useState<string>("");
  const [showImport, setShowImport] = useState(false);

  async function load() {
    setLoading(true);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const [uRes, eRes] = await Promise.all([
      (supabase.from("espelho_unidades") as any)
        .select("data, empreendimento, apartamento, torre, tipo, area_m2, valor, venda, status")
        .order("data", { ascending: false })
        .limit(8000),
      (supabase.from("espelho_empreendimentos") as any).select("*").order("ordem"),
    ]);
    /* eslint-enable @typescript-eslint/no-explicit-any */
    const u = (uRes.data as Unidade[]) || [];
    setUnidades(u);
    setEmps((eRes.data as Emp[]) || []);
    setDataSel((prev) => prev || u[0]?.data || "");
    setLoading(false);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const datas = useMemo(() => [...new Set(unidades.map((u) => u.data))].sort((a, b) => b.localeCompare(a)), [unidades]);
  const dataAtual = dataSel || datas[0] || "";
  const dataAnterior = datas[datas.indexOf(dataAtual) + 1] || "";

  const doDia = useMemo(() => unidades.filter((u) => u.data === dataAtual), [unidades, dataAtual]);
  const doDiaAnterior = useMemo(() => unidades.filter((u) => u.data === dataAnterior), [unidades, dataAnterior]);

  const empNomes = useMemo(() => {
    const set = new Set(doDia.map((u) => u.empreendimento));
    const ordenados = emps.filter((e) => set.has(e.nome)).map((e) => e.nome);
    const resto = [...set].filter((n) => !ordenados.includes(n)).sort();
    return [...ordenados, ...resto];
  }, [doDia, emps]);

  const logoDe = (nome: string) => emps.find((e) => e.nome === nome)?.logo_url || null;

  // série de % vendido por dia, por empreendimento
  const serie = useMemo(() => {
    const porDiaEmp = new Map<string, Map<string, { v: number; t: number }>>();
    unidades.forEach((u) => {
      if (!porDiaEmp.has(u.empreendimento)) porDiaEmp.set(u.empreendimento, new Map());
      const m = porDiaEmp.get(u.empreendimento)!;
      const o = m.get(u.data) || { v: 0, t: 0 };
      o.t += 1;
      if (u.status === "vendida") o.v += 1;
      m.set(u.data, o);
    });
    return porDiaEmp;
  }, [unidades]);

  const consolidado = useMemo(() => agrega(doDia), [doDia]);

  if (loading) return <div style={{ padding: 40, color: "#fff" }}>Carregando…</div>;

  return (
    <div style={page}>
      <style>{printCSS}</style>

      {/* Header */}
      <div style={hero} className="esp-hero">
        <div>
          <span style={kicker}>Markup Incorporações</span>
          <h1 style={heroTitle}>Espelho de Vendas</h1>
          {dataAtual && <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Posição de {fmtData(dataAtual)}</p>}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }} className="esp-noprint">
          {datas.length > 0 && (
            <select value={dataAtual} onChange={(e) => setDataSel(e.target.value)} style={selectLight}>
              {datas.map((d) => (
                <option key={d} value={d}>{fmtData(d)}</option>
              ))}
            </select>
          )}
          <button onClick={() => setShowImport((s) => !s)} style={btnGhost}>Importar CSV</button>
          <button onClick={() => window.print()} style={btnPrimary}>Imprimir</button>
        </div>
      </div>

      {showImport && <ImportPanel onDone={() => { setShowImport(false); setDataSel(""); load(); }} emps={emps} onLogos={load} />}

      {datas.length === 0 ? (
        <div style={{ ...card, textAlign: "center", color: "#5b6573" }}>
          Nenhum espelho importado ainda. Clique em <b>Importar CSV</b> e envie o relatório do Trilote.
        </div>
      ) : (
        <>
          {/* Consolidado */}
          <div style={{ ...card, marginBottom: 18 }}>
            <h2 style={secTitle}>Consolidado geral</h2>
            <div style={consolidadoGrid}>
              <Stat label="Unidades" valor={fmtInt(consolidado.total)} />
              <Stat label="Vendidas" valor={fmtInt(consolidado.vendida)} cor={COR.vendida} />
              <Stat label="Reservadas" valor={fmtInt(consolidado.reservada)} cor={COR.reservada} />
              <Stat label="Disponíveis" valor={fmtInt(consolidado.disponivel)} cor={COR.disponivel} />
              <Stat label="% vendido" valor={`${consolidado.pct.toFixed(1)}%`} cor="#0c1c3a" destaque />
              <Stat label="VGV vendido" valor={fmtBRL(consolidado.vgv)} cor="#0c1c3a" destaque />
            </div>
            <Barra a={consolidado} />
          </div>

          {/* Cards por empreendimento */}
          <div style={empGrid}>
            {empNomes.map((nome) => (
              <EmpCard
                key={nome}
                nome={nome}
                logo={logoDe(nome)}
                unidades={doDia.filter((u) => u.empreendimento === nome)}
                anterior={doDiaAnterior.filter((u) => u.empreendimento === nome)}
                temAnterior={!!dataAnterior}
                serie={serie.get(nome)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------- Card de empreendimento ----------
function EmpCard({
  nome,
  logo,
  unidades,
  anterior,
  temAnterior,
  serie,
}: {
  nome: string;
  logo: string | null;
  unidades: Unidade[];
  anterior: Unidade[];
  temAnterior: boolean;
  serie?: Map<string, { v: number; t: number }>;
}) {
  const [aberto, setAberto] = useState<string | null>(null);
  const a = agrega(unidades);
  const comp = useMemo(() => comparar(unidades, anterior), [unidades, anterior]);
  const donut = (["vendida", "reservada", "disponivel", "outros"] as const)
    .map((k) => ({ nome: LABEL[k], value: a[k], cor: COR[k] }))
    .filter((d) => d.value > 0);
  const evol = serie
    ? [...serie.entries()]
        .sort((x, y) => x[0].localeCompare(y[0]))
        .map(([d, o]) => ({ label: fmtDataCurta(d), pct: o.t > 0 ? (o.v / o.t) * 100 : 0 }))
    : [];
  const blocos: Array<"vendida" | "reservada" | "disponivel" | "outros"> = ["vendida", "reservada", "disponivel"];
  if (a.outros > 0) blocos.push("outros");

  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={nome} style={{ height: 34, width: "auto", objectFit: "contain" }} />
        ) : null}
        <div>
          <h3 style={{ margin: 0, fontSize: 16, color: "#0c1c3a", fontWeight: 700 }}>{nome}</h3>
          <span style={{ fontSize: 12, color: "#5b6573" }}>{fmtInt(a.total)} unidades · {a.pct.toFixed(1)}% vendido</span>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#8a93a0" }}>VGV vendido</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0098d4" }}>{fmtBRL(a.vgv)}</div>
        </div>
      </div>

      <Barra a={a} />

      {/* Blocos clicáveis */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${blocos.length}, 1fr)`, gap: 8, marginTop: 14 }}>
        {blocos.map((k) => (
          <button
            key={k}
            onClick={() => setAberto(aberto === k ? null : k)}
            style={{ ...bloco, borderColor: aberto === k ? COR[k] : "#e6e9ee" }}
          >
            <div style={{ fontSize: 20, fontWeight: 700, color: COR[k] }}>{a[k]}</div>
            <div style={{ fontSize: 11, color: "#5b6573" }}>{LABEL[k]}</div>
            <div style={{ fontSize: 10, color: "#9aa3ad" }}>{a.total > 0 ? ((a[k] / a.total) * 100).toFixed(0) : 0}%</div>
          </button>
        ))}
      </div>
      {aberto && (
        <div style={lista}>
          {unidades.filter((u) => u.status === aberto).map((u, i) => (
            <div key={i} style={listaItem}>
              <span style={{ color: "#0c1c3a", fontWeight: 500 }}>{u.apartamento}</span>
              <span style={{ color: "#5b6573" }}>{u.tipo}</span>
              <span style={{ color: "#0c1c3a" }}>{u.status === "vendida" ? fmtBRL(u.venda || 0) : fmtBRL(u.valor || 0)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Donut + evolução */}
      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12, marginTop: 16, alignItems: "center" }} className="esp-charts">
        <ResponsiveContainer width="100%" height={120}>
          <PieChart>
            <Pie data={donut} dataKey="value" nameKey="nome" innerRadius={32} outerRadius={52} paddingAngle={2} stroke="none">
              {donut.map((d, i) => <Cell key={i} fill={d.cor} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={evol} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <XAxis dataKey="label" stroke="#9aa3ad" fontSize={10} tickLine={false} />
            <YAxis stroke="#9aa3ad" fontSize={10} tickLine={false} width={32} unit="%" />
            <Tooltip formatter={(v) => [`${Number(v).toFixed(1)}%`, "% vendido"] as [string, string]} />
            <Line dataKey="pct" stroke="#0098d4" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Comparações vs dia anterior */}
      {temAnterior && (
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
          <Comp icone="🎉" label="Novas vendas" itens={comp.novasVendas} cor={COR.vendida} />
          <Comp icone="🔄" label="Reserva → Venda" itens={comp.resParaVenda} cor="#0098d4" />
          <Comp icone="⚠️" label="Vendas que caíram" itens={comp.vendasCairam} cor="#d9534f" />
          <Comp icone="📉" label="Reserva → Disponível" itens={comp.resParaDispo} cor={COR.disponivel} />
        </div>
      )}
    </div>
  );
}

function Comp({ icone, label, itens, cor }: { icone: string; label: string; itens: string[]; cor: string }) {
  if (itens.length === 0) return null;
  return (
    <div style={{ fontSize: 12, color: "#3a4453", display: "flex", gap: 6, alignItems: "baseline", flexWrap: "wrap" }}>
      <span>{icone}</span>
      <b style={{ color: cor }}>{label} ({itens.length}):</b>
      <span style={{ color: "#5b6573" }}>{itens.slice(0, 12).join(", ")}{itens.length > 12 ? "…" : ""}</span>
    </div>
  );
}

function Stat({ label, valor, cor, destaque }: { label: string; valor: string; cor?: string; destaque?: boolean }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: destaque ? 22 : 20, fontWeight: 700, color: cor || "#0c1c3a", fontFamily: "var(--font-playfair)" }}>{valor}</div>
      <div style={{ fontSize: 11, color: "#8a93a0", textTransform: "uppercase", letterSpacing: "0.4px", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Barra({ a }: { a: ReturnType<typeof agrega> }) {
  const seg = (n: number, cor: string, key: string) => (a.total > 0 && n > 0 ? <div key={key} style={{ width: `${(n / a.total) * 100}%`, background: cor }} /> : null);
  return (
    <div style={{ display: "flex", height: 10, borderRadius: 6, overflow: "hidden", background: "#eef1f5" }}>
      {seg(a.vendida, COR.vendida, "v")}
      {seg(a.reservada, COR.reservada, "r")}
      {seg(a.disponivel, COR.disponivel, "d")}
      {seg(a.outros, COR.outros, "o")}
    </div>
  );
}

// ---------- Painel de import + logos ----------
function ImportPanel({ onDone, emps, onLogos }: { onDone: () => void; emps: Emp[]; onLogos: () => void }) {
  const supabase = createClient();
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [texto, setTexto] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function lerArquivo(file: File) {
    const buf = await file.arrayBuffer();
    let t = new TextDecoder("utf-8", { fatal: false }).decode(buf);
    if (t.includes("�")) t = new TextDecoder("windows-1252").decode(buf); // fallback Latin-1
    setTexto(t);
  }

  async function importar() {
    setEnviando(true);
    setErro(null);
    setMsg(null);
    try {
      const res = await fetch("/api/espelho/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: texto, data }),
      });
      const json = await res.json();
      if (!json.ok) {
        setErro(json.error || "Falha ao importar.");
      } else {
        let m = `Importado: ${json.total} unidades em ${json.empreendimentos.length} empreendimentos (${fmtData(json.data)}).`;
        if (json.statusDesconhecidos?.length) m += ` ⚠️ Situações não classificadas: ${json.statusDesconhecidos.join(", ")}.`;
        setMsg(m);
        setTimeout(onDone, 1200);
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro de rede.");
    }
    setEnviando(false);
  }

  async function salvarLogo(nome: string, url: string) {
    await (supabase.from("espelho_empreendimentos") as any).update({ logo_url: url }).eq("nome", nome);
    onLogos();
  }

  return (
    <div style={{ ...card, marginBottom: 18 }}>
      <h2 style={secTitle}>Importar espelho (CSV do Trilote)</h2>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <label style={{ fontSize: 13, color: "#3a4453" }}>Data do espelho:</label>
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} style={inputLight} />
        <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={(e) => e.target.files?.[0] && lerArquivo(e.target.files[0])} style={{ fontSize: 13 }} />
      </div>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="…ou cole aqui o conteúdo do CSV"
        style={{ width: "100%", height: 90, padding: 10, borderRadius: 8, border: "1px solid #d6dbe2", fontSize: 12, fontFamily: "monospace", resize: "vertical" }}
      />
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
        <button onClick={importar} disabled={enviando || !texto} style={{ ...btnPrimary, opacity: enviando || !texto ? 0.6 : 1 }}>
          {enviando ? "Importando…" : "Importar"}
        </button>
        {msg && <span style={{ fontSize: 12, color: "#2e7d52" }}>{msg}</span>}
        {erro && <span style={{ fontSize: 12, color: "#d9534f" }}>{erro}</span>}
      </div>

      {emps.length > 0 && (
        <div style={{ marginTop: 18, borderTop: "1px solid #eef1f5", paddingTop: 14 }}>
          <p style={{ fontSize: 12, color: "#5b6573", marginBottom: 10 }}>Logos dos empreendimentos (cole a URL pública de uma imagem):</p>
          {emps.map((e) => (
            <div key={e.nome} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <span style={{ width: 200, fontSize: 12, color: "#3a4453" }}>{e.nome}</span>
              <input
                defaultValue={e.logo_url || ""}
                placeholder="https://…/logo.png"
                onBlur={(ev) => ev.target.value !== (e.logo_url || "") && salvarLogo(e.nome, ev.target.value)}
                style={{ ...inputLight, flex: 1 }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- helpers ----------
function agrega(us: Unidade[]) {
  const r = { vendida: 0, reservada: 0, disponivel: 0, outros: 0, total: 0, vgv: 0, pct: 0 };
  us.forEach((u) => {
    r[u.status] += 1;
    r.total += 1;
    if (u.status === "vendida") r.vgv += +(u.venda || 0);
  });
  r.pct = r.total > 0 ? (r.vendida / r.total) * 100 : 0;
  return r;
}
function comparar(atual: Unidade[], anterior: Unidade[]) {
  const prev = new Map(anterior.map((u) => [u.apartamento, u.status]));
  const novasVendas: string[] = [], vendasCairam: string[] = [], resParaVenda: string[] = [], resParaDispo: string[] = [];
  for (const u of atual) {
    const p = prev.get(u.apartamento);
    if (u.status === "vendida") {
      if (p === "reservada") resParaVenda.push(u.apartamento);
      else if (p !== "vendida") novasVendas.push(u.apartamento);
    }
    if (p === "vendida" && u.status !== "vendida") vendasCairam.push(u.apartamento);
    if (p === "reservada" && u.status === "disponivel") resParaDispo.push(u.apartamento);
  }
  return { novasVendas, vendasCairam, resParaVenda, resParaDispo };
}
const fmtInt = (n: number) => Math.round(n).toLocaleString("pt-BR");
const fmtBRL = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
function fmtData(d: string) {
  const [y, m, dd] = d.split("-");
  return `${dd}/${m}/${y}`;
}
function fmtDataCurta(d: string) {
  const [, m, dd] = d.split("-");
  return `${dd}/${m}`;
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
const kicker: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: "#00aeef", textTransform: "uppercase", letterSpacing: "1.5px" };
const heroTitle: React.CSSProperties = { fontFamily: "var(--font-playfair)", fontSize: 28, fontWeight: 500, color: "#fff", margin: "4px 0 0" };
const card: React.CSSProperties = { background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(12,28,58,0.08)" };
const secTitle: React.CSSProperties = { fontSize: 14, fontWeight: 700, color: "#0c1c3a", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.5px" };
const consolidadoGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 16, marginBottom: 16 };
const empGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))", gap: 18 };
const bloco: React.CSSProperties = { background: "#fff", border: "1.5px solid #e6e9ee", borderRadius: 10, padding: "10px 8px", cursor: "pointer", textAlign: "center" };
const lista: React.CSSProperties = { marginTop: 10, maxHeight: 200, overflowY: "auto", border: "1px solid #eef1f5", borderRadius: 8 };
const listaItem: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "7px 12px", fontSize: 12, borderBottom: "1px solid #f3f5f8" };
const selectLight: React.CSSProperties = { padding: "9px 12px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 9, color: "#fff", fontSize: 13, outline: "none", colorScheme: "dark" };
const inputLight: React.CSSProperties = { padding: "8px 10px", background: "#fff", border: "1px solid #d6dbe2", borderRadius: 8, color: "#1a2332", fontSize: 13, outline: "none" };
const btnPrimary: React.CSSProperties = { padding: "9px 18px", background: "#00aeef", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" };
const btnGhost: React.CSSProperties = { padding: "9px 16px", background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: "pointer" };

const printCSS = `
@media print {
  aside { display: none !important; }
  main { margin-left: 0 !important; padding: 0 !important; background: #fff !important; }
  .esp-noprint { display: none !important; }
  body { background: #fff !important; }
}`;
