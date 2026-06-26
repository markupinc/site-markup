"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Horario {
  id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string | null;
  capacidade: number;
  ativo: boolean;
}

const DIAS_SEMANA = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
];

export default function HorariosManager({
  treinamentoId,
}: {
  treinamentoId: string;
}) {
  const supabase = createClient();
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modo, setModo] = useState<"unico" | "recorrente">("unico");

  // Único
  const [unico, setUnico] = useState({
    data: "",
    hora_inicio: "",
    hora_fim: "",
    capacidade: 10,
  });
  // Recorrente
  const [rec, setRec] = useState({
    data_inicio: "",
    data_fim: "",
    dias: [] as number[],
    hora_inicio: "",
    hora_fim: "",
    capacidade: 10,
  });
  const [adicionando, setAdicionando] = useState(false);
  const [erro, setErro] = useState("");

  async function load() {
    const { data } = await supabase
      .from("treinamento_horarios")
      .select("*")
      .eq("treinamento_id", treinamentoId)
      .order("data")
      .order("hora_inicio");
    if (data) setHorarios(data as Horario[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treinamentoId]);

  async function addUnico() {
    setErro("");
    if (!unico.data || !unico.hora_inicio) {
      setErro("Data e hora de início são obrigatórias.");
      return;
    }
    setAdicionando(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("treinamento_horarios") as any).insert({
      treinamento_id: treinamentoId,
      data: unico.data,
      hora_inicio: unico.hora_inicio,
      hora_fim: unico.hora_fim || null,
      capacidade: unico.capacidade,
    });
    setAdicionando(false);
    if (error) {
      setErro(error.message);
      return;
    }
    setUnico({ data: "", hora_inicio: "", hora_fim: "", capacidade: 10 });
    load();
  }

  async function addRecorrente() {
    setErro("");
    if (
      !rec.data_inicio ||
      !rec.data_fim ||
      rec.dias.length === 0 ||
      !rec.hora_inicio
    ) {
      setErro("Preencha data início/fim, ao menos um dia e hora de início.");
      return;
    }
    if (new Date(rec.data_fim) < new Date(rec.data_inicio)) {
      setErro("Data fim deve ser maior ou igual à data início.");
      return;
    }

    const inicio = new Date(rec.data_inicio + "T00:00:00");
    const fim = new Date(rec.data_fim + "T00:00:00");
    const datas: string[] = [];
    const cur = new Date(inicio);
    while (cur <= fim) {
      if (rec.dias.includes(cur.getDay())) {
        const yyyy = cur.getFullYear();
        const mm = String(cur.getMonth() + 1).padStart(2, "0");
        const dd = String(cur.getDate()).padStart(2, "0");
        datas.push(`${yyyy}-${mm}-${dd}`);
      }
      cur.setDate(cur.getDate() + 1);
    }

    if (datas.length === 0) {
      setErro("Nenhuma data corresponde aos dias selecionados.");
      return;
    }

    setAdicionando(true);
    const rows = datas.map((d) => ({
      treinamento_id: treinamentoId,
      data: d,
      hora_inicio: rec.hora_inicio,
      hora_fim: rec.hora_fim || null,
      capacidade: rec.capacidade,
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("treinamento_horarios") as any).insert(rows);
    setAdicionando(false);
    if (error) {
      setErro(error.message);
      return;
    }
    setRec({
      data_inicio: "",
      data_fim: "",
      dias: [],
      hora_inicio: "",
      hora_fim: "",
      capacidade: 10,
    });
    load();
  }

  async function toggleAtivo(h: Horario) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("treinamento_horarios") as any)
      .update({ ativo: !h.ativo })
      .eq("id", h.id);
    setHorarios((prev) =>
      prev.map((x) => (x.id === h.id ? { ...x, ativo: !x.ativo } : x))
    );
  }

  async function setCapacidade(h: Horario, nova: number) {
    if (nova < 1) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("treinamento_horarios") as any)
      .update({ capacidade: nova })
      .eq("id", h.id);
    setHorarios((prev) =>
      prev.map((x) => (x.id === h.id ? { ...x, capacidade: nova } : x))
    );
  }

  async function remover(id: string) {
    if (!confirm("Excluir este horário e suas reservas?")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("treinamento_horarios") as any).delete().eq("id", id);
    setHorarios((prev) => prev.filter((h) => h.id !== id));
  }

  const formatDate = (s: string) => {
    const [y, m, d] = s.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div
      style={{
        backgroundColor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div>
        <h2 style={{ fontSize: "14px", fontWeight: 500, color: "#fff", marginBottom: "4px" }}>
          Horários
        </h2>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
          Adicione datas específicas ou crie uma série semanal.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <TabBtn ativo={modo === "unico"} onClick={() => setModo("unico")}>
          Data específica
        </TabBtn>
        <TabBtn ativo={modo === "recorrente"} onClick={() => setModo("recorrente")}>
          Recorrência semanal
        </TabBtn>
      </div>

      {/* Form */}
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          border: "1px dashed rgba(255,255,255,0.12)",
          borderRadius: "8px",
          padding: "16px",
        }}
      >
        {modo === "unico" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 100px auto",
              gap: "8px",
              alignItems: "end",
            }}
          >
            <FieldInline label="Data">
              <input
                type="date"
                value={unico.data}
                onChange={(e) => setUnico({ ...unico, data: e.target.value })}
                style={{ ...inputStyle, colorScheme: "dark" }}
              />
            </FieldInline>
            <FieldInline label="Início">
              <input
                type="time"
                value={unico.hora_inicio}
                onChange={(e) =>
                  setUnico({ ...unico, hora_inicio: e.target.value })
                }
                style={{ ...inputStyle, colorScheme: "dark" }}
              />
            </FieldInline>
            <FieldInline label="Fim (opc)">
              <input
                type="time"
                value={unico.hora_fim}
                onChange={(e) => setUnico({ ...unico, hora_fim: e.target.value })}
                style={{ ...inputStyle, colorScheme: "dark" }}
              />
            </FieldInline>
            <FieldInline label="Vagas">
              <input
                type="number"
                min="1"
                value={unico.capacidade}
                onChange={(e) =>
                  setUnico({ ...unico, capacidade: Number(e.target.value) })
                }
                style={inputStyle}
              />
            </FieldInline>
            <button
              type="button"
              onClick={addUnico}
              disabled={adicionando}
              style={btnAdd}
            >
              {adicionando ? "..." : "Adicionar"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}
            >
              <FieldInline label="Data início">
                <input
                  type="date"
                  value={rec.data_inicio}
                  onChange={(e) =>
                    setRec({ ...rec, data_inicio: e.target.value })
                  }
                  style={{ ...inputStyle, colorScheme: "dark" }}
                />
              </FieldInline>
              <FieldInline label="Data fim">
                <input
                  type="date"
                  value={rec.data_fim}
                  onChange={(e) => setRec({ ...rec, data_fim: e.target.value })}
                  style={{ ...inputStyle, colorScheme: "dark" }}
                />
              </FieldInline>
            </div>
            <FieldInline label="Dias da semana">
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {DIAS_SEMANA.map((d) => {
                  const ativo = rec.dias.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() =>
                        setRec({
                          ...rec,
                          dias: ativo
                            ? rec.dias.filter((v) => v !== d.value)
                            : [...rec.dias, d.value],
                        })
                      }
                      style={{
                        padding: "8px 12px",
                        backgroundColor: ativo ? "#00aeef" : "rgba(255,255,255,0.06)",
                        border: `1px solid ${ativo ? "#00aeef" : "rgba(255,255,255,0.1)"}`,
                        borderRadius: "6px",
                        color: "#fff",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </FieldInline>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 100px auto",
                gap: "8px",
                alignItems: "end",
              }}
            >
              <FieldInline label="Início">
                <input
                  type="time"
                  value={rec.hora_inicio}
                  onChange={(e) =>
                    setRec({ ...rec, hora_inicio: e.target.value })
                  }
                  style={{ ...inputStyle, colorScheme: "dark" }}
                />
              </FieldInline>
              <FieldInline label="Fim (opc)">
                <input
                  type="time"
                  value={rec.hora_fim}
                  onChange={(e) => setRec({ ...rec, hora_fim: e.target.value })}
                  style={{ ...inputStyle, colorScheme: "dark" }}
                />
              </FieldInline>
              <FieldInline label="Vagas">
                <input
                  type="number"
                  min="1"
                  value={rec.capacidade}
                  onChange={(e) =>
                    setRec({ ...rec, capacidade: Number(e.target.value) })
                  }
                  style={inputStyle}
                />
              </FieldInline>
              <button
                type="button"
                onClick={addRecorrente}
                disabled={adicionando}
                style={btnAdd}
              >
                {adicionando ? "..." : "Gerar horários"}
              </button>
            </div>
          </div>
        )}
        {erro && (
          <p style={{ fontSize: "12px", color: "#e88", marginTop: "8px" }}>
            {erro}
          </p>
        )}
      </div>

      {/* Lista */}
      {loading ? (
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Carregando...</p>
      ) : horarios.length === 0 ? (
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
          Nenhum horário criado ainda.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {horarios.map((h) => (
            <div
              key={h.id}
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "10px 14px",
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto",
                gap: "10px",
                alignItems: "center",
                opacity: h.ativo ? 1 : 0.5,
              }}
            >
              <div style={{ fontSize: "13px", color: "#fff" }}>
                <strong>{formatDate(h.data)}</strong> ·{" "}
                {h.hora_inicio.slice(0, 5)}
                {h.hora_fim ? ` – ${h.hora_fim.slice(0, 5)}` : ""}
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  Vagas:
                </span>
                <input
                  type="number"
                  min="1"
                  value={h.capacidade}
                  onChange={(e) => setCapacidade(h, Number(e.target.value))}
                  style={{
                    ...inputStyle,
                    width: "60px",
                    padding: "6px 8px",
                    fontSize: "12px",
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => toggleAtivo(h)}
                style={{
                  padding: "6px 10px",
                  backgroundColor: "transparent",
                  border: `1px solid ${h.ativo ? "#6b9f6b" : "rgba(255,255,255,0.15)"}`,
                  borderRadius: "6px",
                  color: h.ativo ? "#6b9f6b" : "rgba(255,255,255,0.5)",
                  fontSize: "11px",
                  cursor: "pointer",
                }}
              >
                {h.ativo ? "Ativo" : "Inativo"}
              </button>
              <button
                type="button"
                onClick={() => remover(h.id)}
                style={{
                  padding: "6px 10px",
                  backgroundColor: "transparent",
                  border: "1px solid rgba(212,91,91,0.3)",
                  borderRadius: "6px",
                  color: "#d45b5b",
                  fontSize: "11px",
                  cursor: "pointer",
                }}
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabBtn({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "10px 16px",
        backgroundColor: "transparent",
        border: "none",
        borderBottom: `2px solid ${ativo ? "#00aeef" : "transparent"}`,
        color: ativo ? "#fff" : "rgba(255,255,255,0.5)",
        fontSize: "13px",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function FieldInline({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "10px",
          color: "rgba(255,255,255,0.5)",
          marginBottom: "4px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
};

const btnAdd: React.CSSProperties = {
  padding: "8px 14px",
  backgroundColor: "#fff",
  color: "#000",
  border: "none",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: 500,
  cursor: "pointer",
  whiteSpace: "nowrap",
};
