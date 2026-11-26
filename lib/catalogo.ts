import "server-only";
import { buscarDisciplina, disciplinas, informaticaBasica, isProgramacaoBasica, type Disciplina } from "@/data/disciplinas";
import { informaticaBasicaVersion, type Lesson } from "@/data/lessons";
import { programacaoBasicaAulas, programacaoBasicaMeses, programacaoBasicaVersion } from "@/data/programacao-basica";
import { revisarAulaInformatica, revisarAulaProgramacao } from "./catalogo-revisoes";
import { getDb, isDuplicateKey } from "@/lib/mongodb";
import { normalizeVideoUrls } from "@/lib/lesson-video";

type StoredDisciplina = Omit<Disciplina, "aulas"> & {
  aulas: readonly (Omit<Lesson, "videoUrl"> & { videoUrl?: string | string[] })[];
};

type CatalogEntry = {
  _id: string;
  revision: number;
  disciplina?: StoredDisciplina;
  nextLessonId: number;
};

async function collection() {
  return (await getDb()).collection<CatalogEntry>("catalogo_trilha");
}

function normalizeDiscipline(discipline: StoredDisciplina | undefined): Disciplina | undefined {
  if (!discipline) return;
  const aulas = discipline.aulas.map(({ videoUrl, ...lesson }) => (
    videoUrl === undefined ? lesson : { ...lesson, videoUrl: normalizeVideoUrls(videoUrl) }
  ));
  if (discipline.id === informaticaBasica.id && (discipline.versaoApostilaInformatica ?? 0) < informaticaBasicaVersion) {
    return { ...discipline, versaoApostilaInformatica: informaticaBasicaVersion, aulas: aulas.map((lesson) => {
      const original = informaticaBasica.aulas.find(({ id }) => id === lesson.id);
      return original && (lessonTitleKey(original.title) === lessonTitleKey(lesson.title) || original.objective === lesson.objective)
        ? revisarAulaInformatica(lesson, original) : lesson;
    }) };
  }
  if (discipline.apostilaProgramacaoImportada && (discipline.versaoApostilaProgramacao ?? 1) < programacaoBasicaVersion) {
    const version = discipline.versaoApostilaProgramacao ?? 1;
    return { ...discipline, aulas: aulas.map((lesson) => revisarAulaProgramacao(lesson, version)), versaoApostilaProgramacao: programacaoBasicaVersion };
  }
  return { ...discipline, aulas };
}

export async function listarDisciplinas() {
  const entries = await (await collection()).find().sort({ _id: 1 }).toArray();
  const catalog = new Map(disciplinas.map((disciplina) => [disciplina.id, disciplina]));
  for (const entry of entries) {
    const disciplina = normalizeDiscipline(entry.disciplina);
    if (disciplina) catalog.set(entry._id, disciplina);
    else catalog.delete(entry._id);
  }
  return [...catalog.values()];
}

export async function carregarDisciplina(id: unknown) {
  if (typeof id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || id.length > 80) return;
  const entry = await (await collection()).findOne({ _id: id });
  return entry ? normalizeDiscipline(entry.disciplina) : buscarDisciplina(id);
}

type CatalogChange =
  | { kind: "create"; nome: string }
  | { kind: "rename"; nome: string }
  | { kind: "delete" }
  | { kind: "import-programming-lessons" }
  | { kind: "save-lesson"; lesson: Omit<Lesson, "id">; lessonId?: number }
  | { kind: "delete-lesson"; lessonId: number };

export async function alterarCatalogo(id: string, change: CatalogChange) {
  const entries = await collection();
  const current = await entries.findOne({ _id: id });
  let disciplina = current ? normalizeDiscipline(current.disciplina) : buscarDisciplina(id);
  let nextLessonId = current?.nextLessonId ?? (Math.max(0, ...(disciplina?.aulas.map(({ id }) => id) ?? [])) + 1);
  if (change.kind === "create") {
    if (current || disciplina) return "Este identificador já foi usado. Escolha outro.";
    disciplina = { id, nome: change.nome, aulas: [] };
  } else {
    if (!disciplina) return "Disciplina indisponível.";
    switch (change.kind) {
      case "rename":
        disciplina = { ...disciplina, nome: change.nome };
        break;
      case "delete":
        disciplina = undefined;
        break;
      case "import-programming-lessons": {
        if (!current || !isProgramacaoBasica(disciplina)) return "Selecione a disciplina Programação Básica já cadastrada.";
        if (disciplina.apostilaProgramacaoImportada) return;
        const titles = new Set(disciplina.aulas.map(({ title }) => lessonTitleKey(title)));
        const additions = programacaoBasicaAulas.filter(({ title }) => !titles.has(lessonTitleKey(title)));
        if (disciplina.aulas.length + additions.length > 200) return "A importação ultrapassa o limite de 200 aulas.";
        disciplina = {
          ...disciplina,
          aulas: [...disciplina.aulas, ...additions.map((lesson) => ({ ...lesson, id: nextLessonId++ }))],
          meses: { ...programacaoBasicaMeses, ...disciplina.meses },
          apostilaProgramacaoImportada: true,
          versaoApostilaProgramacao: programacaoBasicaVersion,
        };
        break;
      }
      case "save-lesson": {
        if (change.lessonId !== undefined && !disciplina.aulas.some((lesson) => lesson.id === change.lessonId)) return "Aula indisponível.";
        if (change.lessonId === undefined && disciplina.aulas.length >= 200) return "Esta disciplina atingiu o limite de 200 aulas.";
        const lesson = { ...change.lesson, id: change.lessonId ?? nextLessonId++ };
        disciplina = { ...disciplina, aulas: change.lessonId === undefined
          ? [...disciplina.aulas, lesson]
          : disciplina.aulas.map((item) => item.id === lesson.id ? lesson : item) };
        break;
      }
      case "delete-lesson":
        if (!disciplina.aulas.some((lesson) => lesson.id === change.lessonId)) return "Aula indisponível.";
        disciplina = { ...disciplina, aulas: disciplina.aulas.filter((lesson) => lesson.id !== change.lessonId) };
    }
  }
  const revision = (current?.revision ?? 0) + 1;
  const next: CatalogEntry = { _id: id, revision, nextLessonId, ...(disciplina && { disciplina }) };
  try {
    if (!current) await entries.insertOne(next);
    else {
      const result = await entries.replaceOne({ _id: id, revision: current.revision }, next);
      if (!result.matchedCount) return "O catálogo foi alterado. Recarregue a página e tente novamente.";
    }
  } catch (error) {
    if (isDuplicateKey(error)) return "O catálogo foi alterado. Recarregue a página e tente novamente.";
    throw error;
  }
}

function lessonTitleKey(title: string) {
  return title.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
