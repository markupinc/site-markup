/**
 * Formulário de lead da Karteira (CRM), embutido por iframe.
 * Usado na página de Contato e na seção "Tenho interesse" dos empreendimentos.
 */
export const KARTEIRA_FORM_URL = "https://markup.karteira.app/embed/f/site";

export default function KarteiraForm() {
  return (
    <iframe
      src={KARTEIRA_FORM_URL}
      width="100%"
      height="700"
      style={{ border: 0, maxWidth: "100%" }}
      loading="lazy"
      title="Formulário"
    />
  );
}
