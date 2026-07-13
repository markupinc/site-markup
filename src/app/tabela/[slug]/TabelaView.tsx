"use client";

import { useMemo, useState } from "react";
import {
  Componente,
  UnidadeTabela,
  montarColunas,
  valorDaColuna,
  brl,
  STATUS_LABEL,
} from "@/lib/tabelas/calc";

const BLUE = "#00aeef";
const NAVY = "#0c1c3a";
const COR_STATUS: Record<string, string> = {
  disponivel: "#3a4d6d",
  reservada: "#b8945f",
  vendida: "#00aeef",
  outros: "#9aa3ad",
};

interface Tabela {
  empreendimento: string;
  nome: string;
  data_espelho: string;
  entrega_prevista: string | null;
  localizacao: string | null;
  incorporadora: string | null;
  mostrar_valor_m2: boolean;
  observacoes: string | null;
}

const FILTROS = [
  { label: "Todas", value: "todas" },
  { label: "Disponíveis", value: "disponivel" },
  { label: "Reservadas", value: "reservada" },
  { label: "Vendidas", value: "vendida" },
];

export default function TabelaView({
  tabela,
  componentes,
  unidades,
}: {
  tabela: Tabela;
  componentes: Componente[];
  unidades: UnidadeTabela[];
}) {
  const [filtro, setFiltro] = useState("todas");
  const colunas = useMemo(() => montarColunas(componentes), [componentes]);

  const lista = useMemo(
    () =>
      (filtro === "todas" ? unidades : unidades.filter((u) => u.status === filtro)).slice().sort((a, b) =>
        a.apartamento.localeCompare(b.apartamento, "pt-BR", { numeric: true })
      ),
    [unidades, filtro]
  );

  const contagem = useMemo(() => {
    const c: Record<string, number> = { todas: unidades.length };
    unidades.forEach((u) => (c[u.status] = (c[u.status] || 0) + 1));
    return c;
  }, [unidades]);

  return (
    <div style={page}>
      <style>{printCSS}</style>

      {/* Cabeçalho */}
      <div style={hero}>
        <div>
          <span style={kicker}>{tabela.incorporadora || "MARKUP INCORPORAÇÕES"}</span>
          <h1 style={titulo}>{tabela.empreendimento}</h1>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
            {tabela.localizacao && <span>📍 {tabela.localizacao}</span>}
            {tabela.entrega_prevista && <span>🔑 Entrega: {tabela.entrega_prevista}</span>}
            <span>📋 Tabela: {tabela.nome}</span>
          </div>
        </div>
        <button onClick={() => window.print()} style={btnPrint} className="no-print">
          Imprimir / PDF
        </button>
      </div>

      {/* Filtro de status */}
      <div style={{ display: "flex", gap: 8, margin: "18px 0", flexWrap: "wrap" }} className="no-print">
        {FILTROS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            style={{
              ...chip,
              background: filtro === f.value ? BLUE : "#fff",
              color: filtro === f.value ? "#fff" : "#3a4453",
              borderColor: filtro === f.value ? BLUE : "#d6dbe2",
            }}
          >
            {f.label} ({contagem[f.value] ?? 0})
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(12,28,58,0.08)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, whiteSpace: "nowrap" }}>
            <thead>
              <tr style={{ background: NAVY, color: "#fff" }}>
                <th style={th}>Unidade</th>
                {tabela.mostrar_valor_m2 && <th style={th}>Valor do m²</th>}
                <th style={th}>Área (m²)</th>
                <th style={th}>Valor Total</th>
                {colunas.map((c) => (
                  <th key={c.key} style={{ ...th, background: c.tipo === "grupo" ? "#13294d" : undefined }}>
                    {c.label}
                    <div style={{ fontSize: 9, fontWeight: 400, opacity: 0.7, marginTop: 2 }}>
                      {c.percentual.toFixed(2).replace(".", ",")}%
                      {c.tipo === "componente" && c.parcelas > 1 ? ` · ${c.parcelas}x` : ""}
                    </div>
                  </th>
                ))}
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((u, i) => {
                const vt = Number(u.valor) || 0;
                const area = Number(u.area_m2) || 0;
                return (
                  <tr key={i} style={{ borderTop: "1px solid #eef1f5", background: i % 2 ? "#fafbfc" : "#fff" }}>
                    <td style={{ ...td, fontWeight: 600, color: NAVY }}>{u.apartamento}</td>
                    {tabela.mostrar_valor_m2 && <td style={td}>{area > 0 ? brl(vt / area) : "—"}</td>}
                    <td style={td}>{area.toFixed(2).replace(".", ",")}</td>
                    <td style={{ ...td, fontWeight: 700, color: NAVY }}>{brl(vt)}</td>
                    {colunas.map((c) => (
                      <td key={c.key} style={{ ...td, fontWeight: c.tipo === "grupo" ? 600 : 400, color: c.tipo === "grupo" ? BLUE : "#3a4453" }}>
                        {brl(valorDaColuna(c, vt))}
                      </td>
                    ))}
                    <td style={td}>
                      <span style={{ ...badge, background: `${COR_STATUS[u.status] || "#9aa3ad"}18`, color: COR_STATUS[u.status] || "#9aa3ad", border: `1px solid ${COR_STATUS[u.status] || "#9aa3ad"}40` }}>
                        {STATUS_LABEL[u.status] || u.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {lista.length === 0 && (
                <tr>
                  <td colSpan={20} style={{ ...td, textAlign: "center", color: "#8a93a0", padding: 24 }}>
                    Nenhuma unidade nesse filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {tabela.observacoes && (
        <p style={{ fontSize: 12, color: "#5b6573", marginTop: 16, lineHeight: 1.6 }}>{tabela.observacoes}</p>
      )}
      <p style={{ fontSize: 11, color: "#8a93a0", marginTop: 16, lineHeight: 1.6 }}>
        Valores sujeitos a alteração sem aviso prévio. Tabela {tabela.nome} · posição de{" "}
        {tabela.data_espelho.split("-").reverse().join("/")}. Não constitui proposta comercial.
        <br />© {new Date().getFullYear()} {tabela.incorporadora || "Markup Incorporações"} · Maceió/AL
      </p>
    </div>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", background: "#eef1f5", padding: 24, color: "#1a2332", fontFamily: "var(--font-inter)" };
const hero: React.CSSProperties = {
  background: `linear-gradient(135deg, ${NAVY} 0%, #13294d 100%)`,
  borderRadius: 14,
  padding: "26px 28px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
};
const kicker: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: BLUE, textTransform: "uppercase", letterSpacing: "1.5px" };
const titulo: React.CSSProperties = { fontFamily: "var(--font-playfair)", fontSize: 28, fontWeight: 500, color: "#fff", margin: "6px 0 0" };
const btnPrint: React.CSSProperties = { padding: "10px 20px", background: BLUE, color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" };
const chip: React.CSSProperties = { padding: "7px 14px", border: "1px solid #d6dbe2", borderRadius: 999, fontSize: 12.5, fontWeight: 500, cursor: "pointer" };
const th: React.CSSProperties = { padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 11 };
const td: React.CSSProperties = { padding: "9px 12px" };
const badge: React.CSSProperties = { fontSize: 10.5, fontWeight: 600, padding: "2px 8px", borderRadius: 999 };

const printCSS = `
@media print {
  .no-print { display: none !important; }
  body { background: #fff !important; }
  table { font-size: 9px !important; }
  th, td { padding: 4px 6px !important; }
  @page { size: A4 landscape; margin: 10mm; }
}`;
