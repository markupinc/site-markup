import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Área do Corretor | Markup Incorporações",
  description: "Acesse materiais dos empreendimentos Markup.",
};

export default function CorretorLoginPage() {
  return <LoginForm />;
}
