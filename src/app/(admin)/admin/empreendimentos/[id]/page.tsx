"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import ImageUpload from "@/components/admin/ImageUpload";

// ─── Types ───────────────────────────────────────────────────────────────
interface Imagem {
  id: string;
  url: string;
  alt_text: string | null;
  categoria: string | null;
  ordem: number;
}
interface Planta {
  id: string;
  nome: string;
  url: string;
  area: number | null;
  quartos: number | null;
  suites: number | null;
  ordem: number;
}
interface Diferencial {
  id: string;
  titulo: string;
  descricao: string | null;
  icone: string | null;
  ordem: number;
}

// ─── Schema ──────────────────────────────────────────────────────────────
const schema = z.object({
  nome: z.string().min(1, "Nome e obrigatorio"),
  slug: z.string().min(1, "Slug e obrigatorio"),
  descricao_curta: z.string().max(500).optional().or(z.literal("")),
  descricao: z.string().optional().or(z.literal("")),
  status: z.enum(["lancamento", "em_obras", "entregue"]),
  destaque: z.boolean(),
  ativo: z.boolean(),
  ordem: z.coerce.number().int().min(0),
  endereco: z.string().optional().or(z.literal("")),
  cidade: z.string().optional().or(z.literal("")),
  estado: z.string().optional().or(z.literal("")),
  bairro: z.string().optional().or(z.literal("")),
  area_min: z.coerce.number().positive().optional().or(z.literal("") as unknown as z.ZodType<number>),
  area_max: z.coerce.number().positive().optional().or(z.literal("") as unknown as z.ZodType<number>),
  quartos_min: z.coerce.number().int().min(0).optional().or(z.literal("") as unknown as z.ZodType<number>),
  quartos_max: z.coerce.number().int().min(0).optional().or(z.literal("") as unknown as z.ZodType<number>),
  suites_min: z.coerce.number().int().min(0).optional().or(z.literal("") as unknown as z.ZodType<number>),
  suites_max: z.coerce.number().int().min(0).optional().or(z.literal("") as unknown as z.ZodType<number>),
  vagas_min: z.coerce.number().int().min(0).optional().or(z.literal("") as unknown as z.ZodType<number>),
  vagas_max: z.coerce.number().int().min(0).optional().or(z.literal("") as unknown as z.ZodType<number>),
  andares: z.coerce.number().int().min(0).optional().or(z.literal("") as unknown as z.ZodType<number>),
  unidades_por_andar: z.coerce.number().int().min(0).optional().or(z.literal("") as unknown as z.ZodType<number>),
  total_unidades: z.coerce.number().int().min(0).optional().or(z.literal("") as unknown as z.ZodType<number>),
  previsao_entrega: z.string().optional().or(z.literal("")),
  imagem_destaque_url: z.string().optional().or(z.literal("")),
  video_url: z.string().optional().or(z.literal("")),
  tour_virtual_url: z.string().optional().or(z.literal("")),
  meta_title: z.string().max(70).optional().or(z.literal("")),
  meta_description: z.string().max(160).optional().or(z.literal("")),
  og_image_url: z.string().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

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
const gridFour: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "16px",
};
const errorMsgStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#d45b5b",
  marginTop: "4px",
};
const smallBtnStyle: React.CSSProperties = {
  padding: "6px 14px",
  fontSize: "12px",
  borderRadius: "6px",
  border: "1px solid rgba(255,255,255,0.15)",
  backgroundColor: "rgba(255,255,255,0.06)",
  color: "#fff",
  cursor: "pointer",
};
const deleteBtnStyle: React.CSSProperties = {
  ...smallBtnStyle,
  borderColor: "rgba(212,91,91,0.3)",
  color: "#d45b5b",
};

export default function EditEmpreendimentoPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Related data
  const [imagens, setImagens] = useState<Imagem[]>([]);
  const [plantas, setPlantas] = useState<Planta[]>([]);
  const [diferenciais, setDiferenciais] = useState<Diferencial[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const imagemDestaqueUrl = watch("imagem_destaque_url");

  // ─── Load data ─────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);

    const [empRes, imgRes, plantaRes, difRes] = await Promise.all([
      (supabase.from("empreendimentos") as any).select("*").eq("id", id).single(),
      (supabase.from("empreendimento_imagens") as any).select("*").eq("empreendimento_id", id).order("ordem"),
      (supabase.from("empreendimento_plantas") as any).select("*").eq("empreendimento_id", id).order("ordem"),
      (supabase.from("empreendimento_diferenciais") as any).select("*").eq("empreendimento_id", id).order("ordem"),
    ]);

    if (empRes.error || !empRes.data) {
      setError("Empreendimento nao encontrado.");
      setLoading(false);
      return;
    }

    const emp = empRes.data;
    reset({
      nome: emp.nome || "",
      slug: emp.slug || "",
      descricao_curta: emp.descricao_curta || "",
      descricao: emp.descricao || "",
      status: emp.status || "lancamento",
      destaque: emp.destaque ?? false,
      ativo: emp.ativo ?? true,
      ordem: emp.ordem ?? 0,
      endereco: emp.endereco || "",
      cidade: emp.cidade || "",
      estado: emp.estado || "",
      bairro: emp.bairro || "",
      area_min: emp.area_min ?? "",
      area_max: emp.area_max ?? "",
      quartos_min: emp.quartos_min ?? "",
      quartos_max: emp.quartos_max ?? "",
      suites_min: emp.suites_min ?? "",
      suites_max: emp.suites_max ?? "",
      vagas_min: emp.vagas_min ?? "",
      vagas_max: emp.vagas_max ?? "",
      andares: emp.andares ?? "",
      unidades_por_andar: emp.unidades_por_andar ?? "",
      total_unidades: emp.total_unidades ?? "",
      previsao_entrega: emp.previsao_entrega || "",
      imagem_destaque_url: emp.imagem_destaque_url || "",
      video_url: emp.video_url || "",
      tour_virtual_url: emp.tour_virtual_url || "",
      meta_title: emp.meta_title || "",
      meta_description: emp.meta_description || "",
      og_image_url: emp.og_image_url || "",
    });

    setImagens(imgRes.data ?? []);
    setPlantas(plantaRes.data ?? []);
    setDiferenciais(difRes.data ?? []);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Slug auto-generation ──────────────────────────────────────────
  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("nome", value);
    setValue("slug", slugify(value));
  };

  // ─── Submit ────────────────────────────────────────────────────────
  const onSubmit = async (data: FormData) => {
    setSaving(true);
    setError(null);

    const payload: Record<string, unknown> = { ...data };
    const optionalFields = [
      "descricao_curta", "descricao", "endereco", "cidade", "estado", "bairro",
      "area_min", "area_max", "quartos_min", "quartos_max", "suites_min", "suites_max",
      "vagas_min", "vagas_max", "andares", "unidades_por_andar", "total_unidades",
      "previsao_entrega", "imagem_destaque_url", "video_url", "tour_virtual_url",
      "meta_title", "meta_description", "og_image_url",
    ];
    for (const field of optionalFields) {
      if (payload[field] === "" || payload[field] === undefined) {
        payload[field] = null;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase.from("empreendimentos") as any)
      .update(payload)
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push("/admin/empreendimentos");
  };

  // ─── Delete empreendimento ─────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: delError } = await (supabase.from("empreendimentos") as any)
      .delete()
      .eq("id", id);

    if (delError) {
      setError(delError.message);
      setDeleting(false);
      return;
    }
    router.push("/admin/empreendimentos");
  };

  // ─── Galeria helpers ───────────────────────────────────────────────
  const addImagem = async (url: string, categoria: string = "interior") => {
    const ordem = imagens.length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: err } = await (supabase.from("empreendimento_imagens") as any)
      .insert({ empreendimento_id: id, url, ordem, categoria })
      .select()
      .single();
    if (!err && data) setImagens((prev) => [...prev, data]);
  };

  const removeImagem = async (imgId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("empreendimento_imagens") as any).delete().eq("id", imgId);
    setImagens((prev) => prev.filter((i) => i.id !== imgId));
  };

  // ─── Plantas helpers ───────────────────────────────────────────────
  const [newPlanta, setNewPlanta] = useState({ nome: "", url: "", area: "", quartos: "", suites: "" });

  const addPlanta = async () => {
    if (!newPlanta.nome || !newPlanta.url) return;
    const ordem = plantas.length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: err } = await (supabase.from("empreendimento_plantas") as any)
      .insert({
        empreendimento_id: id,
        nome: newPlanta.nome,
        url: newPlanta.url,
        area: newPlanta.area ? Number(newPlanta.area) : null,
        quartos: newPlanta.quartos ? Number(newPlanta.quartos) : null,
        suites: newPlanta.suites ? Number(newPlanta.suites) : null,
        ordem,
      })
      .select()
      .single();
    if (!err && data) {
      setPlantas((prev) => [...prev, data]);
      setNewPlanta({ nome: "", url: "", area: "", quartos: "", suites: "" });
    }
  };

  const removePlanta = async (plantaId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("empreendimento_plantas") as any).delete().eq("id", plantaId);
    setPlantas((prev) => prev.filter((p) => p.id !== plantaId));
  };

  // ─── Diferenciais helpers ──────────────────────────────────────────
  const [newDif, setNewDif] = useState({ titulo: "", descricao: "", icone: "" });

  const addDiferencial = async () => {
    if (!newDif.titulo) return;
    const ordem = diferenciais.length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: err } = await (supabase.from("empreendimento_diferenciais") as any)
      .insert({
        empreendimento_id: id,
        titulo: newDif.titulo,
        descricao: newDif.descricao || null,
        icone: newDif.icone || null,
        ordem,
      })
      .select()
      .single();
    if (!err && data) {
      setDiferenciais((prev) => [...prev, data]);
      setNewDif({ titulo: "", descricao: "", icone: "" });
    }
  };

  const removeDiferencial = async (difId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("empreendimento_diferenciais") as any).delete().eq("id", difId);
    setDiferenciais((prev) => prev.filter((d) => d.id !== difId));
  };

  // ─── Loading state ─────────────────────────────────────────────────
  if (loading) {
    return (
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>Carregando...</p>
    );
  }

  if (error && !saving) {
    // If it's a "not found" error, show it without form
    if (error === "Empreendimento nao encontrado.") {
      return (
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 300, color: "#fff", marginBottom: "8px" }}>
            Empreendimento nao encontrado
          </h1>
          <a href="/admin/empreendimentos" style={{ fontSize: "13px", color: "#b8945f" }}>
            Voltar para lista
          </a>
        </div>
      );
    }
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
            Editar Empreendimento
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            Altere as informacoes e salve.
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

      {error && error !== "Empreendimento nao encontrado." && (
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
        {/* ─── Informacoes Basicas ───────────────────────────────── */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Informacoes Basicas</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={gridTwo}>
              <div>
                <label style={labelStyle}>Nome</label>
                <input
                  {...register("nome")}
                  onChange={handleNomeChange}
                  style={inputStyle}
                />
                {errors.nome && <p style={errorMsgStyle}>{errors.nome.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Slug</label>
                <input {...register("slug")} style={inputStyle} />
                {errors.slug && <p style={errorMsgStyle}>{errors.slug.message}</p>}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Descricao Curta</label>
              <input {...register("descricao_curta")} style={inputStyle} maxLength={500} />
            </div>
            <div>
              <label style={labelStyle}>Descricao Completa</label>
              <textarea {...register("descricao")} rows={5} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
          </div>
        </div>

        {/* ─── Status e Visibilidade ─────────────────────────────── */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Status e Visibilidade</h2>
          <div style={gridFour}>
            <div>
              <label style={labelStyle}>Status</label>
              <select {...register("status")} style={{ ...inputStyle, backgroundColor: "#1a1a1a" }}>
                <option value="lancamento" style={{ backgroundColor: "#1a1a1a", color: "#fff" }}>Lançamento</option>
                <option value="em_obras" style={{ backgroundColor: "#1a1a1a", color: "#fff" }}>Em Obras</option>
                <option value="entregue" style={{ backgroundColor: "#1a1a1a", color: "#fff" }}>Entregue</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Ordem</label>
              <input {...register("ordem")} type="number" style={inputStyle} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "20px" }}>
              <input {...register("destaque")} type="checkbox" id="destaque-edit" />
              <label htmlFor="destaque-edit" style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
                Destaque
              </label>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "20px" }}>
              <input {...register("ativo")} type="checkbox" id="ativo-edit" />
              <label htmlFor="ativo-edit" style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
                Ativo
              </label>
            </div>
          </div>
        </div>

        {/* ─── Localizacao ────────────────────────────────────────── */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Localizacao</h2>
          <div style={gridTwo}>
            <div>
              <label style={labelStyle}>Endereco</label>
              <input {...register("endereco")} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Bairro</label>
              <input {...register("bairro")} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Cidade</label>
              <input {...register("cidade")} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Estado</label>
              <input {...register("estado")} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* ─── Especificacoes ─────────────────────────────────────── */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Especificacoes</h2>
          <div style={gridFour}>
            <div>
              <label style={labelStyle}>Area Min (m2)</label>
              <input {...register("area_min")} type="number" step="0.01" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Area Max (m2)</label>
              <input {...register("area_max")} type="number" step="0.01" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Quartos Min</label>
              <input {...register("quartos_min")} type="number" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Quartos Max</label>
              <input {...register("quartos_max")} type="number" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Suites Min</label>
              <input {...register("suites_min")} type="number" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Suites Max</label>
              <input {...register("suites_max")} type="number" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Vagas Min</label>
              <input {...register("vagas_min")} type="number" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Vagas Max</label>
              <input {...register("vagas_max")} type="number" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Andares</label>
              <input {...register("andares")} type="number" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Unid. por Andar</label>
              <input {...register("unidades_por_andar")} type="number" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Total Unidades</label>
              <input {...register("total_unidades")} type="number" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Previsao Entrega</label>
              <input {...register("previsao_entrega")} type="text" style={inputStyle} />
            </div>
          </div>
        </div>

        {/* ─── Midia ──────────────────────────────────────────────── */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Midia</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Imagem de Destaque</label>
              <ImageUpload
                bucket="empreendimentos"
                path="destaques"
                currentUrl={imagemDestaqueUrl || undefined}
                onUpload={(url) => setValue("imagem_destaque_url", url)}
              />
              <input type="hidden" {...register("imagem_destaque_url")} />
            </div>
            <div style={gridTwo}>
              <div>
                <label style={labelStyle}>URL do Video</label>
                <input {...register("video_url")} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Tour Virtual URL</label>
                <input {...register("tour_virtual_url")} style={inputStyle} />
              </div>
            </div>
          </div>
        </div>

        {/* ─── SEO ────────────────────────────────────────────────── */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>SEO</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Meta Title (max 70)</label>
              <input {...register("meta_title")} style={inputStyle} maxLength={70} />
            </div>
            <div>
              <label style={labelStyle}>Meta Description (max 160)</label>
              <textarea {...register("meta_description")} rows={2} style={{ ...inputStyle, resize: "vertical" }} maxLength={160} />
            </div>
            <div>
              <label style={labelStyle}>OG Image URL</label>
              <input {...register("og_image_url")} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* ─── Galeria de Imagens (por categoria) ─────────────────── */}
        {[
          { key: "interior", label: "Fotos Internas", path: "internas" },
          { key: "area_comum", label: "Áreas Comuns", path: "areas-comuns" },
          { key: "fachada", label: "Fachada / Externas", path: "fachada" },
          { key: "planta", label: "Plantas Baixas (imagens)", path: "plantas" },
        ].map((cat) => {
          const catImagens = imagens.filter((i) => i.categoria === cat.key);
          return (
            <div key={cat.key} style={cardStyle}>
              <h2 style={sectionTitle}>
                {cat.label}
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginLeft: "8px", fontWeight: 400 }}>
                  ({catImagens.length})
                </span>
              </h2>

              {catImagens.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  {catImagens.map((img) => (
                    <div key={img.id} style={{ position: "relative" }}>
                      <img
                        src={img.url}
                        alt={img.alt_text || ""}
                        style={{
                          width: "100%",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImagem(img.id)}
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          backgroundColor: "rgba(0,0,0,0.7)",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <ImageUpload
                bucket="empreendimentos"
                path={`${cat.path}/${id}`}
                onUpload={(url) => { if (url) addImagem(url, cat.key); }}
              />
            </div>
          );
        })}

        {/* ─── Plantas ────────────────────────────────────────────── */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Plantas</h2>

          {plantas.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              {plantas.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "13px", color: "#fff" }}>{p.nome}</span>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginLeft: "12px" }}>
                      {p.area ? `${p.area}m2` : ""} {p.quartos ? `${p.quartos}q` : ""} {p.suites ? `${p.suites}s` : ""}
                    </span>
                  </div>
                  <button type="button" onClick={() => removePlanta(p.id)} style={deleteBtnStyle}>
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add planta form */}
          <div style={{ ...gridTwo, marginBottom: "8px" }}>
            <div>
              <label style={labelStyle}>Nome da Planta</label>
              <input
                value={newPlanta.nome}
                onChange={(e) => setNewPlanta((p) => ({ ...p, nome: e.target.value }))}
                style={inputStyle}
                placeholder="Ex: Planta 2 quartos"
              />
            </div>
            <div>
              <label style={labelStyle}>URL da Imagem</label>
              <ImageUpload
                bucket="empreendimentos"
                path={`plantas/${id}`}
                currentUrl={newPlanta.url || undefined}
                onUpload={(url) => setNewPlanta((p) => ({ ...p, url }))}
              />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "12px", alignItems: "end" }}>
            <div>
              <label style={labelStyle}>Area (m2)</label>
              <input
                value={newPlanta.area}
                onChange={(e) => setNewPlanta((p) => ({ ...p, area: e.target.value }))}
                type="number"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Quartos</label>
              <input
                value={newPlanta.quartos}
                onChange={(e) => setNewPlanta((p) => ({ ...p, quartos: e.target.value }))}
                type="number"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Suites</label>
              <input
                value={newPlanta.suites}
                onChange={(e) => setNewPlanta((p) => ({ ...p, suites: e.target.value }))}
                type="number"
                style={inputStyle}
              />
            </div>
            <button type="button" onClick={addPlanta} style={{ ...smallBtnStyle, marginBottom: "1px" }}>
              Adicionar
            </button>
          </div>
        </div>

        {/* ─── Diferenciais ───────────────────────────────────────── */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Diferenciais</h2>

          {diferenciais.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              {diferenciais.map((d) => (
                <div
                  key={d.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "13px", color: "#fff" }}>
                      {d.icone ? `${d.icone} ` : ""}{d.titulo}
                    </span>
                    {d.descricao && (
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginLeft: "12px" }}>
                        {d.descricao.substring(0, 60)}{d.descricao.length > 60 ? "..." : ""}
                      </span>
                    )}
                  </div>
                  <button type="button" onClick={() => removeDiferencial(d.id)} style={deleteBtnStyle}>
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add diferencial form */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 80px auto", gap: "12px", alignItems: "end" }}>
            <div>
              <label style={labelStyle}>Titulo</label>
              <input
                value={newDif.titulo}
                onChange={(e) => setNewDif((d) => ({ ...d, titulo: e.target.value }))}
                style={inputStyle}
                placeholder="Ex: Piscina"
              />
            </div>
            <div>
              <label style={labelStyle}>Descricao</label>
              <input
                value={newDif.descricao}
                onChange={(e) => setNewDif((d) => ({ ...d, descricao: e.target.value }))}
                style={inputStyle}
                placeholder="Descricao opcional"
              />
            </div>
            <div>
              <label style={labelStyle}>Icone</label>
              <input
                value={newDif.icone}
                onChange={(e) => setNewDif((d) => ({ ...d, icone: e.target.value }))}
                style={inputStyle}
                placeholder="emoji"
              />
            </div>
            <button type="button" onClick={addDiferencial} style={{ ...smallBtnStyle, marginBottom: "1px" }}>
              Adicionar
            </button>
          </div>
        </div>

        {/* ─── Zona de Perigo ─────────────────────────────────────── */}
        <div
          style={{
            ...cardStyle,
            borderColor: "rgba(212,91,91,0.2)",
          }}
        >
          <h2 style={{ ...sectionTitle, color: "#d45b5b" }}>Zona de Perigo</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>
            Esta acao nao pode ser desfeita. Todos os dados relacionados (imagens, plantas, diferenciais) serao removidos.
          </p>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                padding: "10px 24px",
                backgroundColor: "transparent",
                color: "#d45b5b",
                border: "1px solid rgba(212,91,91,0.3)",
                borderRadius: "8px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Excluir empreendimento
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "13px", color: "#d45b5b" }}>Tem certeza?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "#d45b5b",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  cursor: "pointer",
                  opacity: deleting ? 0.5 : 1,
                }}
              >
                {deleting ? "Excluindo..." : "Sim, excluir"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                style={smallBtnStyle}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
