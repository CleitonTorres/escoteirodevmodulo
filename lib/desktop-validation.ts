import "server-only";
import {
  desktopApps, desktopCellLimit, desktopItemLimit, desktopSheetColumns, desktopSheetRows, desktopSizeError, desktopSlotLimit,
  desktopTextLimit, desktopTrash, validDesktopName, type DesktopEntry,
} from "./desktop-files";

export function readDesktopItems(value: unknown): DesktopEntry[] | null {
  if (!Array.isArray(value) || value.length > desktopItemLimit) return null;
  const items: DesktopEntry[] = [];
  const byId = new Map<string, DesktopEntry>();
  const slots = new Set<number>();
  const names = new Map<string | null, Set<string>>();

  for (const record of value) {
    if (!record || typeof record !== "object") return null;
    const { id, name, parent, slot, modifiedAt, deleted, kind, app, text, cells } = record as Record<string, unknown>;
    if (typeof id !== "string" || !/^[a-z\d-]{1,64}$/.test(id) || id === desktopTrash || byId.has(id)) return null;
    if (typeof name !== "string" || !validDesktopName(name) || (parent !== null && typeof parent !== "string")) return null;
    if (slot !== undefined && (parent !== null || typeof slot !== "number" || !Number.isInteger(slot) || slot < 0 || slot >= desktopSlotLimit)) return null;
    if (modifiedAt !== undefined && (typeof modifiedAt !== "number" || !Number.isSafeInteger(modifiedAt) || modifiedAt < 0 || modifiedAt > 8.64e15)) return null;
    if (deleted !== undefined && typeof deleted !== "boolean") return null;

    const base = { id, name, parent, ...(slot === undefined ? {} : { slot }),
      ...(deleted === undefined ? {} : { deleted }), ...(modifiedAt === undefined ? {} : { modifiedAt }) };
    let entry: DesktopEntry;
    if (kind === "folder") entry = { ...base, kind };
    else if (kind === "shortcut") {
      const destination = desktopApps.find((option) => option === app);
      if (!destination) return null;
      entry = { ...base, kind, app: destination };
    } else if (kind === "file") {
      if (text !== undefined && (typeof text !== "string" || text.length > desktopTextLimit)) return null;
      if (cells !== undefined && (!Array.isArray(cells) || cells.length > desktopSheetRows || cells.some((row) =>
        !Array.isArray(row) || row.length > desktopSheetColumns || row.some((cell) => typeof cell !== "string" || cell.length > desktopCellLimit)))) return null;
      entry = { ...base, kind, ...(text === undefined ? {} : { text }), ...(cells === undefined ? {} : { cells }) };
    } else return null;

    if (!deleted) {
      const siblings = names.get(parent) ?? new Set<string>();
      const normalized = name.toLocaleLowerCase("pt-BR");
      if (siblings.has(normalized)) return null;
      siblings.add(normalized);
      names.set(parent, siblings);
      if (slot !== undefined) {
        if (slots.has(slot)) return null;
        slots.add(slot);
      }
    }
    byId.set(id, entry);
    items.push(entry);
  }

  for (const entry of items) {
    const visited = new Set([entry.id]);
    for (let parent = entry.parent; parent !== null;) {
      const folder = byId.get(parent);
      if (folder?.kind !== "folder" || visited.has(parent)) return null;
      visited.add(parent);
      parent = folder.parent;
    }
  }

  return desktopSizeError(items) ? null : items;
}
