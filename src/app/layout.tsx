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

const SITE_URL = "https://markupincorporacoes.com.br";
const SITE_DESCRIPTION =
  "Incorporadora de alto padrão em Maceió. Empreendimentos exclusivos com alta rentabilidade para investidores.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Markup Incorporações",
  description: SITE_DESCRIPTION,
  applicationName: "Markup Incorporações",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "Markup Incorporações",
    title: "Markup Incorporações",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Markup Incorporações",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Markup Incorporações",
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Markup Incorporações",
              url: SITE_URL,
              logo: `${SITE_URL}/icons/icon-512.png`,
              description: SITE_DESCRIPTION,
              sameAs: [
                "https://www.instagram.com/markup_inc/",
                "https://www.facebook.com/p/Markup-Inc-61571062839626/",
                "https://www.youtube.com/channel/UCo9RXBaBrP5CRxZIACEeo2Q",
              ],
            }),
          }}
        />
        {children}
        <UtmCapture />
        <TrackingScripts />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
