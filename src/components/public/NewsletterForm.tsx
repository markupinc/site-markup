"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !consent) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus("error");
        setErrorMsg(data.error || "Erro ao inscrever. Tente novamente.");
        return;
      }

      setStatus("success");
      setEmail("");
      setConsent(false);
    } catch {
      setStatus("error");
      setErrorMsg("Erro ao inscrever. Tente novamente.");
    }
  }

  if (status === "success") {
    return (
      <p
        style={{
          fontSize: "14px",
          color: "#b8945f",
          fontWeight: 500,
        }}
      >
        Inscrição confirmada!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Email input with arrow button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.3)",
          paddingBottom: "8px",
          marginBottom: "16px",
        }}
      >
        <input
          type="email"
          placeholder="Seu melhor e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            flex: 1,
            backgroundColor: "transparent",
            border: "none",
            outline: "none",
            color: "#ffffff",
            fontSize: "13px",
            padding: "4px 0",
          }}
        />
        <button
          type="submit"
          aria-label="Enviar"
          disabled={status === "loading" || !consent}
          style={{
            backgroundColor: "transparent",
            border: "none",
            cursor: status === "loading" || !consent ? "not-allowed" : "pointer",
            color: "rgba(255,255,255,0.5)",
            padding: "4px",
            transition: "color 0.3s ease",
            opacity: status === "loading" || !consent ? 0.4 : 1,
          }}
          className="hover:text-white"
        >
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Error message */}
      {status === "error" && (
        <p
          style={{
            fontSize: "12px",
            color: "#ef4444",
            marginBottom: "12px",
          }}
        >
          {errorMsg}
        </p>
      )}

      {/* Consent checkbox */}
      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "8px",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          style={{
            marginTop: "2px",
            accentColor: "#b8945f",
          }}
        />
        <span
          style={{
            fontSize: "11px",
            lineHeight: 1.5,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          Concordo em receber comunicações da Markup Incorporações e aceito a
          política de privacidade.
        </span>
      </label>
    </form>
  );
}
