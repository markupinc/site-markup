"use client";

import { useEffect } from "react";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

const STORAGE_KEY = "markup_lead_attribution";

interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  first_landing?: string;
  captured_at?: string;
}

export default function UtmCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const incoming: Attribution = {};
      let hasUtm = false;

      for (const key of UTM_KEYS) {
        const v = params.get(key);
        if (v) {
          incoming[key] = v;
          hasUtm = true;
        }
      }

      const referrer = document.referrer || "";
      const isInternalReferrer =
        referrer && referrer.startsWith(window.location.origin);

      // Só atualiza se chegou novo (priorizar primeira atribuição)
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored && !hasUtm) return;

      const attribution: Attribution = stored ? JSON.parse(stored) : {};

      if (hasUtm) {
        Object.assign(attribution, incoming);
        attribution.captured_at = new Date().toISOString();
        attribution.first_landing =
          attribution.first_landing || window.location.href;
      }

      if (referrer && !isInternalReferrer && !attribution.referrer) {
        attribution.referrer = referrer;
      }

      if (Object.keys(attribution).length > 0) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
      }
    } catch {
      // sessionStorage indisponível — ignora
    }
  }, []);

  return null;
}
