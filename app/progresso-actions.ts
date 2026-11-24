"use server";

import { informaticaBasica, typingLevels } from "@/data/disciplinas";
import { lessons } from "@/data/lessons";
import { currentAluno } from "@/lib/auth/session";
import { readDesktopItems } from "@/lib/desktop-validation";
import { progressoAluno } from "@/lib/progresso";
import { guideLimit } from "@/lib/storage";
import { redirect } from "next/navigation";

const saveError = "Não foi possível salvar. Tente novamente.";

async function salvarProgresso(save: (store: Awaited<ReturnType<typeof progressoAluno>>) => Promise<void>) {
  try {
    const aluno = await currentAluno();
    if (aluno) {
      await save(await progressoAluno(aluno._id, informaticaBasica.id));
      return { ok: true } as const;
    }
  } catch {
    console.error("Falha ao atualizar o progresso da disciplina.");
    return { ok: false, error: saveError } as const;
  }
  redirect("/entrar");
}

export async function concluirAula(lessonId: number) {
  if (!lessons.some((lesson) => lesson.id === lessonId)) return { ok: false, error: "Aula inválida." } as const;
  return salvarProgresso((store) => store.complete(lessonId));
}

export async function registrarDigitacao(level: number) {
  if (!Number.isInteger(level) || level < 1 || level > typingLevels.length) return { ok: false, error: "Nível inválido." } as const;
  return salvarProgresso((store) => store.recordTyping(level));
}

export async function salvarGuia(guide: string) {
  if (typeof guide !== "string" || guide.length > guideLimit) {
    return { ok: false, error: "O guia pode ter até 50 mil caracteres." } as const;
  }
  return salvarProgresso((store) => store.saveGuide(guide));
}

export async function salvarDesktop(value: unknown, revision: number) {
  if (!Number.isSafeInteger(revision) || revision < 0 || revision >= Number.MAX_SAFE_INTEGER) {
    return { ok: false, error: "Versão do desktop inválida." } as const;
  }
  const items = readDesktopItems(value);
  if (!items) return { ok: false, error: "O desktop contém dados inválidos ou excede o limite de armazenamento." } as const;

  try {
    const aluno = await currentAluno();
    if (aluno) {
      const savedRevision = await (await progressoAluno(aluno._id, informaticaBasica.id)).saveDesktop(items, revision);
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

