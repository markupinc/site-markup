import Script from "next/script";
import { createAdminClient } from "@/lib/supabase/admin";

interface TrackingConfig {
  ga4: string | null;
  gtm: string | null;
  pixel: string | null;
}

async function getTrackingConfig(): Promise<TrackingConfig> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("configuracoes")
      .select("chave, valor")
      .in("chave", ["ga4_measurement_id", "gtm_id", "meta_pixel_id"]);

    const map = new Map<string, string>();
    (data as { chave: string; valor: string | null }[] | null)?.forEach((row) => {
      if (row.valor?.trim()) map.set(row.chave, row.valor.trim());
    });

    return {
      ga4: map.get("ga4_measurement_id") || null,
      gtm: map.get("gtm_id") || null,
      pixel: map.get("meta_pixel_id") || null,
    };
  } catch {
    return { ga4: null, gtm: null, pixel: null };
  }
}

export default async function TrackingScripts() {
  const config = await getTrackingConfig();

  return (
    <>
      {/* Google Analytics 4 */}
      {config.ga4 && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${config.ga4}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${config.ga4}');
            `}
          </Script>
        </>
      )}

      {/* Google Tag Manager */}
      {config.gtm && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${config.gtm}');
          `}
        </Script>
      )}

      {/* Meta Pixel */}
      {config.pixel && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${config.pixel}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}
