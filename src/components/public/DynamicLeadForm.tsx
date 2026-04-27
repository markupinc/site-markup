"use client";

import { useState, useEffect } from "react";
import type { CampoFormulario } from "@/types/database";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 500,
  color: "rgba(255,255,255,0.6)",
  marginBottom: "6px",
  letterSpacing: "0.3px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  fontSize: "14px",
  color: "#ffffff",
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "6px",
  outline: "none",
  transition: "border-color 0.2s ease",
  boxSizing: "border-box",
};

const errorStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#e57373",
  marginTop: "4px",
};

interface Props {
  empreendimentoId?: string;
  empreendimentoNome?: string;
  campos: CampoFormulario[];
}

interface BasicData {
  nome: string;
  telefone: string;
  email: string;
  mensagem: string;
}

export default function DynamicLeadForm({
  empreendimentoId,
  empreendimentoNome,
  campos,
}: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [basic, setBasic] = useState<BasicData>({
    nome: "",
    telefone: "",
    email: "",
    mensagem: "",
  });
  const [respostas, setRespostas] = useState<Record<string, string | string[]>>(
    {}
  );
  const [attribution, setAttribution] = useState<Record<string, string>>({});

  useEffect(() => {
    const data: Record<string, string> = {};
    const params = new URLSearchParams(window.location.search);
    for (const key of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
    ]) {
      const v = params.get(key);
      if (v) data[key] = v;
    }
    if (!data.utm_source) {
      try {
        const stored = sessionStorage.getItem("markup_lead_attribution");
        if (stored) {
          const parsed = JSON.parse(stored);
          for (const key of [
            "utm_source",
            "utm_medium",
            "utm_campaign",
            "utm_content",
            "utm_term",
          ]) {
            if (!data[key] && parsed[key]) data[key] = parsed[key];
          }
          if (parsed.referrer) data.referrer = parsed.referrer;
        }
      } catch {}
    }
    if (!data.referrer) {
      const ref = document.referrer || "";
      if (ref && !ref.startsWith(window.location.origin)) {
        data.referrer = ref;
      }
    }
    setAttribution(data);
  }, []);

  const camposOrdenados = [...campos].sort((a, b) => a.ordem - b.ordem);

  const isCampoVisivel = (campo: CampoFormulario): boolean => {
    if (!campo.condicao) return true;
    const valor = respostas[campo.condicao.campo_id];
    if (Array.isArray(valor)) return valor.includes(campo.condicao.valor);
    return valor === campo.condicao.valor;
  };

  const updateBasic = (key: keyof BasicData, value: string) => {
    setBasic((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const updateResposta = (id: string, valor: string | string[]) => {
    setRespostas((prev) => ({ ...prev, [id]: valor }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const toggleCheckbox = (id: string, opcao: string) => {
    const atual = respostas[id];
    const arr = Array.isArray(atual) ? atual : [];
    const next = arr.includes(opcao)
      ? arr.filter((v) => v !== opcao)
      : [...arr, opcao];
    updateResposta(id, next);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    const novosErros: Record<string, string> = {};

    if (!basic.nome.trim() || basic.nome.trim().length < 2)
      novosErros.nome = "Informe seu nome";
    if (!basic.telefone.trim() || basic.telefone.replace(/\D/g, "").length < 10)
      novosErros.telefone = "Informe um telefone válido";
    if (basic.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basic.email))
      novosErros.email = "E-mail inválido";

    // Valida campos custom visíveis
    const respostasFinais: Record<string, string | string[]> = {};
    for (const campo of camposOrdenados) {
      if (!isCampoVisivel(campo)) continue;
      const valor = respostas[campo.id];
      const vazio =
        valor === undefined ||
        valor === "" ||
        (Array.isArray(valor) && valor.length === 0);
      if (campo.obrigatorio && vazio) {
        novosErros[campo.id] = "Campo obrigatório";
      }
      if (!vazio) {
        // salva como label (não id) pra ficar legível no admin
        respostasFinais[campo.label] = valor!;
      }
    }

    if (Object.keys(novosErros).length > 0) {
      setErrors(novosErros);
      setStatus("idle");
      return;
    }

    try {
      const body: Record<string, unknown> = {
        nome: basic.nome,
        telefone: basic.telefone,
        origem: "site",
        pagina_origem: window.location.href,
        ...attribution,
      };
      if (basic.email) body.email = basic.email;
      if (basic.mensagem) body.mensagem = basic.mensagem;
      if (empreendimentoId) body.empreendimento_id = empreendimentoId;
      if (Object.keys(respostasFinais).length > 0) {
        body.respostas_personalizadas = respostasFinais;
      }

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? "Erro ao enviar formulário.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Erro inesperado. Tente novamente."
      );
    }
  }

  if (status === "success") {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <p
          style={{
            fontSize: "18px",
            fontWeight: 500,
            color: "#1CB8E8",
            marginBottom: "8px",
          }}
        >
          Obrigado!
        </p>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
          Entraremos em contato em breve.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Campos padrão */}
        <div>
          <label style={labelStyle}>
            Nome <span style={{ color: "#1CB8E8" }}>*</span>
          </label>
          <input
            value={basic.nome}
            onChange={(e) => updateBasic("nome", e.target.value)}
            placeholder="Seu nome completo"
            style={inputStyle}
          />
          {errors.nome && <p style={errorStyle}>{errors.nome}</p>}
        </div>

        <div>
          <label style={labelStyle}>
            Telefone <span style={{ color: "#1CB8E8" }}>*</span>
          </label>
          <input
            value={basic.telefone}
            onChange={(e) => updateBasic("telefone", e.target.value)}
            placeholder="(00) 00000-0000"
            type="tel"
            style={inputStyle}
          />
          {errors.telefone && <p style={errorStyle}>{errors.telefone}</p>}
        </div>

        <div>
          <label style={labelStyle}>E-mail</label>
          <input
            value={basic.email}
            onChange={(e) => updateBasic("email", e.target.value)}
            placeholder="seu@email.com"
            type="email"
            style={inputStyle}
          />
          {errors.email && <p style={errorStyle}>{errors.email}</p>}
        </div>

        {/* Campos custom */}
        {camposOrdenados.filter(isCampoVisivel).map((campo) => (
          <div key={campo.id}>
            <label style={labelStyle}>
              {campo.label}
              {campo.obrigatorio && <span style={{ color: "#1CB8E8" }}> *</span>}
            </label>
            {renderCampo(campo, respostas, updateResposta, toggleCheckbox)}
            {errors[campo.id] && <p style={errorStyle}>{errors[campo.id]}</p>}
          </div>
        ))}

        {/* Mensagem (mantém depois dos custom) */}
        <div>
          <label style={labelStyle}>Mensagem</label>
          <textarea
            value={basic.mensagem}
            onChange={(e) => updateBasic("mensagem", e.target.value)}
            placeholder={
              empreendimentoNome
                ? `Gostaria de saber mais sobre o ${empreendimentoNome}...`
                : "Escreva sua mensagem..."
            }
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {status === "error" && (
          <p style={{ ...errorStyle, textAlign: "center" }}>{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "14px",
            fontWeight: 600,
            letterSpacing: "0.5px",
            color: "#ffffff",
            backgroundColor: status === "loading" ? "#159bc2" : "#1CB8E8",
            border: "none",
            borderRadius: "6px",
            cursor: status === "loading" ? "not-allowed" : "pointer",
            transition: "background-color 0.2s ease",
          }}
        >
          {status === "loading" ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </form>
  );
}

function renderCampo(
  campo: CampoFormulario,
  respostas: Record<string, string | string[]>,
  update: (id: string, valor: string | string[]) => void,
  toggleCheck: (id: string, opcao: string) => void
) {
  const valor = respostas[campo.id];

  switch (campo.tipo) {
    case "textarea":
      return (
        <textarea
          value={(valor as string) || ""}
          onChange={(e) => update(campo.id, e.target.value)}
          placeholder={campo.placeholder}
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      );

    case "numero":
      return (
        <input
          type="number"
          value={(valor as string) || ""}
          onChange={(e) => update(campo.id, e.target.value)}
          placeholder={campo.placeholder}
          style={inputStyle}
        />
      );

    case "select":
      return (
        <select
          value={(valor as string) || ""}
          onChange={(e) => update(campo.id, e.target.value)}
          style={{ ...inputStyle, colorScheme: "dark" }}
        >
          <option value="" style={{ backgroundColor: "#1a1a1a" }}>
            Selecione...
          </option>
          {(campo.opcoes || []).map((o) => (
            <option key={o} value={o} style={{ backgroundColor: "#1a1a1a" }}>
              {o}
            </option>
          ))}
        </select>
      );

    case "selecao_unica":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {(campo.opcoes || []).map((o) => (
            <label
              key={o}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                backgroundColor: "rgba(255,255,255,0.04)",
                border: `1px solid ${
                  valor === o ? "#1CB8E8" : "rgba(255,255,255,0.1)"
                }`,
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                color: "#fff",
              }}
            >
              <input
                type="radio"
                name={campo.id}
                value={o}
                checked={valor === o}
                onChange={() => update(campo.id, o)}
                style={{ accentColor: "#1CB8E8" }}
              />
              {o}
            </label>
          ))}
        </div>
      );

    case "multipla_escolha": {
      const arr = Array.isArray(valor) ? valor : [];
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {(campo.opcoes || []).map((o) => (
            <label
              key={o}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                backgroundColor: "rgba(255,255,255,0.04)",
                border: `1px solid ${
                  arr.includes(o) ? "#1CB8E8" : "rgba(255,255,255,0.1)"
                }`,
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                color: "#fff",
              }}
            >
              <input
                type="checkbox"
                checked={arr.includes(o)}
                onChange={() => toggleCheck(campo.id, o)}
                style={{ accentColor: "#1CB8E8" }}
              />
              {o}
            </label>
          ))}
        </div>
      );
    }

    case "texto":
    default:
      return (
        <input
          type="text"
          value={(valor as string) || ""}
          onChange={(e) => update(campo.id, e.target.value)}
          placeholder={campo.placeholder}
          style={inputStyle}
        />
      );
  }
}
