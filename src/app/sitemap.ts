import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = "https://markupincorporacoes.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Fetch published blog posts
  const { data: blogPosts } = await (supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("publicado", true)
    .order("data_publicacao", { ascending: false }) as any);

  // Fetch active empreendimentos
  const { data: empreendimentos } = await (supabase
    .from("empreendimentos")
    .select("slug, updated_at")
    .eq("ativo", true) as any);

  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/empreendimentos`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  // Empreendimento pages
  if (empreendimentos) {
    for (const emp of empreendimentos as Array<{ slug: string; updated_at: string }>) {
      entries.push({
        url: `${BASE_URL}/empreendimentos/${emp.slug}`,
        lastModified: new Date(emp.updated_at),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  // Blog post pages
  if (blogPosts) {
    for (const post of blogPosts as Array<{ slug: string; updated_at: string }>) {
      entries.push({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
