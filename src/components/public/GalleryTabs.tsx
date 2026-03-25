"use client";

import { useState } from "react";

interface GalleryImage {
  id: string;
  url: string;
  alt_text?: string;
  categoria?: string;
}

interface GalleryTabsProps {
  images: GalleryImage[];
  empNome: string;
}

const categories = [
  { key: "all", label: "Todas" },
  { key: "interior", label: "Internas" },
  { key: "area_comum", label: "Áreas Comuns" },
  { key: "fachada", label: "Fachada" },
  { key: "planta", label: "Plantas" },
];

export default function GalleryTabs({ images, empNome }: GalleryTabsProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  // Only show tabs that have images
  const availableTabs = categories.filter(
    (cat) =>
      cat.key === "all" ||
      images.some((img) => img.categoria === cat.key)
  );

  const filtered =
    activeTab === "all"
      ? images
      : images.filter((img) => img.categoria === activeTab);

  return (
    <>
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "48px",
          flexWrap: "wrap",
        }}
      >
        {availableTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 28px",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              border: "1px solid",
              borderColor:
                activeTab === tab.key
                  ? "#b8945f"
                  : "rgba(255,255,255,0.15)",
              borderRadius: "0",
              backgroundColor:
                activeTab === tab.key
                  ? "#b8945f"
                  : "transparent",
              color: activeTab === tab.key ? "#fff" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "4px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {filtered.map((img) => (
          <div
            key={img.id}
            onClick={() => setLightbox(img.url)}
            style={{
              overflow: "hidden",
              aspectRatio: "4/3",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <img
              src={img.url}
              alt={img.alt_text ?? empNome}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.6s ease, filter 0.6s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.filter = "brightness(1.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.filter = "brightness(1)";
              }}
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
            padding: "40px",
          }}
        >
          <img
            src={lightbox}
            alt=""
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
            }}
          />
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: "absolute",
              top: "24px",
              right: "32px",
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: "32px",
              cursor: "pointer",
              fontWeight: 300,
            }}
          >
            ×
          </button>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(3"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `,
        }}
      />
    </>
  );
}
