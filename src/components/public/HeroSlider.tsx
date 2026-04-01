"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

interface Slide {
  type: "video" | "image";
  src: string;
  label: string;
  href?: string;
}

interface HeroSliderProps {
  slides: Slide[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  return (
    <div className="relative w-full" style={{ height: "100vh" }}>
      <Swiper
        modules={[Navigation]}
        navigation
        loop
        className="w-full h-full"
        style={
          {
            "--swiper-navigation-color": "#fff",
            "--swiper-navigation-size": "24px",
          } as React.CSSProperties
        }
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index} className="relative w-full h-full">
            <a
              href={slide.href || "#"}
              className="absolute inset-0 z-30 block w-full h-full"
              style={{ cursor: "pointer" }}
            />
            {/* Media */}
            {slide.type === "video" ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={slide.src} type="video/mp4" />
              </video>
            ) : (
              <Image
                src={slide.src}
                alt={slide.label}
                fill
                quality={85}
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                sizes="100vw"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {/* Gradient overlay */}
            <div
              className="absolute inset-0 z-10"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.5) 100%)",
              }}
            />

            {/* Label */}
            <div
              className="absolute z-20"
              style={{
                bottom: "80px",
                right: "60px",
                color: "#fff",
                fontSize: "14px",
                letterSpacing: "1px",
              }}
            >
              {slide.label}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
