"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Componente,
  UnidadeTabela,
  montarColunas,
  valorDaColuna,
  somaPercentuais,
  brl,
  MODELOS,
  STATUS_LABEL,
} from "@/lib/tabelas/calc";

const BLUE = "#00aeef";
const BASE_URL = "https://markupincorporacoes.com.br";

interface Tabela {
  id: string;
  empreendimento: string;
  nome: string;
  slug: string;
  data_espelho: string;
  entrega_prevista: string | null;
  localizacao: string | null;
  incorporadora: string | null;
  mostrar_valor_m2: boolean;
  observacoes: string | null;
  publicada: boolean;
}

const slugify = (v: string) =>
  v.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);

export default function TabelasPage() {
  const supabase = createClient();
  const [tabelas, setTabelas] = useState<Tabela[]>([]);
  const [emps, setEmps] = useState<string[]>([]);
  const [datas, setDatas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const [tRes, uRes] = await Promise.all([
      (supabase.from("tabelas_precos") as any).select("*").order("created_at", { ascending: false }),
      (supabase.from("espelho_unidades") as any).select("empreendimento, data").limit(80000),
    ]);
    /* eslint-enable @typescript-eslint/no-explicit-any */
    setTabelas((tRes.data as Tabela[]) || []);
    const rows = (uRes.data as { empreendimento: string; data: string }[]) || [];
    setEmps([...new Set(rows.map((r) => r.empreendimento))].sort());
    setDatas([...new Set(rows.map((r) => r.data))].sort((a, b) => b.localeCompare(a)));
    setLoading(false);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function novaTabela() {
    if (emps.length === 0 || datas.length === 0) return alert("Importe um espelho primeiro (Espelho de Vendas).");
    const emp = emps[0];
    const nome = "Nova tabela";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("tabelas_precos") as any)
      .insert({
        empreendimento: emp,
        nome,
        slug: `${slugify(emp)}-${Date.now().toString(36)}`,
        data_espelho: datas[0],
      })
      .select()
      .single();
    if (error) return alert(error.message);
    await load();
    setEditId((data as Tabela).id);
  }

  async function remover(id: string) {
    if (!confirm("Remover esta tabela de preços?")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("tabelas_precos") as any).delete().eq("id", id);
    setEditId(null);
    load();
  }

  if (loading) return <div style={{ color: "#fff" }}>Carregando…</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: 26, fontWeight: 500, color: "#fff", margin: 0 }}>Tabelas de Preços</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "6px 0 0" }}>
            As unidades e valores vêm do Espelho de Vendas. Aqui você define a estrutura de pagamento (%, parcelas e grupos).
          </p>
        </div>
        <button onClick={novaTabela} style={btnPrimary}>+ Nova tabela</button>
      </div>

      {tabelas.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Nenhuma tabela criada ainda.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tabelas.map((t) => (
            <div key={t.id} style={cardBox}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>
                    {t.empreendimento} <span style={{ color: BLUE }}>· {t.nome}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
                    Espelho de {t.data_espelho.split("-").reverse().join("/")} ·{" "}
                    <code style={{ color: "rgba(255,255,255,0.6)" }}>/tabela/{t.slug}</code>
                    {t.publicada ? <span style={{ color: "#4caf7d" }}> · publicada</span> : <span style={{ color: "rgba(255,255,255,0.35)" }}> · rascunho</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {t.publicada && (
                    <a href={`/tabela/${t.slug}`} target="_blank" rel="noopener noreferrer" style={btnGhost}>Ver ↗</a>
                  )}
                  <button onClick={() => setEditId(editId === t.id ? null : t.id)} style={btnGhost}>
                    {editId === t.id ? "Fechar" : "Editar"}
                  </button>
                  <button onClick={() => remover(t.id)} style={{ ...btnGhost, color: "#e88" }}>Remover</button>
                </div>
              </div>
              {editId === t.id && <Editor tabela={t} emps={emps} datas={datas} onSaved={load} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Editor ----------
function Editor({ tabela, emps, datas, onSaved }: { tabela: Tabela; emps: string[]; datas: string[]; onSaved: () => void }) {
  const supabase = createClient();
  const [t, setT] = useState<Tabela>(tabela);
  const [comps, setComps] = useState<Componente[]>([]);
  const [unidades, setUnidades] = useState<UnidadeTabela[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from("tabela_componentes") as any)
        .select("*")
        .eq("tabela_id", tabela.id)
        .order("ordem");
      setComps((data as Componente[]) || []);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabela.id]);

  // unidades do espelho para o preview
  useEffect(() => {
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from("espelho_unidades") as any)
        .select("apartamento, torre, tipo, area_m2, valor, status")
        .eq("empreendimento", t.empreendimento)
        .eq("data", t.data_espelho)
        .limit(5000);
      setUnidades((data as UnidadeTabela[]) || []);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.empreendimento, t.data_espelho]);

  const soma = somaPercentuais(comps);
  const ok100 = Math.abs(soma - 100) < 0.01;
  const colunas = useMemo(() => montarColunas(comps), [comps]);

  const setComp = (i: number, patch: Partial<Componente>) =>
    setComps((prev) => prev.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const addComp = () =>
    setComps((prev) => [...prev, { ordem: prev.length, nome: "Novo componente", grupo: null, percentual: 0, parcelas: 1 }]);
  const delComp = (i: number) => setComps((prev) => prev.filter((_, j) => j !== i).map((c, j) => ({ ...c, ordem: j })));

  async function salvar() {
    setSalvando(true);
    setMsg("");
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const { error: e1 } = await (supabase.from("tabelas_precos") as any)
      .update({
        empreendimento: t.empreendimento,
        nome: t.nome,
        slug: t.slug,
        data_espelho: t.data_espelho,
        entrega_prevista: t.entrega_prevista,
        localizacao: t.localizacao,
        incorporadora: t.incorporadora,
        mostrar_valor_m2: t.mostrar_valor_m2,
        observacoes: t.observacoes,
        publicada: t.publicada,
        updated_at: new Date().toISOString(),
      })
      .eq("id", t.id);
    if (e1) {
      setSalvando(false);
      return setMsg(`Erro: ${e1.message}`);
    }
    await (supabase.from("tabela_componentes") as any).delete().eq("tabela_id", t.id);
    if (comps.length > 0) {
      const { error: e2 } = await (supabase.from("tabela_componentes") as any).insert(
        comps.map((c, i) => ({
          tabela_id: t.id,
          ordem: i,
          nome: c.nome,
          grupo: c.grupo || null,
          percentual: Number(c.percentual) || 0,
          parcelas: Math.max(1, Number(c.parcelas) || 1),
        }))
      );
      if (e2) {
        setSalvando(false);
        return setMsg(`Erro nos componentes: ${e2.message}`);
      }
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
    setSalvando(false);
    setMsg("Salvo!");
    onSaved();
    setTimeout(() => setMsg(""), 2500);
  }

  return (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 14, paddingTop: 16 }}>
      {/* Cabeçalho da tabela */}
      <p style={secLabel}>Dados da tabela</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px,1fr))", gap: 10, marginBottom: 16 }}>
        <Campo label="Empreendimento">
          <select value={t.empreendimento} onChange={(e) => setT({ ...t, empreendimento: e.target.value })} style={input}>
            {emps.map((e) => <option key={e} value={e} style={opt}>{e}</option>)}
          </select>
        </Campo>
        <Campo label="Nome/versão">
          <input value={t.nome} onChange={(e) => setT({ ...t, nome: e.target.value })} placeholder="Julho/26" style={input} />
        </Campo>
        <Campo label="Espelho (data)">
          <select value={t.data_espelho} onChange={(e) => setT({ ...t, data_espelho: e.target.value })} style={input}>
            {datas.map((d) => <option key={d} value={d} style={opt}>{d.split("-").reverse().join("/")}</option>)}
          </select>
        </Campo>
        <Campo label="Entrega prevista">
          <input value={t.entrega_prevista || ""} onChange={(e) => setT({ ...t, entrega_prevista: e.target.value })} placeholder="Junho/32" style={input} />
        </Campo>
        <Campo label="Localização">
          <input value={t.localizacao || ""} onChange={(e) => setT({ ...t, localizacao: e.target.value })} style={input} />
        </Campo>
        <Campo label="Link público (slug)">
          <input value={t.slug} onChange={(e) => setT({ ...t, slug: slugify(e.target.value) })} style={input} />
        </Campo>
      </div>
      <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <label style={check}>
          <input type="checkbox" checked={t.mostrar_valor_m2} onChange={(e) => setT({ ...t, mostrar_valor_m2: e.target.checked })} />
          Mostrar coluna Valor do m²
        </label>
        <label style={check}>
          <input type="checkbox" checked={t.publicada} onChange={(e) => setT({ ...t, publicada: e.target.checked })} />
          Publicada (visível pros corretores / link público)
        </label>
        {t.publicada && (
          <button
            onClick={() => navigator.clipboard.writeText(`${BASE_URL}/tabela/${t.slug}`)}
            style={{ ...btnGhost, fontSize: 11 }}
          >
            Copiar link
          </button>
        )}
      </div>

      {/* Componentes */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <p style={{ ...secLabel, marginBottom: 0 }}>Estrutura de pagamento</p>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {Object.keys(MODELOS).map((m) => (
            <button key={m} onClick={() => setComps(MODELOS[m].map((c) => ({ ...c })))} style={{ ...btnGhost, fontSize: 11 }}>
              Modelo: {m}
            </button>
          ))}
          <span style={{ fontSize: 12, color: ok100 ? "#4caf7d" : "#e0a23b", fontWeight: 600 }}>
            Soma: {soma.toFixed(2)}% {ok100 ? "✓" : "(precisa dar 100%)"}
          </span>
        </div>
      </div>

      <div style={{ marginTop: 10, marginBottom: 8 }}>
        <div style={{ ...compRow, color: "rgba(255,255,255,0.4)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.4px" }}>
          <span>Nome (como aparece na coluna)</span>
          <span>Grupo (opcional)</span>
          <span>% do total</span>
          <span>Parcelas</span>
          <span>Valor por parcela*</span>
          <span />
        </div>
        {comps.map((c, i) => (
          <div key={i} style={compRow}>
            <input value={c.nome} onChange={(e) => setComp(i, { nome: e.target.value })} style={input} />
            <input value={c.grupo || ""} onChange={(e) => setComp(i, { grupo: e.target.value || null })} placeholder="—" style={input} />
            <input type="number" step="0.0001" value={c.percentual} onChange={(e) => setComp(i, { percentual: Number(e.target.value) })} style={input} />
            <input type="number" min="1" value={c.parcelas} onChange={(e) => setComp(i, { parcelas: Number(e.target.value) })} style={input} />
            <span style={{ fontSize: 12, color: BLUE, alignSelf: "center" }}>
              {(Number(c.percentual) / Math.max(1, Number(c.parcelas))).toFixed(4)}% cada
            </span>
            <button onClick={() => delComp(i)} style={{ ...btnGhost, color: "#e88", padding: "6px 10px" }}>✕</button>
          </div>
        ))}
        <button onClick={addComp} style={{ ...btnGhost, marginTop: 6 }}>+ Adicionar componente</button>
      </div>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>
        * % por parcela. O valor em R$ = Valor Total da unidade × % ÷ parcelas. Componentes com o mesmo <b>grupo</b> geram
        uma coluna de subtotal (como &quot;Taxa de Adesão&quot; e &quot;Custo de Construção&quot; no Horizon).
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18 }}>
        <button onClick={salvar} disabled={salvando} style={{ ...btnPrimary, opacity: salvando ? 0.6 : 1 }}>
          {salvando ? "Salvando…" : "Salvar tabela"}
        </button>
        {msg && <span style={{ fontSize: 12, color: msg.startsWith("Erro") ? "#e88" : "#4caf7d" }}>{msg}</span>}
      </div>

      {/* Preview */}
      <p style={secLabel}>Preview ({unidades.length} unidades do espelho)</p>
      <div style={{ overflowX: "auto", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, whiteSpace: "nowrap" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)" }}>
              <th style={th}>Unidade</th>
              {t.mostrar_valor_m2 && <th style={th}>Valor do m²</th>}
              <th style={th}>Área</th>
              <th style={th}>Valor Total</th>
              {colunas.map((c) => (
                <th key={c.key} style={{ ...th, color: c.tipo === "grupo" ? BLUE : undefined }}>
                  {c.label}
                  <div style={{ fontSize: 9, fontWeight: 400, opacity: 0.6 }}>
                    {c.percentual.toFixed(2)}%{c.tipo === "componente" && c.parcelas > 1 ? ` · ${c.parcelas}x` : ""}
                  </div>
                </th>
              ))}
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {unidades.slice(0, 12).map((u, i) => {
              const vt = Number(u.valor) || 0;
              const area = Number(u.area_m2) || 0;
              return (
                <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.85)" }}>
                  <td style={td}>{u.apartamento}</td>
                  {t.mostrar_valor_m2 && <td style={td}>{area > 0 ? brl(vt / area) : "—"}</td>}
                  <td style={td}>{area.toFixed(2)}</td>
                  <td style={{ ...td, color: "#fff", fontWeight: 600 }}>{brl(vt)}</td>
                  {colunas.map((c) => (
                    <td key={c.key} style={{ ...td, color: c.tipo === "grupo" ? BLUE : undefined }}>
                      {brl(valorDaColuna(c, vt))}
                    </td>
                  ))}
                  <td style={td}>{STATUS_LABEL[u.status] || u.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {unidades.length > 12 && (
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>
          Mostrando 12 de {unidades.length} — a tabela publicada mostra todas.
        </p>
      )}
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.4px", display: "block", marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const cardBox: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 18 };
const secLabel: React.CSSProperties = { fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 };
const input: React.CSSProperties = { padding: "8px 10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "#fff", fontSize: 12.5, outline: "none", width: "100%", colorScheme: "dark", minWidth: 0 };
const opt: React.CSSProperties = { background: "#1a1a1a", color: "#fff" };
const btnPrimary: React.CSSProperties = { padding: "10px 18px", background: BLUE, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" };
const btnGhost: React.CSSProperties = { padding: "8px 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "#fff", fontSize: 12, cursor: "pointer", textDecoration: "none", whiteSpace: "nowrap" };
const check: React.CSSProperties = { fontSize: 12, color: "rgba(255,255,255,0.7)", display: "flex", gap: 7, alignItems: "center", cursor: "pointer" };
const compRow: React.CSSProperties = { display: "grid", gridTemplateColumns: "2fr 1.4fr 0.8fr 0.7fr 1fr auto", gap: 8, marginBottom: 6, alignItems: "center" };
const th: React.CSSProperties = { padding: "8px 10px", textAlign: "left", fontWeight: 600, fontSize: 10.5 };
const td: React.CSSProperties = { padding: "7px 10px" };
