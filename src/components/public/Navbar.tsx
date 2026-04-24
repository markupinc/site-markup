"use client";

import { useEffect, useState, useRef } from "react";

interface NavbarProps {
  logoSrc: string;
}

const navLinks = [
  { label: "Empreendimentos", href: "/empreendimentos" },
  { label: "Empresa", href: "/sobre" },
  { label: "O Padrão Markup", href: "/padrao-markup" },
  { label: "Sustentabilidade", href: "/sustentabilidade" },
  { label: "Blog", href: "/blog" },
  { label: "Contato", href: "/contato" },
];

const socialLinks = [
  {
    href: "https://www.instagram.com/markup_inc/",
    label: "Instagram",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    href: "https://www.facebook.com/profile.php?id=61575200364485",
    label: "Facebook",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    href: "https://www.youtube.com/@MarkupIncorporacoes",
    label: "YouTube",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    ),
  },
  {
    href: "https://wa.me/5582982294001/",
    label: "WhatsApp",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
      </svg>
    ),
  },
];

export default function Navbar({ logoSrc }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        // Check if clicked target is not the hamburger button
        const hamburger = document.querySelector("[data-hamburger-btn]");
        if (hamburger && !hamburger.contains(e.target as Node)) {
          setMobileMenuOpen(false);
        }
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header
      className="fixed top-0 left-0 w-full z-[100] flex items-center justify-between transition-all duration-300"
      style={{
        padding: `${scrolled ? "12px" : "20px"} 24px`,
        backgroundColor: scrolled ? "rgba(26,26,26,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
      }}
    >
      <style>{`
        @media (min-width: 768px) {
          header {
            padding-left: 60px !important;
            padding-right: 60px !important;
          }
        }
      `}</style>
      <a href="/">
        <img
          src={logoSrc}
          alt="Markup Incorporações"
          style={{ height: "40px", filter: "brightness(0) invert(1)" }}
        />
      </a>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="hover:opacity-70 transition-opacity"
            style={{
              color: "#fff",
              fontSize: "13px",
              fontWeight: 400,
              letterSpacing: "0.5px",
              marginLeft: "40px",
              textDecoration: "none",
            }}
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Desktop: Corretor button + Social Links */}
      <div className="hidden md:flex items-center" style={{ gap: "24px" }}>
        <a
          href="/corretores"
          className="hover:opacity-80 transition-opacity"
          style={{
            padding: "6px 12px",
            border: "1px solid rgba(255,255,255,0.6)",
            borderRadius: "999px",
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.5px",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          Área do Corretor
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener"
              aria-label={social.label}
              className="inline-flex hover:opacity-70 transition-opacity"
              style={{ color: "#fff" }}
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>

      {/* Mobile Hamburger Button */}
      <button
        data-hamburger-btn
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden flex flex-col items-center justify-center w-[48px] h-[48px] hover:opacity-70 transition-opacity"
        aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={mobileMenuOpen}
      >
        <div
          style={{
            width: "24px",
            height: "2px",
            backgroundColor: "#fff",
            marginBottom: "5px",
            transition: "all 0.3s ease",
            transform: mobileMenuOpen ? "rotate(45deg) translate(9px, 9px)" : "none",
          }}
        />
        <div
          style={{
            width: "24px",
            height: "2px",
            backgroundColor: "#fff",
            marginBottom: "5px",
            transition: "all 0.3s ease",
            opacity: mobileMenuOpen ? 0 : 1,
          }}
        />
        <div
          style={{
            width: "24px",
            height: "2px",
            backgroundColor: "#fff",
            transition: "all 0.3s ease",
            transform: mobileMenuOpen ? "rotate(-45deg) translate(8px, -8px)" : "none",
          }}
        />
      </button>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 40,
              animation: "fadeIn 0.3s ease",
            }}
          />

          {/* Drawer */}
          <div
            ref={mobileMenuRef}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100vh",
              backgroundColor: "#1a1a1a",
              zIndex: 50,
              overflow: "auto",
              animation: "slideInLeft 0.3s ease",
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <a href="/" onClick={closeMenu}>
                <img
                  src={logoSrc}
                  alt="Markup Incorporações"
                  style={{ height: "40px", filter: "brightness(0) invert(1)" }}
                />
              </a>
              <button
                onClick={closeMenu}
                className="flex flex-col items-center justify-center w-[48px] h-[48px] hover:opacity-70 transition-opacity"
                aria-label="Fechar menu"
              >
                <div
                  style={{
                    width: "24px",
                    height: "2px",
                    backgroundColor: "#fff",
                    marginBottom: "5px",
                    transform: "rotate(45deg) translate(9px, 9px)",
                  }}
                />
                <div
                  style={{
                    width: "24px",
                    height: "2px",
                    backgroundColor: "#fff",
                    marginBottom: "5px",
                    opacity: 0,
                  }}
                />
                <div
                  style={{
                    width: "24px",
                    height: "2px",
                    backgroundColor: "#fff",
                    transform: "rotate(-45deg) translate(8px, -8px)",
                  }}
                />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <nav style={{ padding: "24px 20px" }}>
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: "48px",
                    color: "#fff",
                    fontSize: "16px",
                    fontWeight: 400,
                    letterSpacing: "0.5px",
                    textDecoration: "none",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    transition: "opacity 0.3s ease",
                  }}
                  className="hover:opacity-70"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/corretores"
                onClick={closeMenu}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "44px",
                  marginTop: "20px",
                  border: "1px solid rgba(255,255,255,0.6)",
                  borderRadius: "999px",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 500,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  textDecoration: "none",
                }}
              >
                Área do Corretor
              </a>
            </nav>

            {/* Drawer Social Links */}
            <div
              style={{
                padding: "24px 20px",
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: "16px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Siga-nos
              </p>
              <div style={{ display: "flex", gap: "16px" }}>
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener"
                    aria-label={social.label}
                    onClick={closeMenu}
                    className="inline-flex hover:opacity-70 transition-opacity"
                    style={{
                      color: "#fff",
                      width: "48px",
                      height: "48px",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "4px",
                      backgroundColor: "rgba(255,255,255,0.05)",
                    }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </header>
  );
}
