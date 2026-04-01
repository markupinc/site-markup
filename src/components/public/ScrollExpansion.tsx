"use client";

import Image from "next/image";
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

  // Continuous expansion: 20vw/50vh at p=0 → 100vw/100vh at p=1
  // No jump, no clamp — pure linear interpolation in viewport units
  const startW = isMobile ? 60 : 20; // vw
  const startH = 50; // vh
  const w = startW + progress * (100 - startW);
  const h = startH + progress * (100 - startH);

  const borderRadius = 16 * (1 - progress);
  const overlayOpacity = Math.max(0.4 - progress * 0.4, 0);

  // Titles split apart
  const textX = progress * (isMobile ? 180 : 150);
  const titleOpacity = Math.max(1 - progress * 2.5, 0);

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
        className="sticky top-0 overflow-hidden"
        style={{
          height: "100vh",
          backgroundColor: "#1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Image container — always uses vw/vh for smooth continuous growth */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: `${w}vw`,
            height: `${h}vh`,
            borderRadius: `${borderRadius}px`,
            overflow: "hidden",
            boxShadow: progress < 0.98 ? "0 0 50px rgba(0,0,0,0.3)" : "none",
            zIndex: 1,
          }}
        >
          <Image
            src={imageSrc}
            alt="Conteúdo visual do empreendimento - Scroll para expandir"
            fill
            quality={85}
            priority={false}
            loading="lazy"
            sizes="100vw"
            style={{
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `rgba(0,0,0,${overlayOpacity})`,
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
