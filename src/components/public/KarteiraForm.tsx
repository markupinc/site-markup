/**
 * Formulário de lead da Karteira (CRM), embutido por iframe.
 * Usado na página de Contato e na seção "Tenho interesse" dos empreendimentos.
 *
 * O link abaixo do iframe abre o mesmo formulário numa aba nova: enquanto a Karteira
 * bloquear a incorporação (X-Frame-Options: SAMEORIGIN), o iframe aparece como
 * "conexão recusada" e o link é o caminho para o visitante se cadastrar.
 */
const BASE = "https://markup.karteira.app/embed/f";

// Formulário geral (página de Contato e empreendimentos sem formulário próprio)
export const KARTEIRA_FORM_URL = `${BASE}/formulario?titulo=0`;

// Formulário próprio de cada empreendimento (slug → link)
const KARTEIRA_FORM_POR_EMPREENDIMENTO: Record<string, string> = {
  "up-studios-smart-living": `${BASE}/formulario?titulo=0`,
  "salsa-home-resort": `${BASE}/formulario-copia-1794347726689?titulo=0`,
  "horizon-trade-center": `${BASE}/formhorizon?titulo=0`,
};

export default function KarteiraForm({ empreendimentoSlug }: { empreendimentoSlug?: string }) {
  const url = (empreendimentoSlug && KARTEIRA_FORM_POR_EMPREENDIMENTO[empreendimentoSlug]) || KARTEIRA_FORM_URL;
  return (
    <div>
      <iframe
        src={url}
        width="100%"
        height="700"
        style={{ border: 0, maxWidth: "100%" }}
        loading="lazy"
        title="Formulário"
      />
      <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 12 }}>
        O formulário não apareceu?{" "}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#00aeef", textDecoration: "underline" }}
        >
          Clique aqui para abrir
        </a>
      </p>
    </div>
  );
}
