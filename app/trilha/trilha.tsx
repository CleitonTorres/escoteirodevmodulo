"use client";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  Home,
  BookOpen,
  Keyboard,
  Folder,
  FileText,
  Code2,
  Table2,
  Globe,
  LogOut,
  Search,
  ChevronRight,
  Play,
  Check,
  Clock,
  Menu,
  X,
  Save,
  ArrowLeft,
  ArrowUpRight,
  Star,
  Compass,
  Lock,
  MapPin,
} from "lucide-react";
import { initialTypingDraft, isProgramacaoBasica, typingLevels, type Disciplina } from "@/data/disciplinas";
import type { Lesson } from "@/data/lessons";
import { lessonVideo } from "@/lib/lesson-video";
import { lessonUnlocked, taskDone, type PracticeEvent } from "@/lib/practice";
import { journalNoteLimit, type Progress } from "@/lib/storage";
import { typingMinimumScore, typingScore, type TypingAttempt } from "@/lib/typing-score";
import { sair } from "@/app/conta-actions";
import { concluirAula, registrarDigitacao, registrarPratica, salvarDiario, salvarGuia } from "@/app/progresso-actions";
import { FinishLesson, PracticeAssistant, PracticeChecklist, PracticeShortcuts } from "./lesson-practice";
import TypingPanel from "@/app/simuladores/digitacao/typing-panel";
import DesktopLab, { type ExplorerWindow } from "@/app/simuladores/area-de-trabalho/desktop-lab";
import { availableName, desktopCellLimit, desktopEntryAt, desktopFileApp, desktopPath, desktopSheetColumns, desktopSheetRows, desktopSizeError, desktopTextLimit, hasName, isAvailable, isCodeFile, isDesktopDocument, nextDesktopSlot, type DesktopFile, type FolderId } from "@/lib/desktop-files";
import { readWordDocument, wordFromText, type WordValue } from "@/lib/word-document";
import { useDesktopProgress } from "@/app/simuladores/area-de-trabalho/use-desktop-progress";
import WordEditor from "@/app/simuladores/editor-texto/word-editor";
import BrowserSimulator from "@/app/simuladores/navegador/browser-simulator";
import CodeEditor from "@/app/simuladores/editor-codigo/code-editor";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { sheetFromRows, sheetPlainText, sheetTextRows, type SheetWorkbook } from "@/lib/sheet-workbook";

const SheetEditor = dynamic(() => import("@/app/simuladores/planilha/sheet-editor"), {
  ssr: false,
  loading: () => <p role="status">Carregando o simulador de planilha…</p>,
});
const sheetExample = sheetFromRows("planilha-exemplo", "Planilha de exemplo", [
  ["Material", "Quantidade", "Preço unitário", "Subtotal"], ["Caderno", "2", "12.5"], ["Lápis", "4", "2"], ["Borracha", "1", "3.5"], ["Total"],
]);
const exampleCells = sheetExample.sheets["folha-1"].cellData!;
for (let row = 1; row <= 3; row++) exampleCells[row][3] = { f: `=B${row + 1}*C${row + 1}` };
exampleCells[4][3] = { f: "=SUM(D2:D4)" };
const localPageTags = new Set(
  "a article aside b blockquote br caption code dd div dl dt em figcaption figure footer h1 h2 h3 h4 h5 h6 header hr i li main nav ol p pre section small span strong style sub sup table tbody td th thead tr ul".split(" "),
);
const localPageAttributes = new Set(["class", "id", "style", "lang", "dir", "colspan", "rowspan"]);
const practiceTools = { arquivos: "Área de trabalho", digitacao: "Digitação", navegador: "Navegador" };
const trailDestination = { x: 292, y: 139 };

type GuideDraft = { value: WordValue; lessonId?: number };

type TrilhaProps = {
  nome: string;
  studentId: string;
  disciplina: Disciplina;
  opcoesDisciplinas: Pick<Disciplina, "id" | "nome">[];
  initialProgress: Progress;
  preview?: { lessonId?: number };
};

export default function Trilha({ nome, studentId, disciplina, opcoesDisciplinas, initialProgress, preview }: TrilhaProps) {
  const { aulas: lessons, meses: monthNames } = disciplina;
  const programming = isProgramacaoBasica(disciplina);
  const guideLabel = programming ? "Diário" : "Meu guia";
  const previewStart = preview?.lessonId;
  const router = useRouter();
  const [preparingDiscipline, setPreparingDiscipline] = useState(false);
  const [navigationPending, startTransition] = useTransition();
  const [disciplineError, setDisciplineError] = useState("");
  const switchingDiscipline = preparingDiscipline || navigationPending;
  const [view, setView] = useState(previewStart === undefined ? "Início" : "Aula"),
    [selected, setSelected] = useState<number | undefined>(previewStart ?? lessons[0]?.id),
    [progress, setProgress] = useState(initialProgress),
    [query, setQuery] = useState(""),
    [mobile, setMobile] = useState(false),
    [tab, setTab] = useState("Visão geral"),
    [level, setLevel] = useState(0),
    [typingDraft, setTypingDraft] = useState(() => initialTypingDraft(0)),
    [explorer, setExplorer] = useState<ExplorerWindow>({ open: false, history: [null], index: 0, maximized: false }),
    [openFileId, setOpenFileId] = useState<string | null>(null),
    [desktopEditError, setDesktopEditError] = useState(""),
    [guideDraft, setGuideDraft] = useState<GuideDraft>(() => {
      const legacy = wordFromText(initialProgress.guide, true);
      const value = readWordDocument(initialProgress.guideDocument ?? legacy) ?? { document: legacy, text: initialProgress.guide };
      return { value };
    }),
    [sheet, setSheet] = useState(sheetExample),
    [sheetReset, setSheetReset] = useState(0);
  const [guideState, setGuideState] = useState({ checked: guideDraft, error: "" });
  const [guidePending, setGuidePending] = useState(false);
  const guideSaved = useRef(guideDraft);
  const savingGuide = useRef<Promise<boolean> | null>(null);
  const finishSheetEditing = useRef<(() => Promise<boolean>) | null>(null);
  const contentRef = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeMenuButton = useRef<HTMLButtonElement>(null);
  const [guideChanged, setGuideChanged] = useState(false);
  const [journalDrafts, setJournalDrafts] = useState<Progress["journal"]>({});
  const [journalStatus, setJournalStatus] = useState<{ id: number; error?: string; saved?: boolean }>();
  const [journalPending, setJournalPending] = useState(false);
  const savingJournal = useRef<Promise<boolean> | null>(null);
  const [typingPending, setTypingPending] = useState(0);
  const [typingResult, setTypingResult] = useState<TypingAttempt | null>(null);
  const [typingSaveError, setTypingSaveError] = useState("");
  const [practicing, setPracticing] = useState(false);
  const [assistantMinimized, setAssistantMinimized] = useState(false);
  const [practicePending, setPracticePending] = useState(0);
  const [verifyingFile, setVerifyingFile] = useState(false);
  const [practiceFailure, setPracticeFailure] = useState<{ event: PracticeEvent; message: string } | null>(null);
  const practiceQueue = useRef<Promise<unknown>>(Promise.resolve());
  const desktop = useDesktopProgress(disciplina.id, initialProgress.desktop);
  const desktopItems = desktop.items;
  const desktopView = view === "Área de trabalho";
  const simulatorView = desktopView || ["Editor de texto", "Editor de código", "Planilha", "Navegador", "Digitação"].includes(view);
  const openFile = desktopItems.find((item): item is DesktopFile => item.id === openFileId && item.kind === "file");
  const codeFiles = view === "Editor de código" && !openFile
    ? desktopItems.filter((item): item is DesktopFile => item.kind === "file" && isCodeFile(item.name) && isAvailable(desktopItems, item.id))
    : [];
  const guideError = guideState.checked === guideDraft ? guideState.error : undefined;
  const guideUnsaved = guidePending || guideState.checked !== guideDraft || Boolean(guideError);

  const submitGuide = useCallback((draft: GuideDraft) => {
    if (savingGuide.current) return savingGuide.current;
    setGuidePending(true);
    savingGuide.current = salvarGuia(disciplina.id, draft.value.text, draft.value.document, draft.lessonId, previewStart).then((result) => {
      if (result.ok) {
        guideSaved.current = draft;
        const id = result.guideEditedLesson;
        if (id !== undefined) setProgress((current) => current.guideEditedLessons?.includes(id) ? current
          : { ...current, guideEditedLessons: [...(current.guideEditedLessons ?? []), id] });
      }
      setGuideState({ checked: draft, error: result.ok ? "" : result.error });
      return result.ok;
    }).catch(() => {
      setGuideState({ checked: draft, error: "Não foi possível salvar o guia. Tente novamente." });
      return false;
    }).finally(() => {
      savingGuide.current = null;
      setGuidePending(false);
    });
    return savingGuide.current;
  }, [disciplina.id, previewStart]);

  useEffect(() => {
    if (guidePending || guideState.checked === guideDraft) return;
    const delay = window.setTimeout(() => void submitGuide(guideDraft), 600);
    return () => window.clearTimeout(delay);
  }, [guideDraft, guidePending, guideState.checked, submitGuide]);

  useEffect(() => {
    if (!guideUnsaved) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [guideUnsaved]);

  useEffect(() => {
    if (mobile) closeMenuButton.current?.focus();
  }, [mobile]);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 56rem)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (!event.matches) setMobile(false);
    };
    narrow.addEventListener("change", closeOnDesktop);
    return () => narrow.removeEventListener("change", closeOnDesktop);
  }, []);

  const guideEditorProps = {
    name: "Meu Guia Digital",
    value: guideDraft.value,
    onChange: (value: WordValue) => {
      setGuideChanged(true);
      setGuideDraft({ value, lessonId: view === "Aula" && tab === "Meu guia" ? selected : undefined });
    },
    saved: guideChanged && !guideUnsaved,
    pending: guidePending,
    error: guideError,
    save: () => {
      if (guideUnsaved) void submitGuide(guideDraft);
    },
  };

  const lesson = lessons.find((x) => x.id === selected);
  const note = lesson ? journalDrafts?.[lesson.id] ?? progress.journal?.[lesson.id] ?? "" : "";
  const noteDirty = Boolean(lesson && note !== (progress.journal?.[lesson.id] ?? ""));
  const codeTasks = lesson?.practice.flatMap(({ id, check }) => {
    if (check.kind !== "code") return [];
    const entry = desktopEntryAt(desktopItems, check.file);
    return [{ id, check, file: entry?.kind === "file" ? entry : undefined }];
  }) ?? [];
  const [codeOpenError, setCodeOpenError] = useState("");
  const practiceProgress = { ...progress, desktop: { items: desktopItems, revision: 0 } };
  const lessonCompleted = Boolean(lesson && progress.completed.includes(lesson.id));
  const pendingTasks = lesson?.practice.filter((task) => !taskDone(lesson.id, task, practiceProgress)) ?? [];
  const tasksDone = (lesson?.practice.length ?? 0) - pendingTasks.length;
  const hasPractice = Boolean(lesson?.practice.length || lesson?.exercise?.length);
  const assistantTask = pendingTasks[0];
  const practiceAssistant = practicing && simulatorView && lesson?.practice.length && (!lessonCompleted || assistantTask) ? (
    <PracticeAssistant task={assistantTask} minimized={assistantMinimized} guideLabel={guideLabel}
      toggle={() => setAssistantMinimized((minimized) => !minimized)} openGuide={openGuide} />
  ) : null;
  const followingLesson = lesson && lessons[lessons.indexOf(lesson) + 1];
  const practiceTool = lesson?.tool && practiceTools[lesson.tool];
  const initials = nome.trim().split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0]).join("").toUpperCase();
  const pendingLessons = lessons.filter((item) => !progress.completed.includes(item.id));
  const completedCount = lessons.length - pendingLessons.length;
  const previewIndex = previewStart === undefined ? 0 : Math.max(0, lessons.findIndex(({ id }) => id === previewStart));
  const homeLessons = previewIndex === 0 ? lessons : lessons.slice(previewIndex);
  const homePendingLessons = previewIndex === 0 ? pendingLessons : homeLessons.filter(({ id }) => !progress.completed.includes(id));
  const nextLesson = homePendingLessons[0] ?? homeLessons.at(-1);

  async function flushWork() {
    if (finishSheetEditing.current && !await finishSheetEditing.current()) return false;
    if (!await desktop.flush()) return false;
    if (programming && lesson && (noteDirty || savingJournal.current) && !await submitJournal(lesson.id, note)) return false;
    await savingGuide.current;
    return guideSaved.current === guideDraft || await submitGuide(guideDraft);
  }

  function submitJournal(id: number, text: string) {
    if (savingJournal.current) return savingJournal.current;
    setJournalPending(true);
    setJournalStatus({ id });
    savingJournal.current = salvarDiario(disciplina.id, id, text, previewStart).then((result) => {
      if (!result.ok) { setJournalStatus({ id, error: result.error }); return false; }
      setProgress((current) => ({ ...current, journal: { ...current.journal, [id]: text } }));
      setJournalStatus({ id, saved: true });
      return true;
    }).catch(() => {
      setJournalStatus({ id, error: "Não foi possível salvar a anotação. Tente novamente." });
      return false;
    }).finally(() => { savingJournal.current = null; setJournalPending(false); });
    return savingJournal.current;
  }

  async function complete(id: number) {
    if (!await flushWork()) return "Não foi possível salvar as alterações. Tente concluir a aula novamente.";
    const result = await concluirAula(disciplina.id, id, previewStart);
    if (!result.ok) return result.error;
    setProgress((current) => current.completed.includes(id)
      ? current
      : { ...current, completed: [...current.completed, id] });
  }

  function observePractice(event: PracticeEvent) {
    if (!practicing || !lesson || (lessonCompleted && event.kind !== "quiz") || !lesson.practice.some(({ check }) =>
      check.kind === event.kind && (check.kind !== "desktop-event" ||
        (event.kind === "desktop-event" && check.action === event.action && check.name.localeCompare(event.name, "pt-BR", { sensitivity: "base" }) === 0)),
    )) return Promise.resolve({});
    const fileOperation = event.kind === "desktop-event" && event.action !== "open";
    if (fileOperation) setVerifyingFile(true);
    setPracticePending((count) => count + 1);
    setPracticeFailure(null);
    setCodeOpenError("");
    const request = practiceQueue.current.then(async () => {
      if (event.kind === "desktop-event" && !await desktop.flush()) throw new Error();
      const result = await registrarPratica(disciplina.id, lesson.id, event, previewStart);
      if (!result.ok) {
        setPracticeFailure({ event, message: result.error });
        return null;
      }
      if (fileOperation && Object.keys(result.evidence).length === 0) {
        setPracticeFailure({ event, message: "Confira o nome do arquivo e a ordem das tarefas. Depois, tente novamente." });
        return null;
      }
      setProgress((current) => ({ ...current, practiceEvidence: { ...current.practiceEvidence, ...result.evidence } }));
      return result.evidence;
    }).catch(() => {
      setPracticeFailure({ event, message: "Não foi possível verificar a tarefa. Tente novamente." });
      return null;
    }).finally(() => {
      setPracticePending((count) => count - 1);
      if (fileOperation) setVerifyingFile(false);
    });
    practiceQueue.current = request;
    return request;
  }

  async function saveTyping(attempt: TypingAttempt) {
    if (attempt.level <= progress.typingBest) return;
    setTypingSaveError("");
    setTypingPending((current) => current + 1);
    try {
      const result = await registrarDigitacao(disciplina.id, attempt);
      if (!result.ok) {
        setTypingSaveError(result.error);
        return;
      }
      setProgress((current) => ({ ...current, typingBest: Math.max(current.typingBest, attempt.level) }));
    } catch {
      setTypingSaveError("Não foi possível salvar a nota. Tente novamente.");
    } finally {
      setTypingPending((current) => current - 1);
    }
  }

  const filtered = lessons.filter((x) =>
    x.title.toLowerCase().includes(query.toLowerCase()),
  );
  const months = [...new Set(filtered.map(({ month }) => month))].sort((a, b) => a - b);
  const pct = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;
  const nav = [
    ["Início", Home],
    ["Aulas", BookOpen],
    ["Digitação", Keyboard],
    ["Área de trabalho", Folder],
    ["Editor de texto", FileText],
    ["Editor de código", Code2],
    ["Planilha", Table2],
    ["Navegador", Globe],
  ] as const;

  function focusContent() {
    requestAnimationFrame(() => contentRef.current?.querySelector("h1")?.focus());
  }

  function closeMobileMenu() {
    setMobile(false);
    requestAnimationFrame(() => menuButton.current?.focus());
  }

  async function navigateWithProgress(destination: string) {
    if (switchingDiscipline || typingPending || practicePending) return;
    setPreparingDiscipline(true);
    setDisciplineError("");
    const saveError = "Não foi possível salvar suas alterações. Tente novamente.";
    try {
      if (!await flushWork()) {
        setDisciplineError(saveError);
        return;
      }
      startTransition(() => router.replace(destination));
    } catch {
      setDisciplineError(saveError);
    } finally {
      setPreparingDiscipline(false);
    }
  }

  function switchDiscipline(id: string) {
    if (id === disciplina.id) return;
    const path = preview ? "/gestao/visualizar" : "/";
    void navigateWithProgress(`${path}?disciplina=${encodeURIComponent(id)}`);
  }

  function canOpenLesson(id: number) {
    return lessonUnlocked(lessons, progress.completed, id, previewStart);
  }

  function startLesson(id: number) {
    if (!canOpenLesson(id) || practicePending) return;
    setPracticing(false);
    setAssistantMinimized(false);
    setPracticeFailure(null);
    setOpenFileId(null);
    setSelected(id);
    setView("Aula");
    setTab("Visão geral");
    changeTypingLevel(0);
    setMobile(false);
    focusContent();
  }
  function changeView(v: string, afterNavigate?: () => void) {
    const navigate = () => {
      if (view === "Aula" && v === "Área de trabalho" && lesson?.practice.length) setPracticing(true);
      setOpenFileId(null);
      setDesktopEditError("");
      setCodeOpenError("");
      setView(v);
      setMobile(false);
      if (v === "Digitação") setTab("Digitação");
      afterNavigate?.();
      focusContent();
    };
    const finish = finishSheetEditing.current;
    if (view !== "Planilha" || !finish) { navigate(); return; }
    if (v === view && !openFile) { setMobile(false); focusContent(); return; }
    void finish().then((saved) => {
      if (saved || window.confirm("Há alterações da planilha que não podem ser salvas. Sair da planilha mesmo assim?")) navigate();
    });
  }

  function openPractice() {
    setPracticing(true);
    changeView("Aula", () => setTab("Prática"));
  }
  function openGuide() {
    changeView("Aula", () => setTab("Meu guia"));
  }
  function openDesktopFile(file: DesktopFile) {
    const app = desktopFileApp(file.name);
    changeView(programming && app === "Navegador" ? "Editor de código" : app, () => setOpenFileId(file.id));
  }
  function openCode(file: DesktopFile) {
    changeView("Editor de código", () => setOpenFileId(file.id));
  }
  function createCodeFile(name: string, parent: FolderId) {
    if (hasName(desktopItems, parent, name)) {
      setCodeOpenError("Já existe um item com esse nome na pasta.");
      return;
    }
    const file: DesktopFile = { id: crypto.randomUUID(), name, kind: "file", parent, modifiedAt: Date.now(), text: "",
      ...(parent === null && { slot: nextDesktopSlot(desktopItems) }) };
    const error = desktop.changeItems((items) => [...items, file]);
    if (error) { setCodeOpenError(error); return; }
    openCode(file);
  }
  function newCodeFile() {
    const folder = desktopEntryAt(desktopItems, ["Arquivos"]);
    const parent = folder?.kind === "folder" ? folder.id : null;
    createCodeFile(availableName(desktopItems, parent, "Novo arquivo.js"), parent);
  }
  function openCodeTask(task: (typeof codeTasks)[number]) {
    setCodeOpenError("");
    setPracticing(true);
    if (task.file) { openCode(task.file); return; }
    const { check } = task;
    const parent = desktopEntryAt(desktopItems, check.file.slice(0, -1));
    if (!check.quickStart || (check.file.length > 1 && parent?.kind !== "folder")) {
      setCodeOpenError("Crie o arquivo na pasta indicada na Área de trabalho.");
      return;
    }
    createCodeFile(check.file.at(-1)!, parent?.id ?? null);
  }
  function updateFile(items: typeof desktopItems, id: string, content: Pick<DesktopFile, "text" | "document" | "workbook">) {
    const modifiedAt = Date.now();
    return items.map((item) => item.id === id && item.kind === "file"
      ? { ...item, text: content.text?.slice(0, desktopTextLimit), cells: undefined, document: content.document, workbook: content.workbook, modifiedAt } : item);
  }
  function editDesktopFile(id: string, content: Pick<DesktopFile, "text" | "document" | "workbook">) {
    const error = desktop.changeItems((items) => updateFile(items, id, content));
    setDesktopEditError(error ?? "");
  }
  function changeTypingLevel(next: number) {
    if (!Number.isInteger(next) || next < 0 || next >= typingLevels.length || next > progress.typingBest) return;
    setLevel(next);
    setTypingDraft(initialTypingDraft(next));
    setTypingResult(null);
    setTypingSaveError("");
  }

  function completeTypingLevel(attempt: TypingAttempt) {
    setTypingResult(attempt);
    if (typingScore(attempt.level, attempt.elapsedMs, attempt.errors) >= typingMinimumScore) void saveTyping(attempt);
  }

  const typingPanelProps = {
    level,
    draft: typingDraft,
    setLevel: changeTypingLevel,
    setDraft: setTypingDraft,
    onComplete: completeTypingLevel,
    onRetrySave: () => { if (typingResult) void saveTyping(typingResult); },
    result: typingResult,
    saving: typingPending > 0,
    saveError: typingSaveError,
    best: progress.typingBest,
  };
  const progressCard = (
    <div className="progress-card">
      <div className="progress-top">
        <span>Seu progresso</span>
        <strong>{pct}%</strong>
      </div>
      <div className="progress-track" aria-hidden="true">
        <i style={{ width: `${pct}%` }} />
      </div>
      <small>{completedCount} de {lessons.length} aulas concluídas</small>
    </div>
  );
  const desktopSave = desktop.state.status === "error" ? (
    <div className="desktop-save" data-error>
      <p role="alert">{desktop.state.message}</p>
      <button type="button" className="secondary-btn" onClick={() => void desktop.flush()}>Tentar salvar</button>
    </div>
  ) : (
    <div className="desktop-save" role="status"><Save size={18} aria-hidden="true" />{
      desktop.state.status === "pending" ? "Salvando desktop…" : desktop.state.status === "saved" ? "Desktop salvo na sua conta" : "Salvamento automático"
    }</div>
  );

  //Menu lateral.
  const sidebar = (
    <aside
      id="menu-trilha"
      className={`sidebar ${mobile ? "open" : ""}`}
      role={mobile ? "dialog" : undefined}
      aria-modal={mobile || undefined}
      aria-label="Menu da trilha"
      onKeyDown={(event) => {
        if (mobile && event.key === "Escape") closeMobileMenu();
      }}
    >
      <div className="brand">
        <div className="brand-mark">
          <Compass size={24} />
        </div>
        <div>
          <b>Aprender Trilha Digital</b>
          <small>19º GE Coqueiral</small>
        </div>
        <button ref={closeMenuButton} className="close-mobile" onClick={closeMobileMenu} aria-label="Fechar menu">
          <X size={22} aria-hidden="true" />
        </button>
      </div>
      <div className="group-tag">
        <span className="tag-dot" /> ESCOTEIRO DEV
      </div>
      <div className="discipline-picker">
        <label htmlFor="disciplina-aluno">Disciplina</label>
        <select
          id="disciplina-aluno"
          value={disciplina.id}
          disabled={switchingDiscipline || typingPending > 0 || practicePending > 0}
          onChange={(event) => void switchDiscipline(event.target.value)}
        >
          {opcoesDisciplinas.map(({ id, nome }) => <option key={id} value={id}>{nome}</option>)}
        </select>
        {switchingDiscipline && <small role="status">Salvando alterações…</small>}
        {disciplineError && <small role="alert">{disciplineError}</small>}
      </div>
      <nav aria-label="Navegação da trilha">
        {preview && <button type="button" className="nav-item" disabled={switchingDiscipline || typingPending > 0 || practicePending > 0}
          onClick={() => {
            const query = new URLSearchParams({ secao: "catalogo", disciplina: disciplina.id });
            if (lesson) query.set("aula", String(lesson.id));
            void navigateWithProgress(`/gestao?${query}`);
          }}>
          <ArrowLeft size={18} aria-hidden="true" /> Voltar à gestão
        </button>}
        {nav.map(([label, Icon]) => (
          <button
            key={label}
            className={`nav-item ${view === label || (view === "Aula" && label === "Aulas") ? "active" : ""}`}
            aria-current={view === label || (view === "Aula" && label === "Aulas") ? "page" : undefined}
            disabled={switchingDiscipline}
            onClick={() => changeView(label)}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
            {label === "Aulas" && <span className="nav-count">{lessons.length}</span>}
          </button>
        ))}
      </nav>
      {progressCard}
      <div className="sidebar-note">
        <Star size={15} />
        <span>
          Aprender fazendo.
          <br />
          <b>Descobrir para crescer.</b>
        </span>
      </div>
      <div className="sidebar-footer">
        <div className="avatar" aria-hidden="true">{initials}</div>
        <div className="profile-name">
          <b title={nome}>{nome}</b>
          <small>{preview ? "Visualização de aula" : "Aluno da Trilha Digital"}</small>
        </div>
        <form action={async () => {
          const sheetReady = await finishSheetEditing.current?.() ?? true;
          if (sheetReady && await desktop.flush()) await sair();
          else {
            setMobile(false);
            if (window.confirm("Há alterações pendentes no desktop. Sair e descartar essas alterações?")) await sair();
          }
        }} onSubmit={(event) => {
          if (guideUnsaved && !window.confirm("Há alterações no guia aguardando salvamento. Sair mesmo assim?")) event.preventDefault();
        }}>
          <button className="logout-btn" type="submit" aria-label="Sair da conta" title="Sair da conta" disabled={switchingDiscipline}><LogOut size={17} /></button>
        </form>
      </div>
    </aside>
  );
  return (
    <div className="app-shell">
      <a className="skip-link" href="#conteudo-principal" tabIndex={mobile ? -1 : undefined}>Ir para o conteúdo</a>
      {sidebar}
      {mobile && <div className="scrim" aria-hidden="true" onClick={closeMobileMenu} />}
      <div className="main" inert={mobile || switchingDiscipline}>
        <header className="topbar">
          <button ref={menuButton} className="mobile-menu" onClick={() => setMobile(true)} aria-expanded={mobile} aria-controls="menu-trilha">
            <Menu size={21} aria-hidden="true" /> Menu
          </button>
          <div className="breadcrumbs">
            <span className="breadcrumbs-section">Trilha de aprendizagem</span> <ChevronRight size={14} aria-hidden="true" />
            <b>{view === "Aula" ? `Aula ${selected}` : view}</b>
          </div>
          <div className="top-actions">
            <span className="today">
              <span className="online-dot" /> {disciplina.nome}
            </span>
            <div className="avatar small-avatar" aria-hidden="true">{initials}</div>
          </div>
        </header>
        <main className={`content${desktopView ? " desktop-content" : view === "Planilha" ? " training-sheet-content" : ""}`} id="conteudo-principal" ref={contentRef} tabIndex={-1}>
          {practicing && lesson && simulatorView && (
            <section className="practice-tools" aria-label="Prática da aula">
              <button type="button" className="secondary-btn" onClick={openPractice}>
                <ArrowLeft size={18} aria-hidden="true" /> Voltar às tarefas da aula
              </button>
              <details>
                <summary>{tasksDone} de {lesson.practice.length} tarefas cumpridas</summary>
                <PracticeChecklist lesson={lesson} progress={practiceProgress} />
              </details>
            </section>
          )}
          {practicing && practicePending > 0 && <p className="practice-notice" role="status">Verificando prática…</p>}
          {practicing && practiceFailure && <div className="practice-notice" role="alert">
            <p>{practiceFailure.message}</p>
            <button type="button" className="secondary-btn" disabled={practicePending > 0} onClick={() => void observePractice(practiceFailure.event)}>
              Repetir verificação
            </button>
          </div>}
          {openFile && <div className="desktop-file-return">
            <button className="secondary-btn" onClick={() => changeView("Área de trabalho")}>
              <ArrowLeft size={20} aria-hidden="true" /> Voltar à área de trabalho
            </button>
            {desktopSave}
          </div>}
          {!openFile && !desktopView && desktop.state.status === "error" && desktopSave}
          {openFile && desktopEditError && <p className="account-notice" role="alert">{desktopEditError}</p>}
          {view === "Início" && (
            <>
              <div className="welcome-banner">
                <div className="banner-copy">
                  <span className="eyebrow">
                    19º GRUPO ESCOTEIRO COQUEIRAL · EDUCAÇÃO PARA A VIDA
                  </span>
                  <h1 tabIndex={-1}>
                    Aventura que ensina.
                    <br />
                    <em>Descobertas no mundo digital.</em>
                  </h1>
                  <p>
                    Aprenda fazendo, um passo de cada vez.
                  </p>
                  {nextLesson && <button
                    className="primary-btn"
                    disabled={practicePending > 0}
                    onClick={() => startLesson(nextLesson.id)}
                  >
                    <Play size={16} fill="currentColor" /> Continuar aprendendo{" "}
                    <ChevronRight size={16} />
                  </button>}
                </div>
                <div className="banner-art" aria-hidden="true">
                  <Image 
                    src={"/logo.png"} 
                    alt="logo"
                    width={100} 
                    height={100}
                    quality={100}
                    />
                  <div className="sun-glow" />
                  <svg className="banner-landscape" viewBox="0 0 400 208" preserveAspectRatio="none">
                    <path className="banner-hill-back" d="M 0 181 C 95 167, 172 143, 255 138 C 309 132, 358 133, 400 147 V 208 H 0 Z" />
                    <path className="banner-hill-front" d="M 0 166 C 100 153, 192 166, 249 208 H 0 Z" />
                    <path className="banner-trail" d={`M 118 214 C 139 192, 194 189, 243 181 C 278 175, 302 170, 279 160 C 261 152, 224 158, 228 149 C 231 142, 263 145, ${trailDestination.x} ${trailDestination.y}`} />
                    <MapPin className="banner-destination" x={trailDestination.x - 20} y={trailDestination.y - 36}
                      size={40} strokeWidth={2.2} />
                  </svg>
                </div>
                <div className="banner-foot">
                  <span>
                    <span className="online-dot" /> APRENDER FAZENDO
                  </span>
                  <span>ARACRUZ · ESPÍRITO SANTO</span>
                </div>
              </div>
              <div className="section-title">
                <div>
                  <span className="eyebrow">SUA PRÓXIMA DESCOBERTA</span>
                  <h2>Continue sua trilha</h2>
                </div>
                {lessons.length > 0 && <button
                  className="link-button"
                  onClick={() => changeView("Aulas")}
                >
                  Ver todas as aulas <ArrowUpRight size={15} />
                </button>}
              </div>
              {lessons.length === 0 && <p>As aulas desta disciplina ainda serão cadastradas.</p>}
              <div className="lesson-grid">
                {(homePendingLessons.length ? homePendingLessons.slice(0, 3) : homeLessons.slice(-3))
                  .map((l, i) => (
                    <button
                      className={`lesson-card ${i === 0 ? "featured" : ""}`}
                      key={l.id}
                      disabled={!canOpenLesson(l.id) || practicePending > 0}
                      onClick={() => startLesson(l.id)}
                    >
                      <div className="lesson-card-top">
                        <span className="lesson-icon">{l.icon}</span>
                        <span
                          className={`status-pill ${progress.completed.includes(l.id) ? "done" : ""}`}
                        >
                          {progress.completed.includes(l.id) ? (
                            <>
                              <Check size={12} /> Concluída
                            </>
                          ) : !canOpenLesson(l.id) ? (
                            <><Lock size={16} aria-hidden="true" /> Bloqueada</>
                          ) : (
                            `AULA ${String(l.id).padStart(2, "0")}`
                          )}
                        </span>
                      </div>
                      <span className="card-month">
                        MÊS {l.month}{monthNames?.[l.month] && ` · ${monthNames[l.month]}`}
                      </span>
                      <h3>{l.title}</h3>
                      <p>{l.subtitle}</p>
                      <span className="card-bottom">
                        <span>
                          <Clock size={14} /> 35 min
                        </span>
                        <span className="circle-arrow">
                          <ChevronRight size={16} />
                        </span>
                      </span>
                    </button>
                  ))}
              </div>
              <div className="home-lower">
                <div className="quick-tools">
                  <div className="section-title compact">
                    <div>
                      <span className="eyebrow">ESPAÇO DE PRÁTICA</span>
                      <h2>Ferramentas de aprendizagem</h2>
                    </div>
                  </div>
                  <div className="tool-row">
                    {[
                      ["Digitação", Keyboard, "Pratique suas teclas"],
                      ["Área de trabalho", Folder, "Organize arquivos"],
                      ["Editor de texto", FileText, "Escreva seu guia"],
                      ["Editor de código", Code2, "Escreva e teste código"],
                      ["Planilha", Table2, "Organize informações"],
                      ["Navegador", Globe, "Pesquise com cuidado"],
                    ].map(([n, I, d]) => {
                      const Icon = I as typeof Home;
                      return (
                        <button
                          className="tool-tile"
                          key={n as string}
                          onClick={() => changeView(n as string)}
                        >
                          <span className="tool-icon">
                            <Icon size={19} />
                          </span>
                          <b>{n as string}</b>
                          <small>{d as string}</small>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="quote-card">
                  <span className="quote-mark">“</span>
                  <p>
                    Na natureza e na comunidade, cada descoberta é uma
                    oportunidade de crescer.
                  </p>
                  <span>APRENDER - TRILHA DIGITAL · APRENDER FAZENDO</span>
                </div>
              </div>
            </>
          )}
          {view === "Aulas" && (
            <>
              <div className="page-heading">
                <span className="eyebrow">SEU MAPA DE DESCOBERTAS</span>
                <h1 tabIndex={-1}>Trilha de aulas</h1>
                <p>{disciplina.nome}</p>
              </div>
              {lessons.length > 0 && <div className="search-box">
                <Search size={17} />
                <input
                  aria-label="Buscar uma aula"
                  placeholder="Buscar uma aula…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>}
              {lessons.length === 0 && <p>As aulas desta disciplina ainda serão cadastradas.</p>}
              {lessons.length > 0 && filtered.length === 0 && <p>Nenhuma aula encontrada.</p>}
              {months.map((m) => (
                <section className="month-section" key={m}>
                  <div className="month-heading">
                    <span className="month-number" aria-hidden="true">{String(m).padStart(2, "0")}</span>
                    <div>
                      {monthNames?.[m] && <small>MÊS {m}</small>}
                      <h2>{monthNames?.[m] ?? `Mês ${m}`}</h2>
                    </div>
                    <span className="month-line" />
                  </div>
                  <div className="all-lessons">
                    {filtered
                      .filter((l) => l.month === m)
                      .map((l) => (
                        <button
                          key={l.id}
                          className="all-lesson"
                          disabled={!canOpenLesson(l.id) || practicePending > 0}
                          onClick={() => startLesson(l.id)}
                        >
                          <span className="lesson-icon">{l.icon}</span>
                          <div>
                            <small>AULA {String(l.id).padStart(2, "0")}</small>
                            <b>{l.title}</b>
                            <p>{l.subtitle}</p>
                          </div>
                          <span
                            className={`status-dot ${progress.completed.includes(l.id) ? "complete" : ""}`}
                          >
                            {progress.completed.includes(l.id) ? (
                              <><Check size={14} aria-hidden="true" /><span className="sr-only">Concluída</span></>
                            ) : !canOpenLesson(l.id) ? (
                              <><Lock size={16} aria-hidden="true" /><span className="sr-only">Bloqueada</span></>
                            ) : (
                              <ChevronRight size={15} />
                            )}
                          </span>
                        </button>
                      ))}
                  </div>
                </section>
              ))}
            </>
          )}
          {view === "Aula" && lesson && canOpenLesson(lesson.id) && (
            <>
              <div className="lesson-hero">
                <button
                  className="back-link"
                  onClick={() => changeView("Aulas")}
                >
                  ‹ Todas as aulas
                </button>
                <div className="lesson-hero-row">
                  <div>
                    <span className="eyebrow">
                      MÊS {lesson.month} · AULA{" "}
                      {String(lesson.id).padStart(2, "0")}
                    </span>
                    <h1 tabIndex={-1}>{lesson.title}</h1>
                    <p>{lesson.subtitle}</p>
                  </div>
                  <div className="lesson-big-icon">{lesson.icon}</div>
                </div>
                <div className="lesson-meta">
                  <span>
                    <Clock size={14} /> 35 min
                  </span>
                  {lesson.practice.length > 0 && <span>
                    <BookOpen size={14} /> {lesson.practice.length} tarefas práticas
                  </span>}
                  <span className="lesson-progress">
                    {progress.completed.includes(lesson.id)
                      ? "Aula concluída"
                      : "Em andamento"}
                  </span>
                </div>
              </div>
              <div className="lesson-tabs" role="group" aria-label="Etapas da aula">
                {[
                  "Visão geral",
                  "Digitação",
                  "Teoria",
                  "Prática",
                  "Meu guia",
                ].map((t) => (
                  <button
                    key={t}
                    className={tab === t ? "selected" : ""}
                    aria-pressed={tab === t}
                    onClick={() => t === "Prática" ? openPractice() : setTab(t)}
                  >
                    {t === "Meu guia" ? guideLabel : t}
                  </button>
                ))}
              </div>
              {(tab === "Visão geral" || tab === "Teoria") && (
                <div className="lesson-columns">
                  <section className="lesson-main-card">
                    {tab === "Teoria" ? (
                      <>
                        <h2>Teoria da aula</h2>
                        {lesson.theory.map((p, i) => (
                          <div className="theory-block" key={i}>
                            <span className="theory-index">0{i + 1}</span>
                            <p>{p}</p>
                          </div>
                        ))}
                        {lesson.codeExample && <section className="lesson-code-example">
                          <h3>Exemplo de código</h3>
                          <pre tabIndex={0}><code>{lesson.codeExample}</code></pre>
                        </section>}
                        <LessonVideos lesson={lesson} />
                        <LessonResources lesson={lesson} />
                      </>
                    ) : (
                      <>
                        <h2>Objetivo da aula</h2>
                        <p className="objective">{lesson.objective}</p>
                      </>
                    )}
                  </section>
                  <aside className="lesson-aside">
                    <div className="aside-card">
                      <span className="eyebrow">SEU DESAFIO PRÁTICO</span>
                      <h3>{lesson.exercise?.length ? "Exercício da aula" : lesson.practice.length === 1
                        ? "1 tarefa para praticar" : lesson.practice.length ? `${lesson.practice.length} tarefas para praticar` : "Atividade no guia"}</h3>
                      <button
                        className="secondary-btn"
                        onClick={hasPractice ? openPractice : openGuide}
                      >
                        Começar exercício <Play size={15} />
                      </button>
                    </div>
                    <div className="guide-aside">
                      <span className="eyebrow">{programming ? "DIÁRIO DA AULA" : "CONSTRUINDO SEU GUIA"}</span>
                      <p>{programming ? "Anote o que fez nesta aula e o que quer retomar depois." : lesson.guide}</p>
                      <button
                        className="text-link"
                        onClick={() => setTab("Meu guia")}
                      >
                        Abrir {guideLabel} <ChevronRight size={14} />
                      </button>
                    </div>
                  </aside>
                </div>
              )}
              {tab === "Digitação" && (
                <TypingPanel {...typingPanelProps} />
              )}

              {tab === "Prática" && (
                <div className="practice-card">
                  <div className="practice-icon">{lesson.icon}</div>
                  <span className="eyebrow">
                    EXERCÍCIO PRÁTICO · AULA {lesson.id}
                  </span>
                  <h2>Tarefas da aula</h2>
                  <LessonResources lesson={lesson} />
                  {lesson.practice.length > 0
                    ? <p role="status">{tasksDone} de {lesson.practice.length} tarefas cumpridas</p>
                    : !hasPractice && <p>A atividade desta aula está na aba Meu guia.</p>}
                  {lessonCompleted && pendingTasks.length > 0 && <p>Revise as tarefas pendentes desta aula.</p>}
                  {practiceTool && <button type="button" className="secondary-btn" onClick={() => changeView(practiceTool)}>
                    Abrir {practiceTool} <ArrowUpRight size={17} aria-hidden="true" />
                  </button>}
                  {lesson.practice.some(({ check }) => check.kind === "shortcut") && <PracticeShortcuts observe={observePractice} />}
                  {lesson.practice.length > 0 && <PracticeChecklist lesson={lesson} progress={practiceProgress} observe={observePractice}
                    renderAction={({ id }) => {
                      const code = codeTasks.find((task) => task.id === id);
                      return code && (code.file || code.check.quickStart) &&
                        <button type="button" className="secondary-btn" onClick={() => openCodeTask(code)}>
                          {code.file ? "Editar" : "Criar e abrir"} {code.check.file.at(-1)} <ArrowUpRight size={17} aria-hidden="true" />
                        </button>;
                    }} />}
                  {codeOpenError && <p role="alert">{codeOpenError}</p>}
                  {!!lesson.exercise?.length && <section className="lesson-exercise">
                    <h3>Orientações extras</h3>
                    <ol>{lesson.exercise.map((step, index) => <li key={index}>{step}</li>)}</ol>
                  </section>}
                  {(lessonCompleted || pendingTasks.length === 0) && <button type="button" className="primary-btn" onClick={openGuide}>
                    Abrir {guideLabel} <ChevronRight size={17} aria-hidden="true" />
                  </button>}
                </div>
              )}

              {tab === "Meu guia" && (
                <div className="lesson-guide">
                  <section className="lesson-guide-instructions" aria-labelledby="lesson-guide-title">
                    <h2 id="lesson-guide-title">{programming ? "Diário da aula" : "Orientação para o guia"}</h2>
                    <p>{programming ? "Anote o que fez hoje, o que conseguiu testar e o que quer retomar na próxima aula." : lesson.guide}</p>
                  </section>
                  {programming ? <div className="journal-note">
                    <label htmlFor="journal-note">Anotação desta aula</label>
                    <textarea id="journal-note" value={note} maxLength={journalNoteLimit} rows={7}
                      onChange={(event) => setJournalDrafts((current) => ({ ...current, [lesson.id]: event.target.value }))} />
                    <button type="button" className="secondary-btn" disabled={!noteDirty || journalPending}
                      onClick={() => void submitJournal(lesson.id, note)}>{journalPending ? "Salvando anotação." : "Salvar anotação"}</button>
                    {journalStatus?.id === lesson.id && journalStatus.error && <p role="alert">{journalStatus.error}</p>}
                    {journalStatus?.id === lesson.id && journalStatus.saved && !noteDirty && <p role="status">Anotação salva.</p>}
                    {progress.guide.trim() && <details>
                      <summary>Consultar minhas anotações do guia anterior</summary>
                      <p className="journal-legacy">{progress.guide}</p>
                    </details>}
                  </div> : <WordEditor {...guideEditorProps} />}
                  <FinishLesson
                    key={lesson.id}
                    done={progress.completed.includes(lesson.id)}
                    busy={practicePending > 0 || typingPending > 0 || guidePending || journalPending}
                    blockedReason={pendingTasks.length > 0
                      ? "Conclua as tarefas da aba Prática para finalizar a aula."
                      : programming || progress.guideEditedLessons?.includes(lesson.id) ? undefined : "Edite e salve o guia para concluir a aula."}
                    complete={() => complete(lesson.id)}
                    next={followingLesson && canOpenLesson(followingLesson.id)
                      ? () => startLesson(followingLesson.id) : undefined}
                  />
                </div>
              )}
            </>
          )}

          {view === "Editor de código" && <>
            <div className="page-heading">
              <h1 tabIndex={-1}>Editor de código</h1>
              <p>Os arquivos ficam na sua Área de trabalho simulada.</p>
            </div>
            {openFile ? <CodeEditor key={openFile.id} file={openFile} items={desktopItems} open={openCode}
              change={(text) => editDesktopFile(openFile.id, { text })} /> : (
              <section className="code-workbench" aria-label="Arquivos para editar">
                <div className="code-actions">
                  <button type="button" className="primary-btn" onClick={newCodeFile}>Novo arquivo JavaScript</button>
                </div>
                {codeOpenError && <p role="alert">{codeOpenError}</p>}
                {codeFiles.length > 0 && <div>
                  <h2>Abrir arquivo salvo</h2>
                  <div className="code-file-list">
                    {codeFiles.map((file) => <button key={file.id} type="button" className="secondary-btn" onClick={() => openCode(file)}>
                      {desktopPath(file, desktopItems).join(" / ")}
                    </button>)}
                  </div>
                </div>}
              </section>
            )}
          </>}
          {view === "Digitação" && (
            <>
              <div className="page-heading">
                <span className="eyebrow">TREINO DIÁRIO · {typingLevels.length} NÍVEIS</span>
                <h1 tabIndex={-1}>Digitação</h1>
                <p>
                  Comece devagar, encontre as teclas e pratique um pouco a cada
                  etapa.
                </p>
              </div>
              <TypingPanel {...typingPanelProps} />
            </>
          )}

          {desktopView && (
            <>
              <div className="desktop-heading">
                <h1 tabIndex={-1}>Área de trabalho</h1>
                {desktopSave}
              </div>
              <DesktopLab items={desktopItems} setItems={desktop.changeItems} explorer={explorer} setExplorer={setExplorer}
                openApp={changeView} openFile={openDesktopFile} observe={observePractice} verifyingFile={verifyingFile}
                assistant={practiceAssistant} />
            </>
          )}

          {view === "Editor de texto" && (
            <>
              <div className="page-heading">
                <span className="eyebrow">{openFile ? "SIMULADOR · ARQUIVO DE TREINO" : "SIMULADOR · GUIA DIGITAL"}</span>
                <h1 tabIndex={-1}>Editor de texto</h1>
                <p>
                  {openFile ? "Edite o conteúdo do arquivo de treino." : "Escreva e organize ideias para o guia da sua disciplina."}
                </p>
              </div>
              {!openFile ? <WordEditor {...guideEditorProps} /> : isDesktopDocument(openFile.name) ? (
                <WordEditor key={openFile.id} name={openFile.name}
                  value={{ document: openFile.document ?? wordFromText(fileText(openFile)), text: fileText(openFile) }}
                  canChange={(value) => desktopSizeError(updateFile(desktopItems, openFile.id, value))}
                  onChange={(value) => editDesktopFile(openFile.id, value)} />
              ) : <PlainTextEditor name={openFile.name} value={fileText(openFile)} onChange={(text) => editDesktopFile(openFile.id, { text })} />}
            </>
          )}

          {view === "Planilha" && (
            <>
              <div className="page-heading">
                <span className="eyebrow">
                  SIMULADOR · ORGANIZE INFORMAÇÕES
                </span>
                <h1 tabIndex={-1}>Planilha</h1>
                <p>{openFile ? "Edite células, aplique formatos e pratique fórmulas. As alterações são salvas na sua conta."
                  : "Pratique edição e fórmulas na planilha de exemplo. Para guardar uma planilha na sua conta, crie um arquivo no desktop."}</p>
              </div>
              {openFile ? <SheetEditor key={openFile.id} name={openFile.name} initial={fileWorkbook(openFile)}
                onChange={(workbook) => desktop.changeItems((items) => updateFile(items, openFile.id, { workbook }))}
                onSave={desktop.flush} busy={desktop.state.status === "pending"} finishEditing={finishSheetEditing} />
                : <SheetEditor key={`example-${sheetReset}`} name="Planilha de exemplo" initial={sheet}
                  onChange={(workbook: SheetWorkbook) => { setSheet(workbook); return undefined; }}
                  onReset={() => { setSheet(sheetExample); setSheetReset((count) => count + 1); }} finishEditing={finishSheetEditing} />}
            </>
          )}

          {view === "Navegador" && (
            <>
              <div className="page-heading">
                <span className="eyebrow">
                  SIMULADOR · PESQUISA RESPONSÁVEL
                </span>
                <h1 tabIndex={-1}>Navegador de internet</h1>
                <p>
                  {openFile ? "Visualize a página HTML do exercício." : "Explore páginas educativas de demonstração e pratique uma busca segura."}
                </p>
              </div>
              {openFile ? (
                <div className="browser-card">
                  <div className="browser-chrome">
                    <div className="address-bar"><FileText size={16} aria-hidden="true" /> file:///{openFile.name}</div>
                  </div>
                  {openFile.text?.trim() ? (
                    <iframe className="browser-file-preview" title={openFile.name} sandbox="" referrerPolicy="no-referrer"
                      srcDoc={localPageSource(openFile.text)} />
                  ) : <p className="browser-body">Esta página HTML está vazia.</p>}
                </div>
              ) : <BrowserSimulator studentId={studentId} observe={observePractice} />}
            </>
          )}
          {!desktopView && practiceAssistant}
        </main>
      </div>
    </div>
  );
}

function LessonResources({ lesson }: { lesson: Lesson }) {
  if (!lesson.resources?.length) return null;
  return (
    <section className="lesson-resources">
      <h3>Recursos da aula</h3>
      <ul>{lesson.resources.map(({ title, url }, index) => (
        <li key={`${url}:${index}`}><a href={url} target="_blank" rel="noopener noreferrer">{title}</a></li>
      ))}</ul>
    </section>
  );
}

function LessonVideos({ lesson }: { lesson: Lesson }) {
  const videos = (lesson.videoUrl ?? []).map(lessonVideo).filter((video) => video !== undefined);
  if (!videos.length) return null;
  return <section className="lesson-videos" aria-label="Vídeos da aula">
    <h3>Vídeos da aula</h3>
    {videos.map(({ href, embed }, index) => <div className="lesson-video" key={`${href}:${index}`}>
      {embed && <iframe
        src={embed}
        title={`Vídeo ${index + 1} · ${lesson.title}`}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="encrypted-media; picture-in-picture; web-share"
        allowFullScreen
      />}
      <a className="link-button" href={href} target="_blank" rel="noreferrer">
        {embed ? "Abrir no YouTube" : "Abrir vídeo em nova aba"} <ArrowUpRight size={15} aria-hidden="true" />
      </a>
    </div>)}
  </section>;
}

function localPageSource(html: string) {
  // Reject active elements and navigation while the markup is still inert.
  const template = document.createElement("template");
  template.innerHTML = html;
  for (const element of template.content.querySelectorAll("*")) {
    if (element.namespaceURI !== "http://www.w3.org/1999/xhtml" || !localPageTags.has(element.localName)) {
      element.remove();
      continue;
    }
    for (const attribute of Array.from(element.attributes)) {
      if (!localPageAttributes.has(attribute.name)) element.removeAttribute(attribute.name);
    }
  }
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'none'; object-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
    <style>body { margin: 1.25rem; font: 1rem/1.6 system-ui, sans-serif; overflow-wrap: anywhere; }</style>
    </head><body>${template.innerHTML}</body></html>`;
}

function fileText(file: DesktopFile) {
  return (file.text ?? (file.workbook ? sheetPlainText(file.workbook) : file.cells?.map((row) => row.join(",")).join("\n")) ?? "").slice(0, desktopTextLimit);
}

function fileWorkbook(file: DesktopFile) {
  if (file.workbook) return { ...file.workbook, name: file.name };
  const delimiter = /\.tsv$/i.test(file.name) ? "\t" : ",";
  const rows = file.cells ?? sheetTextRows(file.text ?? "", delimiter, {
    rows: desktopSheetRows, columns: desktopSheetColumns, characters: desktopCellLimit,
  });
  return sheetFromRows(file.id, file.name, rows);
}

function PlainTextEditor({ name, value, onChange }: {
  name: string;
  value: string;
  onChange: (text: string) => void;
}) {
  return (
    <div className="editor-card">
      <div className="editor-toolbar">
        <span className="editor-brand"><FileText size={20} aria-hidden="true" /> <b>{name}</b></span>
      </div>
      <textarea aria-label={`Conteúdo de ${name}`} maxLength={desktopTextLimit} value={value}
        onChange={(event) => onChange(event.target.value)} placeholder="Comece a digitar aqui" />
    </div>
  );
}
