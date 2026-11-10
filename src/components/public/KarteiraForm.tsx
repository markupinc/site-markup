/**
 * Formulário de lead da Karteira (CRM), embutido por iframe.
 * Usado na página de Contato e na seção "Tenho interesse" dos empreendimentos.
 *
 * O link abaixo do iframe abre o mesmo formulário numa aba nova: enquanto a Karteira
 * bloquear a incorporação (X-Frame-Options: SAMEORIGIN), o iframe aparece como
 * "conexão recusada" e o link é o caminho para o visitante se cadastrar.
 */
export const KARTEIRA_FORM_URL = "https://markup.karteira.app/embed/f/formulario";

export default function KarteiraForm() {
  return (
    <div>
      <iframe
        src={KARTEIRA_FORM_URL}
        width="100%"
        height="700"
        style={{ border: 0, maxWidth: "100%" }}
        loading="lazy"
        title="Formulário"
      />
      <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 12 }}>
        O formulário não apareceu?{" "}
        <a
          href={KARTEIRA_FORM_URL}
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
