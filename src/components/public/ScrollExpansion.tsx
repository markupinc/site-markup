"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollExpansionProps {
  imageSrc: string;
  titleTop: string;
  titleBottom: string;
}

export default function ScrollExpansion({
  imageSrc,
  titleTop,
  titleBottom,
}: ScrollExpansionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);

    const handleScroll = () => {
      if (!wrapperRef.current) return;

      const rect = wrapperRef.current.getBoundingClientRect();
      const wrapperHeight = wrapperRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      const scrolled = -rect.top;
      const totalScrollable = wrapperHeight - viewportHeight;
      const p = Math.max(0, Math.min(1, scrolled / totalScrollable));
      setProgress(p);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Media grows from 300x400 to full viewport
  const p = progress;
  const isFullScreen = p >= 0.95;

  const mediaWidth = isFullScreen
    ? "100vw"
    : `${300 + p * (isMobile ? 650 : 1250)}px`;
  const mediaHeight = isFullScreen
    ? "100vh"
    : `${400 + p * (isMobile ? 200 : 400)}px`;
  const maxWidth = isFullScreen ? "100vw" : "95vw";
  const maxHeight = isFullScreen ? "100vh" : "85vh";

  const borderRadius = 16 * (1 - Math.min(p / 0.95, 1));
  const overlayOpacity = Math.max(0.4 - p * 0.4, 0);

  // Titles split apart
  const textX = p * (isMobile ? 180 : 150);
  const titleOpacity = Math.max(1 - p * 2.5, 0);

  return (
    <div
      ref={wrapperRef}
      style={{
        height: "300vh",
        position: "relative",
        backgroundColor: "#1a1a1a",
        marginTop: 0,
      }}
    >
      <div
        className="sticky top-0 flex items-center justify-center overflow-hidden"
        style={{
          height: "100vh",
          backgroundColor: "#1a1a1a",
        }}
      >
        {/* Image container */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: mediaWidth,
            height: mediaHeight,
            maxWidth,
            maxHeight,
            borderRadius: `${borderRadius}px`,
            overflow: "hidden",
            boxShadow: "0 0 50px rgba(0,0,0,0.3)",
            zIndex: 1,
          }}
        >
          <img
            src={imageSrc}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `rgba(0,0,0,${overlayOpacity})`,
              borderRadius: `${borderRadius}px`,
            }}
          />
        </div>

        {/* Title lines */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            pointerEvents: "none",
            opacity: titleOpacity,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "clamp(36px, 5vw, 64px)",
              fontWeight: 300,
              color: "#fff",
              whiteSpace: "nowrap",
              letterSpacing: "-0.5px",
              transform: `translateX(-${textX}vw)`,
            }}
          >
            {titleTop}
          </h2>
          <h2
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "clamp(36px, 5vw, 64px)",
              fontWeight: 300,
              color: "#fff",
              whiteSpace: "nowrap",
              letterSpacing: "-0.5px",
              transform: `translateX(${textX}vw)`,
            }}
          >
            {titleBottom}
          </h2>
        </div>
      </div>
    </div>
  );
}
