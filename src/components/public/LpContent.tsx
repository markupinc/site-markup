import Image from "next/image";
import Link from "next/link";
import { TrendingUp, ShieldCheck, MapPin, ArrowUpRight, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

/**
 * Conteúdo da LP "Você investe. O retorno vem!" — servido em / (home, com navbar)
 * e em /lp (campanhas, standalone sem menu para não vazar o tráfego pago).
 */

const BLUE = "#00aeef";
const WHATS = `https://wa.me/5582982294001?text=${encodeURIComponent(
  "Olá! Quero saber mais sobre os empreendimentos da Markup."
)}`;

// Copy de campanha por empreendimento (imagem/slug vêm do banco)
const CARDS = [
  {
    match: "salsa",
    nome: "Salsa Home Resort",
    specs: "148–254m² · 3–4 suítes · Pé na areia · 8.000m² de lazer",
    local: "Guaxuma · Maceió, Alagoas",
    fallback: "/assets/salsa.png",
  },
  {
    match: "up",
    nome: "Up! Studios Smart Living",
    specs: "22–83m² · Studios e Coberturas · 200m do mar · Gestão MME Hospitalidade",
    local: "Jatiúca · Maceió, Alagoas",
    fallback: "/assets/up-fachada-01-nova.jpg",
  },
  {
    match: "horizon",
    nome: "Horizon Trade Center",
    specs: "41m²+ · Salas comerciais · Vista mar em 80% das unidades · Obra a preço de custo",
    local: "Centro · Praia da Avenida, Maceió, Alagoas",
    fallback: "/assets/vista-mar-cobertura-sala08.png",
  },
];

const PILARES = [
  {
    icone: TrendingUp,
    titulo: "Rentabilidade Real",
    texto: "Sistema de condomínio a preço de custo. Studios com gestão de temporada via MME Hospitalidade.",
  },
  {
    icone: ShieldCheck,
    titulo: "Governança Transparente",
    texto: "SPE com CNPJ próprio por empreendimento. Você sabe onde cada real está sendo aplicado.",
  },
  {
    icone: MapPin,
    titulo: "Localização Estratégica",
    texto: "Guaxuma, Jatiúca e Praia da Avenida. Beira-mar nos bairros de maior valorização de Maceió.",
  },
];

// Preencher com depoimentos reais; a seção só aparece se houver algum.
const DEPOIMENTOS: Array<{ texto: string; nome: string; cargo?: string }> = [];

interface Emp {
  nome: string;
  slug: string;
  imagem_destaque_url: string | null;
}

export default async function LpContent({ comNavbar = false }: { comNavbar?: boolean }) {
  const supabase = await createClient();
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const { data } = await (supabase
    .from("empreendimentos" as any)
    .select("nome, slug, imagem_destaque_url")
    .eq("ativo", true) as any);
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const emps = (data as Emp[]) || [];
  const empDe = (match: string) =>
    emps.find((e) => e.slug?.toLowerCase().includes(match) || e.nome?.toLowerCase().includes(match));
  const horizon = empDe("horizon");
  const heroImg = horizon?.imagem_destaque_url || "/assets/vista-mar-cobertura-sala08.png";

  return (
    <main className="bg-[#0a0a0a] text-white" style={{ fontFamily: "var(--font-inter)", lineHeight: 1.5 }}>
      {/* Sem navbar (campanha): só a logo centralizada. Com navbar (home), ela já traz a logo. */}
      {!comNavbar && (
        <header className="absolute top-0 left-0 right-0 z-20 flex justify-center py-6">
          <Image src="/assets/logo.png" alt="Markup Incorporações" width={120} height={40} style={{ height: 36, width: "auto" }} />
        </header>
      )}

      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <Image
          src={heroImg}
          alt="Horizon Trade Center"
          fill
          priority
          quality={80}
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(5,8,12,0.88) 0%, rgba(5,8,12,0.55) 45%, rgba(5,8,12,0.25) 100%)" }} />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-24 pb-16">
          <h1 className="text-4xl md:text-6xl font-light" style={{ fontFamily: "var(--font-playfair)", lineHeight: 1.1 }}>
            Você investe.
            <br />
            <b className="font-semibold">O retorno vem!</b>
          </h1>
          <p className="mt-5 max-w-md text-sm md:text-base text-white/70">
            Empreendimentos de alto padrão na orla de Maceió — beira-mar, arquitetura contemporânea e rentabilidade
            comprovada para quem investe com inteligência.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#empreendimentos" className="px-6 py-3.5 bg-white text-[#0a0a0a] text-xs font-semibold tracking-widest uppercase hover:bg-white/90 transition">
              Ver empreendimentos
            </a>
            <a href={WHATS} target="_blank" rel="noopener noreferrer" className="px-6 py-3.5 border border-white/40 text-white text-xs font-semibold tracking-widest uppercase hover:border-white transition">
              Falar no WhatsApp
            </a>
          </div>
          <div className="mt-16 text-[11px] tracking-[0.2em] uppercase text-white/50">
            Horizon Trade Center
            <br />
            <span className="text-white/35">Centro, Maceió, AL</span>
          </div>
        </div>
      </section>

      {/* EMPREENDIMENTOS */}
      <section id="empreendimentos" className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <h2 className="text-2xl md:text-4xl font-semibold tracking-wide uppercase">Três endereços, uma única obsessão</h2>
        <p className="text-2xl md:text-4xl font-light tracking-wide uppercase" style={{ color: BLUE }}>
          Entregar o que foi prometido
        </p>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {CARDS.map((c) => {
            const emp = empDe(c.match);
            const href = emp ? `/empreendimentos/${emp.slug}` : "/empreendimentos";
            return (
              <Link key={c.match} href={href} className="group block">
                <div className="overflow-hidden">
                  <Image
                    src={emp?.imagem_destaque_url || c.fallback}
                    alt={c.nome}
                    width={600}
                    height={420}
                    quality={82}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ width: "100%", height: 300, objectFit: "cover", transition: "transform .6s ease" }}
                    className="group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <h3 className="text-lg font-medium">{c.nome}</h3>
                  <ArrowUpRight size={20} className="shrink-0 mt-1 text-white/40 group-hover:text-[#00aeef] transition" />
                </div>
                <p className="mt-2 text-xs text-white/55 leading-relaxed">{c.specs}</p>
                <p className="mt-2 text-[11px] text-white/40 flex items-center gap-1.5">
                  <MapPin size={12} style={{ color: BLUE }} />
                  {c.local}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* POR QUE A MARKUP */}
      <section className="border-t border-white/8">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <h2 className="text-2xl md:text-4xl font-semibold tracking-wide uppercase">Por que 200 investidores</h2>
          <p className="text-2xl md:text-4xl font-light tracking-wide uppercase" style={{ color: BLUE }}>
            escolheram a Markup?
          </p>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {PILARES.map((p) => (
              <div key={p.titulo}>
                <p.icone size={26} strokeWidth={1.5} style={{ color: BLUE }} />
                <h3 className="mt-4 text-base font-medium">{p.titulo}</h3>
                <p className="mt-2 text-sm text-white/55 leading-relaxed">{p.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS (só aparece quando houver depoimentos reais) */}
      {DEPOIMENTOS.length > 0 && (
        <section className="border-t border-white/8">
          <div className="max-w-4xl mx-auto px-6 py-20 md:py-24">
            {DEPOIMENTOS.map((d, i) => (
              <figure key={i} className="text-center">
                <div className="flex justify-center gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={16} fill="#b8945f" stroke="none" />
                  ))}
                </div>
                <blockquote className="text-lg md:text-xl font-light text-white/85" style={{ fontFamily: "var(--font-playfair)" }}>
                  “{d.texto}”
                </blockquote>
                <figcaption className="mt-6 text-sm text-white/60">
                  <b className="text-white">{d.nome}</b>
                  {d.cargo ? ` · ${d.cargo}` : ""}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* SOBRE — imagem de fundo cobre a seção inteira, texto por cima (à direita) */}
      <section className="relative overflow-hidden border-t border-white/8">
        <Image
          src={empDe("salsa")?.imagem_destaque_url || "/assets/salsa.png"}
          alt="Empreendimento Markup na orla de Maceió"
          fill
          quality={82}
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(90deg, rgba(5,10,16,0.30) 0%, rgba(5,10,16,0.72) 50%, rgba(5,10,16,0.94) 100%)" }}
        />
        <div className="absolute inset-0 md:hidden" style={{ background: "rgba(5,10,16,0.55)" }} />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 md:py-36 grid gap-12 md:grid-cols-2 items-center">
          <div className="hidden md:block" />
          <div>
            <h2 className="text-3xl md:text-4xl font-light" style={{ fontFamily: "var(--font-playfair)", lineHeight: 1.2 }}>
              Uma incorporadora jovem com a{" "}
              <span style={{ color: BLUE }}>inteligência de quem já construiu muito.</span>
            </h2>
            <p className="mt-6 text-sm md:text-base text-white/60 leading-relaxed">
              A Markup Incorporações não constrói, ela desenvolve. Cada empreendimento nasce de uma escolha cirúrgica de
              localização, de um projeto arquitetônico assinado e de uma construtora selecionada pela experiência
              específica naquele tipo de obra.
            </p>
            <p className="mt-4 text-sm md:text-base text-white/60 leading-relaxed">
              O resultado é um produto de alto padrão com governança real: SPE com CNPJ próprio, prestação de contas à
              comissão de investidores e compromisso com o prazo estabelecido em contrato.
            </p>
            <a
              href={WHATS}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-8 px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-[#0a0a0a] transition hover:opacity-90"
              style={{ background: BLUE }}
            >
              Fale com um consultor
            </a>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: `linear-gradient(135deg, ${BLUE} 0%, #0077b6 100%)` }}>
        <div className="max-w-4xl mx-auto px-6 py-20 md:py-24 text-center">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-wide uppercase leading-tight">
            O próximo investimento inteligente em Maceió
          </h2>
          <p className="text-2xl md:text-4xl font-light tracking-wide uppercase mt-1">pode ser o seu</p>
          <p className="mt-6 max-w-xl mx-auto text-sm text-white/85">
            Nossa equipe está pronta para apresentar o empreendimento certo para o seu perfil. Sem pressão, sem
            urgência, só a informação que você precisa para decidir com segurança.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a href="#empreendimentos" className="px-6 py-3.5 bg-white text-[#0a0a0a] text-xs font-semibold tracking-widest uppercase hover:bg-white/90 transition">
              Ver empreendimentos
            </a>
            <a href={WHATS} target="_blank" rel="noopener noreferrer" className="px-6 py-3.5 border border-white/60 text-white text-xs font-semibold tracking-widest uppercase hover:border-white transition">
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 flex flex-col items-center gap-4">
        <Image src="/assets/logo.png" alt="Markup Incorporações" width={100} height={34} style={{ height: 30, width: "auto" }} />
        <p className="text-[11px] text-white/35">
          © {new Date().getFullYear()} Markup Incorporações. Todos os direitos reservados.
        </p>
      </footer>
    </main>
  );
}
