import "server-only";
import type { Db, ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { Role } from "./roles";

export type Aluno = {
  nome: string;
  email: string;
  passwordHash: string;
  passwordVersion: number;
  createdAt: Date;
  role?: Role;
  status?: "pendente" | "ativo";
  emailVerifiedAt?: Date;
  emailConfirmation?: { hash: string; expiresAt: Date };
  passwordReset?: { hash: string; expiresAt: Date };
};

type Session = { _id: string; alunoId: ObjectId; passwordVersion: number; expiresAt: Date };
type AttemptWindow = { _id: string; attempts: number; expiresAt: Date };

let ready: Promise<Db> | undefined;

export async function authStore() {
  ready ??= getDb().then(async (db) => {
    await Promise.all([
      db.collection("alunos").createIndex({ email: 1 }, { unique: true }),
      db.collection("sessoes_alunos").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db.collection("limites_autenticacao").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db.collection("alunos").createIndex({ "passwordReset.hash": 1 }, { sparse: true }),
      db.collection("alunos").createIndex({ "emailConfirmation.hash": 1 }, { sparse: true }),
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
