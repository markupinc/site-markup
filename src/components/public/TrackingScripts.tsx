import { createAdminClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";

interface TrackingConfig {
  ga4: string | null;
  gtm: string | null;
  pixel: string | null;
}

async function getTrackingConfig(): Promise<{
  config: TrackingConfig;
  debug: string;
}> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("configuracoes")
      .select("chave, valor")
      .in("chave", ["ga4_measurement_id", "gtm_id", "meta_pixel_id"]);

    if (error) {
      return {
        config: { ga4: null, gtm: null, pixel: null },
        debug: `error:${error.message}`,
      };
    }

    const map = new Map<string, string>();
    (data as { chave: string; valor: string | null }[] | null)?.forEach((row) => {
      if (row.valor?.trim()) map.set(row.chave, row.valor.trim());
    });

    return {
      config: {
        ga4: map.get("ga4_measurement_id") || null,
        gtm: map.get("gtm_id") || null,
        pixel: map.get("meta_pixel_id") || null,
      },
      debug: `loaded:rows=${data?.length ?? 0}`,
    };
  } catch (e) {
    return {
      config: { ga4: null, gtm: null, pixel: null },
      debug: `exception:${e instanceof Error ? e.message : "unknown"}`,
    };
  }
}

export default async function TrackingScripts() {
  // Força dynamic rendering — sem isso o Next pode pré-renderizar com config vazia
  await headers();
  const { config, debug } = await getTrackingConfig();

  return (
    <>
      {/* Debug marker — confirma que o componente rodou */}
      <script
        dangerouslySetInnerHTML={{
          __html: `/* tracking-scripts: ${debug} ga4=${config.ga4 || "none"} */`,
        }}
      />

      {/* Google Analytics 4 */}
      {config.ga4 && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${config.ga4}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${config.ga4}');
              `,
            }}
          />
        </>
      )}

      {/* Google Tag Manager */}
      {config.gtm && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${config.gtm}');
            `,
          }}
        />
      )}

      {/* Meta Pixel */}
      {config.pixel && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
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
            `,
          }}
        />
      )}
    </>
  );
}
