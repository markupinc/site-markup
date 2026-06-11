import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import TrackingScripts from "@/components/public/TrackingScripts";
import UtmCapture from "@/components/public/UtmCapture";
import ServiceWorkerRegistration from "@/components/public/ServiceWorkerRegistration";

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
  applicationName: "Markup Incorporações",
  appleWebApp: {
    capable: true,
    title: "Markup",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/favicon-16.png", type: "image/png", sizes: "16x16" },
      { url: "/icons/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icons/favicon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/icons/favicon-96.png", type: "image/png", sizes: "96x96" },
    ],
    apple: [
      { url: "/icons/apple-icon-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  verification: {
    google: "15Op8xGxORHl3CqdEuaGSMDVMucT5vy1QH0meem7yoE",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
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
        <UtmCapture />
        <TrackingScripts />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
