"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

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
    <>
      <Navbar logoSrc="/assets/logo.png" />

      {/* Hero */}
      <section
        style={{
          backgroundColor: "#1a1a1a",
          paddingTop: "160px",
          paddingBottom: "40px",
          textAlign: "center",
          padding: "160px 20px 40px",
        }}
      >
        <h1
          className="font-serif"
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "40px",
            color: "#ffffff",
            fontWeight: 400,
            marginBottom: "8px",
          }}
        >
          Área do Corretor
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          Acesso aos materiais dos empreendimentos Markup.
        </p>
      </section>

      {/* Form card */}
      <main
        style={{
          backgroundColor: "#f5ebe1",
          padding: "60px 20px",
          minHeight: "60vh",
        }}
      >
        <div
          style={{
            maxWidth: "440px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            padding: "40px 32px",
            boxShadow: "0 4px 30px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            className="font-serif"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "24px",
              color: "#1a1a1a",
              fontWeight: 400,
              marginBottom: "8px",
            }}
          >
            Entrar
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "#8a7d72",
              marginBottom: "28px",
            }}
          >
            Acesse com seu CPF cadastrado.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
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
              <p style={{ fontSize: "13px", color: "#c0392b", margin: 0 }}>
                {error}
              </p>
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
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
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
              marginTop: "28px",
              textAlign: "center",
            }}
          >
            Não tem cadastro?{" "}
            <Link
              href="/corretores/cadastro"
              style={{
                color: "#b8945f",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Criar conta
            </Link>
          </p>
        </div>
      </main>

      <Footer logoSrc="/assets/logo.png" />
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  color: "#8a7d72",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid rgba(0,0,0,0.12)",
  borderRadius: "4px",
  fontSize: "14px",
  outline: "none",
  backgroundColor: "#ffffff",
  color: "#1a1a1a",
  boxSizing: "border-box",
};
