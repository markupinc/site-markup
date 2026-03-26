"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import ImageUpload from "@/components/admin/ImageUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface BlogFormData {
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  imagem_destaque_url: string;
  og_image_url: string;
  categoria: string;
  tags: string;
  publicado: boolean;
  data_publicacao: string;
  meta_title: string;
  meta_description: string;
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
const charCounterStyle = (current: number, max: number): React.CSSProperties => ({
  fontSize: "11px",
  color: current > max ? "#d45b5b" : "rgba(255,255,255,0.3)",
  marginTop: "4px",
  textAlign: "right",
});

export default function EditBlogPostPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [postSlug, setPostSlug] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BlogFormData>({
    defaultValues: {
      titulo: "",
      slug: "",
      resumo: "",
      conteudo: "",
      imagem_destaque_url: "",
      og_image_url: "",
      categoria: "",
      tags: "",
      publicado: false,
      data_publicacao: "",
      meta_title: "",
      meta_description: "",
    },
  });

  const imagemDestaqueUrl = watch("imagem_destaque_url");
  const ogImageUrl = watch("og_image_url");
  const metaTitle = watch("meta_title");
  const metaDescription = watch("meta_description");
  const publicado = watch("publicado");

  // Load post data
  useEffect(() => {
    (async () => {
      const { data, error: fetchError } = await (supabase.from("blog_posts") as any)
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !data) {
        setError(fetchError?.message || "Post nao encontrado");
        setLoading(false);
        return;
      }

      const post = data as Record<string, any>;

      // Convert data_publicacao to datetime-local format
      let dataPublicacao = "";
      if (post.data_publicacao) {
        const d = new Date(post.data_publicacao);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        dataPublicacao = d.toISOString().slice(0, 16);
      }

      // Convert tags array to comma-separated string
      const tagsString = Array.isArray(post.tags) ? post.tags.join(", ") : "";

      setPostSlug(post.slug || "");

      reset({
        titulo: post.titulo || "",
        slug: post.slug || "",
        resumo: post.resumo || "",
        conteudo: post.conteudo || "",
        imagem_destaque_url: post.imagem_destaque_url || "",
        og_image_url: post.og_image_url || "",
        categoria: post.categoria || "",
        tags: tagsString,
        publicado: post.publicado || false,
        data_publicacao: dataPublicacao,
        meta_title: post.meta_title || "",
        meta_description: post.meta_description || "",
      });

      setLoading(false);
    })();
  }, [id]);

  // Load existing categorias for datalist
  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from("blog_categorias") as any)
        .select("nome")
        .order("nome", { ascending: true });
      if (data) {
        setCategorias(data.map((c: { nome: string }) => c.nome));
      }
    })();
  }, []);

  // Auto-set data_publicacao when publicado is checked
  useEffect(() => {
    if (publicado) {
      const current = watch("data_publicacao");
      if (!current) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        setValue("data_publicacao", now.toISOString().slice(0, 16));
      }
    }
  }, [publicado]);

  const handleTituloChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("titulo", value);
    setValue("slug", slugify(value));
  };

  const onSubmit = async (data: BlogFormData) => {
    setSaving(true);
    setError(null);

    // Parse tags from comma-separated string to array
    const tagsArray = data.tags
      ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    // Build payload
    const payload: Record<string, unknown> = {
      titulo: data.titulo,
      slug: data.slug,
      resumo: data.resumo || null,
      conteudo: data.conteudo || null,
      imagem_destaque_url: data.imagem_destaque_url || null,
      og_image_url: data.og_image_url || null,
      categoria: data.categoria || null,
      tags: tagsArray.length > 0 ? tagsArray : null,
      publicado: data.publicado,
      data_publicacao: data.data_publicacao || null,
      meta_title: data.meta_title || null,
      meta_description: data.meta_description || null,
      updated_at: new Date().toISOString(),
    };

    // Auto-create categoria if it doesn't exist
    if (data.categoria && !categorias.includes(data.categoria)) {
      await (supabase.from("blog_categorias") as any).insert({
        nome: data.categoria,
        slug: slugify(data.categoria),
      });
    }

    const { error: updateError } = await (supabase.from("blog_posts") as any)
      .update(payload)
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push("/admin/blog");
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este post? Esta acao nao pode ser desfeita.")) {
      return;
    }

    setDeleting(true);
    setError(null);

    const { error: deleteError } = await (supabase.from("blog_posts") as any)
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
      return;
    }

    router.push("/admin/blog");
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
            Editar Post
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            Altere as informacoes do post abaixo.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <a
            href={`/blog/${postSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "10px 20px",
              backgroundColor: "transparent",
              color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Visualizar
          </a>
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
        {/* Conteudo */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Conteudo</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={gridTwo}>
              <div>
                <label style={labelStyle}>Titulo</label>
                <input
                  {...register("titulo", { required: "Titulo e obrigatorio" })}
                  onChange={handleTituloChange}
                  style={inputStyle}
                  placeholder="Titulo do post"
                />
                {errors.titulo && <p style={errorStyle}>{errors.titulo.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Slug</label>
                <input
                  {...register("slug", { required: "Slug e obrigatorio" })}
                  style={inputStyle}
                  placeholder="slug-auto-gerado"
                />
                {errors.slug && <p style={errorStyle}>{errors.slug.message}</p>}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Resumo</label>
              <textarea
                {...register("resumo", { maxLength: { value: 500, message: "Maximo 500 caracteres" } })}
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
                placeholder="Breve resumo do post (max 500 caracteres)"
                maxLength={500}
              />
              {errors.resumo && <p style={errorStyle}>{errors.resumo.message}</p>}
            </div>
            <div>
              <label style={labelStyle}>Conteúdo</label>
              <RichTextEditor
                content={watch("conteudo") || ""}
                onChange={(html) => setValue("conteudo", html)}
                placeholder="Comece a escrever o conteúdo do post..."
              />
            </div>
          </div>
        </div>

        {/* Midia */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Midia</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <label style={labelStyle}>Imagem de Destaque</label>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "8px" }}>
                Imagem principal exibida na listagem e no topo do post.
              </p>
              <ImageUpload
                bucket="blog"
                path="destaques"
                currentUrl={imagemDestaqueUrl || undefined}
                onUpload={(url) => setValue("imagem_destaque_url", url)}
              />
              <input type="hidden" {...register("imagem_destaque_url")} />
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
              <label style={labelStyle}>OG Image URL</label>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "8px" }}>
                Imagem para compartilhamento em redes sociais. Se vazio, usa a imagem de destaque.
              </p>
              <ImageUpload
                bucket="blog"
                path="og"
                currentUrl={ogImageUrl || undefined}
                onUpload={(url) => setValue("og_image_url", url)}
              />
              <input type="hidden" {...register("og_image_url")} />
            </div>
          </div>
        </div>

        {/* Categorizacao */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Categorizacao</h2>
          <div style={gridTwo}>
            <div>
              <label style={labelStyle}>Categoria</label>
              <input
                {...register("categoria")}
                list="categorias-list"
                style={inputStyle}
                placeholder="Selecione ou digite uma nova categoria"
              />
              <datalist id="categorias-list">
                {categorias.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <div>
              <label style={labelStyle}>Tags</label>
              <input
                {...register("tags")}
                style={inputStyle}
                placeholder="tag1, tag2, tag3 (separadas por virgula)"
              />
            </div>
          </div>
        </div>

        {/* Publicacao */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Publicacao</h2>
          <div style={gridTwo}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input {...register("publicado")} type="checkbox" id="publicado" />
              <label htmlFor="publicado" style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
                Publicado
              </label>
            </div>
            <div>
              <label style={labelStyle}>Data de Publicacao</label>
              <input
                {...register("data_publicacao")}
                type="datetime-local"
                style={{ ...inputStyle, backgroundColor: "#1a1a1a" }}
              />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>SEO</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Meta Title (max 70)</label>
              <input
                {...register("meta_title", { maxLength: { value: 70, message: "Maximo 70 caracteres" } })}
                style={inputStyle}
                maxLength={70}
                placeholder="Titulo para SEO"
              />
              <div style={charCounterStyle(metaTitle?.length || 0, 70)}>
                {metaTitle?.length || 0}/70
              </div>
              {errors.meta_title && <p style={errorStyle}>{errors.meta_title.message}</p>}
            </div>
            <div>
              <label style={labelStyle}>Meta Description (max 160)</label>
              <textarea
                {...register("meta_description", { maxLength: { value: 160, message: "Maximo 160 caracteres" } })}
                rows={2}
                style={{ ...inputStyle, resize: "vertical" }}
                maxLength={160}
                placeholder="Descricao para SEO"
              />
              <div style={charCounterStyle(metaDescription?.length || 0, 160)}>
                {metaDescription?.length || 0}/160
              </div>
              {errors.meta_description && <p style={errorStyle}>{errors.meta_description.message}</p>}
            </div>
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
            Esta acao e irreversivel. O post sera permanentemente excluido.
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
            {deleting ? "Excluindo..." : "Excluir Post"}
          </button>
        </div>
      </div>
    </form>
  );
}
