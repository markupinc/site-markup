import Link from "next/link";
import FadeInOnScroll from "./FadeInOnScroll";

interface Project {
  nome: string;
  bairro?: string;
  imagem_destaque_url?: string;
  slug: string;
}

interface LaunchesSectionProps {
  projects?: Project[];
}

function ProjectCard({
  project,
  imageHeight,
}: {
  project: Project;
  imageHeight: string;
}) {
  return (
    <Link href={`/empreendimentos/${project.slug}`} className="group block">
      <div className="overflow-hidden">
        <img
          src={project.imagem_destaque_url || "/assets/up-fachada-01-nova.jpg"}
          alt={project.nome}
          style={{
            width: "100%",
            height: imageHeight,
            objectFit: "cover",
            transition: "transform 0.6s ease",
          }}
          className="group-hover:scale-[1.03]"
        />
      </div>
      <div style={{ marginTop: "12px" }}>
        <p
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#1a1a1a",
            margin: "0 0 4px 0",
          }}
        >
          {project.nome}
        </p>
        <p
          style={{
            fontSize: "12px",
            fontWeight: 300,
            color: "#8a7d72",
            margin: 0,
          }}
        >
          {project.bairro || "Maceió/Alagoas"}
        </p>
      </div>
    </Link>
  );
}

export default function LaunchesSection({ projects = [] }: LaunchesSectionProps) {
  // Se não houver projetos, não renderiza
  if (!projects || projects.length === 0) {
    return null;
  }

  // Primeiro projeto como destaque
  const featuredProject = projects[0];

  // Resto dos projetos no grid
  const gridProjects = projects.slice(1);

  return (
    <section
      id="empreendimentos"
      style={{
        backgroundColor: "#ffffff",
        padding: "80px 60px",
      }}
    >
      <FadeInOnScroll>
        <h2
          className="font-serif"
          style={{
            fontSize: "30px",
            fontWeight: 400,
            color: "#1a1a1a",
            marginBottom: "12px",
          }}
        >
          Lançamentos Markup
        </h2>
        <p
          style={{
            fontSize: "12px",
            lineHeight: 1.6,
            color: "#555",
            maxWidth: "440px",
            marginBottom: "48px",
          }}
        >
          Conheça nossos empreendimentos que redefinem o conceito de morar bem em
          Maceió, com projetos que unem sofisticação, localização privilegiada e
          alta valorização.
        </p>
      </FadeInOnScroll>

      {/* Featured project */}
      <FadeInOnScroll>
        <div style={{ marginBottom: "40px" }}>
          <ProjectCard
            project={featuredProject}
            imageHeight="500px"
          />
        </div>
      </FadeInOnScroll>

      {/* 2-column grid */}
      {gridProjects.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
          }}
        >
          {gridProjects.map((project) => (
            <FadeInOnScroll key={project.slug}>
              <ProjectCard project={project} imageHeight="320px" />
            </FadeInOnScroll>
          ))}
        </div>
      )}

      {/* CTA */}
      <FadeInOnScroll>
        <div style={{ marginTop: "40px" }}>
          <Link
            href="/empreendimentos"
            style={{
              fontSize: "14px",
              color: "#1a1a1a",
              borderBottom: "1px solid #1a1a1a",
              paddingBottom: "4px",
              textDecoration: "none",
            }}
          >
            Veja mais empreendimentos &rarr;
          </Link>
        </div>
      </FadeInOnScroll>
    </section>
  );
}
