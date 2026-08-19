import type { Metadata } from "next";
import LpContent from "@/components/public/LpContent";

/**
 * /lp — versão de campanha da LP: standalone, sem navbar/menu
 * para não vazar o tráfego pago. O mesmo conteúdo é a home (/).
 */

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Você investe. O retorno vem! | Markup Incorporações",
  description:
    "Empreendimentos de alto padrão na orla de Maceió — beira-mar, arquitetura contemporânea e rentabilidade comprovada para quem investe com inteligência.",
  // Servida em / (home) e /lp (campanhas) — canonical única para o Google
  alternates: { canonical: "/" },
};

export default function LpPage() {
  return <LpContent />;
}
