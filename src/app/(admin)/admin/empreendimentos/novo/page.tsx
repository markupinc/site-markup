"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import ImageUpload from "@/components/admin/ImageUpload";

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

// Style constants
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
const errorStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#d45b5b",
  marginTop: "4px",
};

export default function NovoEmpreendimentoPage() {
  const supabase = createClient();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      nome: "",
      slug: "",
      descricao_curta: "",
      descricao: "",
      status: "lancamento",
      destaque: false,
      ativo: true,
      ordem: 0,
      endereco: "",
      cidade: "",
      estado: "",
      bairro: "",
      previsao_entrega: "",
      imagem_destaque_url: "",
      video_url: "",
      tour_virtual_url: "",
      meta_title: "",
      meta_description: "",
      og_image_url: "",
    },
  });

  const nome = watch("nome");
  const imagemDestaqueUrl = watch("imagem_destaque_url");

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("nome", value);
    setValue("slug", slugify(value));
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    setError(null);

    // Clean up empty strings to null for optional fields
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
    const { error: insertError } = await (supabase.from("empreendimentos") as any).insert(payload);

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push("/admin/empreendimentos");
  };

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
            Novo Empreendimento
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            Preencha as informacoes abaixo para criar um novo empreendimento.
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
        {/* Informacoes Basicas */}
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
                  placeholder="Nome do empreendimento"
                />
                {errors.nome && <p style={errorStyle}>{errors.nome.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Slug</label>
                <input {...register("slug")} style={inputStyle} placeholder="slug-auto-gerado" />
                {errors.slug && <p style={errorStyle}>{errors.slug.message}</p>}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Descricao Curta</label>
              <input
                {...register("descricao_curta")}
                style={inputStyle}
                placeholder="Breve descricao (max 500 caracteres)"
                maxLength={500}
              />
            </div>
            <div>
              <label style={labelStyle}>Descricao Completa</label>
              <textarea
                {...register("descricao")}
                rows={5}
                style={{ ...inputStyle, resize: "vertical" }}
                placeholder="Descricao detalhada do empreendimento"
              />
            </div>
          </div>
        </div>

        {/* Status e Visibilidade */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Status e Visibilidade</h2>
          <div style={gridFour}>
            <div>
              <label style={labelStyle}>Status</label>
              <select {...register("status")} style={inputStyle}>
                <option value="lancamento">Lancamento</option>
                <option value="em_obras">Em Obras</option>
                <option value="entregue">Entregue</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Ordem</label>
              <input {...register("ordem")} type="number" style={inputStyle} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "20px" }}>
              <input {...register("destaque")} type="checkbox" id="destaque" />
              <label htmlFor="destaque" style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
                Destaque
              </label>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "20px" }}>
              <input {...register("ativo")} type="checkbox" id="ativo" />
              <label htmlFor="ativo" style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
                Ativo
              </label>
            </div>
          </div>
        </div>

        {/* Localizacao */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Localizacao</h2>
          <div style={gridTwo}>
            <div>
              <label style={labelStyle}>Endereco</label>
              <input {...register("endereco")} style={inputStyle} placeholder="Rua, numero" />
            </div>
            <div>
              <label style={labelStyle}>Bairro</label>
              <input {...register("bairro")} style={inputStyle} placeholder="Bairro" />
            </div>
            <div>
              <label style={labelStyle}>Cidade</label>
              <input {...register("cidade")} style={inputStyle} placeholder="Cidade" />
            </div>
            <div>
              <label style={labelStyle}>Estado</label>
              <input {...register("estado")} style={inputStyle} placeholder="UF" />
            </div>
          </div>
        </div>

        {/* Especificacoes */}
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
              <input {...register("previsao_entrega")} type="text" style={inputStyle} placeholder="Ex: Dez/2026" />
            </div>
          </div>
        </div>

        {/* Midia */}
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
                <input {...register("video_url")} style={inputStyle} placeholder="https://youtube.com/..." />
              </div>
              <div>
                <label style={labelStyle}>Tour Virtual URL</label>
                <input {...register("tour_virtual_url")} style={inputStyle} placeholder="https://..." />
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>SEO</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Meta Title (max 70)</label>
              <input {...register("meta_title")} style={inputStyle} maxLength={70} placeholder="Titulo para SEO" />
              {errors.meta_title && <p style={errorStyle}>{errors.meta_title.message}</p>}
            </div>
            <div>
              <label style={labelStyle}>Meta Description (max 160)</label>
              <textarea
                {...register("meta_description")}
                rows={2}
                style={{ ...inputStyle, resize: "vertical" }}
                maxLength={160}
                placeholder="Descricao para SEO"
              />
              {errors.meta_description && <p style={errorStyle}>{errors.meta_description.message}</p>}
            </div>
            <div>
              <label style={labelStyle}>OG Image URL</label>
              <input {...register("og_image_url")} style={inputStyle} placeholder="URL da imagem para redes sociais" />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
