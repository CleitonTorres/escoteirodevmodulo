import type { WordValue } from "./word-document";
import type { SheetWorkbook } from "./sheet-workbook";

export const desktopApps = ["Digitação", "Editor de texto", "Editor de código", "Planilha", "Navegador"] as const;
export type DesktopApp = typeof desktopApps[number];
export type FolderId = string | null;
export const desktopTrash = "lixeira";
export const desktopNameLimit = 100;
export const desktopSlotLimit = 300;
export const desktopTextLimit = 50_000;
export const desktopSheetRows = 200;
export const desktopSheetColumns = 26;
export const desktopCellLimit = 500;
export const desktopItemLimit = 200;
export const programmingPortfolio = "meu_portifólio";
const desktopByteLimit = 500_000;

type Entry = { id: string; name: string; parent: FolderId; slot?: number; deleted?: boolean; modifiedAt?: number };
export type DesktopEntry = Entry & (
  { kind: "folder" } | { kind: "file"; text?: string; cells?: string[][]; document?: WordValue["document"]; workbook?: SheetWorkbook } | { kind: "shortcut"; app: DesktopApp }
);
export type EntryKind = DesktopEntry["kind"];
export type DesktopFile = Extract<DesktopEntry, { kind: "file" }>;
export type DesktopProgress = { items: DesktopEntry[]; revision: number };

export function validDesktopName(name: string) {
  return !!name && name.length <= desktopNameLimit && name.trim() === name && !/[<>:"/\\|?*\x00-\x1f]/.test(name) && !/^\.+$/.test(name);
}

export function desktopSizeError(items: DesktopEntry[]) {
  if (items.length > desktopItemLimit) return `O desktop comporta até ${desktopItemLimit} itens, incluindo a Lixeira.`;
  if (new TextEncoder().encode(JSON.stringify(items)).length > desktopByteLimit) {
    return "O desktop atingiu o limite de conteúdo. Reduza o conteúdo ou libere espaço na Lixeira.";
  }
}

export function desktopFileApp(name: string) {
  if (/\.(csv|tsv|xlsx?|ods)$/i.test(name)) return "Planilha";
  if (/\.html?$/i.test(name)) return "Navegador";
  if (/\.(js|css|json|md)$/i.test(name)) return "Editor de código";
  return "Editor de texto";
}

export function isCodeFile(name: string) {
  return /\.(html?|js|css|json|md|txt)$/i.test(name);
}

export function desktopPath(item: DesktopEntry, items: DesktopEntry[]) {
  const path = [item.name];
  for (let parent = item.parent; parent !== null;) {
    const folder = items.find(({ id }) => id === parent);
    if (!folder) break;
    path.unshift(folder.name);
    parent = folder.parent;
  }
  return path;
}

export function desktopEntryAt(items: DesktopEntry[], path: readonly string[]) {
  let parent: FolderId = null;
  const normalize = (value: string) => value.normalize("NFD").replace(/\p{M}/gu, "").trim().toLowerCase();
  for (const [index, name] of path.entries()) {
    const entry = items.find((item) => item.parent === parent && !item.deleted && normalize(item.name) === normalize(name));
    if (!entry || index === path.length - 1) return entry;
    if (entry.kind !== "folder") return;
    parent = entry.id;
  }
}

export function isDesktopDocument(name: string) {
  return /\.docx?$/i.test(name);
}

export const initialDesktopItems: DesktopEntry[] = [
  { id: "arquivos", kind: "folder", name: "Arquivos", parent: null, slot: 0 },
  { id: "boas-vindas", kind: "file", name: "Boas-vindas.txt", parent: null, slot: 1,
    text: "Bem-vindo à área de trabalho da Trilha Digital! Abra a pasta Arquivos para praticar a organização de seus documentos." },
  { id: "atalho-digitacao", kind: "shortcut", name: "Treino de digitação", app: "Digitação", parent: null, slot: 2 },
  { id: "guia", kind: "folder", name: "Meu Guia Digital", parent: "arquivos" },
  { id: "textos", kind: "folder", name: "Textos", parent: "guia" },
];

export function nextDesktopSlot(items: DesktopEntry[]) {
  const used = new Set(items.filter((item) => item.parent === null && !item.deleted).map((item) => item.slot));
  let slot = 0;
  while (used.has(slot)) slot += 1;
  return slot;
}

export function hasName(items: DesktopEntry[], parent: FolderId, name: string, except?: string) {
  return items.some((item) => item.parent === parent && !item.deleted && item.id !== except &&
    item.name.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR"));
}

export function availableName(items: DesktopEntry[], parent: FolderId, name: string) {
  let candidate = name;
  let counter = 2;
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const extension = dot > 0 ? name.slice(dot) : "";
  while (hasName(items, parent, candidate)) {
    const suffix = ` (${counter++})`;
    const ending = extension.slice(0, desktopNameLimit - suffix.length - 1);
    candidate = `${base.slice(0, desktopNameLimit - suffix.length - ending.length)}${suffix}${ending}`;
  }
  return candidate;
}

export function isAvailable(items: DesktopEntry[], id: FolderId) {
  while (id !== null) {
    const entry = items.find((item) => item.id === id);
    if (!entry || entry.deleted) return false;
    id = entry.parent;
  }
  return true;
}

export function subtree(items: DesktopEntry[], id: string) {
  const ids = new Set<string>([id]);
  for (const parent of ids) {
    for (const child of items) {
      if (child.parent === parent) ids.add(child.id);
    }
  }
  return ids;
}

export function moveEntry(items: DesktopEntry[], entry: DesktopEntry, parent: FolderId) {
  if (!isAvailable(items, parent) || (parent !== null && subtree(items, entry.id).has(parent))) {
    return { error: "Escolha uma pasta fora deste item." };
  }
  if (hasName(items, parent, entry.name, entry.id)) return { error: "Já existe um item com esse nome no destino." };
  if (entry.parent === parent) return { items };
  return { items: items.map((item) => item.id === entry.id
    ? { ...item, parent, slot: parent === null ? nextDesktopSlot(items) : undefined, modifiedAt: Date.now() } : item) };
}

export function copyEntry(items: DesktopEntry[], entry: DesktopEntry, parent: FolderId, newId: () => string) {
  if (!isAvailable(items, parent) || (parent !== null && subtree(items, entry.id).has(parent))) {
    return { error: "Escolha uma pasta fora deste item." };
  }
  const rootId = newId();
  const name = availableName(items, parent, entry.name);
  const modifiedAt = Date.now();
  const copied: DesktopEntry[] = [{ ...entry, id: rootId, name, parent, modifiedAt,
    slot: parent === null ? nextDesktopSlot(items) : undefined }];
  const parents = new Map([[entry.id, rootId]]);
  for (const [original, clone] of parents) {
    for (const child of items.filter((item) => item.parent === original && !item.deleted)) {
      const id = newId();
      parents.set(child.id, id);
      copied.push({ ...child, id, parent: clone, slot: undefined, modifiedAt });
    }
  }
  return { items: [...items, ...copied], name, id: rootId };
}

export function restoreEntry(items: DesktopEntry[], entry: DesktopEntry) {
  const parent = isAvailable(items, entry.parent) ? entry.parent : null;
  const name = availableName(items, parent, entry.name);
  const occupied = items.some((item) => item.parent === null && !item.deleted && item.slot === entry.slot);
  const slot = parent !== null ? undefined : entry.slot !== undefined && !occupied ? entry.slot : nextDesktopSlot(items);
  return { name, parent, items: items.map((item) => item.id === entry.id
    ? { ...item, name, parent, slot, deleted: false, modifiedAt: Date.now() } : item) };
}

export function placeDesktopEntry(items: DesktopEntry[], entry: DesktopEntry, slot: number) {
  return items.map((item) => {
    if (item.id === entry.id) return { ...item, slot };
    if (item.parent === null && !item.deleted && item.slot === slot) return { ...item, slot: entry.slot };
    return item;
  });
}
