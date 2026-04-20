"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface QrCode {
  id: string;
  slug: string;
  destino_url: string;
  descricao: string | null;
  ativo: boolean;
}

const BASE_URL = "https://markupincorporacoes.com.br";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

export default function QrCodesSection() {
  const supabase = createClient();
  const [codes, setCodes] = useState<QrCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [newDestino, setNewDestino] = useState("");
  const [newDescricao, setNewDescricao] = useState("");
  const [error, setError] = useState("");
  const [copiedSlug, setCopiedSlug] = useState("");

  async function load() {
    const { data } = await supabase
      .from("qr_codes")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setCodes(data as QrCode[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    setError("");
    const slug = slugify(newSlug);
    if (!slug) {
      setError("Informe um nome válido.");
      return;
    }
    if (!newDestino.trim()) {
      setError("Informe a URL de destino.");
      return;
    }
    setCreating(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase.from("qr_codes") as any).insert({
      slug,
      destino_url: newDestino.trim(),
      descricao: newDescricao.trim() || null,
    });
    setCreating(false);
    if (insertError) {
      setError(
        insertError.code === "23505"
          ? "Já existe um QR Code com esse nome."
          : insertError.message
      );
      return;
    }
    setNewSlug("");
    setNewDestino("");
    setNewDescricao("");
    load();
  };

  const handleUpdate = async (id: string, patch: Partial<QrCode>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("qr_codes") as any).update(patch).eq("id", id);
    setCodes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
  };

  const handleDelete = async (id: string, slug: string) => {
    if (!confirm(`Remover o QR Code /qr/${slug}?`)) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("qr_codes") as any).delete().eq("id", id);
    setCodes((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCopy = async (slug: string) => {
    await navigator.clipboard.writeText(`${BASE_URL}/qr/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(""), 2000);
  };

  return (
    <div
      style={{
        backgroundColor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        padding: "24px",
      }}
    >
      <h2
        style={{
          fontSize: "14px",
          fontWeight: 500,
          color: "#fff",
          marginBottom: "6px",
        }}
      >
        QR Codes
      </h2>
      <p
        style={{
          fontSize: "12px",
          color: "rgba(255,255,255,0.4)",
          marginBottom: "20px",
        }}
      >
        Crie redirecionamentos editáveis. A URL gerada segue o padrão{" "}
        <code style={{ color: "rgba(255,255,255,0.7)" }}>{BASE_URL}/qr/nome</code>.
      </p>

      {/* Create new */}
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          border: "1px dashed rgba(255,255,255,0.12)",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "24px",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.5)",
            marginBottom: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Novo QR Code
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr 2fr auto",
            gap: "8px",
            alignItems: "stretch",
          }}
        >
          <input
            type="text"
            placeholder="nome (ex: horizon)"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="URL de destino"
            value={newDestino}
            onChange={(e) => setNewDestino(e.target.value)}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="descrição (opcional)"
            value={newDescricao}
            onChange={(e) => setNewDescricao(e.target.value)}
            style={inputStyle}
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            style={{
              padding: "10px 16px",
              backgroundColor: "#fff",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              opacity: creating ? 0.5 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {creating ? "..." : "Criar"}
          </button>
        </div>
        {newSlug && (
          <p
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.5)",
              marginTop: "8px",
            }}
          >
            URL gerada: {BASE_URL}/qr/<strong style={{ color: "#fff" }}>{slugify(newSlug)}</strong>
          </p>
        )}
        {error && (
          <p style={{ fontSize: "12px", color: "#e88", marginTop: "8px" }}>
            {error}
          </p>
        )}
      </div>

      {/* List */}
      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
          Carregando...
        </p>
      ) : codes.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
          Nenhum QR Code criado ainda.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {codes.map((code) => (
            <QrCodeRow
              key={code.id}
              code={code}
              copied={copiedSlug === code.slug}
              onCopy={() => handleCopy(code.slug)}
              onUpdate={(patch) => handleUpdate(code.id, patch)}
              onDelete={() => handleDelete(code.id, code.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function QrCodeRow({
  code,
  copied,
  onCopy,
  onUpdate,
  onDelete,
}: {
  code: QrCode;
  copied: boolean;
  onCopy: () => void;
  onUpdate: (patch: Partial<QrCode>) => void;
  onDelete: () => void;
}) {
  const [destino, setDestino] = useState(code.destino_url);
  const [descricao, setDescricao] = useState(code.descricao || "");
  const dirty =
    destino !== code.destino_url || descricao !== (code.descricao || "");

  return (
    <div
      style={{
        backgroundColor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "8px",
        padding: "12px",
        display: "grid",
        gridTemplateColumns: "1.3fr 2fr 2fr auto auto auto",
        gap: "8px",
        alignItems: "center",
      }}
    >
      <code
        style={{
          fontSize: "12px",
          color: "rgba(255,255,255,0.9)",
          fontFamily: "monospace",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={`${BASE_URL}/qr/${code.slug}`}
      >
        markupincorporacoes.com.br/qr/<span style={{ color: "#fff", fontWeight: 600 }}>{code.slug}</span>
      </code>
      <input
        type="text"
        value={destino}
        onChange={(e) => setDestino(e.target.value)}
        onBlur={() => dirty && onUpdate({ destino_url: destino })}
        style={inputStyle}
      />
      <input
        type="text"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        onBlur={() =>
          dirty && onUpdate({ descricao: descricao.trim() || null })
        }
        placeholder="descrição"
        style={inputStyle}
      />
      <button
        onClick={onCopy}
        style={{
          ...miniButtonStyle,
          color: copied ? "#6b9f6b" : "#fff",
          borderColor: copied ? "rgba(107,159,107,0.4)" : "rgba(255,255,255,0.1)",
        }}
        title="Copiar URL"
      >
        {copied ? "✓ Copiado" : "Copiar"}
      </button>
      <ToggleSwitch
        ativo={code.ativo}
        onChange={() => onUpdate({ ativo: !code.ativo })}
      />
      <button
        onClick={onDelete}
        style={{ ...miniButtonStyle, color: "#e88" }}
        title="Remover"
      >
        Remover
      </button>
    </div>
  );
}

function ToggleSwitch({
  ativo,
  onChange,
}: {
  ativo: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      title={ativo ? "Ativo — clique para desativar" : "Inativo — clique para ativar"}
      style={{
        width: "44px",
        height: "24px",
        borderRadius: "12px",
        border: "none",
        backgroundColor: ativo ? "#22a355" : "#c0392b",
        position: "relative",
        cursor: "pointer",
        transition: "background-color 0.2s",
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "2px",
          left: ativo ? "22px" : "2px",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "13px",
  outline: "none",
};

const miniButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "12px",
  cursor: "pointer",
  whiteSpace: "nowrap",
};
