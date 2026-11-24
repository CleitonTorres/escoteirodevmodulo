"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { isDuplicateKey } from "@/lib/mongodb";
import { hashPassword, verifyPassword } from "@/lib/auth/passwords";
import { allowAttempt, allowClientAttempt } from "@/lib/auth/rate-limit";
import { createSession, endSession } from "@/lib/auth/session";
import { authStore } from "@/lib/auth/store";
import { digest, isToken, randomToken } from "@/lib/auth/tokens";
import { resetMailConfig, sendResetMail } from "@/lib/auth/mail";

type FormState = { error?: string; message?: string };
const unavailable = { error: "Serviço indisponível. Tente novamente em instantes." };
const tooMany = { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." };
const invalidLogin = { error: "E-mail ou senha inválidos." };
const invalidReset = { error: "Link inválido ou expirado. Solicite um novo link de recuperação." };
const resetRequested = { message: "Se houver uma conta com esse e-mail, você receberá um link para redefinir sua senha." };

function readEmail(formData: FormData) {
  const value = formData.get("email");
  if (typeof value !== "string") return "";
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@<>(),;:"\\\[\]]+@[^\s@<>(),;:"\\\[\]]+\.[^\s@<>(),;:"\\\[\]]+$/.test(email) ? email : "";
}

function readNewPassword(formData: FormData) {
  const value = formData.get("password");
  if (typeof value !== "string" || value.length > 256) return null;
  const length = Array.from(value).length;
  return length >= 15 && length <= 128 && value === formData.get("confirmation") ? value : null;
}

export async function cadastrar(_: FormState, formData: FormData): Promise<FormState> {
  const email = readEmail(formData);
  const name = formData.get("nome");
  const nome = typeof name === "string" ? name.trim() : "";
  const password = readNewPassword(formData);
  if (!nome || nome.length > 100 || !email) return { error: "Informe seu nome e um e-mail válido." };
  if (!password) return { error: "Use de 15 a 128 caracteres na senha e confirme a mesma senha." };

  try {
    if (!await allowClientAttempt("cadastro", 12, 15) || !await allowAttempt("cadastro", email, 5, 15)) return tooMany;
    const { alunos } = await authStore();
    const passwordHash = await hashPassword(password);
    await alunos.insertOne({ nome, email, passwordHash, passwordVersion: 1, createdAt: new Date() });
  } catch (error) {
    if (isDuplicateKey(error)) return { error: "Já existe uma conta com esse e-mail. Entre ou recupere sua senha." };
    console.error("Falha no cadastro de aluno.");
    return unavailable;
  }
  redirect("/entrar?cadastro=ok");
}

export async function entrar(_: FormState, formData: FormData): Promise<FormState> {
  const email = readEmail(formData);
  const password = formData.get("password");
  if (!email || typeof password !== "string" || !password || password.length > 256) return invalidLogin;

  try {
    if (!await allowClientAttempt("login", 40, 15) || !await allowAttempt("login", email, 10, 15)) return tooMany;
    const { alunos } = await authStore();
    const aluno = await alunos.findOne({ email }, { projection: { passwordHash: 1, passwordVersion: 1 } });
    const valid = await verifyPassword(password, aluno?.passwordHash);
    if (!aluno || !valid) return invalidLogin;
    await createSession(aluno._id, aluno.passwordVersion);
  } catch {
    console.error("Falha no login de aluno.");
    return unavailable;
  }
  redirect("/");
}

export async function sair() {
  await endSession();
  redirect("/entrar");
}

export async function recuperarSenha(_: FormState, formData: FormData): Promise<FormState> {
  const email = readEmail(formData);
  if (!email) return { error: "Informe um e-mail válido." };
  const config = resetMailConfig();
  if (!config) return { error: "A recuperação de senha está indisponível no momento." };

  try {
    if (!await allowClientAttempt("recuperacao", 25, 15) || !await allowAttempt("recuperacao", email, 3, 15)) return resetRequested;
  } catch {
    console.error("Falha ao solicitar recuperação de senha.");
    return unavailable;
  }

  after(async () => {
    try {
      const { alunos } = await authStore();
      const token = randomToken();
      const passwordReset = { hash: digest(token), expiresAt: new Date(Date.now() + 30 * 60_000) };
      const result = await alunos.updateOne({ email }, { $set: { passwordReset } });
      if (result.matchedCount) await sendResetMail(config, email, token);
    } catch {
      console.error("Falha ao enviar o e-mail de recuperação de senha.");
    }
  });
  return resetRequested;
}

export async function redefinirSenha(_: FormState, formData: FormData): Promise<FormState> {
  const token = formData.get("token");
  const password = readNewPassword(formData);
  if (!isToken(token)) return invalidReset;
  if (!password) return { error: "Use de 15 a 128 caracteres na senha e confirme a mesma senha." };

  try {
    if (!await allowClientAttempt("redefinicao", 30, 15)) return tooMany;
    const { alunos } = await authStore();
    const filter = () => ({ "passwordReset.hash": digest(token), "passwordReset.expiresAt": { $gt: new Date() } });
    if (!await alunos.findOne(filter(), { projection: { _id: 1 } })) return invalidReset;
    const passwordHash = await hashPassword(password);
    const result = await alunos.updateOne(filter(), {
      $set: { passwordHash },
      $inc: { passwordVersion: 1 },
      $unset: { passwordReset: "" },
    });
    if (!result.modifiedCount) return invalidReset;
  } catch {
    console.error("Falha ao redefinir a senha de aluno.");
    return unavailable;
  }
  redirect("/entrar?senha=alterada");
}
