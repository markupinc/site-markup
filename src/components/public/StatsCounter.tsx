"use client";

import { useEffect, useRef, useState } from "react";

interface Stat {
  target: number;
  suffix: string;
  label: string;
}

interface StatsCounterProps {
  stats: Stat[];
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
}

function AnimatedNumber({
  target,
  suffix,
  shouldAnimate,
}: {
  target: number;
  suffix: string;
  shouldAnimate: boolean;
}) {
  const [current, setCurrent] = useState(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!shouldAnimate) return;

    const duration = 2000; // 2 seconds
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic: 1 - (1 - progress)^3
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);

      setCurrent(value);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [shouldAnimate, target]);

  return (
    <span>
      {current}
      {suffix}
    </span>
  );
}

export default function StatsCounter({
  stats,
  title,
  subtitle,
  ctaText,
  ctaHref,
}: StatsCounterProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        backgroundColor: "#1a1a1a",
        padding: "80px 60px",
      }}
    >
      <div
        className="flex flex-wrap justify-between items-start gap-16"
        style={{ maxWidth: "1200px", margin: "0 auto" }}
      >
        {/* Left column: title, subtitle, CTA */}
        <div style={{ maxWidth: "440px" }}>
          <h2
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: "36px",
              fontWeight: 400,
              color: "#fff",
              margin: "0 0 20px 0",
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontSize: "12px",
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.6)",
              maxWidth: "440px",
              margin: "0 0 24px 0",
            }}
          >
            {subtitle}
          </p>
          <a
            href={ctaHref}
            style={{
              color: "#fff",
              fontSize: "14px",
              textDecoration: "none",
              borderBottom: "1px solid #fff",
              paddingBottom: "4px",
              display: "inline-block",
            }}
          >
            {ctaText}
          </a>
        </div>

        {/* Right column: stats grid */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "60px",
          }}
        >
          {stats.map((stat, index) => (
            <div key={index} className="relative" style={{ paddingLeft: "20px" }}>
              {/* Decorative slash */}
              <div
                className="absolute"
                style={{
                  left: "0",
                  top: "8px",
                  width: "2px",
                  height: "40px",
                  backgroundColor: "rgba(255,255,255,0.3)",
                  transform: "rotate(15deg)",
                }}
              />
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: 300,
                  color: "#fff",
                  lineHeight: 1.2,
                  marginBottom: "8px",
                }}
              >
                <AnimatedNumber
                  target={stat.target}
                  suffix={stat.suffix}
                  shouldAnimate={isVisible}
                />
              </div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 300,
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
