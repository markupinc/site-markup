"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Lead {
  id: string;
  nome: string;
  empreendimento_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  pagina_origem: string | null;
  created_at: string;
}

interface QrAcesso {
  id: string;
  qr_slug: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
}

interface Corretor {
  id: string;
  nome: string;
  created_at: string;
}

interface MaterialAcesso {
  id: string;
  corretor_id: string;
  material_id: string;
  created_at: string;
}

interface FormularioResposta {
  empreendimento_id: string | null;
  respostas: Record<string, string | string[]>;
  created_at: string;
}

interface Empreendimento {
  id: string;
  nome: string;
}

const RANGES = [
  { label: "Últimos 7 dias", value: 7 },
  { label: "Últimos 30 dias", value: 30 },
  { label: "Últimos 90 dias", value: 90 },
  { label: "Tudo", value: 0 },
];

export default function AnalyticsPage() {
  const supabase = createClient();
  const [range, setRange] = useState(30);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [qrAcessos, setQrAcessos] = useState<QrAcesso[]>([]);
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [materialAcessos, setMaterialAcessos] = useState<MaterialAcesso[]>([]);
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);
  const [respostas, setRespostas] = useState<FormularioResposta[]>([]);
  const [ga4Url, setGa4Url] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);

      const since =
        range === 0
          ? null
          : new Date(Date.now() - range * 24 * 60 * 60 * 1000).toISOString();

      const leadsQuery = supabase
        .from("leads")
        .select(
          "id, nome, empreendimento_id, utm_source, utm_medium, utm_campaign, pagina_origem, created_at"
        )
        .order("created_at", { ascending: false });
      if (since) leadsQuery.gte("created_at", since);

      const qrQuery = supabase
        .from("qr_acessos")
        .select("id, qr_slug, utm_source, utm_medium, utm_campaign, created_at")
        .order("created_at", { ascending: false });
      if (since) qrQuery.gte("created_at", since);

      const corQuery = supabase
        .from("corretores")
        .select("id, nome, created_at")
        .order("created_at", { ascending: false });
      if (since) corQuery.gte("created_at", since);

      const matQuery = supabase
        .from("material_acessos")
        .select("id, corretor_id, material_id, created_at");
      if (since) matQuery.gte("created_at", since);

      const respQuery = supabase
        .from("formulario_respostas")
        .select("empreendimento_id, respostas, created_at");
      if (since) respQuery.gte("created_at", since);

      const [leadsRes, qrRes, corRes, matRes, respRes, empRes, configRes] =
        await Promise.all([
          leadsQuery,
          qrQuery,
          corQuery,
          matQuery,
          respQuery,
          supabase.from("empreendimentos").select("id, nome"),
          supabase
            .from("configuracoes")
            .select("valor")
            .eq("chave", "ga4_dashboard_url")
            .maybeSingle<{ valor: string | null }>(),
        ]);

      setLeads((leadsRes.data as Lead[]) || []);
      setQrAcessos((qrRes.data as QrAcesso[]) || []);
      setCorretores((corRes.data as Corretor[]) || []);
      setMaterialAcessos((matRes.data as MaterialAcesso[]) || []);
      setRespostas((respRes.data as FormularioResposta[]) || []);
      setEmpreendimentos((empRes.data as Empreendimento[]) || []);
      setGa4Url(configRes.data?.valor || "");
      setLoading(false);
    }
    load();
  }, [range]);

  // Agregações
  const summary = useMemo(
    () => ({
      leads: leads.length,
      qrAcessos: qrAcessos.length,
      corretores: corretores.length,
      materialAcessos: materialAcessos.length,
    }),
    [leads, qrAcessos, corretores, materialAcessos]
  );

  const leadsPorCampanha = useMemo(() => {
    const map = new Map<string, number>();
    leads.forEach((l) => {
      const key =
        [l.utm_source, l.utm_medium, l.utm_campaign]
          .filter(Boolean)
          .join(" / ") || "(direto / sem UTM)";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([campanha, count]) => ({ campanha, count }));
  }, [leads]);

  const leadsPorEmpreendimento = useMemo(() => {
    const empMap = new Map(empreendimentos.map((e) => [e.id, e.nome]));
    const map = new Map<string, number>();
    leads.forEach((l) => {
      const nome = l.empreendimento_id
        ? empMap.get(l.empreendimento_id) || "(removido)"
        : "(sem empreendimento)";
      map.set(nome, (map.get(nome) || 0) + 1);
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([nome, count]) => ({ nome, count }));
  }, [leads, empreendimentos]);

  const qrPorSlug = useMemo(() => {
    const map = new Map<string, number>();
    qrAcessos.forEach((q) => {
      map.set(q.qr_slug, (map.get(q.qr_slug) || 0) + 1);
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([slug, count]) => ({ slug, count }));
  }, [qrAcessos]);

  const qrPorCampanha = useMemo(() => {
    const map = new Map<string, number>();
    qrAcessos.forEach((q) => {
      const key =
        [q.utm_source, q.utm_medium, q.utm_campaign].filter(Boolean).join(" / ") ||
        "(sem UTM)";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([campanha, count]) => ({ campanha, count }));
  }, [qrAcessos]);

  const corretoresAtivos = useMemo(() => {
    const map = new Map<string, number>();
    materialAcessos.forEach((m) => {
      map.set(m.corretor_id, (map.get(m.corretor_id) || 0) + 1);
    });
    const corMap = new Map(corretores.map((c) => [c.id, c.nome]));
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({ nome: corMap.get(id) || "—", count }));
  }, [materialAcessos, corretores]);

  // Agrega respostas por (empreendimento → pergunta → opção)
  const respostasAgrupadas = useMemo(() => {
    const empMap = new Map(empreendimentos.map((e) => [e.id, e.nome]));
    type Pergunta = { pergunta: string; opcoes: Map<string, number> };
    const porEmp = new Map<string, Map<string, Pergunta>>();

    respostas.forEach((r) => {
      const empId = r.empreendimento_id || "geral";
      if (!porEmp.has(empId)) porEmp.set(empId, new Map());
      const perguntas = porEmp.get(empId)!;

      Object.entries(r.respostas || {}).forEach(([pergunta, resp]) => {
        if (!perguntas.has(pergunta)) {
          perguntas.set(pergunta, { pergunta, opcoes: new Map() });
        }
        const item = perguntas.get(pergunta)!;
        const valores = Array.isArray(resp) ? resp : [String(resp)];
        valores.forEach((v) => {
          if (!v) return;
          item.opcoes.set(v, (item.opcoes.get(v) || 0) + 1);
        });
      });
    });

    return [...porEmp.entries()].map(([empId, perguntas]) => ({
      empreendimento: empMap.get(empId) || "(sem empreendimento)",
      perguntas: [...perguntas.values()].map((p) => ({
        pergunta: p.pergunta,
        opcoes: [...p.opcoes.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([opcao, count]) => ({ opcao, count })),
      })),
    }));
  }, [respostas, empreendimentos]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          marginBottom: "32px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 300,
              color: "#fff",
              marginBottom: "8px",
            }}
          >
            Analytics
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            Conversões e fontes baseadas em dados próprios. Para audiência geral
            (sessões, tempo, geo), use o Google Analytics.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <select
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
            style={{
              ...inputStyle,
              colorScheme: "dark",
              minWidth: "160px",
            }}
          >
            {RANGES.map((r) => (
              <option key={r.value} value={r.value} style={optionStyle}>
                {r.label}
              </option>
            ))}
          </select>
          <a
            href={ga4Url || "https://analytics.google.com"}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "10px 16px",
              backgroundColor: "#fff",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Abrir Google Analytics ↗
          </a>
        </div>
      </div>

      {!ga4Url && (
        <div
          style={{
            backgroundColor: "rgba(184,148,95,0.08)",
            border: "1px solid rgba(184,148,95,0.2)",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "24px",
            fontSize: "12px",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          Dica: cole a URL da sua propriedade no GA4 em{" "}
          <a
            href="/admin/configuracoes"
            style={{ color: "#b8945f", textDecoration: "none" }}
          >
            Configurações → Tracking → URL do GA4
          </a>{" "}
          para o botão acima abrir direto no relatório certo.
        </div>
      )}

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <SummaryCard label="Leads" value={summary.leads} loading={loading} />
        <SummaryCard
          label="Cliques em QR"
          value={summary.qrAcessos}
          loading={loading}
        />
        <SummaryCard
          label="Novos corretores"
          value={summary.corretores}
          loading={loading}
        />
        <SummaryCard
          label="Acessos a materiais"
          value={summary.materialAcessos}
          loading={loading}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "16px",
        }}
      >
        <Section title="Leads por campanha (UTM)">
          <RankingTable
            rows={leadsPorCampanha}
            keyName="campanha"
            empty={loading ? "Carregando..." : "Sem leads no período."}
          />
        </Section>

        <Section title="Leads por empreendimento">
          <RankingTable
            rows={leadsPorEmpreendimento}
            keyName="nome"
            empty={loading ? "Carregando..." : "Sem leads no período."}
          />
        </Section>

        <Section title="QR Codes — cliques por slug">
          <RankingTable
            rows={qrPorSlug}
            keyName="slug"
            prefix="/qr/"
            empty={loading ? "Carregando..." : "Sem cliques no período."}
          />
        </Section>

        <Section title="QR Codes — por campanha (UTM)">
          <RankingTable
            rows={qrPorCampanha}
            keyName="campanha"
            empty={loading ? "Carregando..." : "Sem cliques com UTM no período."}
          />
        </Section>

        <Section title="Corretores mais ativos (acessos a materiais)">
          <RankingTable
            rows={corretoresAtivos}
            keyName="nome"
            empty={loading ? "Carregando..." : "Sem acessos no período."}
          />
        </Section>
      </div>

      {/* Respostas dos formulários personalizados */}
      {respostasAgrupadas.length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 500,
              color: "#fff",
              marginBottom: "16px",
            }}
          >
            Respostas dos formulários
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: "16px",
            }}
          >
            {respostasAgrupadas.map((emp) => (
              <Section
                key={emp.empreendimento}
                title={emp.empreendimento}
              >
                {emp.perguntas.map((p) => (
                  <div key={p.pergunta} style={{ marginBottom: "20px" }}>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.5)",
                        marginBottom: "8px",
                        fontWeight: 500,
                      }}
                    >
                      {p.pergunta}
                    </p>
                    <RankingTable rows={p.opcoes} keyName="opcao" empty="Sem dados." />
                  </div>
                ))}
              </Section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <div
      style={{
        backgroundColor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          color: "rgba(255,255,255,0.5)",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: "8px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "32px",
          color: "#fff",
          fontWeight: 300,
          margin: 0,
        }}
      >
        {loading ? "—" : value.toLocaleString("pt-BR")}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <h2
        style={{
          fontSize: "14px",
          fontWeight: 500,
          color: "#fff",
          marginBottom: "16px",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function RankingTable({
  rows,
  keyName,
  prefix = "",
  empty,
}: {
  rows: Array<Record<string, string | number>>;
  keyName: string;
  prefix?: string;
  empty: string;
}) {
  if (rows.length === 0) {
    return (
      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
        {empty}
      </p>
    );
  }
  const max = Math.max(...rows.map((r) => Number(r.count)));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {rows.slice(0, 10).map((row, i) => {
        const pct = (Number(row.count) / max) * 100;
        return (
          <div key={i}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "4px",
                fontSize: "12px",
              }}
            >
              <span
                style={{
                  color: "rgba(255,255,255,0.85)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  paddingRight: "8px",
                  flex: 1,
                }}
                title={String(row[keyName])}
              >
                {prefix}
                {row[keyName]}
              </span>
              <span style={{ color: "#fff", fontWeight: 500 }}>
                {Number(row.count).toLocaleString("pt-BR")}
              </span>
            </div>
            <div
              style={{
                height: "4px",
                backgroundColor: "rgba(255,255,255,0.06)",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  backgroundColor: "#b8945f",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
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
};

const optionStyle: React.CSSProperties = {
  backgroundColor: "#1a1a1a",
  color: "#fff",
};
