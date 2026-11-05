// Google Ads (gtag.js) — a tag global é carregada em TrackingScripts.
export const GOOGLE_ADS_ID = "AW-18387925053";

// Todas as contas do Google Ads que recebem a tag global (um gtag('config') por conta).
// AW-16975398608: segunda conta, adicionada em 05/11/2026 — só a tag global, sem conversão própria.
export const GOOGLE_ADS_IDS = [GOOGLE_ADS_ID, "AW-16975398608"];

// Conversão "[INSCRIÇÃO SITE]" no Google Ads
const SIGNUP_CONVERSION = `${GOOGLE_ADS_ID}/Xw0wCI6E6oodEL3whcBE`;

/**
 * Dispara a conversão "[INSCRIÇÃO SITE]". O site não tem página de obrigado
 * (os formulários enviam via fetch), então chamar logo após o envio bem-sucedido.
 */
export function trackSignupConversion() {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gtag = (window as any).gtag;
  if (typeof gtag !== "function") return; // tag não carregada (ex.: bloqueador de anúncios)
  gtag("event", "conversion", {
    send_to: SIGNUP_CONVERSION,
    value: 1.0,
    currency: "BRL",
  });
}
