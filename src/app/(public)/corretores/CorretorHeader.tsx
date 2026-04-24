"use client";

import { useRouter } from "next/navigation";

export default function CorretorHeader({ nome }: { nome: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/corretores/logout", { method: "POST" });
    router.push("/corretores/login");
    router.refresh();
  }

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "16px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            color: "#8a7d72",
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Área do Corretor · <span style={{ color: "#1a1a1a" }}>{nome}</span>
        </p>
        <button
          onClick={handleLogout}
          style={{
            padding: "6px 14px",
            backgroundColor: "transparent",
            color: "#8a7d72",
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Sair
        </button>
      </div>
    </div>
  );
}
