import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import TrackingScripts from "@/components/public/TrackingScripts";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Markup Incorporações",
  description:
    "Incorporadora de alto padrão em Maceió. Empreendimentos exclusivos com alta rentabilidade para investidores.",
  icons: {
    icon: "/favicon.png",
  },
  verification: {
    google: "15Op8xGxORHl3CqdEuaGSMDVMucT5vy1QH0meem7yoE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">
        {children}
        <TrackingScripts />
      </body>
    </html>
  );
}
