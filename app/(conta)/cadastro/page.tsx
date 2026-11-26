import { redirect } from "next/navigation";
import { currentAccount } from "@/lib/auth/session";
import { ContaForm } from "../conta-form";

export default async function CadastroPage() {
  if (await currentAccount()) redirect("/");
  return <ContaForm mode="cadastro" />;
}
