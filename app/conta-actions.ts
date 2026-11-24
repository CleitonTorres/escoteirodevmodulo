"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { isDuplicateKey } from "@/lib/mongodb";
import { isValidNewPassword, passwordHint } from "@/lib/auth/password-policy";
import { hashPassword, verifyPassword } from "@/lib/auth/passwords";
import { allowAttempt, allowClientAttempt } from "@/lib/auth/rate-limit";
import { createSession, endSession } from "@/lib/auth/session";
import { authStore } from "@/lib/auth/store";
import { digest, isToken, randomToken } from "@/lib/auth/tokens";
import { authMailConfig, confirmationHours, logMailError, sendConfirmationMail, sendResetMail } from "@/lib/auth/mail";

type FormState = { error?: string; message?: string; nome?: string; email?: string };
const unavailable = { error: "Serviço indisponível. Tente novamente em instantes." };
const tooMany = { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." };
const invalidLogin = { error: "E-mail ou senha inválidos." };
const invalidReset = { error: "Link inválido ou expirado. Solicite um novo link de recuperação." };
const resetRequested = { message: "Se houver uma conta com esse e-mail, você receberá um link para redefinir sua senha." };
const invalidConfirmation = { error: "Link inválido, expirado ou já usado. Se sua conta ainda estiver pendente, solicite outro link." };
const confirmationRequested = { message: "Se houver um cadastro pendente para esse e-mail, você receberá um novo link de confirmação." };
const confirmationUnavailable = { error: "O envio de confirmação por e-mail está indisponível no momento." };

function createEmailConfirmation() {
  const token = randomToken();
  return {
    token,
    record: { hash: digest(token), expiresAt: new Date(Date.now() + confirmationHours * 60 * 60_000) },
  };
}

function readField(formData: FormData, name: string, maxLength: number) {
  const value = formData.get(name);
  return typeof value === "string" && value.length <= maxLength ? value : "";
}

function normalizeEmail(value: string) {
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@<>(),;:"\\\[\]]+@[^\s@<>(),;:"\\\[\]]+\.[^\s@<>(),;:"\\\[\]]+$/.test(email) ? email : "";
}

function readNewPassword(formData: FormData) {
  const password = formData.get("password");
  if (typeof password !== "string" || !isValidNewPassword(password)) return { error: passwordHint };
  if (password !== formData.get("confirmation")) return { error: "As senhas não coincidem." };
  return { password };
}

export async function cadastrar(_: FormState, formData: FormData): Promise<FormState> {
  const fields = { nome: readField(formData, "nome", 100), email: readField(formData, "email", 254) };
  const email = normalizeEmail(fields.email);
  const nome = fields.nome.trim();
  const { password, error } = readNewPassword(formData);
  if (!nome || !email) return { ...fields, error: "Informe seu nome e um e-mail válido." };
  if (!password) return { ...fields, error };
  const config = authMailConfig();
  if (!config) return { ...fields, ...confirmationUnavailable };

  const { token, record } = createEmailConfirmation();
  try {
    if (!await allowClientAttempt("cadastro", 12, 15) || !await allowAttempt("cadastro", email, 5, 15)) return { ...fields, ...tooMany };
    const { alunos } = await authStore();
    const passwordHash = await hashPassword(password);
    await alunos.insertOne({
      nome, email, passwordHash, passwordVersion: 1, createdAt: new Date(),
      status: "pendente", emailConfirmation: record,
    });
  } catch (error) {
    if (isDuplicateKey(error)) return { ...fields, error: "Já existe um cadastro com esse e-mail. Acesse o login para entrar ou reenviar a confirmação." };
    console.error("Falha no cadastro de aluno.");
    return { ...fields, ...unavailable };
  }

  try {
    await sendConfirmationMail(config, email, token);
  } catch (error) {
    logMailError("Falha ao enviar a confirmação de cadastro.", error);
    return { ...fields, error: "Seu cadastro está pendente. Não foi possível enviar o e-mail. Use Reenviar confirmação para tentar de novo." };
  }
  redirect("/entrar?cadastro=pendente");
}

export async function reenviarConfirmacao(_: FormState, formData: FormData): Promise<FormState> {
  const fields = { email: readField(formData, "email", 254) };
  const email = normalizeEmail(fields.email);
  if (!email) return { ...fields, error: "Informe um e-mail válido." };
  const config = authMailConfig();
  if (!config) return { ...fields, ...confirmationUnavailable };

  const { token, record } = createEmailConfirmation();
  let pending: boolean;
  try {
    if (!await allowClientAttempt("reenviar-confirmacao", 25, 15) ||
        !await allowAttempt("reenviar-confirmacao", email, 3, 15)) return { ...fields, ...tooMany };
    const { alunos } = await authStore();
    const result = await alunos.updateOne({ email, status: "pendente" }, { $set: { emailConfirmation: record } });
    pending = result.matchedCount > 0;
  } catch {
    console.error("Falha ao solicitar reenvio da confirmação.");
    return { ...fields, ...unavailable };
  }

  if (pending) {
    try {
      await sendConfirmationMail(config, email, token);
    } catch (error) {
      logMailError("Falha ao reenviar a confirmação de cadastro.", error);
      return { ...fields, ...confirmationUnavailable };
    }
  }
  return { ...fields, ...confirmationRequested };
}

export async function confirmarEmail(token: string): Promise<FormState> {
  if (!isToken(token)) return invalidConfirmation;

  try {
    if (!await allowClientAttempt("confirmar-email", 40, 15)) return tooMany;
    const { alunos } = await authStore();
    const now = new Date();
    const result = await alunos.updateOne(
      { status: "pendente", "emailConfirmation.hash": digest(token), "emailConfirmation.expiresAt": { $gt: now } },
      { $set: { status: "ativo", emailVerifiedAt: now }, $unset: { emailConfirmation: "" } },
    );
    return result.modifiedCount ? { message: "E-mail confirmado. Sua conta está ativa." } : invalidConfirmation;
  } catch {
    console.error("Falha ao confirmar o e-mail do aluno.");
    return unavailable;
  }
}

export async function entrar(_: FormState, formData: FormData): Promise<FormState> {
  const fields = { email: readField(formData, "email", 254) };
  const email = normalizeEmail(fields.email);
  const password = formData.get("password");
  if (!email || typeof password !== "string" || !password || password.length > 256) return { ...fields, ...invalidLogin };

  try {
    if (!await allowClientAttempt("login", 40, 15) || !await allowAttempt("login", email, 10, 15)) return { ...fields, ...tooMany };
    const { alunos } = await authStore();
    const aluno = await alunos.findOne({ email }, { projection: { passwordHash: 1, passwordVersion: 1, status: 1 } });
    const valid = await verifyPassword(password, aluno?.passwordHash);
    if (!aluno || !valid) return { ...fields, ...invalidLogin };
    if (aluno.status === "pendente") return { ...fields, error: "Confirme seu e-mail para entrar. Você pode solicitar um novo link abaixo." };
    await createSession(aluno._id, aluno.passwordVersion);
  } catch {
    console.error("Falha no login de aluno.");
    return { ...fields, ...unavailable };
  }
  redirect("/");
}

export async function sair() {
  await endSession();
  redirect("/entrar");
}

export async function recuperarSenha(_: FormState, formData: FormData): Promise<FormState> {
  const email = normalizeEmail(readField(formData, "email", 254));
  if (!email) return { error: "Informe um e-mail válido." };
  const config = authMailConfig();
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
      const result = await alunos.updateOne({ email, status: { $ne: "pendente" } }, { $set: { passwordReset } });
      if (result.matchedCount) await sendResetMail(config, email, token);
    } catch (error) {
      logMailError("Falha ao enviar o e-mail de recuperação de senha.", error);
    }
  });
  return resetRequested;
}

export async function redefinirSenha(_: FormState, formData: FormData): Promise<FormState> {
  const token = formData.get("token");
  const { password, error } = readNewPassword(formData);
  if (!isToken(token)) return invalidReset;
  if (!password) return { error };

  try {
    if (!await allowClientAttempt("redefinicao", 30, 15)) return tooMany;
    const { alunos } = await authStore();
    const filter = () => ({ status: { $ne: "pendente" as const }, "passwordReset.hash": digest(token), "passwordReset.expiresAt": { $gt: new Date() } });
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
