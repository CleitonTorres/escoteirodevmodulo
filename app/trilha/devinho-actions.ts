"use server";

import { currentAccount } from "@/lib/auth/session";
import { carregarDisciplina } from "@/lib/catalogo";
import { informaticaBasica } from "@/data/disciplinas";
import { devinhoChoices, devinhoContext } from "@/data/devinho";
import { reserveDevinhoRequest, selectDevinhoHint } from "@/lib/devinho-openai";
import { currentSimulationStep, lessonUnlocked } from "@/lib/practice";
import { progressoAluno } from "@/lib/progresso";

export async function pedirDicaDevinho(
  lessonId: number,
  taskId: string,
  mode: unknown,
  state: unknown,
) {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (
    !key ||
    !Number.isSafeInteger(lessonId) ||
    lessonId < 1 ||
    typeof taskId !== "string" ||
    taskId.length > 64 ||
    (mode !== "pista" && mode !== "explicar")
  )
    return null;

  try {
    const account = await currentAccount();
    if (!account) return null;
    const discipline = await carregarDisciplina(informaticaBasica.id);
    if (!discipline) return null;
    const lesson = discipline.aulas.find(({ id }) => id === lessonId);
    const task = lesson?.practice.find(({ id }) => id === taskId);
    if (!lesson || !task) return null;
    const student = account.role === "aluno";
    let step: number | undefined;
    if (student || task.check.kind === "simulation") {
      const progress = await (
        await progressoAluno(account._id, discipline.id, !student)
      ).load();
      if (student && !lessonUnlocked(discipline.aulas, progress.completed, lessonId))
        return null;
      step = currentSimulationStep(lessonId, task, progress.practiceEvidence);
    }
    if (!(await reserveDevinhoRequest(account._id.toHexString(), lessonId)))
      return null;
    const context = devinhoContext(state);
    const choices = devinhoChoices(lesson.title, task, mode, context, step);
    return (
      (await selectDevinhoHint(
        key,
        choices.goal,
        choices.hints,
        mode,
        context,
      )) ?? null
    );
  } catch {
    return null;
  }
}
