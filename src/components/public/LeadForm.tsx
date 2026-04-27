"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const leadSchema = z.object({
  nome: z.string().min(2, "Informe seu nome"),
  telefone: z
    .string()
    .min(10, "Informe um telefone válido")
    .max(20, "Telefone inválido"),
  email: z.union([z.string().email("E-mail inválido"), z.literal("")]).optional(),
  mensagem: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  empreendimentoId?: string;
  empreendimentoNome?: string;
}

export default function LeadForm({
  empreendimentoId,
  empreendimentoNome,
}: LeadFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [attribution, setAttribution] = useState<Record<string, string>>({});

  useEffect(() => {
    const data: Record<string, string> = {};

    // 1. UTMs da URL atual têm prioridade
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

    // 2. Senão usa o que está em sessionStorage (primeira atribuição da sessão)
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
      } catch {
        // ignora
      }
    }

    // 3. Captura referrer atual se não tiver vindo do storage
    if (!data.referrer) {
      const ref = document.referrer || "";
      if (ref && !ref.startsWith(window.location.origin)) {
        data.referrer = ref;
      }
    }

    setAttribution(data);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormData>();

  const onSubmit = async (data: LeadFormData) => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const body: Record<string, unknown> = {
        nome: data.nome,
        telefone: data.telefone,
        origem: "site",
        pagina_origem: window.location.href,
        ...attribution,
      };

      if (data.email) body.email = data.email;
      if (data.mensagem) body.mensagem = data.mensagem;
      if (empreendimentoId) body.empreendimento_id = empreendimentoId;

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
      reset();
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Erro inesperado. Tente novamente.");
    }
  };

  if (status === "success") {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px 0",
        }}
      >
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
        <p
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          Entraremos em contato em breve.
        </p>
      </div>
    );
  }

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
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: 500,
    color: "rgba(255,255,255,0.6)",
    marginBottom: "6px",
    letterSpacing: "0.3px",
  };

  const errorStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#e57373",
    marginTop: "4px",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Nome */}
        <div>
          <label style={labelStyle}>
            Nome <span style={{ color: "#1CB8E8" }}>*</span>
          </label>
          <input
            {...register("nome", { required: "Informe seu nome" })}
            placeholder="Seu nome completo"
            style={inputStyle}
          />
          {errors.nome && <p style={errorStyle}>{errors.nome.message}</p>}
        </div>

        {/* Telefone */}
        <div>
          <label style={labelStyle}>
            Telefone <span style={{ color: "#1CB8E8" }}>*</span>
          </label>
          <input
            {...register("telefone", {
              required: "Informe seu telefone",
              minLength: { value: 10, message: "Telefone inválido" },
            })}
            placeholder="(00) 00000-0000"
            type="tel"
            style={inputStyle}
          />
          {errors.telefone && (
            <p style={errorStyle}>{errors.telefone.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label style={labelStyle}>E-mail</label>
          <input
            {...register("email")}
            placeholder="seu@email.com"
            type="email"
            style={inputStyle}
          />
          {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
        </div>

        {/* Mensagem */}
        <div>
          <label style={labelStyle}>Mensagem</label>
          <textarea
            {...register("mensagem")}
            placeholder={
              empreendimentoNome
                ? `Gostaria de saber mais sobre o ${empreendimentoNome}...`
                : "Escreva sua mensagem..."
            }
            rows={4}
            style={{
              ...inputStyle,
              resize: "vertical",
            }}
          />
        </div>

        {/* Error message */}
        {status === "error" && (
          <p style={{ ...errorStyle, textAlign: "center" }}>{errorMessage}</p>
        )}

        {/* Submit */}
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
            transition: "background-color 0.2s ease, transform 0.2s ease",
          }}
        >
          {status === "loading" ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </form>
  );
}
