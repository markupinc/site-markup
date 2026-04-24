"use client";

interface Material {
  id: string;
  titulo: string;
  categoria: "folder" | "tabela" | "divulgacao" | "outros";
  drive_url: string;
  descricao: string | null;
}

export default function MaterialLink({ material }: { material: Material }) {
  function handleClick() {
    fetch("/api/corretores/acesso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ material_id: material.id }),
      keepalive: true,
    }).catch(() => {});
  }

  return (
    <a
      href={material.drive_url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      style={{
        display: "block",
        padding: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        textDecoration: "none",
        color: "#1a1a1a",
        border: "1px solid rgba(0,0,0,0.05)",
        transition: "border-color 0.2s, transform 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#1a1a1a",
              marginBottom: material.descricao ? "4px" : 0,
            }}
          >
            {material.titulo}
          </p>
          {material.descricao && (
            <p style={{ fontSize: "12px", color: "#8a7d72", lineHeight: 1.5 }}>
              {material.descricao}
            </p>
          )}
        </div>
        <span
          style={{
            fontSize: "16px",
            color: "#b8945f",
            flexShrink: 0,
          }}
        >
          ↗
        </span>
      </div>
    </a>
  );
}
