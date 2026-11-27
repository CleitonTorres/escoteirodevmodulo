export const estados = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export type StudentProfile = { dataNascimento?: string; bairro?: string; municipio?: string; uf?: string };

export function readField(formData: FormData, name: string, maxLength: number) {
  const value = formData.get(name);
  return typeof value === "string" && value.length <= maxLength ? value : "";
}

export function normalizeEmail(value: string) {
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@<>(),;:"\\\[\]]+@[^\s@<>(),;:"\\\[\]]+\.[^\s@<>(),;:"\\\[\]]+$/.test(email) ? email : "";
}

export function readStudentProfile(formData: FormData): { perfil: StudentProfile; error?: string } {
  const limits = { dataNascimento: 10, bairro: 100, municipio: 100, uf: 2 };
  const perfil: StudentProfile = {};
  let invalidField = false;
  for (const key of Object.keys(limits) as (keyof StudentProfile)[]) {
    const value = formData.get(key);
    if (value === null) continue;
    if (typeof value !== "string" || value.length > limits[key] || /[\u0000-\u001f\u007f]/u.test(value)) {
      invalidField = true;
      continue;
    }
    const trimmed = value.trim();
    if (trimmed) perfil[key] = trimmed;
  }
  if (invalidField) return { perfil, error: "Confira os dados do perfil e tente novamente." };
  const { dataNascimento, uf } = perfil;
  if (dataNascimento) {
    const date = new Date(`${dataNascimento}T00:00:00.000Z`);
    const hoje = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(new Date());
    if (!/^(?!0000)\d{4}-\d{2}-\d{2}$/.test(dataNascimento) || !Number.isFinite(date.getTime()) ||
        date.toISOString().slice(0, 10) !== dataNascimento || dataNascimento > hoje) {
      return { perfil, error: "Informe uma data de nascimento válida." };
    }
  }
  if (uf && !estados.some((estado) => estado === uf)) return { perfil, error: "Selecione uma UF válida." };
  return { perfil };
}
