import Navbar from "@/components/public/Navbar";
import HeroSlider from "@/components/public/HeroSlider";
import MagicText from "@/components/public/MagicText";
import ScrollExpansion from "@/components/public/ScrollExpansion";
import LaunchesSection from "@/components/public/LaunchesSection";
import StatsCounter from "@/components/public/StatsCounter";
import MediaSection from "@/components/public/MediaSection";
import BlogSection from "@/components/public/BlogSection";
import ContactSection from "@/components/public/ContactSection";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";

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

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <Navbar logoSrc="/assets/logo.png" />
      <HeroSlider slides={heroSlides} />
      <MagicText lines={magicLines} />
      <ScrollExpansion
        imageSrc="/assets/apt-varanda.png"
        titleTop="Você investe,"
        titleBottom="o retorno vem."
      />
      <LaunchesSection />
      <StatsCounter
        title="Somos obcecados por excelência"
        subtitle="Com 15 anos de experiência em desenvolvimento imobiliário através de parcerias estratégicas, a Markup Incorporações direciona toda a sua expertise para oferecer produtos arrojados, de alto padrão e com alta rentabilidade."
        stats={stats}
        ctaText="Conheça nosso portfólio"
        ctaHref="https://www.instagram.com/markup_inc/"
      />
      <MediaSection />
      <BlogSection />
      <ContactSection />
      <Footer logoSrc="/assets/logo.png" />
      <WhatsAppButton />
    </main>
  );
}
