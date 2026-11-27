import "server-only";
import type { Filter, ObjectId, UpdateFilter, UpdateOptions } from "mongodb";
import { isDeepStrictEqual } from "node:util";
import type { DesktopEntry } from "@/lib/desktop-files";
import { getDb, isDuplicateKey } from "@/lib/mongodb";
import { withAccountWrite } from "@/lib/auth/store";
import { emptyProgress, type Progress } from "@/lib/storage";

type ProgressoAluno = Partial<Progress> & { _id: string; alunoId: ObjectId; disciplinaId: string };

export async function progressoAluno(alunoId: ObjectId, disciplinaId: string, visualizacao = false, passwordVersion?: number) {
  const db = await getDb();
  const collection = db.collection<ProgressoAluno>(visualizacao ? "progresso_visualizacao" : "progresso_alunos");
  const key = { _id: `${alunoId.toHexString()}:${disciplinaId}` };
  const identity = { alunoId, disciplinaId };

  async function update(filter: Filter<ProgressoAluno>, changes: UpdateFilter<ProgressoAluno>, options?: UpdateOptions) {
    if (passwordVersion === undefined) throw new Error("Sessão necessária para salvar o progresso.");
    const result = await withAccountWrite(alunoId, passwordVersion,
      (session) => collection.updateOne(filter, changes, { ...options, session }));
    if (!result) throw new Error("Conta indisponível para salvar o progresso.");
    return result;
  }

  return {
    async load(): Promise<Progress> {
      const result = await collection.findOne(key);
      return {
        completed: result?.completed ?? emptyProgress.completed,
        typingBest: result?.typingBest ?? emptyProgress.typingBest,
        guide: result?.guide ?? emptyProgress.guide,
        guideDocument: result?.guideDocument,
        guideEditedLessons: result?.guideEditedLessons,
        journal: result?.journal,
        desktop: result?.desktop,
        practiceEvidence: result?.practiceEvidence,
      };
    },
    async complete(lessonId: number) {
      await update(key, { $setOnInsert: identity, $addToSet: { completed: lessonId } }, { upsert: true });
    },
    async saveJournalNote(lessonId: number, note: string) {
      const changes = { $setOnInsert: identity, $set: { [`journal.${lessonId}`]: note } };
      try {
        await update(key, changes, { upsert: true });
      } catch (error) {
        if (!isDuplicateKey(error)) throw error;
        await update(key, changes);
      }
    },
    async recordPractice(evidence: Record<string, string>, keepLatestStep = false) {
      const fields = Object.fromEntries(Object.entries(evidence).map(([id, value]) => [`practiceEvidence.${id}`, value]));
      // Simulation progress uses single-digit steps and "ok" as the final state.
      const changes = { $setOnInsert: identity, ...(keepLatestStep ? { $max: fields } : { $set: fields }) };
      try {
        await update(key, changes, { upsert: true });
      } catch (error) {
        if (!isDuplicateKey(error)) throw error;
        await update(key, changes);
      }
    },
    async recordTyping(level: number) {
      const filter = level === 1 ? { ...key, $or: [{ typingBest: { $gte: 0 } }, { typingBest: { $exists: false } }] }
        : { ...key, typingBest: { $gte: level - 1 } };
      const changes = { $setOnInsert: identity, $max: { typingBest: level } };
      try {
        const result = await update(filter, changes, { upsert: level === 1 });
        return !!(result.matchedCount || result.upsertedCount);
      } catch (error) {
        if (level !== 1 || !isDuplicateKey(error)) throw error;
        return !!(await update(filter, changes)).matchedCount;
      }
    },
    async saveGuide(guide: string, guideDocument?: Progress["guideDocument"], lessonEdit?: {
      id: number;
      previous: Pick<Progress, "guide" | "guideDocument">;
    }) {
      const content = guideDocument ? { $set: { guide, guideDocument } } : { $set: { guide }, $unset: { guideDocument: "" as const } };
      const filter = lessonEdit ? {
        ...key,
        ...(lessonEdit.previous.guide
          ? { guide: lessonEdit.previous.guide }
          : { $or: [{ guide: "" }, { guide: { $exists: false } }] }),
        guideDocument: lessonEdit.previous.guideDocument ?? { $exists: false },
      } : key;
      const edited = lessonEdit ? { $addToSet: { guideEditedLessons: lessonEdit.id } } : {};
      try {
        await update(filter, { $setOnInsert: identity, ...content, ...edited }, { upsert: true });
        return true;
      } catch (error) {
        if (lessonEdit && isDuplicateKey(error)) return false;
        throw error;
      }
    },
    async saveDesktop(items: DesktopEntry[], revision: number) {
      const next = { items, revision: revision + 1 };
      const filter = { ...key, "desktop.revision": revision === 0 ? { $exists: false } : revision };
      const changes = { $setOnInsert: identity, $set: { desktop: next } };
      try {
        const result = await update(filter, changes, { upsert: revision === 0 });
        if (result.matchedCount || result.upsertedCount) return next.revision;
      } catch (error) {
        if (!isDuplicateKey(error) || revision !== 0) throw error;
        // Another progress action may have created the document while this write was starting.
        const result = await update(filter, changes);
        if (result.matchedCount) return next.revision;
      }
      const saved = (await collection.findOne(key, { projection: { desktop: 1 } }))?.desktop;
      if (saved?.revision === next.revision && isDeepStrictEqual(saved.items, items)) return saved.revision;
      return null;
    },
  };
}
