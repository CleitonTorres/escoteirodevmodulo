import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentAccount } from "@/lib/auth/session";
import { activeStudent, authStore } from "@/lib/auth/store";
import MinhaConta from "./minha-conta";

export const metadata: Metadata = { title: "Minha conta", robots: { index: false } };

export default async function MinhaContaPage() {
  const account = await currentAccount();
  if (!account) redirect("/entrar");
  if (account.role !== "aluno") redirect("/gestao");
  const { alunos } = await authStore();
  const student = await alunos.findOne({ ...activeStudent, _id: account._id, passwordVersion: account.passwordVersion },
    { projection: { nome: 1, email: 1, perfil: 1 } });
  if (!student) redirect("/entrar");
  return <MinhaConta nome={student.nome} email={student.email} perfil={student.perfil} />;
}
