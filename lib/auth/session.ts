import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ObjectId, WithId } from "mongodb";
import { authStore, type Aluno } from "./store";
import { digest, isToken, randomToken } from "./tokens";

const secure = process.env.NODE_ENV === "production";
const sessionCookie = secure ? "__Host-trilha-session" : "trilha-session";
const sessionDuration = 7 * 24 * 60 * 60 * 1000;

export async function createSession(alunoId: ObjectId, passwordVersion: number) {
  const cookieStore = await cookies();
  const previous = cookieStore.get(sessionCookie)?.value;
  const { sessions } = await authStore();
  if (isToken(previous)) await sessions.deleteOne({ _id: digest(previous) });

  const token = randomToken();
  const expiresAt = new Date(Date.now() + sessionDuration);
  await sessions.insertOne({ _id: digest(token), alunoId, passwordVersion, expiresAt });
  cookieStore.set(sessionCookie, token, { httpOnly: true, secure, sameSite: "lax", path: "/", expires: expiresAt });
}

export async function currentAluno() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!isToken(token)) return null;

  const { alunos, sessions } = await authStore();
  const session = await sessions.findOne({ _id: digest(token), expiresAt: { $gt: new Date() } });
  if (!session) return null;

  return alunos.findOne<Pick<WithId<Aluno>, "_id" | "nome">>(
    { _id: session.alunoId, passwordVersion: session.passwordVersion },
    { projection: { nome: 1 } },
  );
}

export async function requireAluno() {
  const aluno = await currentAluno();
  if (!aluno) redirect("/entrar");
  return aluno;
}

export async function endSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;
  if (isToken(token)) {
    const { sessions } = await authStore();
    await sessions.deleteOne({ _id: digest(token) });
  }
  cookieStore.set(sessionCookie, "", { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 0 });
}
