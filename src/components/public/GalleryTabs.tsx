"use client";

import { useState, useRef } from "react";
import { Carousel } from "@ark-ui/react/carousel";

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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
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
      <style dangerouslySetInnerHTML={{ __html: `
        .gallery-slider::-webkit-scrollbar { display: none; }
        [data-scope="carousel"][data-part="item-group"] { overflow: hidden; }
        [data-scope="carousel"][data-part="item"] { min-width: 0; }
      `}} />

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
            onClick={() => { setActiveTab(tab.key); setLightboxIndex(null); }}
            style={{
              padding: "10px 28px",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              border: "1px solid",
              borderColor: activeTab === tab.key ? "#b8945f" : "rgba(255,255,255,0.15)",
              borderRadius: "0",
              backgroundColor: activeTab === tab.key ? "#b8945f" : "transparent",
              color: activeTab === tab.key ? "#fff" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Horizontal slider */}
      <div style={{ position: "relative", maxWidth: "1200px", margin: "0 auto" }}>
        <button
          onClick={() => scroll("left")}
          style={{
            position: "absolute", left: "-20px", top: "50%", transform: "translateY(-50%)",
            zIndex: 10, width: "44px", height: "44px", borderRadius: "50%",
            backgroundColor: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff", fontSize: "20px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ‹
        </button>
        <button
          onClick={() => scroll("right")}
          style={{
            position: "absolute", right: "-20px", top: "50%", transform: "translateY(-50%)",
            zIndex: 10, width: "44px", height: "44px", borderRadius: "50%",
            backgroundColor: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff", fontSize: "20px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ›
        </button>

        <div
          ref={sliderRef}
          className="gallery-slider"
          style={{
            display: "flex", gap: "4px", overflowX: "auto",
            scrollSnapType: "x mandatory", scrollbarWidth: "none",
          }}
        >
          {filtered.map((img, idx) => (
            <div
              key={img.id}
              onClick={() => setLightboxIndex(idx)}
              style={{
                flexShrink: 0, width: "400px", height: "300px",
                overflow: "hidden", cursor: "pointer", scrollSnapAlign: "start",
              }}
            >
              <img
                src={img.url}
                alt={img.alt_text ?? empNome}
                loading="lazy"
                decoding="async"
                style={{
                  width: "100%", height: "100%", objectFit: "cover",
                  transition: "transform 0.6s ease",
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox with Carousel + Thumbnails */}
      {lightboxIndex !== null && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.95)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "40px 60px",
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxIndex(null)}
            style={{
              position: "absolute", top: "20px", right: "28px",
              background: "none", border: "none", color: "rgba(255,255,255,0.6)",
              fontSize: "28px", cursor: "pointer", fontWeight: 300,
              zIndex: 10, transition: "color 0.2s",
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = "#fff"; }}
            onMouseOut={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
          >
            ×
          </button>

          <Carousel.Root
            defaultPage={lightboxIndex}
            slideCount={filtered.length}
            style={{ width: "100%", maxWidth: "900px" }}
          >
            {/* Main image */}
            <Carousel.ItemGroup
              style={{
                overflow: "hidden", borderRadius: "4px",
                marginBottom: "20px",
              }}
            >
              {filtered.map((img, index) => (
                <Carousel.Item key={img.id} index={index}>
                  <img
                    src={img.url}
                    alt={img.alt_text ?? empNome}
                    style={{
                      width: "100%", height: "65vh", objectFit: "contain",
                      backgroundColor: "transparent",
                    }}
                  />
                </Carousel.Item>
              ))}
            </Carousel.ItemGroup>

            {/* Thumbnails row */}
            <div style={{
              display: "flex", alignItems: "center", gap: "12px",
            }}>
              <Carousel.PrevTrigger
                style={{
                  padding: "8px 12px", backgroundColor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px",
                  color: "#fff", cursor: "pointer", fontSize: "16px",
                  transition: "background 0.2s", flexShrink: 0,
                }}
              >
                ←
              </Carousel.PrevTrigger>

              <div style={{
                display: "flex", gap: "6px", overflowX: "auto",
                flex: 1, scrollbarWidth: "none",
              }}>
                {filtered.map((img, index) => (
                  <Carousel.Indicator
                    key={img.id}
                    index={index}
                    style={{
                      flexShrink: 0, borderRadius: "4px", overflow: "hidden",
                      cursor: "pointer", transition: "all 0.2s",
                      border: "2px solid transparent",
                      opacity: 0.5,
                    }}
                  >
                    <img
                      src={img.url}
                      alt={img.alt_text ?? `Thumbnail ${index + 1}`}
                      loading="lazy"
                      style={{ width: "72px", height: "48px", objectFit: "cover", display: "block" }}
                    />
                  </Carousel.Indicator>
                ))}
              </div>

              <Carousel.NextTrigger
                style={{
                  padding: "8px 12px", backgroundColor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px",
                  color: "#fff", cursor: "pointer", fontSize: "16px",
                  transition: "background 0.2s", flexShrink: 0,
                }}
              >
                →
              </Carousel.NextTrigger>
            </div>
          </Carousel.Root>

          {/* Click backdrop to close */}
          <div
            onClick={() => setLightboxIndex(null)}
            style={{ position: "absolute", inset: 0, zIndex: -1 }}
          />
        </div>
      )}
    </>
  );
}
