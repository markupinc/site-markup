"use client";

import { useEffect, useRef, useState } from "react";

interface MagicTextProps {
  lines: string[];
}

export default function MagicText({ lines }: MagicTextProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
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

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Build flat word list with line break tracking
  const words: { word: string; isLineBreak: boolean }[] = [];
  lines.forEach((line, lineIndex) => {
    const lineWords = line.split(/\s+/).filter(Boolean);
    lineWords.forEach((word) => {
      words.push({ word, isLineBreak: false });
    });
    if (lineIndex < lines.length - 1) {
      words.push({ word: "", isLineBreak: true });
    }
  });

  const totalWords = words.filter((w) => !w.isLineBreak).length;

  let wordIndex = 0;

  return (
    <div
      ref={wrapperRef}
      style={{ height: "125vh", position: "relative", marginBottom: 0 }}
    >
      <div
        className="sticky top-0 flex items-center justify-center"
        style={{
          height: "100vh",
          backgroundColor: "#1a1a1a",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            padding: "0 60px",
            textAlign: "center",
          }}
        >
          {words.map((item, i) => {
            if (item.isLineBreak) {
              return <br key={`br-${i}`} />;
            }

            const currentWordIndex = wordIndex;
            wordIndex++;

            const wordProgress = currentWordIndex / totalWords;
            const isRevealed = progress > wordProgress;

            return (
              <span
                key={`word-${i}`}
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: "26px",
                  fontWeight: 500,
                  lineHeight: 1.6,
                  color: isRevealed ? "#fff" : "rgba(255,255,255,0.12)",
                  transition: "color 0.15s ease",
                  marginRight: "8px",
                  display: "inline-block",
                }}
              >
                {item.word}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
