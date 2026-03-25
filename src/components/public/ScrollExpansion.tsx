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
  const [viewportSize, setViewportSize] = useState({ w: 1440, h: 900 });

  useEffect(() => {
    setViewportSize({ w: window.innerWidth, h: window.innerHeight });

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
      setViewportSize({ w: window.innerWidth, h: window.innerHeight });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Image dimensions: starts at 300x400, grows to full viewport
  const expansionProgress = Math.min(progress / 0.95, 1);
  const imgWidth = 300 + expansionProgress * (viewportSize.w - 300);
  const imgHeight = 400 + expansionProgress * (viewportSize.h - 400);
  const isFullScreen = progress >= 0.95;
  const borderRadius = 16 * (1 - expansionProgress);
  const overlayOpacity = 0.4 * (1 - expansionProgress);

  // Title animations
  const titleOpacity = Math.max(0, 1 - progress * 2.5);
  const titleSpread = progress * 25; // vw units

  return (
    <div
      ref={wrapperRef}
      style={{ height: "300vh", backgroundColor: "#1a1a1a" }}
    >
      <div
        className="sticky top-0 flex items-center justify-center overflow-hidden"
        style={{ height: "100vh" }}
      >
        {/* Image container */}
        <div
          className="relative overflow-hidden"
          style={{
            width: isFullScreen ? "100vw" : `${imgWidth}px`,
            height: isFullScreen ? "100vh" : `${imgHeight}px`,
            borderRadius: `${borderRadius}px`,
            transition: "border-radius 0.1s ease",
          }}
        >
          {/* Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${imageSrc})`,
            }}
          />

          {/* Dark overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: `rgba(0,0,0,${overlayOpacity})`,
            }}
          />
        </div>

        {/* Title lines */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ opacity: titleOpacity }}
        >
          {/* Top line — moves left */}
          <span
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "clamp(36px, 5vw, 64px)",
              fontWeight: 300,
              color: "#fff",
              letterSpacing: "-0.5px",
              transform: `translateX(-${titleSpread}vw)`,
              transition: "transform 0.05s linear",
              whiteSpace: "nowrap",
            }}
          >
            {titleTop}
          </span>

          {/* Bottom line — moves right */}
          <span
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "clamp(36px, 5vw, 64px)",
              fontWeight: 300,
              color: "#fff",
              letterSpacing: "-0.5px",
              transform: `translateX(${titleSpread}vw)`,
              transition: "transform 0.05s linear",
              whiteSpace: "nowrap",
            }}
          >
            {titleBottom}
          </span>
        </div>
      </div>
    </div>
  );
}
