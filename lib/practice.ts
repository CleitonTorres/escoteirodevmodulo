import type { Lesson } from "@/data/lessons";
import type { JSONContent } from "@tiptap/core";
import { initialDesktopItems, isAvailable, type DesktopFile } from "./desktop-files";
import type { Progress } from "./storage";

type WordBlock = {
  type: "heading" | "paragraph" | "bulletList" | "orderedList";
  level?: 1 | 2 | 3;
  alignment?: "center" | "justify";
  minLength?: number;
  minItems?: number;
  bold?: boolean;
};

export type PracticeCheck =
  | { kind: "entry"; path: string[]; entry: "folder" | "file" | "shortcut"; itemId?: string; app?: string }
  | { kind: "typing"; level: number }
  | { kind: "word"; file: string[]; block: WordBlock; distinctHeadings?: number }
  | { kind: "sheet"; file: string[]; headers: [string, string, string, string]; itemCount: number; step: "headers" | "items" | "subtotals" | "total" }
  | { kind: "quiz"; options: readonly string[]; answer: number; feedback: string }
  | { kind: "desktop-event"; action: "open" | "rename" | "trash" | "restore"; name: string; from?: string; after?: string }
  | { kind: "search"; engine: "google" | "bing"; terms: string[] }
  | { kind: "favorite"; url: string }
  | { kind: "shortcut"; action: "copy" | "paste" | "undo" };

export type PracticeTask = { id: string; action: string; hint?: string; check: PracticeCheck };

export type PracticeEvent =
  | { kind: "desktop-event"; action: "open" | "rename" | "trash" | "restore"; itemId: string; name: string; previousName?: string }
  | { kind: "search"; engine: string; term: string }
  | { kind: "favorite"; url: string }
  | { kind: "shortcut"; action: "copy" | "paste" | "undo" }
  | { kind: "quiz"; taskId: string; answer: number };

export function practiceKey(lessonId: number, taskId: string) {
  return `${lessonId}:${encodeURIComponent(taskId).replaceAll(".", "%2E")}`;
}

export function lessonUnlocked(lessons: readonly Lesson[], completed: number[], id: number, startLessonId?: number) {
  const index = lessons.findIndex((lesson) => lesson.id === id);
  if (index < 0) return false;
  const start = startLessonId === undefined ? -1 : lessons.findIndex((lesson) => lesson.id === startLessonId);
  const firstRequired = start >= 0 && start <= index ? start : 0;
  return completed.includes(id) || lessons.slice(firstRequired, index).every((lesson) => completed.includes(lesson.id));
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").trim().toLowerCase();
}

function entryAt(progress: Progress, path: string[]) {
  const items = progress.desktop?.items ?? initialDesktopItems;
  let parent: string | null = null;
  for (const [index, name] of path.entries()) {
    const entry = items.find((item) => item.parent === parent && !item.deleted && normalize(item.name) === normalize(name));
    if (!entry) return;
    if (index === path.length - 1) return entry;
    if (entry.kind !== "folder") return;
    parent = entry.id;
  }
}

function textContent(node: JSONContent): string {
  return node.text ?? node.content?.map(textContent).join("") ?? "";
}

function wordBlocks(document: JSONContent | undefined, rule: WordBlock) {
  return (document?.content ?? []).filter((node) =>
    node.type === rule.type &&
    (rule.level === undefined || node.attrs?.level === rule.level) &&
    (rule.alignment === undefined || node.attrs?.textAlign === rule.alignment) &&
    textContent(node).trim().length >= (rule.minLength ?? 1) &&
    (!rule.bold || node.content?.some((child) => child.text?.trim() && child.marks?.some((mark) => mark.type === "bold"))) &&
    (rule.minItems === undefined || (node.content?.filter((child) => textContent(child).trim()).length ?? 0) >= rule.minItems),
  );
}

function sheetCheck(file: DesktopFile, { headers, itemCount, step }: Extract<PracticeCheck, { kind: "sheet" }>) {
  const workbook = file.workbook;
  const cells = workbook?.sheets[workbook.sheetOrder[0]]?.cellData;
  if (!cells) return false;
  const hasHeaders = headers.every((header, column) => {
    const cell = cells[0]?.[column];
    return !cell?.f && typeof cell?.v === "string" &&
      normalize(cell.v).replace(/\s+/g, "") === normalize(header).replace(/\s+/g, "");
  });
  if (step === "headers") return hasHeaders;

  const rows = Array.from({ length: itemCount }, (_, index) => index + 1);
  const hasItems = rows.every((row) => {
    const [item, quantity, price] = [cells[row]?.[0], cells[row]?.[1], cells[row]?.[2]];
    return !item?.f && typeof item?.v === "string" && Boolean(item.v.trim()) &&
      !quantity?.f && typeof quantity?.v === "number" && Number.isInteger(quantity.v) && quantity.v > 0 &&
      !price?.f && typeof price?.v === "number" && Number.isFinite(price.v) && price.v > 0;
  });
  if (step === "items") return hasItems;
  // Inspect the controlled formula shapes without executing learner-supplied expressions.
  const formula = (row: number) => cells[row]?.[3]?.f?.toUpperCase().replace(/[\s$]/g, "") ?? "";
  const hasSubtotals = rows.every((row) => {
    const number = row + 1;
    return [`=B${number}*C${number}`, `=C${number}*B${number}`].includes(formula(row));
  });
  if (step === "subtotals") return hasSubtotals;
  const totalRow = itemCount + 1;
  const label = cells[totalRow]?.[0];
  const totalFormula = formula(totalRow);
  const totalValue = cells[totalRow]?.[3]?.v;
  const range = `D2:D${totalRow}`;
  return !label?.f && typeof label?.v === "string" && normalize(label.v) === "total" &&
    (totalFormula === `=SUM(${range})` ||
      (totalFormula === `=SOMA(${range})` && typeof totalValue === "number" && Number.isFinite(totalValue)));
}

export function taskDone(lessonId: number, task: PracticeTask, progress: Progress): boolean {
  if (progress.completed.includes(lessonId)) return true;
  const { check } = task;
  switch (check.kind) {
    case "entry": {
      const entry = entryAt(progress, check.path);
      return entry?.kind === check.entry &&
        (!check.itemId || entry.id === check.itemId) &&
        (!check.app || (entry.kind === "shortcut" && entry.app === check.app));
    }
    case "typing": return progress.typingBest >= check.level;
    case "word": {
      const file = entryAt(progress, check.file);
      const doc = file?.kind === "file" ? file.document : undefined;
      const blocks = wordBlocks(doc, check.block);
      return check.distinctHeadings
        ? new Set(blocks.map((block) => normalize(textContent(block)))).size >= check.distinctHeadings
        : blocks.length > 0;
    }
    case "sheet": {
      const file = entryAt(progress, check.file);
      return file?.kind === "file" && sheetCheck(file, check);
    }
    default: return Boolean(progress.practiceEvidence?.[practiceKey(lessonId, task.id)]);
  }
}

export function matchPracticeEvent(lessonId: number, task: PracticeTask, observation: unknown, progress: Progress) {
  if (!observation || typeof observation !== "object") return;
  const event = observation as Record<string, unknown>;
  const { check } = task;
  if (event.kind !== check.kind) return;
  switch (check.kind) {
    case "quiz": return event.taskId === task.id && event.answer === check.answer ? "ok" : undefined;
    case "shortcut": return event.action === check.action ? "ok" : undefined;
    case "favorite": return event.url === check.url ? "ok" : undefined;
    case "search": {
      if (event.engine !== check.engine || typeof event.term !== "string" || event.term.length > 180) return;
      const words: string[] = normalize(event.term).match(/[a-z0-9]+/g) ?? [];
      return check.terms.every((term) => words.includes(term)) ? "ok" : undefined;
    }
    case "desktop-event": {
      if (event.action !== check.action || typeof event.itemId !== "string" || typeof event.name !== "string" ||
        event.name.length > 100 || normalize(event.name) !== normalize(check.name)) return;
      const items = progress.desktop?.items ?? initialDesktopItems;
      const item = items.find((entry) => entry.id === event.itemId && normalize(entry.name) === normalize(check.name));
      if (!item) return;
      if (check.action === "open") return item.kind === "folder" && isAvailable(items, item.id) ? item.id : undefined;
      if (item.kind !== "file") return;
      if (check.action === "rename") {
        return typeof event.previousName === "string" && event.previousName.length <= 100 &&
          normalize(event.previousName) !== normalize(item.name) &&
          (!check.from || normalize(event.previousName) === normalize(check.from)) &&
          isAvailable(items, item.id) ? item.id : undefined;
      }
      if (check.action === "trash") return item.deleted ? item.id : undefined;
      const prior = check.after && progress.practiceEvidence?.[practiceKey(lessonId, check.after)];
      return (!check.after || prior === item.id) && isAvailable(items, item.id) ? item.id : undefined;
    }
  }
}
