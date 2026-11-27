"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { currentAccount } from "@/lib/auth/session";
import { canManage, type Permission } from "@/lib/auth/roles";
import { authStore } from "@/lib/auth/store";
import { alterarCatalogo } from "@/lib/catalogo";
import { field, readLesson } from "@/lib/catalogo-form";

type Result = { error?: string; message?: string };
const forbidden = { error: "Seu perfil não tem acesso a esta operação." };

async function manage(permission: Permission, operation: () => Promise<string | undefined>, success: string): Promise<Result> {
  try {
    const account = await currentAccount();
    if (!account || !canManage(account.role, permission)) return forbidden;
    const error = await operation();
    if (error) return { error };
    revalidatePath("/gestao");
    revalidatePath("/");
    return { message: success };
  } catch {
    console.error("Falha ao gravar alteração da gestão.");
    return { error: "Não foi possível salvar. Tente novamente." };
  }
}

export async function promoverConta(_: Result, form: FormData) {
  return manage("promover-contas", async () => {
    const id = field(form, "accountId");
    const role = field(form, "role");
    if (!/^[a-f\d]{24}$/i.test(id) || (role !== "professor" && role !== "administrador") || form.get("confirm") !== "on") {
      return "Selecione um perfil e confirme a promoção.";
    }
    const { alunos } = await authStore();
    const roles = role === "administrador" ? ["aluno", "professor"] as const : ["aluno"] as const;
    const updated = await alunos.updateOne(
      { _id: new ObjectId(id), $or: [{ role: { $in: roles } }, { role: { $exists: false } }] },
      { $set: { role }, $inc: { passwordVersion: 1 }, $unset: { emailChange: "", accountDeletion: "" } },
    );
    if (!updated.modifiedCount) return "A conta já está nesse perfil ou não pode ser promovida.";
  }, "Perfil atualizado. A conta precisa entrar novamente para usar o novo acesso.");
}

export async function salvarDisciplina(_: Result, form: FormData) {
  return manage("disciplinas", async () => {
    const id = field(form, "disciplinaId");
    const nome = field(form, "nome");
    const mode = field(form, "mode");
    if ((mode !== "create" && mode !== "rename") || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || id.length > 80 ||
      !nome || nome.length > 120) return "Informe um nome e um identificador válido com letras minúsculas, números e hífens.";
    return alterarCatalogo(id, { kind: mode, nome });
  }, "Disciplina salva.");
}

export async function salvarAula(_: Result, form: FormData) {
  return manage("salvar-aula", async () => {
    const id = field(form, "disciplinaId");
    const existing = field(form, "lessonId");
    const lessonId = existing ? positiveInteger(existing) : undefined;
    if (!id || (existing && !lessonId)) return "Selecione uma disciplina e uma aula válida.";
    const lesson = readLesson(form);
    if (typeof lesson === "string") return lesson;
    return alterarCatalogo(id, { kind: "save-lesson", lesson, lessonId });
  }, "Aula salva.");
}

export async function importarAulasProgramacao(_: Result, form: FormData) {
  return manage("disciplinas", async () => {
    const id = field(form, "disciplinaId");
    if (!id) return "Selecione a disciplina Programação Básica.";
    return alterarCatalogo(id, { kind: "import-programming-lessons" });
  }, "Aulas da apostila importadas.");
}

export async function excluirDisciplina(_: Result, form: FormData) {
  return manage("disciplinas", async () => {
    const id = field(form, "disciplinaId");
    if (!id || form.get("confirm") !== "on") return "Confirme a exclusão da disciplina.";
    return alterarCatalogo(id, { kind: "delete" });
  }, "Disciplina removida do catálogo.");
}

export async function excluirAula(_: Result, form: FormData) {
  return manage("excluir-aula", async () => {
    const id = field(form, "disciplinaId");
    const lessonId = positiveInteger(field(form, "lessonId"));
    if (!id || !lessonId || form.get("confirm") !== "on") return "Confirme a exclusão da aula.";
    return alterarCatalogo(id, { kind: "delete-lesson", lessonId });
  }, "Aula removida do catálogo.");
}

function positiveInteger(value: string) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : undefined;
}
