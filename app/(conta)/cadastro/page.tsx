import { redirect } from "next/navigation";
import { currentAluno } from "@/lib/auth/session";
import { ContaForm } from "../conta-form";

export default async function CadastroPage() {
  if (await currentAluno()) redirect("/");
  return <ContaForm mode="cadastro" />;
}
