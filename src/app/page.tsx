import dynamic from "next/dynamic";
import Navbar from "@/components/public/Navbar";
import HeroSlider from "@/components/public/HeroSlider";
import LaunchesSection from "@/components/public/LaunchesSection";
import StatsCounter from "@/components/public/StatsCounter";
import ContactSection from "@/components/public/ContactSection";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";
import { createClient } from "@/lib/supabase/server";

// Lazy load heavy components with scroll-based animations
const MagicText = dynamic(() => import("@/components/public/MagicText"), {
  loading: () => <div style={{ height: "160vh" }} />,
});

const ScrollExpansion = dynamic(
  () => import("@/components/public/ScrollExpansion"),
  {
    loading: () => <div style={{ height: "300vh" }} />,
  }
);

const MediaSection = dynamic(() => import("@/components/public/MediaSection"), {
  loading: () => <div style={{ height: "300px" }} />,
});

const BlogSection = dynamic(() => import("@/components/public/BlogSection"), {
  loading: () => <div style={{ height: "300px" }} />,
});

// Cache home page for 1 hour, revalidate after stale
export const revalidate = 3600;

const heroSlides = [
  {
    type: "video" as const,
    src: "/assets/video-horizon.mov",
    label: "Em breve...",
  },
  {
    type: "image" as const,
    src: "/assets/up-fachada-01-nova.jpg",
    label: "Lançamento Up! Studios",
  },
  {
    type: "image" as const,
    src: "/assets/salsa.png",
    label: "Salsa Home Resort",
  },
];

const magicLines = [
  "Seu investimento merece mais do que promessas.",
  "Merece solidez. Merece retorno.",
  "Cada empreendimento carrega o nosso compromisso com quem escolheu investir no que importa.",
];

const stats = [
  { target: 15, suffix: "", label: "anos de experiência" },
  { target: 200, suffix: "+", label: "investidores" },
  { target: 2, suffix: "", label: "empreendimentos" },
  { target: 200, suffix: "+", label: "unid. em desenvolvimento" },
];

export default async function Home() {
  const supabase = await createClient();

  const { data: empreendimentos } = await (supabase
    .from("empreendimentos" as any)
    .select("nome, slug, bairro, imagem_destaque_url")
    .eq("ativo", true)
    .order("ordem") as any);

  const { data: midia } = await (supabase
    .from("midia" as any)
    .select("fonte, titulo, url")
    .eq("ativo", true)
    .order("ordem") as any);

  return (
    <main>
      <Navbar logoSrc="/assets/logo.png" />
      <div style={{ backgroundColor: "#1a1a1a" }}>
        <HeroSlider slides={heroSlides} />
        <MagicText lines={magicLines} />
        <ScrollExpansion
          imageSrc="/assets/apt-varanda.png"
          titleTop="Você investe,"
          titleBottom="o retorno vem."
        />
      </div>
      <LaunchesSection projects={empreendimentos ?? []} />
      <StatsCounter
        title="Somos obcecados por excelência"
        subtitle="Com 15 anos de experiência em desenvolvimento imobiliário através de parcerias estratégicas, a Markup Incorporações direciona toda a sua expertise para oferecer produtos arrojados, de alto padrão e com alta rentabilidade."
        stats={stats}
        ctaText="Conheça nosso portfólio"
        ctaHref="https://www.instagram.com/markup_inc/"
      />
      <MediaSection midia={midia ?? []} />
      <BlogSection />
      <ContactSection />
      <Footer logoSrc="/assets/logo.png" />
      <WhatsAppButton />
    </main>
  );
}
