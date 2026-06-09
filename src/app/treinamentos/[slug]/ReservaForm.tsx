"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface CorretorInicial {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  creci: string;
}

const maskPhone = (value: string) => {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
};

const MOTIVOS: Record<string, string> = {
  lotado: "Esse horário acabou de lotar.",
  expirado: "Esse horário já começou.",
  email_duplicado: "Esse e-mail já reservou esse horário.",
  fechado: "Treinamento fechado para inscrições.",
  nao_encontrado: "Horário não encontrado.",
  dados_invalidos: "Preencha todos os campos.",
};

export default function ReservaForm({
  horarioId,
  cheio,
  accentColor,
  corretorInicial,
}: {
  horarioId: string;
  cheio: boolean;
  accentColor: string;
  corretorInicial: CorretorInicial | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState({
    nome: corretorInicial?.nome || "",
    creci: corretorInicial?.creci || "",
    email: corretorInicial?.email || "",
    telefone: corretorInicial?.telefone
      ? maskPhone(corretorInicial.telefone)
      : "",
  });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function handleReservar() {
    setErro("");
    if (!form.nome.trim() || !form.creci.trim() || !form.email.trim() || !form.telefone.trim()) {
      setErro("Preencha todos os campos.");
      return;
    }
    setEnviando(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc("treinamento_reservar", {
      p_horario_id: horarioId,
      p_nome: form.nome.trim(),
      p_creci: form.creci.trim(),
      p_email: form.email.trim(),
      p_telefone: form.telefone.trim(),
      p_corretor_id: corretorInicial?.id || null,
    });
    setEnviando(false);
    if (error) {
      setErro(error.message);
      return;
    }
    const res = data as { ok: boolean; motivo?: string };
    if (!res?.ok) {
      setErro(MOTIVOS[res?.motivo || ""] || "Não foi possível reservar.");
      return;
    }
    setSucesso(true);
    setTimeout(() => {
      setAberto(false);
      router.refresh();
    }, 1500);
  }

  if (cheio) {
    return (
      <span
        style={{
          padding: "10px 18px",
          backgroundColor: "rgba(0,0,0,0.05)",
          color: "#8a7d72",
          borderRadius: "6px",
          fontSize: "12px",
          fontWeight: 500,
          letterSpacing: "0.5px",
          textTransform: "uppercase",
        }}
      >
        Lotado
      </span>
    );
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        style={{
          padding: "10px 20px",
          backgroundColor: accentColor,
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
        }}
      >
        Reservar
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => !enviando && setAberto(false)}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          zIndex: 200,
        }}
      />
      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "calc(100% - 32px)",
          maxWidth: "440px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "32px",
          zIndex: 201,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {sucesso ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p
              style={{
                fontSize: "24px",
                color: accentColor,
                marginBottom: "8px",
                fontFamily: "var(--font-playfair)",
              }}
            >
              Reservado!
            </p>
            <p style={{ fontSize: "13px", color: "#8a7d72" }}>
              Você verá seu nome na lista em instantes.
            </p>
          </div>
        ) : (
          <>
            <h3
              style={{
                fontSize: "22px",
                color: "#1a1a1a",
                marginBottom: "8px",
                fontFamily: "var(--font-playfair)",
              }}
            >
              Reservar vaga
            </h3>
            <p style={{ fontSize: "13px", color: "#8a7d72", marginBottom: "20px" }}>
              {corretorInicial
                ? "Confirme seus dados ou ajuste se precisar."
                : "Preencha seus dados para reservar."}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <Field label="Nome completo *">
                <input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  style={inputStyle}
                />
              </Field>
              <Field label="CRECI *">
                <input
                  value={form.creci}
                  onChange={(e) =>
                    setForm({ ...form, creci: e.target.value.toUpperCase() })
                  }
                  placeholder="AL-12345"
                  style={inputStyle}
                />
              </Field>
              <Field label="E-mail *">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={inputStyle}
                />
              </Field>
              <Field label="Telefone *">
                <input
                  type="tel"
                  value={form.telefone}
                  onChange={(e) =>
                    setForm({ ...form, telefone: maskPhone(e.target.value) })
                  }
                  placeholder="(82) 98229-4001"
                  style={inputStyle}
                />
              </Field>

              {erro && (
                <p style={{ fontSize: "12px", color: "#c0392b", margin: 0 }}>
                  {erro}
                </p>
              )}

              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={handleReservar}
                  disabled={enviando}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: accentColor,
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: enviando ? "wait" : "pointer",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  {enviando ? "Reservando..." : "Confirmar reserva"}
                </button>
                <button
                  type="button"
                  onClick={() => setAberto(false)}
                  disabled={enviando}
                  style={{
                    padding: "12px 18px",
                    backgroundColor: "transparent",
                    color: "#8a7d72",
                    border: "1px solid rgba(0,0,0,0.12)",
                    borderRadius: "6px",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "11px",
          color: "#8a7d72",
          marginBottom: "5px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          fontWeight: 500,
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
  padding: "11px 14px",
  border: "1px solid rgba(0,0,0,0.12)",
  borderRadius: "6px",
  fontSize: "14px",
  outline: "none",
  backgroundColor: "#fff",
  color: "#1a1a1a",
  boxSizing: "border-box",
};
