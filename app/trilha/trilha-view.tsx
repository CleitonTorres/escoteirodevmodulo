import { currentAccount } from "@/lib/auth/session";
import { listarDisciplinas } from "@/lib/catalogo";
import { progressoAluno } from "@/lib/progresso";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { sair } from "@/app/conta-actions";
import Trilha from "./trilha";
import "./trilha.css";

export type TrilhaQuery = { disciplina?: string | string[]; aula?: string | string[] };

export default async function TrilhaView({ searchParams, visualizacao = false }: {
  searchParams: Promise<TrilhaQuery>;
  visualizacao?: boolean;
}) {
  const account = await currentAccount();
  if (!account) redirect("/entrar");
  if (visualizacao && account.role === "aluno") redirect("/");
  if (!visualizacao && account.role !== "aluno") redirect("/gestao");

  const query = await searchParams;
  const disciplinas = await listarDisciplinas();
  const disciplina = disciplinas.find(({ id }) => id === query.disciplina) ?? disciplinas[0];
  if (!disciplina) return <main className="content">
    <h1>Nenhuma disciplina disponível</h1>
    {visualizacao
      ? <Link href="/gestao" className="secondary-btn">Voltar à gestão</Link>
      : <form action={sair}><button className="secondary-btn" type="submit">Sair da conta</button></form>}
  </main>;

  const lessonId = visualizacao && query.aula !== undefined
    ? disciplina.aulas.find((lesson) => String(lesson.id) === query.aula)?.id : undefined;
  if (visualizacao && query.aula !== undefined && (lessonId === undefined || query.disciplina !== disciplina.id)) notFound();

  const progress = await progressoAluno(account._id, disciplina.id, visualizacao);
  const accountId = account._id.toHexString();
  const studentId = visualizacao ? `visualizacao-${accountId}` : accountId;
  return <Trilha
    key={`${studentId}:${disciplina.id}:${lessonId ?? ""}`}
    studentId={studentId}
    nome={account.nome}
    disciplina={disciplina}
    opcoesDisciplinas={disciplinas.map(({ id, nome }) => ({ id, nome }))}
    initialProgress={await progress.load()}
    preview={visualizacao ? { lessonId } : undefined}
  />;
}
