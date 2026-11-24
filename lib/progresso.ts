import "server-only";
import type { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
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
  };
}
