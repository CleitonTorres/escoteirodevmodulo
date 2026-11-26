"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import type { PracticeEvent } from "@/lib/practice";
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, ChevronRight, Clipboard, Compass, Copy, Ellipsis,
  FileText, Folder, Globe, House, Keyboard, Maximize2, Minus, Monitor, PanelTop, Plus, Scissors, Search,
  SquarePen, Table2, Trash2, X,
} from "lucide-react";
import {
  copyEntry, desktopApps, desktopFileApp, desktopNameLimit, desktopSlotLimit, desktopTrash as trash, hasName,
  isAvailable, isDesktopDocument, moveEntry, nextDesktopSlot, placeDesktopEntry, restoreEntry, subtree, validDesktopName,
  type DesktopApp, type DesktopEntry, type DesktopFile, type EntryKind, type FolderId,
} from "@/lib/desktop-files";
import "./desktop-lab.css";

const fileTypes = { "Editor de texto": "Arquivo de texto", Planilha: "Planilha", Navegador: "Página HTML" };
const fileIcons = { "Editor de texto": FileText, Planilha: Table2, Navegador: Globe };
const fileExtensions = ["txt", "docx", "xlsx", "csv", "html"] as const;
const defaultNames = { folder: "Nova pasta", file: "Novo arquivo", shortcut: "Novo atalho" };
const startApps = { Digitação: Keyboard, "Editor de texto": FileText, Planilha: Table2, Navegador: Globe };
const nameOrder = new Intl.Collator("pt-BR", { numeric: true, sensitivity: "base" });
const dateDisplay = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
const sortColumns = [["name", "Nome"], ["modifiedAt", "Modificado em"], ["type", "Tipo"], ["size", "Tamanho"]] as const;
type SortColumn = typeof sortColumns[number][0];
export type ExplorerWindow = { open: boolean; history: FolderId[]; index: number; maximized: boolean };

type Menu = { id: string | null; x: number; y: number; trigger: HTMLElement };
type Dialog = { type: "create"; kind: EntryKind } | { type: "rename" | "move" | "purge"; entry: DesktopEntry };
type Drop = { type: "folder"; id: string } | { type: "trash" } | { type: "slot"; slot: number };

function ItemIcon({ entry, size = 24 }: { entry: DesktopEntry; size?: number }) {
  const Icon = entry.kind === "folder" ? Folder : entry.kind === "shortcut" ? ArrowUpRight : fileIcons[desktopFileApp(entry.name)];
  return <Icon className={`lab-icon-${entry.kind}`} size={size} aria-hidden="true" />;
}

function entryType(entry: DesktopEntry) {
  if (entry.kind === "file") return fileLabel(entry.name);
  return entry.kind === "folder" ? "Pasta" : "Atalho";
}

function fileLabel(name: string) {
  return isDesktopDocument(name) ? "Documento de texto" : fileTypes[desktopFileApp(name)];
}

function entrySize(entry: DesktopEntry) {
  if (entry.kind !== "file") return 0;
  const structured = entry.document ?? entry.workbook ?? entry.cells;
  return new TextEncoder().encode(structured ? JSON.stringify(structured) : entry.text ?? "").length;
}

function dropAt(x: number, y: number, source: string) {
  const target = document.elementFromPoint(x, y);
  const folder = target?.closest<HTMLElement>("[data-lab-folder]")?.dataset.labFolder;
  if (target?.closest("[data-lab-trash]")) return { type: "trash" } as const;
  if (folder && folder !== source) return { type: "folder", id: folder } as const;
  const slot = target?.closest<HTMLElement>("[data-lab-slot]")?.dataset.labSlot;
  if (slot !== undefined) return { type: "slot", slot: Number(slot) } as const;
}

export default function DesktopLab({ items, setItems, explorer, setExplorer, openApp, openFile, observe, verifyingFile, assistant }: {
  items: DesktopEntry[];
  setItems: (items: DesktopEntry[]) => string | undefined;
  explorer: ExplorerWindow;
  setExplorer: (window: ExplorerWindow) => void;
  openApp: (app: DesktopApp) => void;
  openFile: (file: DesktopFile) => void;
  observe: (event: PracticeEvent) => void;
  verifyingFile: boolean;
  assistant?: ReactNode;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<{ id: string; cut: boolean } | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [notice, setNotice] = useState("");
  const [drag, setDrag] = useState<{ id: string; x: number; y: number; drop?: Drop } | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [screenSlots, setScreenSlots] = useState(8);
  const [sort, setSort] = useState<{ column: SortColumn; descending: boolean }>({ column: "name", descending: false });
  const gesture = useRef<{ id: string; x: number; y: number; pointer: number; moving: boolean; timer?: number } | null>(null);
  const surfacePress = useRef<{ x: number; y: number; timer: number } | null>(null);
  const ignoreClick = useRef(false);
  const surface = useRef<HTMLDivElement>(null);
  const iconGrid = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const startArea = useRef<HTMLDivElement>(null);
  const startButton = useRef<HTMLButtonElement>(null);
  const hintId = useId();
  const startId = useId();
  const activeFolder = explorer.history[explorer.index];
  const place = explorer.open && (activeFolder === trash || isAvailable(items, activeFolder)) ? activeFolder : null;
  const location = items.find((entry) => entry.id === place);
  const visible = items.filter((entry) => place === trash ? entry.deleted : entry.parent === place && !entry.deleted);
  const selectedEntry = visible.find((entry) => entry.id === selected);
  const contextEntry = visible.find((entry) => entry.id === menu?.id);
  const dragEntry = visible.find((entry) => entry.id === drag?.id);
  const folderNames: DesktopEntry[] = [];
  for (let parent = location; parent; parent = items.find((entry) => entry.id === parent?.parent)) folderNames.unshift(parent);
  const locationName = place === trash ? "Lixeira" : location?.name ?? "Área de trabalho";
  const search = query.trim().toLocaleLowerCase("pt-BR");
  const fileRows = explorer.open ? visible
    .filter((entry) => entry.name.toLocaleLowerCase("pt-BR").includes(search))
    .map((entry) => ({ entry, type: entryType(entry), size: entrySize(entry) }))
    .sort((a, b) => {
      if (a.entry.kind === "folder" && b.entry.kind !== "folder") return -1;
      if (a.entry.kind !== "folder" && b.entry.kind === "folder") return 1;
      const byName = nameOrder.compare(a.entry.name, b.entry.name);
      const order = {
        name: byName,
        modifiedAt: (a.entry.modifiedAt ?? 0) - (b.entry.modifiedAt ?? 0),
        type: nameOrder.compare(a.type, b.type),
        size: a.size - b.size,
      }[sort.column];
      return (sort.descending ? -1 : 1) * (order || byName);
    }) : [];

  useLayoutEffect(() => {
    if (!menu || !popup.current) return;
    const node = popup.current;
    node.style.left = `${Math.max(8, Math.min(menu.x, document.documentElement.clientWidth - node.offsetWidth - 8))}px`;
    node.style.top = `${Math.max(8, Math.min(menu.y, window.innerHeight - node.offsetHeight - 8))}px`;
    node.querySelector<HTMLButtonElement>("button")?.focus();
  }, [menu]);

  useLayoutEffect(() => {
    const screen = surface.current;
    const grid = iconGrid.current;
    if (!screen || !grid) return;
    function fit() {
      if (!screen || !grid) return;
      const { paddingBlockStart, paddingBlockEnd } = getComputedStyle(screen);
      const { gridTemplateColumns, rowGap } = getComputedStyle(grid);
      const firstSlot = grid.firstElementChild;
      if (!firstSlot) return;
      const gap = parseFloat(rowGap) || 0;
      const height = screen.clientHeight - parseFloat(paddingBlockStart) - parseFloat(paddingBlockEnd);
      const rows = Math.max(1, Math.floor((height + gap) / (firstSlot.getBoundingClientRect().height + gap)));
      setScreenSlots(Math.min(desktopSlotLimit, rows * gridTemplateColumns.split(" ").length - 1));
    }
    const observer = new ResizeObserver(fit);
    observer.observe(screen);
    fit();
    return () => observer.disconnect();
  }, [explorer.open]);

  useEffect(() => {
    if (!menu) return;
    const closeOutside = (event: globalThis.PointerEvent) => {
      if (!popup.current?.contains(event.target as Node)) setMenu(null);
    };
    const closeOnScroll = (event: Event) => {
      if (!(event.target instanceof Node) || !popup.current?.contains(event.target)) setMenu(null);
    };
    window.addEventListener("pointerdown", closeOutside);
    window.addEventListener("scroll", closeOnScroll, true);
    return () => {
      window.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("scroll", closeOnScroll, true);
    };
  }, [menu]);

  useEffect(() => () => {
    window.clearTimeout(gesture.current?.timer);
    window.clearTimeout(surfacePress.current?.timer);
  }, []);

  useEffect(() => {
    if (!startOpen) return;
    startArea.current?.querySelector<HTMLButtonElement>(".lab-start-menu button")?.focus();
    function closeOutside(event: globalThis.PointerEvent) {
      if (!startArea.current?.contains(event.target as Node)) setStartOpen(false);
    }
    window.addEventListener("pointerdown", closeOutside);
    return () => window.removeEventListener("pointerdown", closeOutside);
  }, [startOpen]);

  function showLocation(next: ExplorerWindow) {
    setExplorer(next);
    setQuery("");
    setStartOpen(false);
    setSelected(null);
    setMenu(null);
    setNotice("");
    requestAnimationFrame(() => surface.current?.focus({ preventScroll: true }));
  }

  function goTo(id: FolderId) {
    const folder = items.find((entry) => entry.id === id && entry.kind === "folder" && !entry.deleted);
    if (folder) observe({ kind: "desktop-event", action: "open", name: folder.name, itemId: folder.id });
    if (activeFolder === id) showLocation({ ...explorer, open: true });
    else {
      const history = [...explorer.history.slice(0, explorer.index + 1), id];
      showLocation({ ...explorer, open: true, history, index: history.length - 1 });
    }
  }

  function commitItems(next: DesktopEntry[]) {
    const error = setItems(next);
    if (error) setNotice(error);
    return error;
  }

  function openItem(entry: DesktopEntry) {
    if (entry.deleted) return;
    if (entry.kind === "folder") goTo(entry.id);
    else if (entry.kind === "shortcut") openApp(entry.app);
    else openFile(entry);
  }

  function showMenu(entry: DesktopEntry | undefined, trigger: HTMLElement, point?: { x: number; y: number }) {
    const bounds = trigger.getBoundingClientRect();
    setStartOpen(false);
    setSelected(entry?.id ?? null);
    setMenu({ id: entry?.id ?? null, trigger, ...(point ?? { x: bounds.left, y: bounds.bottom + 4 }) });
  }

  function closeMenu() {
    menu?.trigger.focus({ preventScroll: true });
    setMenu(null);
  }

  function startSurfacePress(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "touch" || !event.isPrimary || (event.target as Element).closest("button, input")) return;
    const { currentTarget, clientX: x, clientY: y } = event;
    surfacePress.current = { x, y, timer: window.setTimeout(() => showMenu(undefined, currentTarget, { x, y }), 550) };
  }

  function endSurfacePress() {
    window.clearTimeout(surfacePress.current?.timer);
    surfacePress.current = null;
  }

  function recycle(entry: DesktopEntry) {
    if (commitItems(items.map((item) => item.id === entry.id ? { ...item, deleted: true, modifiedAt: Date.now() } : item))) return;
    if (entry.kind === "file") observe({ kind: "desktop-event", action: "trash", name: entry.name, itemId: entry.id });
    if (clipboard?.id === entry.id) setClipboard(null);
    setSelected(null);
    setNotice(`${entry.name} foi para a Lixeira.`);
  }

  function restore(entry: DesktopEntry) {
    const result = restoreEntry(items, entry);
    if (commitItems(result.items)) return;
    if (entry.kind === "file") observe({ kind: "desktop-event", action: "restore", name: result.name, itemId: entry.id });
    setSelected(null);
    setNotice(`${result.name} foi restaurado${result.parent !== entry.parent ? " na Área de trabalho" : ""}.`);
  }

  function markClipboard(entry: DesktopEntry, cut: boolean) {
    setClipboard({ id: entry.id, cut });
    setNotice(`${entry.name} pronto para ${cut ? "mover" : "copiar"}. Abra o destino e escolha Colar.`);
  }

  function paste(parent: FolderId) {
    const entry = items.find((item) => item.id === clipboard?.id);
    if (!clipboard || !entry || !isAvailable(items, entry.id) || parent === trash) {
      setNotice("Selecione um item e use Copiar ou Recortar para colá-lo aqui.");
      return;
    }
    if (clipboard.cut) {
      const error = move(entry, parent);
      if (!error) setClipboard(null);
    } else {
      const result = copyEntry(items, entry, parent, () => crypto.randomUUID());
      if (!result.items) { setNotice(result.error); return; }
      if (commitItems(result.items)) return;
      if (parent === place) setSelected(result.id);
      setNotice(`${result.name} foi copiado.`);
    }
  }

  function move(entry: DesktopEntry, parent: FolderId) {
    const result = moveEntry(items, entry, parent);
    if (!result.items) { setNotice(result.error); return result.error; }
    const error = commitItems(result.items);
    if (error) return error;
    if (parent !== place) setSelected(null);
    setNotice(`${entry.name} está em ${items.find((item) => item.id === parent)?.name ?? "Área de trabalho"}.`);
  }

  function startDrag(event: PointerEvent<HTMLButtonElement>, entry: DesktopEntry) {
    if (event.button !== 0 || !event.isPrimary || (entry.deleted && event.pointerType !== "touch")) return;
    ignoreClick.current = false;
    const node = event.currentTarget;
    const { clientX: x, clientY: y, pointerId } = event;
    const next = { id: entry.id, x, y, pointer: pointerId, moving: false, timer: undefined as number | undefined };
    if (event.pointerType === "touch") {
      next.timer = window.setTimeout(() => {
        ignoreClick.current = true;
        showMenu(entry, node, { x, y });
      }, 550);
    } else node.setPointerCapture(pointerId);
    gesture.current = next;
  }

  function updateDrag(event: PointerEvent<HTMLButtonElement>) {
    const current = gesture.current;
    if (!current || event.pointerId !== current.pointer) return;
    const { clientX: x, clientY: y } = event;
    if (!current.moving && Math.hypot(x - current.x, y - current.y) < 7) return;
    window.clearTimeout(current.timer);
    if (event.pointerType === "touch") return;
    current.moving = true;
    setSelected(current.id);
    setDrag({ id: current.id, x, y, drop: dropAt(x, y, current.id) });
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>, entry: DesktopEntry) {
    const current = gesture.current;
    if (!current || current.pointer !== event.pointerId) return;
    window.clearTimeout(current.timer);
    gesture.current = null;
    setDrag(null);
    if (!current.moving) return;
    ignoreClick.current = true;
    if (event.type !== "pointerup") return;
    const drop = dropAt(event.clientX, event.clientY, entry.id);
    if (drop?.type === "folder") move(entry, drop.id);
    if (drop?.type === "trash") recycle(entry);
    if (drop?.type === "slot" && !explorer.open) {
      if (commitItems(placeDesktopEntry(items, entry, drop.slot))) return;
      setNotice(`${entry.name} foi reposicionado.`);
    }
  }

  function entryButton(entry: DesktopEntry, iconStyle = false) {
    return (
      <button type="button" className={iconStyle ? "lab-desktop-icon" : "lab-file-name"}
        aria-pressed={selected === entry.id}
        data-lab-folder={entry.kind === "folder" && !entry.deleted ? entry.id : undefined}
        data-drop={drag?.drop?.type === "folder" && drag.drop.id === entry.id}
        data-cut={clipboard?.cut && clipboard.id === entry.id}
        onFocus={() => setSelected(entry.id)}
        onClick={(event) => {
          if (ignoreClick.current) { ignoreClick.current = false; return; }
          setSelected(entry.id);
          if (event.detail === 0) openItem(entry);
        }}
        onDoubleClick={() => openItem(entry)}
        onContextMenu={(event) => {
          event.preventDefault(); event.stopPropagation();
          showMenu(entry, event.currentTarget, { x: event.clientX, y: event.clientY });
        }}
        onKeyDown={(event) => {
          if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
            event.preventDefault(); event.stopPropagation(); showMenu(entry, event.currentTarget);
          }
        }}
        onPointerDown={(event) => startDrag(event, entry)} onPointerMove={updateDrag}
        onPointerUp={(event) => endDrag(event, entry)} onPointerCancel={(event) => endDrag(event, entry)}>
        <ItemIcon entry={entry} size={iconStyle ? 36 : 23} />
        <span>{entry.name}</span>
      </button>
    );
  }

  function keyboardActions(event: KeyboardEvent<HTMLElement>) {
    if (startOpen && event.key === "Escape") {
      setStartOpen(false);
      startButton.current?.focus();
      return;
    }
    if (event.defaultPrevented || dialog || menu || event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return;
    const key = event.key.toLowerCase();
    if (place === trash) return;
    if (event.key === "F2" && selectedEntry) { event.preventDefault(); setDialog({ type: "rename", entry: selectedEntry }); }
    if (event.key === "Delete" && selectedEntry) { event.preventDefault(); surface.current?.focus({ preventScroll: true }); recycle(selectedEntry); }
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
    if (key === "v") { event.preventDefault(); paste(place); }
    if ((key === "c" || key === "x") && selectedEntry) { event.preventDefault(); markClipboard(selectedEntry, key === "x"); }
  }

  function menuAction(action: () => void) {
    closeMenu();
    action();
  }

  function submitDialog(data: FormData) {
    if (!dialog) return;
    if (dialog.type === "move") {
      const error = move(dialog.entry, String(data.get("destination")) || null);
      if (error) return error;
    } else if (dialog.type === "purge") {
      const removed = subtree(items, dialog.entry.id);
      const error = commitItems(items.filter((entry) => !removed.has(entry.id)));
      if (error) return error;
      if (clipboard && removed.has(clipboard.id)) setClipboard(null);
      setSelected(null);
      setNotice(`${dialog.entry.name} foi excluído da Lixeira.`);
    } else if (dialog.type === "create" || dialog.type === "rename") {
      const enteredName = String(data.get("name") ?? "").trim();
      const extension = dialog.type === "create" && dialog.kind === "file" ? fileExtensions.find((value) => value === data.get("extension")) : undefined;
      const dot = enteredName.lastIndexOf(".");
      const name = extension && (dot < 1 || dot === enteredName.length - 1) ? `${enteredName.replace(/\.+$/, "")}.${extension}` : enteredName;
      if (!validDesktopName(enteredName) || !validDesktopName(name)) return "Use um nome com até 100 caracteres, contando a extensão. Evite barras e caracteres reservados.";
      const edited = dialog.type === "rename" ? dialog.entry : undefined;
      if (hasName(items, place, name, edited?.id)) return "Já existe um item com esse nome nesta pasta.";
      if (edited) {
        const error = commitItems(items.map((entry) => entry.id === edited.id ? { ...entry, name, modifiedAt: Date.now() } : entry));
        if (error) return error;
        if (edited.kind === "file") observe({ kind: "desktop-event", action: "rename", name, itemId: edited.id, previousName: edited.name });
        setNotice(`${edited.name} agora se chama ${name}.`);
      } else if (dialog.type === "create") {
        const base = { id: crypto.randomUUID(), name, parent: place, modifiedAt: Date.now(), slot: place === null ? nextDesktopSlot(items) : undefined };
        const app = desktopApps.find((option) => option === data.get("app"));
        if (dialog.kind === "shortcut" && !app) return "Escolha o destino do atalho.";
        const entry: DesktopEntry = dialog.kind === "shortcut" && app
          ? { ...base, kind: "shortcut", app }
          : { ...base, kind: dialog.kind === "folder" ? "folder" : "file" };
        const error = commitItems([...items, entry]);
        if (error) return error;
        setSelected(entry.id);
        setNotice(`${name} foi criado.`);
      }
    }
    setDialog(null);
    requestAnimationFrame(() => surface.current?.focus({ preventScroll: true }));
  }

  const actions: { label: string; run: () => void }[] = contextEntry?.deleted ? [
    { label: "Restaurar", run: () => { surface.current?.focus({ preventScroll: true }); restore(contextEntry); } },
    { label: "Excluir definitivamente…", run: () => setDialog({ type: "purge", entry: contextEntry }) },
  ] : contextEntry ? [
    { label: "Abrir", run: () => openItem(contextEntry) },
    { label: "Renomear…", run: () => setDialog({ type: "rename", entry: contextEntry }) },
    { label: "Copiar", run: () => markClipboard(contextEntry, false) },
    { label: "Recortar", run: () => markClipboard(contextEntry, true) },
    { label: "Mover para…", run: () => setDialog({ type: "move", entry: contextEntry }) },
    ...(contextEntry.kind === "folder" && clipboard ? [{ label: "Colar nesta pasta", run: () => paste(contextEntry.id) }] : []),
    { label: "Mover para a Lixeira", run: () => { surface.current?.focus({ preventScroll: true }); recycle(contextEntry); } },
  ] : place === trash ? [{ label: "Voltar à área de trabalho", run: () => showLocation({ ...explorer, open: false }) }] : [
    { label: "Nova pasta…", run: () => setDialog({ type: "create", kind: "folder" }) },
    { label: "Novo arquivo…", run: () => setDialog({ type: "create", kind: "file" }) },
    { label: "Novo atalho…", run: () => setDialog({ type: "create", kind: "shortcut" }) },
    ...(clipboard ? [{ label: "Colar aqui", run: () => paste(place) }] : []),
  ];

  return (
    <section className="desktop-lab" aria-label="Simulador de área de trabalho" onKeyDown={keyboardActions} inert={verifyingFile}>
      <div className="lab-screen">
      <div className="lab-surface" data-explorer={explorer.open} ref={surface} role="group" tabIndex={0} aria-label={locationName} aria-describedby={hintId}
        onContextMenu={(event) => {
          if (event.target instanceof HTMLInputElement) return;
          event.preventDefault();
          endSurfacePress();
          showMenu(undefined, event.currentTarget, { x: event.clientX, y: event.clientY });
        }}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget || (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10"))) return;
          event.preventDefault();
          const { left, top } = event.currentTarget.getBoundingClientRect();
          showMenu(undefined, event.currentTarget, { x: left + 8, y: top + 8 });
        }}
        onPointerDown={startSurfacePress}
        onPointerMove={(event) => {
          const press = surfacePress.current;
          if (press && event.isPrimary && Math.hypot(event.clientX - press.x, event.clientY - press.y) >= 7) endSurfacePress();
        }}
        onPointerUp={endSurfacePress} onPointerCancel={endSurfacePress}>
        {!explorer.open ? (
          <div className="lab-desktop-grid" ref={iconGrid} aria-label="Ícones da Área de trabalho" onClick={(event) => {
            if (!(event.target as HTMLElement).closest("button")) setSelected(null);
          }}>
            <div className="lab-slot">
              <button className="lab-desktop-icon" data-lab-trash data-drop={drag?.drop?.type === "trash"}
                onClick={(event) => { setSelected(null); if (event.detail === 0) goTo(trash); }}
                onDoubleClick={() => goTo(trash)}>
                <Trash2 size={36} aria-hidden="true" /><span>Lixeira</span>
              </button>
            </div>
            {Array.from({ length: Math.min(desktopSlotLimit, Math.max(screenSlots, ...visible.map((entry) => (entry.slot ?? 0) + 2))) }, (_, slot) => {
              const entry = visible.find((item) => item.slot === slot);
              return <div className="lab-slot" key={slot} data-lab-slot={slot} data-drop={drag?.drop?.type === "slot" && drag.drop.slot === slot}>
                {entry && entryButton(entry, true)}
              </div>;
            })}
          </div>
        ) : (
          <div className="lab-window" data-maximized={explorer.maximized}>
            <header className="lab-window-title">
              <h2><Folder size={21} aria-hidden="true" /> {locationName}</h2>
              <div className="lab-window-controls">
                <button type="button" aria-label="Minimizar janela" title="Minimizar janela" onClick={() => showLocation({ ...explorer, open: false })}><Minus size={19} /></button>
                <button type="button" aria-label={explorer.maximized ? "Restaurar tamanho da janela" : "Maximizar janela"}
                  title={explorer.maximized ? "Restaurar tamanho da janela" : "Maximizar janela"}
                  onClick={() => setExplorer({ ...explorer, maximized: !explorer.maximized })}>
                  {explorer.maximized ? <PanelTop size={19} /> : <Maximize2 size={19} />}
                </button>
                <button type="button" aria-label="Fechar janela" title="Fechar janela"
                  onClick={() => showLocation({ open: false, history: [null], index: 0, maximized: false })}><X size={21} /></button>
              </div>
            </header>
            <div className="lab-address-row">
              <div className="lab-history" role="group" aria-label="Histórico do explorador">
                <button type="button" aria-label="Voltar" title="Voltar" disabled={explorer.index === 0}
                  onClick={() => showLocation({ ...explorer, index: explorer.index - 1 })}><ArrowLeft size={19} /></button>
                <button type="button" aria-label="Avançar" title="Avançar" disabled={explorer.index === explorer.history.length - 1}
                  onClick={() => showLocation({ ...explorer, index: explorer.index + 1 })}><ArrowRight size={19} /></button>
                <button type="button" aria-label="Subir um nível" title="Subir um nível" disabled={place === null}
                  onClick={() => goTo(location?.parent ?? null)}><ArrowUp size={19} /></button>
              </div>
              <nav aria-label="Local atual" className="lab-path">
                <button type="button" onClick={() => goTo(null)} aria-current={place === null ? "location" : undefined}>
                  <Monitor size={18} aria-hidden="true" /> <span>Área de trabalho</span>
                </button>
                {place === trash && <><ChevronRight size={16} aria-hidden="true" /><span aria-current="location">Lixeira</span></>}
                {folderNames.map((folder) => <span key={folder.id} className="lab-path-part">
                  <ChevronRight size={16} aria-hidden="true" />
                  <button type="button" aria-current={place === folder.id ? "location" : undefined} onClick={() => goTo(folder.id)}>{folder.name}</button>
                </span>)}
              </nav>
              <label className="lab-search"><Search size={18} aria-hidden="true" />
                <input type="search" aria-label="Buscar nesta pasta" placeholder="Buscar itens" value={query}
                  onChange={(event) => { setQuery(event.target.value); setSelected(null); }} />
              </label>
            </div>
            <div className="lab-command-row" role="group" aria-label="Comandos do explorador">
              {place === trash ? (selectedEntry && <>
                <button type="button" onClick={() => { surface.current?.focus(); restore(selectedEntry); }}>Restaurar</button>
                <button type="button" onClick={() => setDialog({ type: "purge", entry: selectedEntry })}>Excluir definitivamente</button>
              </>) : <>
                <button type="button" className="lab-new" aria-haspopup="menu" onClick={(event) => showMenu(undefined, event.currentTarget)}><Plus size={19} /> Novo</button>
                <button type="button" title="Recortar" aria-label="Recortar" disabled={!selectedEntry} onClick={() => selectedEntry && markClipboard(selectedEntry, true)}><Scissors size={19} /></button>
                <button type="button" title="Copiar" aria-label="Copiar" disabled={!selectedEntry} onClick={() => selectedEntry && markClipboard(selectedEntry, false)}><Copy size={19} /></button>
                <button type="button" title="Colar" aria-label="Colar" disabled={!clipboard} onClick={() => paste(place)}><Clipboard size={19} /></button>
                <button type="button" title="Renomear" aria-label="Renomear" disabled={!selectedEntry} onClick={() => selectedEntry && setDialog({ type: "rename", entry: selectedEntry })}><SquarePen size={19} /></button>
                <button type="button" title="Mover para a Lixeira" aria-label="Mover para a Lixeira" disabled={!selectedEntry} onClick={() => selectedEntry && recycle(selectedEntry)}><Trash2 size={19} /></button>
              </>}
            </div>
            <div className="lab-window-body">
              <nav className="lab-places" aria-label="Pastas do explorador">
                <button type="button" onClick={() => goTo(null)} aria-current={place === null ? "location" : undefined}><Monitor size={19} /> Área de trabalho</button>
                {items.filter((entry) => (entry.id === "arquivos" || entry.id === "guia") && isAvailable(items, entry.id)).map((entry) => (
                  <button type="button" key={entry.id} data-lab-folder={entry.id} data-drop={drag?.drop?.type === "folder" && drag.drop.id === entry.id}
                    onClick={() => goTo(entry.id)} aria-current={place === entry.id ? "location" : undefined}><Folder size={19} /> {entry.name}</button>
                ))}
                <button type="button" data-lab-trash data-drop={drag?.drop?.type === "trash"} aria-current={place === trash ? "location" : undefined}
                  onClick={() => goTo(trash)}><Trash2 size={19} /> Lixeira</button>
              </nav>
              <div className="lab-window-files">
                <table className="lab-file-table" aria-label={`Itens em ${locationName}`}>
                  <thead><tr>{sortColumns.map(([column, label]) => <th key={column} scope="col" data-column={column}
                    aria-sort={sort.column === column ? (sort.descending ? "descending" : "ascending") : undefined}>
                    <button type="button" onClick={() => setSort({ column, descending: sort.column === column && !sort.descending })}>
                      {label}{sort.column === column && (sort.descending ? <ArrowDown size={16} aria-hidden="true" /> : <ArrowUp size={16} aria-hidden="true" />)}
                    </button>
                  </th>)}<th scope="col"><span className="sr-only">Ações</span></th></tr></thead>
                  <tbody>{fileRows.map(({ entry, type, size }) => <tr key={entry.id} data-selected={selected === entry.id}>
                    <td>{entryButton(entry)}</td>
                    <td data-column="modifiedAt">{entry.modifiedAt === undefined ? "—" : dateDisplay.format(entry.modifiedAt)}</td>
                    <td data-column="type">{type}</td>
                    <td data-column="size">{entry.kind === "file" ? (size < 1024 ? `${size} B` : `${(size / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} KB`) : "—"}</td>
                    <td><button type="button" className="lab-row-action" aria-label={`Ações de ${entry.name}`} aria-haspopup="menu"
                      onClick={(event) => showMenu(entry, event.currentTarget)}><Ellipsis size={21} /></button></td>
                  </tr>)}</tbody>
                </table>
                {fileRows.length === 0 && <p className="lab-empty">{search ? "Nenhum item encontrado." : place === trash ? "A Lixeira está vazia." : "Esta pasta está vazia."}</p>}
              </div>
            </div>
            <footer className="lab-window-footer">{fileRows.length} {fileRows.length === 1 ? "item" : "itens"}{selectedEntry && " · 1 selecionado"}</footer>
          </div>
        )}
      </div>
      {assistant}
      <nav className="lab-taskbar" aria-label="Barra de tarefas do simulador">
        <div className="lab-start" ref={startArea}>
          <button type="button" className="lab-start-toggle" ref={startButton} aria-expanded={startOpen} aria-controls={startId}
            onClick={() => { setMenu(null); setStartOpen(!startOpen); }}><Compass size={23} aria-hidden="true" /> Iniciar</button>
          <div className="lab-start-menu" id={startId} hidden={!startOpen} aria-label="Menu Iniciar">
            <button type="button" onClick={() => showLocation({ ...explorer, open: true })}><Folder size={22} /> Explorador de arquivos</button>
            {desktopApps.map((app) => {
              const Icon = startApps[app];
              return <button type="button" key={app} onClick={() => { setStartOpen(false); openApp(app); }}><Icon size={21} aria-hidden="true" /> {app}</button>;
            })}
            <button type="button" onClick={() => goTo(trash)}><Trash2 size={21} aria-hidden="true" /> Lixeira</button>
          </div>
        </div>
        <button type="button" title="Explorador de arquivos" aria-label="Explorador de arquivos" aria-pressed={explorer.open}
          onClick={() => showLocation({ ...explorer, open: !explorer.open })}><Folder size={23} aria-hidden="true" /> <span>Explorador</span></button>
        <button type="button" title="Navegador" aria-label="Navegador" onClick={() => openApp("Navegador")}><Globe size={22} aria-hidden="true" /></button>
        <button type="button" title="Lixeira" aria-label="Abrir Lixeira" data-lab-trash data-drop={drag?.drop?.type === "trash"}
          aria-pressed={place === trash} onClick={() => goTo(trash)}><Trash2 size={22} aria-hidden="true" /></button>
        <div className="lab-taskbar-end">
          <DesktopClock />
          <button type="button" title="Mostrar área de trabalho" aria-label="Mostrar área de trabalho" aria-pressed={!explorer.open}
            onClick={() => showLocation({ ...explorer, open: false })}><House size={21} aria-hidden="true" /></button>
        </div>
      </nav>
      </div>
      <p className="lab-notice" role="status">{notice}</p>
      <p className="lab-hint" id={hintId}>Abra itens com duplo clique ou Enter. Para ver as opções, use o botão direito ou mantenha pressionado um item ou espaço vazio. Com o teclado, use Tab para mover o foco e Shift + F10 para abrir o menu.</p>

      {drag && dragEntry && <div className="lab-drag" aria-hidden="true" style={{ left: drag.x + 12, top: drag.y + 12 }}><ItemIcon entry={dragEntry} /> {dragEntry.name}</div>}
      {menu && <div className="lab-menu" ref={popup} role="menu" aria-label={contextEntry ? `Ações de ${contextEntry.name}` : `Ações em ${locationName}`}
        onKeyDown={(event) => {
          if (event.key === "Escape") { event.preventDefault(); closeMenu(); return; }
          if (event.key === "Tab") { closeMenu(); return; }
          if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          const buttons = Array.from(event.currentTarget.querySelectorAll("button"));
          const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
          const target = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 :
            (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
          buttons[target]?.focus();
        }}>
        {actions.map(({ label, run }) => <button key={label} role="menuitem" tabIndex={-1} onClick={() => menuAction(run)}>{label}</button>)}
      </div>}
      {dialog && <DesktopDialog dialog={dialog} items={items} onClose={() => setDialog(null)} onSubmit={submitDialog} />}
    </section>
  );
}

function DesktopClock() {
  const [now, setNow] = useState<Date>();
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const interval = window.setInterval(tick, 15_000);
    return () => window.clearInterval(interval);
  }, []);
  return <time className="lab-clock" dateTime={now?.toISOString()}>
    {now && <><span>{now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span><span>{now.toLocaleDateString("pt-BR")}</span></>}
  </time>;
}

function DesktopDialog({ dialog, items, onClose, onSubmit }: {
  dialog: Dialog; items: DesktopEntry[]; onClose: () => void; onSubmit: (data: FormData) => string | undefined;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const node = ref.current;
    node?.showModal();
    node?.querySelector<HTMLElement>("[data-lab-autofocus]")?.focus();
    if (node?.querySelector<HTMLInputElement>("input[name=name]")) node.querySelector<HTMLInputElement>("input[name=name]")?.select();
    return () => { if (node?.open) node.close(); };
  }, []);

  const title = dialog.type === "create" ? defaultNames[dialog.kind] : {
    rename: "Renomear item", move: "Mover para outra pasta", purge: "Excluir definitivamente?",
  }[dialog.type];
  const initialName = dialog.type === "create" ? defaultNames[dialog.kind] : dialog.entry.name;
  const excluded = dialog.type === "move" ? subtree(items, dialog.entry.id) : undefined;
  const folders = excluded ? items.filter((item) => item.kind === "folder" && !excluded.has(item.id) && isAvailable(items, item.id)) : [];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(onSubmit(new FormData(event.currentTarget)) ?? "");
  }

  return (
    <dialog className="lab-dialog" ref={ref} aria-labelledby="lab-dialog-title" onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <h2 id="lab-dialog-title">{title}</h2>
      <form onSubmit={submit}>
          {(dialog.type === "create" || dialog.type === "rename") && (
            <label>Nome do item
              <input name="name" required maxLength={desktopNameLimit} data-lab-autofocus
                defaultValue={initialName} />
            </label>
          )}
          {dialog.type === "create" && dialog.kind === "shortcut" && (
            <label>Destino do atalho<select name="app">{desktopApps.map((app) => <option key={app}>{app}</option>)}</select></label>
          )}
          {dialog.type === "create" && dialog.kind === "file" && (
            <>
              <label>Tipo de arquivo
                <select name="extension" aria-describedby="lab-file-extension-help">
                  {fileExtensions.map((extension) => (
                    <option key={extension} value={extension}>{fileLabel(`arquivo.${extension}`)} (.{extension})</option>
                  ))}
                </select>
              </label>
              <p id="lab-file-extension-help">Se você digitar uma extensão no nome, ela vai definir o tipo do arquivo.</p>
            </>
          )}
          {dialog.type === "move" && (
            <label>Pasta de destino
              <select name="destination" data-lab-autofocus defaultValue={dialog.entry.parent ?? ""}>
                <option value="">Área de trabalho</option>
                {folders.map((folder) => {
                  const names = [folder.name];
                  for (let parent = items.find((item) => item.id === folder.parent); parent;
                    parent = items.find((item) => item.id === parent?.parent)) names.unshift(parent.name);
                  return <option value={folder.id} key={folder.id}>{names.join(" / ")}</option>;
                })}
              </select>
            </label>
          )}
          {dialog.type === "purge" && <p>Excluir {dialog.entry.name} e todo o seu conteúdo da Lixeira do simulador?</p>}
          {error && <p role="alert" className="lab-error">{error}</p>}
          <div className="lab-dialog-actions">
            <button className="secondary-btn" type="button" data-lab-autofocus={dialog.type === "purge" || undefined} onClick={onClose}>Cancelar</button>
            <button className="primary-btn">{dialog.type === "purge" ? "Excluir" : dialog.type === "move" ? "Mover" : dialog.type === "rename" ? "Salvar nome" : "Criar"}</button>
          </div>
      </form>
    </dialog>
  );
}
