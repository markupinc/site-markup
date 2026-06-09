"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Horario {
  id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string | null;
  capacidade: number;
  ativo: boolean;
}

interface Reserva {
  id: string;
  horario_id: string;
  corretor_id: string | null;
  nome: string;
  creci: string;
  email: string;
  telefone: string;
  status: "confirmada" | "cancelada";
  created_at: string;
}

const formatDate = (s: string) => {
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
};

export default function InscritosManager({
  treinamentoId,
  treinamentoTitulo,
}: {
  treinamentoId: string;
  treinamentoTitulo: string;
}) {
  const supabase = createClient();
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data: hs } = await supabase
      .from("treinamento_horarios")
      .select("*")
      .eq("treinamento_id", treinamentoId)
      .order("data")
      .order("hora_inicio");
    const ids = (hs as Horario[] | null)?.map((h) => h.id) || [];
    let rs: Reserva[] = [];
    if (ids.length > 0) {
      const { data: rdata } = await supabase
        .from("treinamento_reservas")
        .select("*")
        .in("horario_id", ids)
        .eq("status", "confirmada")
        .order("created_at");
      rs = (rdata as Reserva[]) || [];
    }
    setHorarios((hs as Horario[]) || []);
    setReservas(rs);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treinamentoId]);

  const porHorario = useMemo(() => {
    const map = new Map<string, Reserva[]>();
    reservas.forEach((r) => {
      const arr = map.get(r.horario_id) || [];
      arr.push(r);
      map.set(r.horario_id, arr);
    });
    return map;
  }, [reservas]);

  function exportCSV() {
    const linhas = [
      ["Data", "Início", "Nome", "CRECI", "E-mail", "Telefone", "Inscrição em"].join(","),
    ];
    horarios.forEach((h) => {
      (porHorario.get(h.id) || []).forEach((r) => {
        linhas.push(
          [
            formatDate(h.data),
            h.hora_inicio.slice(0, 5),
            escape(r.nome),
            escape(r.creci),
            escape(r.email),
            escape(r.telefone),
            new Date(r.created_at).toLocaleString("pt-BR"),
          ].join(",")
        );
      });
    });
    const blob = new Blob([linhas.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${treinamentoTitulo.replace(/\s+/g, "-").toLowerCase()}-inscritos.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function cancelar(id: string) {
    if (!confirm("Cancelar esta inscrição?")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("treinamento_reservas") as any)
      .update({ status: "cancelada" })
      .eq("id", id);
    setReservas((prev) => prev.filter((r) => r.id !== id));
  }

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "14px", fontWeight: 500, color: "#fff", marginBottom: "4px" }}>
            Inscritos
          </h2>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
            {reservas.length} confirmada{reservas.length === 1 ? "" : "s"}.
            E-mail e telefone são privados — apenas você vê.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCSV}
          disabled={reservas.length === 0}
          style={{
            padding: "8px 14px",
            backgroundColor: "transparent",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "6px",
            color: "#fff",
            fontSize: "12px",
            cursor: reservas.length === 0 ? "not-allowed" : "pointer",
            opacity: reservas.length === 0 ? 0.4 : 1,
          }}
        >
          Exportar CSV
        </button>
      </div>

      {loading ? (
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Carregando...</p>
      ) : horarios.length === 0 ? (
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
          Crie horários para receber inscrições.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {horarios.map((h) => {
            const lista = porHorario.get(h.id) || [];
            return (
              <div
                key={h.id}
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  padding: "12px 16px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "#fff",
                    marginBottom: "8px",
                    fontWeight: 500,
                  }}
                >
                  {formatDate(h.data)} · {h.hora_inicio.slice(0, 5)}
                  {h.hora_fim ? ` – ${h.hora_fim.slice(0, 5)}` : ""}
                  <span
                    style={{
                      marginLeft: "10px",
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.4)",
                      fontWeight: 400,
                    }}
                  >
                    {lista.length} / {h.capacidade} inscrito{lista.length === 1 ? "" : "s"}
                  </span>
                </div>
                {lista.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
                    Sem inscritos.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {lista.map((r) => (
                      <div
                        key={r.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
                          gap: "12px",
                          fontSize: "12px",
                          color: "rgba(255,255,255,0.8)",
                          padding: "6px 0",
                          borderBottom: "1px dashed rgba(255,255,255,0.05)",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          {r.corretor_id ? (
                            <Link
                              href={`/admin/corretores`}
                              style={{ color: "#b8945f", textDecoration: "none" }}
                              title="Tem cadastro de corretor"
                            >
                              {r.nome} ↗
                            </Link>
                          ) : (
                            r.nome
                          )}
                        </div>
                        <div>{r.creci}</div>
                        <a
                          href={`mailto:${r.email}`}
                          style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}
                        >
                          {r.email}
                        </a>
                        <a
                          href={`tel:${r.telefone}`}
                          style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}
                        >
                          {r.telefone}
                        </a>
                        <button
                          type="button"
                          onClick={() => cancelar(r.id)}
                          style={{
                            padding: "4px 10px",
                            backgroundColor: "transparent",
                            border: "1px solid rgba(212,91,91,0.3)",
                            borderRadius: "4px",
                            color: "#d45b5b",
                            fontSize: "11px",
                            cursor: "pointer",
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function escape(v: string) {
  if (v.includes(",") || v.includes('"') || v.includes("\n"))
    return `"${v.replace(/"/g, '""')}"`;
  return v;
}
