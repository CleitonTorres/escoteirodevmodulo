import { typingLevels } from "@/data/disciplinas";
import type { Lesson, LessonResource } from "@/data/lessons";
import { desktopApps, desktopSheetRows, validDesktopName } from "@/lib/desktop-files";
import type { PracticeCheck, PracticeTask } from "@/lib/practice";
import { pageAddress, resolveAddress } from "@/app/browser-content";
import { desktopActions, documentAlignments, documentBlocks, entryTypes, practiceFromFields,
  searchEngines, sheetSteps, shortcutActions, taskLimit } from "@/lib/practice-form";

export function field(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

const lines = (value: string) => value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown, limit: number): value is string =>
  typeof value === "string" && Boolean(value.trim()) && value.length <= limit;
const whole = (value: unknown, min: number, max: number): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= min && value <= max;
const oneOf = (value: unknown, values: readonly string[]) => typeof value === "string" && values.includes(value);
const supported = (value: unknown, options: Record<string, string>) => typeof value === "string" && Object.hasOwn(options, value);
const path = (value: unknown) => Array.isArray(value) && value.length > 0 && value.length <= 12 &&
  value.every((name) => typeof name === "string" && validDesktopName(name));
const desktopName = (value: unknown) => typeof value === "string" && validDesktopName(value);

function https(value: unknown) {
  if (!text(value, 1500)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

function readCheck(value: unknown): value is PracticeCheck {
  if (!isRecord(value)) return false;
  switch (value.kind) {
    case "entry":
      return path(value.path) && supported(value.entry, entryTypes) &&
        (value.app === undefined || (value.entry === "shortcut" && oneOf(value.app, desktopApps))) &&
        (value.itemId === undefined || text(value.itemId, 64));
    case "typing": return whole(value.level, 1, typingLevels.length);
    case "word": {
      const block = value.block;
      return path(value.file) && isRecord(block) && supported(block.type, documentBlocks) &&
        (block.level === undefined || whole(block.level, 1, 3)) &&
        (block.alignment === undefined || supported(block.alignment, documentAlignments)) &&
        (block.minLength === undefined || whole(block.minLength, 1, 50000)) &&
        (block.minItems === undefined || whole(block.minItems, 1, 100)) &&
        (block.bold === undefined || typeof block.bold === "boolean") &&
        (value.distinctHeadings === undefined || whole(value.distinctHeadings, 1, 100));
    }
    case "sheet":
      return path(value.file) && Array.isArray(value.headers) && value.headers.length === 4 &&
        value.headers.every((header) => text(header, 100)) && whole(value.itemCount, 1, desktopSheetRows - 2) &&
        supported(value.step, sheetSteps);
    case "quiz": return Array.isArray(value.options) && value.options.length >= 2 && value.options.length <= 8 &&
      value.options.every((option) => text(option, 500)) && new Set(value.options).size === value.options.length &&
      whole(value.answer, 0, value.options.length - 1) && text(value.feedback, 1000);
    case "desktop-event": return supported(value.action, desktopActions) && desktopName(value.name) &&
      (value.from === undefined || desktopName(value.from)) && (value.after === undefined || text(value.after, 64));
    case "search": return supported(value.engine, searchEngines) && Array.isArray(value.terms) &&
      value.terms.length > 0 && value.terms.length <= 12 && value.terms.every((term) =>
        typeof term === "string" && /^[a-z0-9]{1,40}$/.test(term));
    case "favorite": {
      if (typeof value.url !== "string" || !https(value.url)) return false;
      const page = resolveAddress(value.url)?.page;
      return Boolean(page && pageAddress(page) === value.url);
    }
    case "shortcut": return supported(value.action, shortcutActions);
    default: return false;
  }
}

function readPractice(form: FormData): PracticeTask[] | undefined {
  const input = field(form, "practice");
  if (input.length > 15000) return;
  let parsed: unknown;
  try {
    parsed = input ? JSON.parse(input) : practiceFromFields(form);
  } catch {
    return;
  }
  if (!Array.isArray(parsed) || parsed.length > taskLimit || (!input && JSON.stringify(parsed).length > 15000)) return;
  const tasks: PracticeTask[] = [];
  const ids = new Set<string>();
  for (const task of parsed) {
    if (!isRecord(task) || !text(task.id, 64) || !/^[a-z0-9-]+$/.test(task.id) || ids.has(task.id) ||
      !text(task.action, 500) || (task.hint !== undefined && !text(task.hint, 750)) || !readCheck(task.check)) return;
    if (task.check.kind === "desktop-event" && task.check.after && !ids.has(task.check.after)) return;
    ids.add(task.id);
    tasks.push({ id: task.id, action: task.action, ...(task.hint && { hint: task.hint }), check: task.check });
  }
  return tasks;
}

export function readLesson(form: FormData): Omit<Lesson, "id"> | string {
  const title = field(form, "title");
  const subtitle = field(form, "subtitle");
  const objective = field(form, "objective");
  const theory = lines(field(form, "theory"));
  const exercise = lines(field(form, "exercise"));
  const resourceLines = lines(field(form, "resources"));
  const guide = field(form, "guide");
  const month = Number(field(form, "month"));
  const videoFields = form.getAll("videoUrl");
  if (videoFields.some((value) => typeof value !== "string")) return "Informe endereços HTTPS válidos para os vídeos.";
  const videoUrl = [...new Set(videoFields.flatMap((value) => String(value).split(/\r?\n/).map((url) => url.trim()).filter(Boolean)))];
  const selectedTool = field(form, "tool");
  const icon = field(form, "icon") || "📘";
  if (!text(title, 150) || !text(subtitle, 200) || !text(objective, 1000) || !text(guide, 1600) ||
    !whole(month, 1, 36) || !theory.length || theory.length > 20 || theory.some((line) => !text(line, 1000)) ||
    icon.length > 12) return "Revise os campos da aula.";
  if (videoUrl.some((url) => !https(url))) return "Informe um endereço HTTPS válido para cada vídeo.";
  const tool = selectedTool === "arquivos" || selectedTool === "digitacao" || selectedTool === "navegador"
    ? selectedTool : undefined;
  if (selectedTool && !tool) return "Escolha uma ferramenta válida.";
  const practice = readPractice(form);
  if (!practice) return "Revise os campos das tarefas práticas e escolha opções reconhecidas pelo simulador.";
  if (exercise.length > 12 || exercise.some((step) => !text(step, 1000))) return "Revise os passos do exercício.";
  if (resourceLines.length > 8) return "Informe até oito recursos por aula.";
  const resources: LessonResource[] = [];
  for (const line of resourceLines) {
    const separator = line.indexOf("|");
    const title = line.slice(0, separator).trim();
    const url = line.slice(separator + 1).trim();
    if (separator < 1 || !text(title, 120) || !https(url)) return "Use o formato Nome | endereço HTTPS para cada recurso.";
    resources.push({ title, url: new URL(url).href });
  }
  return { title, subtitle, objective, theory, guide, month, icon, practice, ...(tool && { tool }), videoUrl,
    ...(exercise.length && { exercise }), ...(resources.length && { resources }) };
}
