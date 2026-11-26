import type { Lesson } from "@/data/lessons";
import { programacaoBasicaAulas } from "@/data/programacao-basica";
import type { PracticeTask } from "./practice";

const merge = (current: string[], additions: string[]) => [...new Set([...current, ...additions])];
const same = (left: readonly string[] | undefined, right: readonly string[] | undefined) =>
  left?.length === right?.length && (left?.every((item, index) => item === right?.[index]) ?? true);

export function revisarAulaInformatica(lesson: Lesson, original: Lesson) {
  const ids = new Set(lesson.practice.map(({ id }) => id));
  const additions = original.practice.filter(({ id }) => id.startsWith("revisao-") && !ids.has(id));
  return {
    ...lesson,
    theory: merge(lesson.theory, original.theory.slice(lesson.id === 11 ? -6 : -5)),
    practice: [...lesson.practice, ...additions],
  };
}

const legacyMarkers: Record<number, string[]> = {
  1: ["nomeCurso", "numeroAulas", "projetoConcluido", "typeof", "console.log("],
  8: ["<h1", "<p", "<img", "<a"],
  16: ["getContext(", "fillRect(", ".arc("],
  22: ["gameOver(", "snake[0]", "return"],
  39: ["## Publicação", "https://"],
};
const legacyLinks: Record<number, [tag: string, name: string]> = {
  9: ["<link", "style.css"],
  12: ["<script", "script.js"],
  16: ["<canvas", "kaa.js"],
  26: ["<canvas", "scout-plat.js"],
};
const legacyVariablesExample =
  'const nomeEquipe = "Coqueiral";\nlet pontos = 0;\nconst partidaAtiva = true;\npontos = 1;\nconsole.log(typeof nomeEquipe, typeof pontos, typeof partidaAtiva);';

function reviseCodeTask(task: PracticeTask, original: PracticeTask, index: number) {
  const { check } = task;
  if (check.kind !== "code" || original.check.kind !== "code" || !same(check.file, original.check.file)) return task;
  const isLink = task.id === "vincular-arquivo";
  const expected = isLink ? legacyLinks[index] : legacyMarkers[index] ?? original.check.markers;
  if (!same(check.markers, expected)) return task;
  const generatedHint = `Arquivo: ${check.file.join(" / ")}. Confira também a aba Teoria para ver um exemplo.`;
  const link = legacyLinks[index];
  const generatedAction = isLink && link
    ? `No ${check.file.at(-1)}, adicione ${link[0]} e vincule ${link[1]}.`
    : index === 1 ? "Declare as três variáveis e exiba seus tipos com typeof." : original.action;
  return {
    ...task,
    check: { ...original.check, ...(check.quickStart !== undefined && { quickStart: check.quickStart }) },
    action: task.action === generatedAction ? original.action : task.action,
    hint: task.hint === generatedHint || (isLink && !task.hint) ? original.hint : task.hint,
  };
}

function remainingExercise(steps: string[] | undefined, task: PracticeTask, index: number) {
  if (!steps || task.check.kind !== "code") return steps;
  const [folder, file] = task.check.file;
  const duplicate = new Set(task.hint?.split("\n"));
  duplicate.add(index < 8
    ? `Abra ${file} pelo botão da prática. Escreva código no editor e use Executar JavaScript para conferir a saída.`
    : index === 8 ? `Na área de trabalho, crie ${folder}. Abra a pasta, crie index.html e abra-o no editor de código.`
      : `Abra ${folder} na área de trabalho. Use ou crie ${file} e continue o mesmo projeto.`);
  const legacySteps: Record<number, string[]> = {
    0: ["Transforme os passos do seu algoritmo em três chamadas a console.log(). Execute e confira a ordem no console."],
    1: [
      "Declare nomeCurso com o nome Programação Básica Escoteiro Dev, numeroAulas com 40 e projetoConcluido com false.",
      "Use typeof para identificar os três tipos. Declare a pontuação com let e altere seu valor em seguida.",
    ],
    16: ["Crie também jogoKaa.html e vincule kaa.js a ele."],
    26: ["Crie também scoutPlat.html e vincule scout-plat.js a ele."],
    37: ["Use Baixar portfólio no editor para extrair os arquivos e testar os comandos do Git no computador."],
  };
  return steps.filter((step) => !duplicate.has(step) && !legacySteps[index]?.includes(step));
}

export function revisarAulaProgramacao(lesson: Lesson, version: number): Lesson {
  const index = programacaoBasicaAulas.findIndex(({ title, month }) => title === lesson.title && month === lesson.month);
  if (index < 0) return lesson;
  const original = programacaoBasicaAulas[index];
  const byId = new Map(original.practice.map((task) => [task.id, task]));
  const main = byId.get("escrever-codigo")!;
  const { exercise, ...current } = lesson;
  let migratedMain = version < 2 && !lesson.practice.some(({ id }) => id === main.id);
  let practice = lesson.practice.map((task) => {
    const base = byId.get(task.id);
    if (!base || task.check.kind !== "code") return task;
    const revised = reviseCodeTask(task, base, index);
    if (task.id === main.id && revised !== task && task.hint !== revised.hint) migratedMain = true;
    return revised;
  });
  if (version < 2) {
    const ids = new Set(practice.map(({ id }) => id));
    practice = [...original.practice.filter(({ id, check }) => check.kind !== "quiz" && !ids.has(id)), ...practice];
  }
  if (practice.map(({ id }) => id).join() === "escrever-codigo,vincular-arquivo,verificar-conceito") {
    practice = [practice[1], practice[0], practice[2]];
  }
  const remaining = migratedMain ? remainingExercise(exercise, main, index) : exercise;
  return {
    ...current,
    practice,
    ...(remaining?.length && { exercise: remaining }),
    ...(version < 2 && { theory: merge(lesson.theory, original.theory), guide: original.guide, tool: original.tool ?? lesson.tool }),
    codeExample: lesson.codeExample && !(index === 1 && lesson.codeExample === legacyVariablesExample)
      ? lesson.codeExample : original.codeExample,
  };
}
