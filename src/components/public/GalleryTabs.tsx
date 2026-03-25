"use client";

import { useState, useRef } from "react";

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
  { key: "interior", label: "Internas" },
  { key: "area_comum", label: "Áreas Comuns" },
  { key: "fachada", label: "Fachada" },
  { key: "planta", label: "Plantas" },
];

export default function GalleryTabs({ images, empNome }: GalleryTabsProps) {
  const availableTabs = categories.filter((cat) =>
    images.some((img) => img.categoria === cat.key)
  );

  const [activeTab, setActiveTab] = useState(availableTabs[0]?.key ?? "");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0 || availableTabs.length === 0) return null;

  const filtered = images.filter((img) => img.categoria === activeTab);

  const scroll = (dir: "left" | "right") => {
    if (!sliderRef.current) return;
    const amount = sliderRef.current.clientWidth * 0.7;
    sliderRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

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
                activeTab === tab.key ? "#b8945f" : "rgba(255,255,255,0.15)",
              borderRadius: "0",
              backgroundColor:
                activeTab === tab.key ? "#b8945f" : "transparent",
              color: activeTab === tab.key ? "#fff" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Slider */}
      <div style={{ position: "relative", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Arrow left */}
        <button
          onClick={() => scroll("left")}
          style={{
            position: "absolute",
            left: "-20px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            backgroundColor: "rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff",
            fontSize: "20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ‹
        </button>

        {/* Arrow right */}
        <button
          onClick={() => scroll("right")}
          style={{
            position: "absolute",
            right: "-20px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            backgroundColor: "rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff",
            fontSize: "20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ›
        </button>

        {/* Images row */}
        <div
          ref={sliderRef}
          style={{
            display: "flex",
            gap: "4px",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
          }}
        >
          <style dangerouslySetInnerHTML={{ __html: `
            .gallery-slider::-webkit-scrollbar { display: none; }
          `}} />
          {filtered.map((img) => (
            <div
              key={img.id}
              className="gallery-slider"
              onClick={() => setLightbox(img.url)}
              style={{
                flexShrink: 0,
                width: "400px",
                height: "300px",
                overflow: "hidden",
                cursor: "pointer",
                scrollSnapAlign: "start",
              }}
            >
              <img
                src={img.url}
                alt={img.alt_text ?? empNome}
                loading="lazy"
                decoding="async"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.6s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              />
            </div>
          ))}
        </div>
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
            style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain" }}
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
    </>
  );
}
