import "server-only";
import type { ObjectId } from "mongodb";
import { isDeepStrictEqual } from "node:util";
import type { DesktopEntry } from "@/lib/desktop-files";
import { getDb, isDuplicateKey } from "@/lib/mongodb";
import { emptyProgress, type Progress } from "@/lib/storage";

type ProgressoAluno = Partial<Progress> & { _id: string; alunoId: ObjectId; disciplinaId: string };

export async function progressoAluno(alunoId: ObjectId, disciplinaId: string) {
  const db = await getDb();
  const collection = db.collection<ProgressoAluno>("progresso_alunos");
  const key = { _id: `${alunoId.toHexString()}:${disciplinaId}` };
  const identity = { alunoId, disciplinaId };

  return {
    async load(): Promise<Progress> {
      const result = await collection.findOne(key);
      return {
        completed: result?.completed ?? emptyProgress.completed,
        typingBest: result?.typingBest ?? emptyProgress.typingBest,
        guide: result?.guide ?? emptyProgress.guide,
        desktop: result?.desktop,
      };
    },
    async complete(lessonId: number) {
      await collection.updateOne(key, { $setOnInsert: identity, $addToSet: { completed: lessonId } }, { upsert: true });
    },
    async recordTyping(level: number) {
      await collection.updateOne(key, { $setOnInsert: identity, $max: { typingBest: level } }, { upsert: true });
    },
    async saveGuide(guide: string) {
      await collection.updateOne(key, { $setOnInsert: identity, $set: { guide } }, { upsert: true });
    },
    async saveDesktop(items: DesktopEntry[], revision: number) {
      const next = { items, revision: revision + 1 };
      const filter = { ...key, "desktop.revision": revision === 0 ? { $exists: false } : revision };
      const update = { $setOnInsert: identity, $set: { desktop: next } };
      try {
        const result = await collection.updateOne(filter, update, { upsert: revision === 0 });
        if (result.matchedCount || result.upsertedCount) return next.revision;
      } catch (error) {
        if (!isDuplicateKey(error) || revision !== 0) throw error;
        // Another progress action may have created the document while this write was starting.
        const result = await collection.updateOne(filter, update);
        if (result.matchedCount) return next.revision;
      }
      const saved = (await collection.findOne(key, { projection: { desktop: 1 } }))?.desktop;
      if (saved?.revision === next.revision && isDeepStrictEqual(saved.items, items)) return saved.revision;
      return null;
    },
  };
}
