"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface CorretorInicial {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  creci: string;
  cpf: string;
}

const maskPhone = (value: string) => {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
};

const maskCpf = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

const isValidCpf = (cpf: string) => {
  const c = cpf.replace(/\D/g, "");
  if (c.length !== 11) return false;
  if (/^(\d)\1+$/.test(c)) return false;
  const digits = c.split("").map(Number);
  for (let t = 9; t < 11; t++) {
    let sum = 0;
    for (let i = 0; i < t; i++) sum += digits[i] * (t + 1 - i);
    const check = ((sum * 10) % 11) % 10;
    if (check !== digits[t]) return false;
  }
  return true;
};

const MOTIVOS: Record<string, string> = {
  lotado: "Esse horário acabou de lotar.",
  expirado: "Esse horário já começou.",
  email_duplicado: "Esse e-mail já reservou esse horário.",
  fechado: "Treinamento fechado para inscrições.",
  nao_encontrado: "Horário não encontrado.",
  dados_invalidos: "Preencha todos os campos.",
  cpf_invalido: "CPF inválido.",
  creci_em_uso: "Esse CRECI já está cadastrado para outra pessoa.",
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
    cpf: corretorInicial?.cpf ? maskCpf(corretorInicial.cpf) : "",
    creci: corretorInicial?.creci || "",
    email: corretorInicial?.email || "",
    telefone: corretorInicial?.telefone
      ? maskPhone(corretorInicial.telefone)
      : "",
    aceite: !!corretorInicial,
  });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [corretorLogado, setCorretorLogado] = useState(!!corretorInicial);

  async function handleReservar() {
    setErro("");
    if (
      !form.nome.trim() ||
      !form.cpf.trim() ||
      !form.creci.trim() ||
      !form.email.trim() ||
      !form.telefone.trim()
    ) {
      setErro("Preencha todos os campos.");
      return;
    }
    if (!isValidCpf(form.cpf)) {
      setErro("CPF inválido.");
      return;
    }
    if (!form.aceite) {
      setErro("É necessário aceitar os termos de uso e a política de privacidade.");
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
      p_cpf: form.cpf.trim(),
      p_corretor_id: corretorInicial?.id || null,
    });

    if (error) {
      setEnviando(false);
      setErro(error.message);
      return;
    }
    const res = data as { ok: boolean; motivo?: string };
    if (!res?.ok) {
      setEnviando(false);
      setErro(MOTIVOS[res?.motivo || ""] || "Não foi possível reservar.");
      return;
    }

    // Auto-login do corretor (seta cookie corretor_id)
    try {
      await fetch("/api/corretores/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: form.cpf.trim() }),
      });
      setCorretorLogado(true);
    } catch {
      // Se falhar, segue normal. O usuário ainda pode entrar manualmente depois.
    }

    setEnviando(false);
    setSucesso(true);
    // Atualiza a página (em background) pra refletir o novo nome na lista
    router.refresh();
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
          maxWidth: sucesso ? "480px" : "440px",
          maxHeight: "90vh",
          overflow: "auto",
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "32px",
          zIndex: 201,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {sucesso ? (
          <div style={{ textAlign: "center" }}>
            {/* Check icon */}
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                backgroundColor: `${accentColor}1A`,
                color: accentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: "36px",
                fontWeight: 300,
              }}
            >
              ✓
            </div>

            <h3
              style={{
                fontSize: "26px",
                color: "#1a1a1a",
                marginBottom: "8px",
                fontFamily: "var(--font-playfair)",
                fontWeight: 400,
              }}
            >
              Reserva confirmada
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#8a7d72",
                marginBottom: "8px",
                lineHeight: 1.6,
              }}
            >
              Sua vaga está garantida. Você receberá os detalhes do treinamento
              no e-mail informado.
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "#8a7d72",
                marginBottom: "28px",
                lineHeight: 1.6,
              }}
            >
              {corretorLogado
                ? "Você também tem acesso aos materiais de divulgação dos empreendimentos na Área do Corretor."
                : "Sua conta de corretor foi criada. Acesse a Área do Corretor com seu CPF."}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link
                href="/corretores/dashboard"
                style={{
                  display: "block",
                  padding: "14px",
                  backgroundColor: accentColor,
                  color: "#fff",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Acessar materiais
              </Link>
              <button
                type="button"
                onClick={() => {
                  setAberto(false);
                  setSucesso(false);
                }}
                style={{
                  padding: "12px",
                  backgroundColor: "transparent",
                  color: "#8a7d72",
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: "6px",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Fechar
              </button>
            </div>
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
                : "Sua conta de corretor será criada automaticamente."}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <Field label="Nome completo *">
                <input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  style={inputStyle}
                />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Field label="CPF *">
                  <input
                    value={form.cpf}
                    onChange={(e) => setForm({ ...form, cpf: maskCpf(e.target.value) })}
                    placeholder="000.000.000-00"
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
              </div>
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

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  fontSize: "12px",
                  color: "#555",
                  marginTop: "4px",
                  cursor: "pointer",
                  lineHeight: 1.5,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.aceite}
                  onChange={(e) => setForm({ ...form, aceite: e.target.checked })}
                  style={{ marginTop: "2px", accentColor }}
                />
                <span>
                  Aceito os{" "}
                  <Link
                    href="/termos"
                    target="_blank"
                    style={{ color: accentColor, textDecoration: "none" }}
                  >
                    termos de uso
                  </Link>{" "}
                  e a{" "}
                  <Link
                    href="/privacidade"
                    target="_blank"
                    style={{ color: accentColor, textDecoration: "none" }}
                  >
                    política de privacidade
                  </Link>
                  .
                </span>
              </label>

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
