import { informaticaBasica } from "@/data/disciplinas";
import { requireAluno } from "@/lib/auth/session";
import { progressoAluno } from "@/lib/progresso";
import Trilha from "./trilha";
import "./trilha.css";

export default async function Page() {
  const aluno = await requireAluno();
  const progress = await progressoAluno(aluno._id, informaticaBasica.id);
  return <Trilha key={aluno._id.toHexString()} nome={aluno.nome} initialProgress={await progress.load()} />;
}
