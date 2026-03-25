import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Building2, FileText, Users, Newspaper } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  // Fetch counts
  const [empreendimentos, posts, leads, midia] = await Promise.all([
    supabase.from("empreendimentos").select("id", { count: "exact", head: true }),
    supabase.from("blog_posts").select("id", { count: "exact", head: true }),
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("midia").select("id", { count: "exact", head: true }),
  ]);

  const stats = [
    {
      label: "Empreendimentos",
      count: empreendimentos.count ?? 0,
      icon: Building2,
      href: "/admin/empreendimentos",
      color: "#b8945f",
    },
    {
      label: "Posts do Blog",
      count: posts.count ?? 0,
      icon: FileText,
      href: "/admin/blog",
      color: "#6b9f6b",
    },
    {
      label: "Leads",
      count: leads.count ?? 0,
      icon: Users,
      href: "/admin/leads",
      color: "#5b8fd4",
    },
    {
      label: "Mídia",
      count: midia.count ?? 0,
      icon: Newspaper,
      href: "/admin/midia",
      color: "#d4835b",
    },
  ];

  return (
    <div>
      <h1
        style={{
          fontSize: "24px",
          fontWeight: 300,
          color: "#fff",
          marginBottom: "8px",
        }}
      >
        Dashboard
      </h1>
      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "40px" }}>
        Bem-vindo, {user.email}
      </p>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <a
              key={stat.label}
              href={stat.href}
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "24px",
                textDecoration: "none",
                transition: "border-color 0.2s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <Icon size={20} style={{ color: stat.color }} />
              </div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 300,
                  color: "#fff",
                  lineHeight: 1,
                  marginBottom: "6px",
                }}
              >
                {stat.count}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {stat.label}
              </div>
            </a>
          );
        })}
      </div>

      {/* Recent Leads Preview */}
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ fontSize: "14px", fontWeight: 500, color: "#fff" }}>
            Últimos Leads
          </h2>
          <a
            href="/admin/leads"
            style={{
              fontSize: "12px",
              color: "#b8945f",
              textDecoration: "none",
            }}
          >
            Ver todos →
          </a>
        </div>
        <RecentLeads />
      </div>
    </div>
  );
}

async function RecentLeads() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("id, nome, telefone, status, created_at, empreendimento_id")
    .order("created_at", { ascending: false })
    .limit(5);

  const leads = (data ?? []) as Array<{
    id: string;
    nome: string;
    telefone: string;
    status: string;
    created_at: string;
    empreendimento_id: string | null;
  }>;

  if (!leads || leads.length === 0) {
    return (
      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
        Nenhum lead ainda.
      </p>
    );
  }

  const statusColors: Record<string, string> = {
    novo: "#5b8fd4",
    contatado: "#b8945f",
    em_negociacao: "#d4835b",
    convertido: "#6b9f6b",
    perdido: "#d45b5b",
  };

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {["Nome", "Telefone", "Status", "Data"].map((h) => (
            <th
              key={h}
              style={{
                textAlign: "left",
                fontSize: "11px",
                color: "rgba(255,255,255,0.3)",
                fontWeight: 500,
                paddingBottom: "12px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {leads.map((lead) => (
          <tr key={lead.id}>
            <td
              style={{
                fontSize: "13px",
                color: "#fff",
                padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              {lead.nome}
            </td>
            <td
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.6)",
                padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              {lead.telefone}
            </td>
            <td
              style={{
                padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  backgroundColor: `${statusColors[lead.status] || "#555"}22`,
                  color: statusColors[lead.status] || "#999",
                }}
              >
                {lead.status}
              </span>
            </td>
            <td
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.4)",
                padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              {new Date(lead.created_at).toLocaleDateString("pt-BR")}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
