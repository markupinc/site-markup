"use client";

import { useState } from "react";

interface Planta {
  id: string;
  nome: string;
  url: string;
  area: number | null;
  quartos: number | null;
  suites: number | null;
}

interface PlantasSectionProps {
  plantas: Planta[];
}

export default function PlantasSection({ plantas }: PlantasSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!plantas || plantas.length === 0) return null;

  const active = plantas[activeIndex];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gap: "0",
        maxWidth: "1100px",
        margin: "0 auto",
        minHeight: "500px",
      }}
    >
      {/* Left — Tipologias list */}
      <div
        style={{
          borderRight: "1px solid rgba(26,26,26,0.08)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {plantas.map((planta, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={planta.id}
              onClick={() => setActiveIndex(idx)}
              style={{
                padding: "20px 24px",
                textAlign: "left",
                border: "none",
                borderBottom: "1px solid rgba(26,26,26,0.06)",
                backgroundColor: isActive ? "rgba(184,148,95,0.08)" : "transparent",
                borderLeft: isActive ? "3px solid #1CB8E8" : "3px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#1a1a1a" : "#8a7d72",
                  marginBottom: planta.area || planta.quartos ? "4px" : "0",
                  transition: "color 0.2s",
                }}
              >
                {planta.nome}
              </p>
              {(planta.area || planta.quartos) && (
                <p
                  style={{
                    fontSize: "11px",
                    color: isActive ? "#1CB8E8" : "rgba(138,125,114,0.6)",
                    transition: "color 0.2s",
                  }}
                >
                  {[
                    planta.area ? `${planta.area}m²` : null,
                    planta.quartos ? `${planta.quartos} quartos` : null,
                    planta.suites ? `${planta.suites} suítes` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Right — Planta image */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
          backgroundColor: "rgba(184,148,95,0.03)",
        }}
      >
        <img
          key={active.id}
          src={active.url}
          alt={active.nome}
          style={{
            maxWidth: "100%",
            maxHeight: "500px",
            objectFit: "contain",
            animation: "fadeIn 0.3s ease",
          }}
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 280px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </div>
  );
}
