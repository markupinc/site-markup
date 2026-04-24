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

const maskPhone = (value: string) => {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
};

export default function CadastroForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    creci: "",
    aceite_termos: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k: keyof typeof form, v: string | boolean) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/corretores/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Erro ao cadastrar.");
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
          Cadastro do Corretor
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          Acesso imediato aos materiais dos empreendimentos.
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
            maxWidth: "520px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            padding: "40px 32px",
            boxShadow: "0 4px 30px rgba(0,0,0,0.05)",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label style={labelStyle}>Nome completo</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => update("nome", e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Telefone</label>
              <input
                type="tel"
                value={form.telefone}
                onChange={(e) => update("telefone", maskPhone(e.target.value))}
                placeholder="(82) 98229-4001"
                style={inputStyle}
                required
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <label style={labelStyle}>CPF</label>
                <input
                  type="text"
                  value={form.cpf}
                  onChange={(e) => update("cpf", maskCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>CRECI</label>
                <input
                  type="text"
                  value={form.creci}
                  onChange={(e) => update("creci", e.target.value.toUpperCase())}
                  placeholder="AL-12345"
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                fontSize: "13px",
                color: "#444",
                marginTop: "8px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={form.aceite_termos}
                onChange={(e) => update("aceite_termos", e.target.checked)}
                style={{ marginTop: "3px" }}
                required
              />
              <span>
                Aceito os{" "}
                <Link
                  href="/termos"
                  target="_blank"
                  style={{ color: "#b8945f", textDecoration: "none" }}
                >
                  termos de uso
                </Link>{" "}
                e a{" "}
                <Link
                  href="/privacidade"
                  target="_blank"
                  style={{ color: "#b8945f", textDecoration: "none" }}
                >
                  política de privacidade
                </Link>
                .
              </span>
            </label>

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
              {loading ? "Criando conta..." : "Criar conta"}
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
            Já tem cadastro?{" "}
            <Link
              href="/corretores/login"
              style={{
                color: "#b8945f",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Entrar
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
