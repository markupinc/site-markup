"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import ImageUpload from "@/components/admin/ImageUpload";

interface MidiaFormData {
  fonte: string;
  titulo: string;
  url: string;
  data_publicacao: string;
  thumbnail_url: string;
  ativo: boolean;
  ordem: number;
}

// ─── Style constants ─────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  padding: "24px",
};
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  color: "rgba(255,255,255,0.4)",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "13px",
  outline: "none",
  fontFamily: "inherit",
};
const sectionTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 500,
  color: "#fff",
  marginBottom: "20px",
};
const gridTwo: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "16px",
};
const errorStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#d45b5b",
  marginTop: "4px",
};

export default function EditMidiaPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MidiaFormData>({
    defaultValues: {
      fonte: "",
      titulo: "",
      url: "",
      data_publicacao: "",
      thumbnail_url: "",
      ativo: true,
      ordem: 0,
    },
  });

  const thumbnailUrl = watch("thumbnail_url");

  // Load data
  useEffect(() => {
    (async () => {
      const { data, error: fetchError } = await (supabase.from("midia") as any)
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !data) {
        setError(fetchError?.message || "Noticia nao encontrada");
        setLoading(false);
        return;
      }

      const item = data as Record<string, any>;

      reset({
        fonte: item.fonte || "",
        titulo: item.titulo || "",
        url: item.url || "",
        data_publicacao: item.data_publicacao || "",
        thumbnail_url: item.thumbnail_url || "",
        ativo: item.ativo ?? true,
        ordem: item.ordem || 0,
      });

      setLoading(false);
    })();
  }, [id]);

  const onSubmit = async (data: MidiaFormData) => {
    setSaving(true);
    setError(null);

    const payload: Record<string, unknown> = {
      fonte: data.fonte,
      titulo: data.titulo,
      url: data.url,
      data_publicacao: data.data_publicacao || null,
      thumbnail_url: data.thumbnail_url || null,
      ativo: data.ativo,
      ordem: data.ordem || 0,
    };

    const { error: updateError } = await (supabase.from("midia") as any)
      .update(payload)
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push("/admin/midia");
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta noticia? Esta acao nao pode ser desfeita.")) {
      return;
    }

    setDeleting(true);
    setError(null);

    const { error: deleteError } = await (supabase.from("midia") as any)
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
      return;
    }

    router.push("/admin/midia");
  };

  if (loading) {
    return (
      <div style={{ padding: "48px", textAlign: "center" }}>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Carregando...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 300, color: "#fff", marginBottom: "8px" }}>
            Editar Noticia
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            Altere as informacoes da noticia abaixo.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "10px 24px",
            backgroundColor: "#fff",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            opacity: saving ? 0.5 : 1,
          }}
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "rgba(212,91,91,0.1)",
            border: "1px solid rgba(212,91,91,0.3)",
            borderRadius: "8px",
            marginBottom: "24px",
            fontSize: "13px",
            color: "#d45b5b",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Informacoes */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Informacoes</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={gridTwo}>
              <div>
                <label style={labelStyle}>Fonte</label>
                <input
                  {...register("fonte", { required: "Fonte e obrigatoria" })}
                  style={inputStyle}
                  placeholder="Ex: Gazeta de Alagoas"
                />
                {errors.fonte && <p style={errorStyle}>{errors.fonte.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Titulo</label>
                <input
                  {...register("titulo", { required: "Titulo e obrigatorio" })}
                  style={inputStyle}
                  placeholder="Titulo da noticia"
                />
                {errors.titulo && <p style={errorStyle}>{errors.titulo.message}</p>}
              </div>
            </div>
            <div>
              <label style={labelStyle}>URL (link externo)</label>
              <input
                {...register("url", { required: "URL e obrigatoria" })}
                type="url"
                style={inputStyle}
                placeholder="https://exemplo.com/noticia"
              />
              {errors.url && <p style={errorStyle}>{errors.url.message}</p>}
            </div>
            <div style={gridTwo}>
              <div>
                <label style={labelStyle}>Data de Publicacao</label>
                <input
                  {...register("data_publicacao")}
                  type="date"
                  style={{ ...inputStyle, backgroundColor: "#1a1a1a" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Ordem</label>
                <input
                  {...register("ordem", { valueAsNumber: true })}
                  type="number"
                  style={inputStyle}
                  placeholder="0"
                />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input {...register("ativo")} type="checkbox" id="ativo" />
              <label htmlFor="ativo" style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
                Ativo
              </label>
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Thumbnail</h2>
          <div>
            <label style={labelStyle}>Imagem</label>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "8px" }}>
              Imagem de destaque da noticia (exibida na listagem).
            </p>
            <ImageUpload
              bucket="midia"
              path="thumbnails"
              currentUrl={thumbnailUrl || undefined}
              onUpload={(url) => setValue("thumbnail_url", url)}
            />
            <input type="hidden" {...register("thumbnail_url")} />
          </div>
        </div>

        {/* Zona de Perigo */}
        <div
          style={{
            ...cardStyle,
            borderColor: "rgba(212,91,91,0.2)",
          }}
        >
          <h2 style={{ ...sectionTitle, color: "#d45b5b" }}>Zona de Perigo</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>
            Esta acao e irreversivel. A noticia sera permanentemente excluida.
          </p>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            style={{
              padding: "10px 24px",
              backgroundColor: "rgba(212,91,91,0.15)",
              color: "#d45b5b",
              border: "1px solid rgba(212,91,91,0.3)",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              opacity: deleting ? 0.5 : 1,
            }}
          >
            {deleting ? "Excluindo..." : "Excluir Noticia"}
          </button>
        </div>
      </div>
    </form>
  );
}
