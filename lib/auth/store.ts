import "server-only";
import type { ClientSession, Db, Filter, ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { StudentProfile } from "./profile";
import type { Role } from "./roles";

type EmailToken = { hash: string; expiresAt: Date };

export type Aluno = {
  nome: string;
  email: string;
  passwordHash: string;
  passwordVersion: number;
  createdAt: Date;
  perfil?: StudentProfile;
  activityRevision?: number;
  role?: Role;
  status?: "pendente" | "ativo";
  emailVerifiedAt?: Date;
  emailConfirmation?: EmailToken;
  passwordReset?: EmailToken;
  emailChange?: EmailToken & { email: string };
  accountDeletion?: EmailToken;
};

type Session = { _id: string; alunoId: ObjectId; passwordVersion: number; expiresAt: Date };
type AttemptWindow = { _id: string; attempts: number; expiresAt: Date };

export const activeStudent: Filter<Aluno> = { role: { $nin: ["administrador", "professor"] }, status: { $ne: "pendente" } };

let ready: Promise<Db> | undefined;

export async function authStore() {
  ready ??= getDb().then(async (db) => {
    await Promise.all([
      db.collection("alunos").createIndex({ email: 1 }, { unique: true }),
      db.collection("sessoes_alunos").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db.collection("sessoes_alunos").createIndex({ alunoId: 1 }),
      db.collection("limites_autenticacao").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db.collection("alunos").createIndex({ "passwordReset.hash": 1 }, { sparse: true }),
      db.collection("alunos").createIndex({ "emailConfirmation.hash": 1 }, { sparse: true }),
      db.collection("alunos").createIndex({ "emailChange.hash": 1 }, { sparse: true }),
      db.collection("alunos").createIndex({ "accountDeletion.hash": 1 }, { sparse: true }),
    ]);
    return db;
  }).catch((error) => {
    ready = undefined;
    throw error;
  });

  const db = await ready;
  return {
    alunos: db.collection<Aluno>("alunos"),
    sessions: db.collection<Session>("sessoes_alunos"),
    attempts: db.collection<AttemptWindow>("limites_autenticacao"),
  };
}

export async function withAccountWrite<T>(alunoId: ObjectId, passwordVersion: number, write: (session: ClientSession) => Promise<T>) {
  const { alunos } = await authStore();
  const db = await getDb();
  return db.client.withSession((session) => session.withTransaction(async () => {
    // A write to the account serializes session and progress changes with account deletion.
    const account = await alunos.updateOne({ _id: alunoId, passwordVersion, status: { $ne: "pendente" } },
      { $inc: { activityRevision: 1 } }, { session });
    return account.matchedCount ? write(session) : null;
  }));
}
