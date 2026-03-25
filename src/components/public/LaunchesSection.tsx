import Link from "next/link";
import FadeInOnScroll from "./FadeInOnScroll";

interface Project {
  name: string;
  location: string;
  image: string;
  href: string;
}

const featuredProject: Project = {
  name: "Up! Studios",
  location: "Maceió/Alagoas",
  image: "/assets/up-fachada-01-nova.jpg",
  href: "/empreendimentos/up",
};

const gridProjects: Project[] = [
  {
    name: "Salsa Home Resort",
    location: "Maceió/Alagoas",
    image: "/assets/salsa.png",
    href: "/empreendimentos/salsa",
  },
  {
    name: "Up! Studios",
    location: "Maceió/Alagoas",
    image: "/assets/up-fachada-01-nova.jpg",
    href: "/empreendimentos/up",
  },
];

function ProjectCard({
  project,
  imageHeight,
}: {
  project: Project;
  imageHeight: string;
}) {
  return (
    <Link href={project.href} className="group block">
      <div className="overflow-hidden">
        <img
          src={project.image}
          alt={project.name}
          style={{
            width: "100%",
            height: imageHeight,
            objectFit: "cover",
            transition: "transform 0.6s ease",
          }}
          className="group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex items-baseline" style={{ marginTop: "12px" }}>
        <span
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#1a1a1a",
          }}
        >
          {project.name}
        </span>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 300,
            color: "#8a7d72",
            marginLeft: "8px",
          }}
        >
          {project.location}
        </span>
      </div>
    </Link>
  );
}

export default function LaunchesSection() {
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
        }}
      >
        {gridProjects.map((project) => (
          <FadeInOnScroll key={project.href + project.name}>
            <ProjectCard project={project} imageHeight="320px" />
          </FadeInOnScroll>
        ))}
      </div>

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
