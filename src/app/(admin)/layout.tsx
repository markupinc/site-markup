export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/admin/Sidebar";

export default async function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if we're on the login page — don't show sidebar there
  return <AdminLayoutInner>{children}</AdminLayoutInner>;
}

async function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#111" }}>
      <Sidebar />
      <main
        style={{
          marginLeft: "240px",
          flex: 1,
          padding: "32px 40px",
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}
