import { redirect } from "next/navigation";
import { currentAluno } from "@/lib/auth/session";
import { ContaForm } from "../conta-form";

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ cadastro?: string; senha?: string }> }) {
  if (await currentAluno()) redirect("/");
  const { cadastro, senha } = await searchParams;
  const notice = senha === "alterada"
    ? "Senha alterada. Entre com sua nova senha."
    : cadastro === "pendente" ? "Cadastro pendente. Confira seu e-mail para ativar a conta." : undefined;
  return <ContaForm mode="login" notice={notice} />;
}
