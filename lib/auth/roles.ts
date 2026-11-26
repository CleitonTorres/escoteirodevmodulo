export type Role = "administrador" | "professor" | "aluno";
export type Permission = "relatorios" | "salvar-aula" | "excluir-aula" | "disciplinas" | "promover-contas";

export function accountRole(value: unknown): Role {
  return value === "administrador" || value === "professor" ? value : "aluno";
}

export function canManage(role: Role, permission: Permission) {
  return role === "administrador" || (
    role === "professor" && (permission === "relatorios" || permission === "salvar-aula")
  );
}
