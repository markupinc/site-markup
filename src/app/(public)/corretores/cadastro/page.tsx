import type { Metadata } from "next";
import CadastroForm from "./CadastroForm";

export const metadata: Metadata = {
  title: "Cadastro de Corretor | Markup Incorporações",
  description: "Crie sua conta na Área do Corretor Markup.",
};

export default function CorretorCadastroPage() {
  return <CadastroForm />;
}
