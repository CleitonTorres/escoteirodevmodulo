"use server";

import { isProgramacaoBasica, typingLevels, type Disciplina } from "@/data/disciplinas";
import { carregarDisciplina } from "@/lib/catalogo";
import { currentAccount } from "@/lib/auth/session";
import { readDesktopItems } from "@/lib/desktop-validation";
import { lessonUnlocked, matchPracticeEvent, practiceKey, taskDone } from "@/lib/practice";
import { progressoAluno } from "@/lib/progresso";
import { guideLimit, journalNoteLimit } from "@/lib/storage";
import { typingMinimumScore, typingScore, type TypingAttempt } from "@/lib/typing-score";
import { readWordDocument, wordFromText } from "@/lib/word-document";
import { redirect } from "next/navigation";
import { isDeepStrictEqual } from "node:util";

const saveError = "Não foi possível salvar. Tente novamente.";
const disciplinaInvalida = { ok: false, error: "Disciplina inválida." } as const;

async function salvarProgresso(
  disciplina: Disciplina,
  save: (store: Awaited<ReturnType<typeof progressoAluno>>, startLessonId?: number) => Promise<void | { error: string }>,
  previewStart?: number,
) {
  try {
    const account = await currentAccount();
    if (account) {
      const visualizacao = account.role !== "aluno";
      const result = await save(await progressoAluno(account._id, disciplina.id, visualizacao), visualizacao ? previewStart : undefined);
      if (result) return { ok: false, error: result.error } as const;
      return { ok: true } as const;
    }
  } catch {
    console.error("Falha ao atualizar o progresso da disciplina.");
    return { ok: false, error: saveError } as const;
  }
  redirect("/entrar");
}

export async function concluirAula(disciplinaId: string, lessonId: number, previewStart?: number) {
  const disciplina = await carregarDisciplina(disciplinaId);
  if (!disciplina) return disciplinaInvalida;
  const lesson = disciplina.aulas.find((item) => item.id === lessonId);
  if (!lesson) return { ok: false, error: "Aula inválida." } as const;
  return salvarProgresso(disciplina, async (store, startLessonId) => {
    const saved = await store.load();
    if (!lessonUnlocked(disciplina.aulas, saved.completed, lessonId, startLessonId)) return { error: "Conclua as aulas anteriores para avançar." };
    if (saved.completed.includes(lessonId)) return;
    if (lesson.practice.some((task) => !taskDone(lessonId, task, saved))) return { error: "Ainda há tarefas pendentes nos dados salvos. Confira a lista de tarefas." };
    if (!isProgramacaoBasica(disciplina) && !saved.guideEditedLessons?.includes(lessonId)) return { error: "Edite e salve o guia desta aula antes de concluir." };
    await store.complete(lessonId);
  }, previewStart);
}

export async function salvarDiario(disciplinaId: string, lessonId: number, note: unknown, previewStart?: number) {
  const disciplina = await carregarDisciplina(disciplinaId);
  if (!disciplina || !isProgramacaoBasica(disciplina)) return disciplinaInvalida;
  if (!Number.isSafeInteger(lessonId) || typeof note !== "string" || note.length > journalNoteLimit) {
    return { ok: false, error: "Confira a anotação e tente novamente." } as const;
  }
  return salvarProgresso(disciplina, async (store, startLessonId) => {
    const saved = await store.load();
    if (!lessonUnlocked(disciplina.aulas, saved.completed, lessonId, startLessonId)) return { error: "Esta aula ainda não está disponível." };
    await store.saveJournalNote(lessonId, note);
  }, previewStart);
}

export async function registrarPratica(disciplinaId: string, lessonId: number, observation: unknown, previewStart?: number) {
  const disciplina = await carregarDisciplina(disciplinaId);
  if (!disciplina) return disciplinaInvalida;
  const lesson = disciplina.aulas.find((item) => item.id === lessonId);
  if (!lesson) return { ok: false, error: "Aula inválida." } as const;
  const evidence: Record<string, string> = {};
  const result = await salvarProgresso(disciplina, async (store, startLessonId) => {
    const saved = await store.load();
    if (!lessonUnlocked(disciplina.aulas, saved.completed, lessonId, startLessonId)) return { error: "Conclua as aulas anteriores para avançar." };
    const completed = saved.completed.includes(lessonId);
    for (const task of lesson.practice) {
      if (completed && task.check.kind !== "quiz") continue;
      const proof = matchPracticeEvent(lessonId, task, observation, saved);
      if (proof) evidence[practiceKey(lessonId, task.id)] = proof;
    }
    if (Object.keys(evidence).length) await store.recordPractice(evidence);
  }, previewStart);
  return result.ok ? { ...result, evidence } : result;
}

export async function registrarDigitacao(disciplinaId: string, attempt: TypingAttempt) {
  const disciplina = await carregarDisciplina(disciplinaId);
  if (!disciplina) return disciplinaInvalida;
  const { level, text, editSteps, elapsedMs, errors } = attempt ?? {};
  if (!Number.isInteger(level) || level < 1 || level > typingLevels.length) {
    return { ok: false, error: "Nível inválido." } as const;
  }
  const exercise = typingLevels[level - 1];
  if (text !== exercise.text || editSteps !== (exercise.edit?.actions.length ?? 0) ||
    !Number.isSafeInteger(elapsedMs) || elapsedMs < 0 || !Number.isSafeInteger(errors) || errors < 0) {
    return { ok: false, error: "Tentativa de digitação inválida." } as const;
  }
  if (typingScore(level, elapsedMs, errors) < typingMinimumScore) {
    return { ok: false, error: "Pontuação abaixo da nota de corte." } as const;
  }
  return salvarProgresso(disciplina, async (store) => {
    if (!await store.recordTyping(level)) return { error: "Conclua o nível anterior antes de avançar." };
  });
}

export async function salvarGuia(disciplinaId: string, guide: string, document?: unknown, lessonId?: number, previewStart?: number) {
  const disciplina = await carregarDisciplina(disciplinaId);
  if (!disciplina) return disciplinaInvalida;
  if (typeof guide !== "string" || guide.length > guideLimit) {
    return { ok: false, error: "O guia pode ter até 50 mil caracteres." } as const;
  }
  const content = document === undefined ? undefined : readWordDocument(document);
  if (content === null) return { ok: false, error: "O guia contém formatação inválida ou excede o limite de espaço." } as const;
  const text = content?.text ?? guide;
  let guideEditedLesson: number | undefined;
  const result = await salvarProgresso(disciplina, async (store, startLessonId) => {
    if (lessonId === undefined) {
      await store.saveGuide(text, content?.document);
      return;
    }
    const saved = await store.load();
    if (!lessonUnlocked(disciplina.aulas, saved.completed, lessonId, startLessonId)) return { error: "Abra uma aula liberada para registrar a edição do guia." };
    const previousDocument = saved.guideDocument ?? readWordDocument(wordFromText(saved.guide, true))?.document;
    const unchanged = content ? isDeepStrictEqual(content.document, previousDocument) : text === saved.guide;
    if (unchanged) {
      if (saved.guideEditedLessons?.includes(lessonId)) guideEditedLesson = lessonId;
      return;
    }
    if (!await store.saveGuide(text, content?.document, { id: lessonId, previous: saved })) {
      return { error: "O guia foi alterado em outra aba. Recarregue a página para abrir a versão salva." };
    }
    guideEditedLesson = lessonId;
  }, previewStart);
  return result.ok ? { ...result, guideEditedLesson } : result;
}

export async function salvarDesktop(disciplinaId: string, value: unknown, revision: number) {
  const disciplina = await carregarDisciplina(disciplinaId);
  if (!disciplina) return disciplinaInvalida;
  if (!Number.isSafeInteger(revision) || revision < 0 || revision >= Number.MAX_SAFE_INTEGER) {
    return { ok: false, error: "Versão do desktop inválida." } as const;
  }
  const items = readDesktopItems(value);
  if (!items) return { ok: false, error: "O desktop contém dados inválidos ou excede o limite de armazenamento." } as const;

  try {
    const account = await currentAccount();
    if (account) {
      const savedRevision = await (await progressoAluno(account._id, disciplina.id, account.role !== "aluno")).saveDesktop(items, revision);
      return savedRevision === null
        ? { ok: false, error: "O desktop foi alterado em outra aba. Recarregue a página para abrir a versão salva." } as const
        : { ok: true, revision: savedRevision } as const;
    }
  } catch {
    console.error("Falha ao salvar o desktop no progresso da disciplina.");
    return { ok: false, error: saveError } as const;
  }
  return { ok: false, error: "Sua sessão expirou. Entre novamente para continuar." } as const;
}

