"use server";

import { revalidatePath } from "next/cache";
import { authMailConfig, accountLinkMinutes, logMailError, sendAccountDeletionMail, sendEmailChangeMail, sendEmailChangeNotice } from "@/lib/auth/mail";
import { verifyPassword } from "@/lib/auth/passwords";
import { normalizeEmail, readField, readStudentProfile, type StudentProfile } from "@/lib/auth/profile";
import { allowAttempt, allowClientAttempt } from "@/lib/auth/rate-limit";
import { currentAccount } from "@/lib/auth/session";
import { activeStudent, authStore } from "@/lib/auth/store";
import { digest, isToken, randomToken } from "@/lib/auth/tokens";
import { getDb, isDuplicateKey } from "@/lib/mongodb";

type FormState = { error?: string; message?: string; nome?: string; perfil?: StudentProfile; email?: string };

const loginRequired = { error: "Entre novamente na sua conta de aluno para continuar." };
const unavailable = { error: "Serviço indisponível. Tente novamente em instantes." };
const tooMany = { error: "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente." };
const invalidLink = { error: "Link inválido, expirado ou já usado. Solicite um novo link em Minha conta." };
const accountMailUnavailable = { error: "O envio de e-mail está indisponível. Tente novamente em instantes." };

function createLinkToken() {
  const token = randomToken();
  return { token, record: { hash: digest(token), expiresAt: new Date(Date.now() + accountLinkMinutes * 60_000) } };
}

async function authenticatedStudent() {
  const account = await currentAccount();
  if (account?.role !== "aluno") return null;
  return { ...activeStudent, _id: account._id, passwordVersion: account.passwordVersion };
}

async function confirmCurrentPassword(formData: FormData, scope: string) {
  const filter = await authenticatedStudent();
  if (!filter) return loginRequired;
  const password = readField(formData, "password", 256);
  if (!password) return { error: "Informe sua senha atual." };
  if (!await allowClientAttempt(scope, 25, 15) || !await allowAttempt(scope, filter._id.toHexString(), 5, 15)) return tooMany;
  const { alunos } = await authStore();
  const current = await alunos.findOne(filter, { projection: { email: 1, passwordHash: 1 } });
  if (!current || !await verifyPassword(password, current.passwordHash)) return { error: "Senha atual incorreta." };
  return { filter: { ...filter, email: current.email }, alunos };
}

export async function salvarPerfil(_: FormState, formData: FormData): Promise<FormState> {
  const nome = readField(formData, "nome", 100).trim();
  const { perfil, error } = readStudentProfile(formData);
  const fields = { nome, perfil };
  if (!nome) return { ...fields, error: "Informe seu nome." };
  if (error) return { ...fields, error };
  try {
    const filter = await authenticatedStudent();
    if (!filter) return { ...fields, ...loginRequired };
    const { alunos } = await authStore();
    const saved = await alunos.updateOne(filter, { $set: { nome, perfil } });
    if (!saved.matchedCount) return { ...fields, ...loginRequired };
    revalidatePath("/");
    return { ...fields, message: "Dados atualizados." };
  } catch {
    console.error("Falha ao atualizar o perfil do aluno.");
    return { ...fields, ...unavailable };
  }
}

export async function solicitarNovoEmail(_: FormState, formData: FormData): Promise<FormState> {
  const fields = { email: readField(formData, "email", 254) };
  const email = normalizeEmail(fields.email);
  if (!email) return { ...fields, error: "Informe um e-mail válido." };
  const config = authMailConfig();
  if (!config) return { ...fields, ...accountMailUnavailable };

  try {
    const credentials = await confirmCurrentPassword(formData, "trocar-email");
    if ("error" in credentials) return { ...fields, error: credentials.error };
    const { filter, alunos } = credentials;
    if (email === filter.email) return { ...fields, error: "Informe um endereço diferente do e-mail atual." };
    const { token, record } = createLinkToken();
    const saved = await alunos.updateOne(filter, { $set: { emailChange: { ...record, email } } });
    if (!saved.matchedCount) return { ...fields, ...loginRequired };
    try {
      await sendEmailChangeNotice(config, filter.email);
      await sendEmailChangeMail(config, email, token);
    } catch (error) {
      logMailError("Falha ao enviar a confirmação de troca de e-mail.", error);
      await alunos.updateOne({ _id: filter._id, "emailChange.hash": record.hash }, { $unset: { emailChange: "" } });
      return { ...fields, ...accountMailUnavailable };
    }
    return { message: "Enviamos um link para o novo endereço. O e-mail atual continua em uso até você confirmar a troca." };
  } catch {
    console.error("Falha ao solicitar troca de e-mail.");
    return { ...fields, ...unavailable };
  }
}

export async function solicitarExclusao(_: FormState, formData: FormData): Promise<FormState> {
  const config = authMailConfig();
  if (!config) return accountMailUnavailable;
  try {
    const credentials = await confirmCurrentPassword(formData, "excluir-conta");
    if ("error" in credentials) return { error: credentials.error };
    const { filter, alunos } = credentials;
    const { token, record } = createLinkToken();
    const saved = await alunos.updateOne(filter, { $set: { accountDeletion: record } });
    if (!saved.matchedCount) return loginRequired;
    try {
      await sendAccountDeletionMail(config, filter.email, token);
    } catch (error) {
      logMailError("Falha ao enviar a confirmação de exclusão de conta.", error);
      await alunos.updateOne({ _id: filter._id, "accountDeletion.hash": record.hash }, { $unset: { accountDeletion: "" } });
      return accountMailUnavailable;
    }
    return { message: "Enviamos o link ao seu e-mail cadastrado. Para excluir a conta, abra o link e confirme na página." };
  } catch {
    console.error("Falha ao solicitar a exclusão da conta.");
    return unavailable;
  }
}

export async function confirmarNovoEmail(_: FormState, formData: FormData): Promise<FormState> {
  const token = formData.get("token");
  if (!isToken(token)) return invalidLink;
  try {
    if (!await allowClientAttempt("confirmar-novo-email", 40, 15)) return tooMany;
    const { alunos } = await authStore();
    const filter = () => ({
      ...activeStudent, "emailChange.hash": digest(token), "emailChange.expiresAt": { $gt: new Date() },
    });
    const account = await alunos.findOne(filter(), { projection: { emailChange: 1 } });
    if (!account?.emailChange) return invalidLink;
    const saved = await alunos.updateOne({ ...filter(), _id: account._id }, {
      $set: { email: account.emailChange.email, emailVerifiedAt: new Date() },
      $inc: { passwordVersion: 1 },
      $unset: { emailChange: "", accountDeletion: "", passwordReset: "" },
    });
    return saved.modifiedCount ? { message: "E-mail atualizado. Entre novamente com seu novo endereço." } : invalidLink;
  } catch (error) {
    if (isDuplicateKey(error)) return { error: "Este endereço está indisponível. Solicite a troca para outro e-mail em Minha conta." };
    console.error("Falha ao confirmar o novo e-mail.");
    return unavailable;
  }
}

export async function confirmarExclusao(_: FormState, formData: FormData): Promise<FormState> {
  const token = formData.get("token");
  if (!isToken(token)) return invalidLink;
  try {
    if (!await allowClientAttempt("confirmar-exclusao", 40, 15)) return tooMany;
    const { alunos, sessions } = await authStore();
    const db = await getDb();
    const removed = await db.client.withSession((session) => session.withTransaction(async () => {
      const account = await alunos.findOneAndDelete({
        ...activeStudent, "accountDeletion.hash": digest(token), "accountDeletion.expiresAt": { $gt: new Date() },
      }, { projection: { _id: 1 }, session });
      if (!account) return false;
      const filter = { alunoId: account._id };
      await sessions.deleteMany(filter, { session });
      await db.collection("progresso_alunos").deleteMany(filter, { session });
      await db.collection("progresso_visualizacao").deleteMany(filter, { session });
      return true;
    }));
    return removed ? { message: "Sua conta foi excluída." } : invalidLink;
  } catch {
    console.error("Falha ao confirmar a exclusão da conta.");
    return unavailable;
  }
}
