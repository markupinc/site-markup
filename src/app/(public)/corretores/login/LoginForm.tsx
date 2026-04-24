"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const maskCpf = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

export default function LoginForm() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/corretores/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Erro ao entrar.");
        setLoading(false);
        return;
      }
      router.push("/corretores/dashboard");
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5ebe1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "48px 32px",
          boxShadow: "0 4px 30px rgba(0,0,0,0.05)",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: "12px",
            color: "#8a7d72",
            textDecoration: "none",
            marginBottom: "24px",
            display: "inline-block",
          }}
        >
          ← Voltar ao site
        </Link>
        <h1
          className="font-serif"
          style={{
            fontSize: "32px",
            color: "#1a1a1a",
            marginBottom: "8px",
            fontWeight: 400,
          }}
        >
          Área do Corretor
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#8a7d72",
            marginBottom: "32px",
          }}
        >
          Acesse com seu CPF cadastrado.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>CPF</label>
            <input
              type="text"
              value={cpf}
              onChange={(e) => setCpf(maskCpf(e.target.value))}
              placeholder="000.000.000-00"
              style={inputStyle}
              autoComplete="off"
              required
            />
          </div>

          {error && (
            <p style={{ fontSize: "13px", color: "#c0392b", margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "8px",
              padding: "14px",
              backgroundColor: "#1a1a1a",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p
          style={{
            fontSize: "13px",
            color: "#8a7d72",
            marginTop: "24px",
            textAlign: "center",
          }}
        >
          Não tem cadastro?{" "}
          <Link
            href="/corretores/cadastro"
            style={{ color: "#b8945f", textDecoration: "none", fontWeight: 500 }}
          >
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  color: "#8a7d72",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid rgba(0,0,0,0.12)",
  borderRadius: "8px",
  fontSize: "14px",
  outline: "none",
  backgroundColor: "#ffffff",
  color: "#1a1a1a",
  boxSizing: "border-box",
};
