import { articles, homePage, pageAddress, pageTitle, type BrowserPage } from "@/app/browser-content";
import type { PracticeCheck } from "@/lib/practice";

export const taskLimit = 40;

export const practiceKinds = {
  entry: "Arquivo, pasta ou atalho no local indicado",
  "desktop-event": "Ação na área de trabalho",
  typing: "Nível de digitação",
  word: "Formatação de documento",
  sheet: "Etapa de planilha",
  quiz: "Pergunta de múltipla escolha",
  search: "Pesquisa no navegador",
  favorite: "Página salva nos favoritos",
  shortcut: "Atalho de teclado",
} satisfies Record<PracticeCheck["kind"], string>;

export const entryTypes = { folder: "Pasta", file: "Arquivo", shortcut: "Atalho" };
export const desktopActions = { open: "Abrir pasta", rename: "Renomear arquivo", trash: "Enviar arquivo para a Lixeira", restore: "Restaurar arquivo da Lixeira" };
export const shortcutActions = { copy: "Copiar (Ctrl+C)", paste: "Colar (Ctrl+V)", undo: "Desfazer (Ctrl+Z)" };
export const documentBlocks = { heading: "Título", paragraph: "Parágrafo", bulletList: "Lista com marcadores", orderedList: "Lista numerada" };
export const documentAlignments = { center: "Centralizado", justify: "Justificado" };
export const sheetSteps = { headers: "Preencher cabeçalhos", items: "Preencher itens", subtotals: "Calcular subtotais", total: "Calcular total" };
export const searchEngines = { google: "Google", bing: "Bing" };

const browserPages: BrowserPage[] = [homePage, { kind: "tips" }, { kind: "security" }, { kind: "login" },
  ...articles.map(({ id }): BrowserPage => ({ kind: "article", id }))];
export const favoritePages = Object.fromEntries(browserPages.map((page) => [pageAddress(page), pageTitle(page)]));

export function taskField(id: string, name: string) {
  return `practice.${id}.${name}`;
}

export function listValues(value: string, separator: string | RegExp) {
  return value.split(separator).map((part) => part.trim()).filter(Boolean);
}

export function practiceFromFields(form: FormData) {
  const ids = form.getAll("practiceTaskId");
  if (ids.length > taskLimit || ids.some((id) => typeof id !== "string" || !/^[a-z0-9-]{1,64}$/.test(id))) return;
  return ids.map((id) => {
    const key = String(id);
    const read = (name: string) => {
      const value = form.get(taskField(key, name));
      return typeof value === "string" ? value.trim() : "";
    };
    const optional = (name: string) => read(name) || undefined;
    const number = (name: string) => optional(name) === undefined ? undefined : Number(read(name));
    const kind = read("kind");
    const task = { id: key, action: read("instruction"), hint: optional("hint") };
    const action = read("action");
    const file = listValues(read("file"), "/");
    switch (kind) {
      case "entry":
        return { ...task, check: { kind, entry: read("entry"), path: listValues(read("path"), "/"), app: optional("app"), itemId: optional("itemId") } };
      case "desktop-event":
        return { ...task, check: { kind, action, name: read("name"), from: optional("from"), after: optional("after") } };
      case "shortcut":
        return { ...task, check: { kind, action } };
      case "typing":
        return { ...task, check: { kind, level: number("level") } };
      case "word":
        return { ...task, check: { kind, file, distinctHeadings: number("distinctHeadings"), block: {
          type: read("block"), level: number("headingLevel"), alignment: optional("alignment"),
          minLength: number("minLength"), minItems: number("minItems"), bold: optional("bold") ? read("bold") === "on" : undefined,
        } } };
      case "sheet":
        return { ...task, check: { kind, file, step: read("step"), itemCount: number("itemCount"),
          headers: [read("header1"), read("header2"), read("header3"), read("header4")] } };
      case "quiz":
        return { ...task, check: { kind, options: listValues(read("options"), /\r?\n/), answer: number("answer"), feedback: read("feedback") } };
      case "search":
        return { ...task, check: { kind, engine: read("engine"),
          terms: listValues(read("terms").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase(), /[\s,]+/) } };
      case "favorite":
        return { ...task, check: { kind, url: read("url") } };
      default:
        return { ...task, check: { kind } };
    }
  });
}
