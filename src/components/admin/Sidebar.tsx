"use client";

import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  Newspaper,
  Mail,
  Settings,
  LogOut,
  UserCheck,
  BarChart3,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Empreendimentos", href: "/admin/empreendimentos", icon: Building2 },
  { label: "Blog", href: "/admin/blog", icon: FileText },
  { label: "Leads", href: "/admin/leads", icon: Users },
  { label: "Corretores", href: "/admin/corretores", icon: UserCheck },
  { label: "Mídia", href: "/admin/midia", icon: Newspaper },
  { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { label: "Configurações", href: "/admin/configuracoes", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside
      style={{
        width: "240px",
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "0 24px", marginBottom: "40px" }}>
        <img
          src="/assets/logo.png"
          alt="Markup Incorporações"
          style={{
            height: "32px",
            width: "auto",
            filter: "brightness(0) invert(1)",
          }}
        />
        <span
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "11px",
            display: "block",
            marginTop: "8px",
            letterSpacing: "0.5px",
          }}
        >
          Admin
        </span>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1 }}>
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 24px",
                fontSize: "13px",
                color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                backgroundColor: isActive
                  ? "rgba(255,255,255,0.06)"
                  : "transparent",
                borderLeft: isActive
                  ? "2px solid #b8945f"
                  : "2px solid transparent",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              <Icon size={16} />
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "10px 24px",
          fontSize: "13px",
          color: "rgba(255,255,255,0.4)",
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          width: "100%",
          transition: "color 0.2s",
        }}
      >
        <LogOut size={16} />
        Sair
      </button>
    </aside>
  );
}
