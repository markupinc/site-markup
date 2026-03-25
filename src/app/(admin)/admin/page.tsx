import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <h1 className="text-3xl font-light mb-8">Dashboard</h1>
      <p className="text-white/50">Painel admin da Markup Incorporações.</p>
      <p className="text-white/30 text-sm mt-4">Logado como: {user.email}</p>
    </div>
  );
}
