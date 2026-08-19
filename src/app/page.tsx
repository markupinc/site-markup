import Navbar from "@/components/public/Navbar";
import LpContent from "@/components/public/LpContent";

/**
 * Home = LP de campanha com o menu do site por cima.
 * /lp serve o mesmo conteúdo sem menu (campanhas).
 * A home institucional antiga está preservada em /home-institucional-x7k2 (noindex).
 */

export const revalidate = 3600;

export { metadata } from "./(public)/lp/page";

export default function Home() {
  return (
    <>
      <Navbar logoSrc="/assets/logo.png" />
      <LpContent comNavbar />
    </>
  );
}
