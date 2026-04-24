"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CorretorHeader({ nome }: { nome: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/corretores/logout", { method: "POST" });
    router.push("/corretores/login");
    router.refresh();
  }

  return (
    <header
      style={{
        backgroundColor: "#1a1a1a",
        padding: "16px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <Link
        href="/corretores/dashboard"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          textDecoration: "none",
        }}
      >
        <img
          src="/assets/logo.png"
          alt="Markup"
          style={{
            height: "32px",
            width: "auto",
            filter: "brightness(0) invert(1)",
          }}
        />
        <span
          style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            borderLeft: "1px solid rgba(255,255,255,0.2)",
            paddingLeft: "12px",
          }}
        >
          Área do Corretor
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          {nome}
        </span>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 14px",
            backgroundColor: "transparent",
            color: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "6px",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          Sair
        </button>
      </div>
    </header>
  );
}
