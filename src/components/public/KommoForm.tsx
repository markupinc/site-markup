"use client";

import { useEffect, useRef } from "react";
import { trackSignupConversion } from "@/lib/tracking/googleAds";

/**
 * Formulário do Kommo embutido (envia o lead direto para o CRM).
 * Reproduz o código de incorporação do Kommo dentro do React: o script procura o
 * elemento #amoforms_script_{id} e insere o iframe do formulário ao lado dele.
 */

const KOMMO_SCRIPT = "https://forms.kommo.com/forms/assets/js/amoforms.js?1792159460";
const KOMMO_ORIGIN = "https://forms.kommo.com";

interface KommoFormConfig {
  id: string;
  hash: string;
}

// Formulário geral por enquanto em todos os empreendimentos. Para usar um formulário
// próprio num empreendimento (e mandar os leads para o funil dele), adicione o slug aqui.
const KOMMO_FORM_GERAL: KommoFormConfig = { id: "1733583", hash: "4cd3095ab48f0fac9edca7798dbd4e82" };
const KOMMO_FORM_POR_EMPREENDIMENTO: Record<string, KommoFormConfig> = {};

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function KommoForm({ empreendimentoSlug }: { empreendimentoSlug: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { id, hash } = KOMMO_FORM_POR_EMPREENDIMENTO[empreendimentoSlug] || KOMMO_FORM_GERAL;

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const w = window as any;

    // Zera o estado global do Kommo para o script reinicializar (navegação entre páginas)
    delete w.amo_forms_params;
    delete w.amo_forms_load;
    delete w.amo_forms_loaded;

    // Equivalente ao primeiro <script> do código de incorporação
    w.amo_forms_params = {
      setMeta(p: unknown) {
        this.params = (this.params || []).concat([p]);
      },
    };
    w.amo_forms_load = function (f: unknown) {
      w.amo_forms_load.f = (w.amo_forms_load.f || []).concat([f]);
    };
    w.amo_forms_load({ id, hash, locale: "pt" });
    w.amo_forms_loaded = function (f: unknown, k: unknown) {
      w.amo_forms_loaded.f = (w.amo_forms_loaded.f || []).concat([[f, k]]);
    };

    // Segundo <script>: o iframe do formulário entra ao lado deste elemento
    const script = document.createElement("script");
    script.id = `amoforms_script_${id}`;
    script.async = true;
    script.charset = "utf-8";
    script.src = KOMMO_SCRIPT;
    container.appendChild(script);

    // Envio concluído no iframe → conversão "[INSCRIÇÃO SITE]" do Google Ads
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== KOMMO_ORIGIN) return;
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data?.func === "amoformsSuccessSubmit" && String(data.form_id) === id) trackSignupConversion();
      } catch {
        // mensagens do Kommo que não são JSON
      }
    };
    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("message", onMessage);
      container.innerHTML = "";
    };
  }, [id, hash]);

  return <div ref={ref} style={{ minHeight: 420 }} />;
}
