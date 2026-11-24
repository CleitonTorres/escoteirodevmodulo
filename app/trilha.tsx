"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Home,
  BookOpen,
  Keyboard,
  Folder,
  FileText,
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
  LockKeyhole,
  Star,
  Compass,
} from "lucide-react";
import { lessons, monthNames, type Lesson } from "@/data/lessons";
import { informaticaBasica, typingLevels } from "@/data/disciplinas";
import { guideLimit, type Progress } from "@/lib/storage";
import { sair } from "./conta-actions";
import { concluirAula, registrarDigitacao, salvarGuia } from "./progresso-actions";
import TypingPanel from "./typing-panel";
import DesktopLab, { type ExplorerWindow } from "./desktop-lab";
import { desktopCellLimit, desktopFileApp, desktopSheetColumns, desktopSheetRows, desktopTextLimit, type DesktopFile } from "@/lib/desktop-files";
import { useDesktopProgress } from "./use-desktop-progress";
import Image from "next/image";

const sheetExample = [["Ferramenta", "Para que serve"], ["Teclado", "Digitar"], ["Mouse", "Apontar e clicar"]];
const emptySheet = [["", ""], ["", ""], ["", ""]];
const localPageTags = new Set(
  "a article aside b blockquote br caption code dd div dl dt em figcaption figure footer h1 h2 h3 h4 h5 h6 header hr i li main nav ol p pre section small span strong style sub sup table tbody td th thead tr ul".split(" "),
);
const localPageAttributes = new Set(["class", "id", "style", "lang", "dir", "colspan", "rowspan"]);

export default function Trilha({ nome, initialProgress }: { nome: string; initialProgress: Progress }) {
  const [view, setView] = useState("Início"),
    [selected, setSelected] = useState(1),
    [progress, setProgress] = useState(initialProgress),
    [query, setQuery] = useState(""),
    [mobile, setMobile] = useState(false),
    [tab, setTab] = useState("Visão geral"),
    [level, setLevel] = useState(0),
    [typed, setTyped] = useState(""),
    [explorer, setExplorer] = useState<ExplorerWindow>({ open: false, history: [null], index: 0, maximized: false }),
    [openFileId, setOpenFileId] = useState<string | null>(null),
    [desktopEditError, setDesktopEditError] = useState(""),
    [doc, setDoc] = useState(initialProgress.guide),
    [sheet, setSheet] = useState(sheetExample),
    [browserQuery, setBrowserQuery] = useState(""),
    [browserSearch, setBrowserSearch] = useState(false);
  const [guideState, setGuideState] = useState({ checked: initialProgress.guide, error: "" });
  const [guidePending, setGuidePending] = useState(false);
  const savingGuide = useRef(false);
  const contentRef = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeMenuButton = useRef<HTMLButtonElement>(null);
  const [guideChanged, setGuideChanged] = useState(false);
  const [typingPending, setTypingPending] = useState(0);
  const [typingRetry, setTypingRetry] = useState(0);
  const desktop = useDesktopProgress(initialProgress.desktop);
  const desktopItems = desktop.items;
  const desktopView = view === "Área de trabalho";
  const openFile = desktopItems.find((item): item is DesktopFile => item.id === openFileId && item.kind === "file");
  const sheetRows = view === "Planilha" && openFile
    ? openFile.cells ?? (openFile.text ? openFile.text.split(/\r?\n/).slice(0, desktopSheetRows).map((row) =>
      row.split(",").slice(0, desktopSheetColumns).map((cell) => cell.slice(0, desktopCellLimit))) : emptySheet)
    : sheet;
  const guideError = guideState.checked === doc ? guideState.error : undefined;
  const guideUnsaved = guidePending || guideState.checked !== doc || Boolean(guideError);

  const submitGuide = useCallback(async (value: string) => {
    if (savingGuide.current) return;
    savingGuide.current = true;
    setGuidePending(true);
    try {
      const result = await salvarGuia(value);
      setGuideState({ checked: value, error: result.ok ? "" : result.error });
    } catch {
      setGuideState({ checked: value, error: "Não foi possível salvar o guia. Tente novamente." });
    } finally {
      savingGuide.current = false;
      setGuidePending(false);
    }
  }, []);

  useEffect(() => {
    if (guidePending || guideState.checked === doc) return;
    const delay = window.setTimeout(() => void submitGuide(doc), 600);
    return () => window.clearTimeout(delay);
  }, [doc, guidePending, guideState.checked, submitGuide]);

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
    value: doc,
    setValue: (value: string) => {
      setGuideChanged(true);
      setDoc(value.slice(0, guideLimit));
    },
    saved: guideChanged && !guideUnsaved,
    pending: guidePending,
    error: guideError,
    save: () => {
      setGuideChanged(true);
      if (guideUnsaved) void submitGuide(doc);
    },
  };

  const lesson = lessons.find((x) => x.id === selected) as Lesson;
  const initials = nome.trim().split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0]).join("").toUpperCase();
  const pendingLessons = lessons.filter((item) => !progress.completed.includes(item.id));
  const nextLesson = pendingLessons[0] ?? lessons[lessons.length - 1];

  async function complete(id: number) {
    const result = await concluirAula(id);
    if (!result.ok) return result.error;
    setProgress((current) => current.completed.includes(id)
      ? current
      : { ...current, completed: [...current.completed, id] });
  }

  async function saveTyping(level: number) {
    if (level <= progress.typingBest) return;
    setTypingPending((current) => current + 1);
    try {
      const result = await registrarDigitacao(level);
      if (!result.ok) {
        setTypingRetry((current) => Math.max(current, level));
        return;
      }
      setProgress((current) => ({ ...current, typingBest: Math.max(current.typingBest, level) }));
      setTypingRetry((current) => current <= level ? 0 : current);
    } catch {
      setTypingRetry((current) => Math.max(current, level));
    } finally {
      setTypingPending((current) => current - 1);
    }
  }

  const filtered = lessons.filter((x) =>
    x.title.toLowerCase().includes(query.toLowerCase()),
  );
  const pct = Math.round((progress.completed.length / lessons.length) * 100);
  const nav = [
    ["Início", Home],
    ["Aulas", BookOpen],
    ["Digitação", Keyboard],
    ["Área de trabalho", Folder],
    ["Editor de texto", FileText],
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

  function startLesson(id: number) {
    setOpenFileId(null);
    setSelected(id);
    setView("Aula");
    setTab("Visão geral");
    setTyped("");
    setLevel(0);
    setMobile(false);
    focusContent();
  }
  function changeView(v: string) {
    setOpenFileId(null);
    setDesktopEditError("");
    setView(v);
    setMobile(false);
    if (v === "Digitação") setTab("Digitação");
    focusContent();
  }
  function openDesktopFile(file: DesktopFile) {
    changeView(desktopFileApp(file.name));
    setOpenFileId(file.id);
  }
  function editDesktopFile(id: string, content: Pick<DesktopFile, "text" | "cells">) {
    const error = desktop.changeItems((items) => items.map((item) => item.id === id && item.kind === "file"
      ? { ...item, text: content.text?.slice(0, desktopTextLimit), cells: content.cells, modifiedAt: Date.now() } : item));
    setDesktopEditError(error ?? "");
  }
  function updateSheet(cells: string[][]) {
    if (openFile) editDesktopFile(openFile.id, { cells });
    else setSheet(cells);
  }
  function changeTypingLevel(next: number) {
    setLevel(next);
    setTyped("");
  }

  function completeTypingLevel() {
    const next = level + 1;
    void saveTyping(next);
    if (next < typingLevels.length) changeTypingLevel(next);
  }
  const progressCard = (
    <div className="progress-card">
      <div className="progress-top">
        <span>Seu progresso</span>
        <strong>{pct}%</strong>
      </div>
      <div className="progress-track" aria-hidden="true">
        <i style={{ width: `${pct}%` }} />
      </div>
      <small>{progress.completed.length} de {lessons.length} aulas concluídas</small>
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
          <b>trilha digital</b>
          <small>19º GE Coqueiral</small>
        </div>
        <button ref={closeMenuButton} className="close-mobile" onClick={closeMobileMenu} aria-label="Fechar menu">
          <X size={22} aria-hidden="true" />
        </button>
      </div>
      <div className="group-tag">
        <span className="tag-dot" /> ESCOTEIRO DEV <span>•</span> INFORMÁTICA
      </div>
      <nav aria-label="Navegação da trilha">
        {nav.map(([label, Icon]) => (
          <button
            key={label}
            className={`nav-item ${view === label || (view === "Aula" && label === "Aulas") ? "active" : ""}`}
            aria-current={view === label || (view === "Aula" && label === "Aulas") ? "page" : undefined}
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
          <small>Aluno da Trilha Digital</small>
        </div>
        <form action={async () => {
          if (await desktop.flush()) await sair();
          else {
            setMobile(false);
            if (window.confirm("Há alterações pendentes no desktop. Sair e descartar essas alterações?")) await sair();
          }
        }} onSubmit={(event) => {
          if (guideUnsaved && !window.confirm("Há alterações no guia aguardando salvamento. Sair mesmo assim?")) event.preventDefault();
        }}>
          <button className="logout-btn" type="submit" aria-label="Sair da conta" title="Sair da conta"><LogOut size={17} /></button>
        </form>
      </div>
    </aside>
  );
  return (
    <div className="app-shell">
      <a className="skip-link" href="#conteudo-principal" tabIndex={mobile ? -1 : undefined}>Ir para o conteúdo</a>
      {sidebar}
      {mobile && <div className="scrim" aria-hidden="true" onClick={closeMobileMenu} />}
      <div className="main" inert={mobile}>
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
              <span className="online-dot" /> {informaticaBasica.nome}
            </span>
            <div className="avatar small-avatar" aria-hidden="true">{initials}</div>
          </div>
        </header>
        <main className={`content${desktopView ? " desktop-content" : ""}`} id="conteudo-principal" ref={contentRef} tabIndex={-1}>
          {openFile && <div className="desktop-file-return">
            <button className="secondary-btn" onClick={() => changeView("Área de trabalho")}>
              <ArrowLeft size={20} aria-hidden="true" /> Voltar à área de trabalho
            </button>
            {desktopSave}
          </div>}
          {!openFile && !desktopView && desktop.state.status === "error" && desktopSave}
          {openFile && desktopEditError && <p className="account-notice" role="alert">{desktopEditError}</p>}
          {typingRetry > progress.typingBest && (
            <div className="account-notice">
              <p role="alert">O resultado da digitação aguarda salvamento.</p>
              <button className="secondary-btn" disabled={typingPending > 0} onClick={() => saveTyping(typingRetry)}>Tentar de novo</button>
            </div>
          )}
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
                    Aprenda informática fazendo — um passo, uma prática e uma
                    conquista de cada vez.
                  </p>
                  <button
                    className="primary-btn"
                    onClick={() => startLesson(nextLesson.id)}
                  >
                    <Play size={16} fill="currentColor" /> Continuar aprendendo{" "}
                    <ChevronRight size={16} />
                  </button>
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
                  <div className="hill hill-one" />                  
                  <div className="hill hill-two" />
                  <div className="trail-sign">
                    <Compass size={30} />
                    <span>
                      UMA NOVA
                      <br />
                      DESCOBERTA
                    </span>
                  </div>
                  <span className="art-star star-one">✦</span>
                  <span className="art-star star-two">✧</span>
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
                <button
                  className="link-button"
                  onClick={() => changeView("Aulas")}
                >
                  Ver todas as aulas <ArrowUpRight size={15} />
                </button>
              </div>
              <div className="lesson-grid">
                {(pendingLessons.length ? pendingLessons.slice(0, 3) : lessons.slice(-3))
                  .map((l, i) => (
                    <button
                      className={`lesson-card ${i === 0 ? "featured" : ""}`}
                      key={l.id}
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
                          ) : (
                            `AULA ${String(l.id).padStart(2, "0")}`
                          )}
                        </span>
                      </div>
                      <span className="card-month">
                        MÊS {l.month} · {monthNames[l.month]}
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
                  <span>TRILHA COQUEIRAL · APRENDER FAZENDO</span>
                </div>
              </div>
            </>
          )}
          {view === "Aulas" && (
            <>
              <div className="page-heading">
                <span className="eyebrow">SEU MAPA DE DESCOBERTAS</span>
                <h1 tabIndex={-1}>Trilha de aulas</h1>
                <p>
                  Do primeiro clique à apresentação do seu próprio guia digital.
                </p>
              </div>
              <div className="search-box">
                <Search size={17} />
                <input
                  aria-label="Buscar uma aula"
                  placeholder="Buscar uma aula…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              {[1, 2, 3].map((m) => (
                <section className="month-section" key={m}>
                  <div className="month-heading">
                    <span className="month-number">0{m}</span>
                    <div>
                      <small>MÊS {m}</small>
                      <h2>{monthNames[m]}</h2>
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
          {view === "Aula" && (
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
                  <span>
                    <BookOpen size={14} /> 4 etapas
                  </span>
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
                    onClick={() => setTab(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {(tab === "Visão geral" || tab === "Teoria") && (
                <div className="lesson-columns">
                  <section className="lesson-main-card">
                    <span className="eyebrow">O QUE VOCÊ VAI DESCOBRIR</span>
                    <h2>
                      {tab === "Teoria" ? "Teoria da aula" : lesson.title}
                    </h2>
                    <p className="objective">{lesson.objective}</p>
                    {lesson.theory.map((p, i) => (
                      <div className="theory-block" key={i}>
                        <span className="theory-index">0{i + 1}</span>
                        <p>{p}</p>
                      </div>
                    ))}
                    <div className="video-card">
                      <div className="video-play">
                        <Play size={19} fill="currentColor" />
                      </div>
                      <div>
                        <small>VÍDEO DA AULA · ESCOTEIRO DEV</small>
                        <b>Assista à explicação e aprenda junto</b>
                      </div>
                      <a
                        href={lesson.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Assistir o vídeo <ArrowUpRight size={14} />
                      </a>
                    </div>
                    <button
                      className="primary-btn"
                      onClick={() => setTab("Prática")}
                    >
                      Ir para a prática <ChevronRight size={16} />
                    </button>
                  </section>
                  <aside className="lesson-aside">
                    <div className="aside-card">
                      <span className="eyebrow">SEU DESAFIO PRÁTICO</span>
                      <h3>{lesson.practice}</h3>
                      <button
                        className="secondary-btn"
                        onClick={() => {
                          setTab("Prática");
                          if (lesson.tool === "arquivos")
                            changeView("Área de trabalho");
                        }}
                      >
                        Começar exercício <Play size={15} />
                      </button>
                    </div>
                    <div className="guide-aside">
                      <span className="eyebrow">CONSTRUINDO SEU GUIA</span>
                      <p>{lesson.guide}</p>
                      <button
                        className="text-link"
                        onClick={() => setTab("Meu guia")}
                      >
                        Abrir meu guia <ChevronRight size={14} />
                      </button>
                    </div>
                  </aside>
                </div>
              )}
              {tab === "Digitação" && (
                <TypingPanel
                  level={level}
                  typed={typed}
                  setLevel={changeTypingLevel}
                  setTyped={setTyped}
                  onComplete={completeTypingLevel}
                  best={progress.typingBest}
                />
              )}

              {tab === "Prática" && (
                <div className="practice-card">
                  <div className="practice-icon">{lesson.icon}</div>
                  <span className="eyebrow">
                    EXERCÍCIO PRÁTICO · AULA {lesson.id}
                  </span>
                  <h2>Agora é sua vez de experimentar</h2>
                  <p>{lesson.practice}</p>
                  <PracticeWidget
                    key={lesson.id}
                    tool={lesson.tool}
                    changeView={changeView}
                    done={progress.completed.includes(lesson.id)}
                    complete={() => complete(lesson.id)}
                  />
                </div>
              )}

              {tab === "Meu guia" && (
                    <TextEditor {...guideEditorProps} />
              )}
            </>
          )}

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
              <TypingPanel
                level={level}
                typed={typed}
                setLevel={changeTypingLevel}
                setTyped={setTyped}
                onComplete={completeTypingLevel}
                best={progress.typingBest}
              />
            </>
          )}

          {desktopView && (
            <>
              <div className="desktop-heading">
                <h1 tabIndex={-1}>Área de trabalho</h1>
                {desktopSave}
              </div>
              <DesktopLab items={desktopItems} setItems={desktop.changeItems} explorer={explorer} setExplorer={setExplorer}
                openApp={changeView} openFile={openDesktopFile} />
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
              {openFile ? <TextEditor fileName={openFile.name}
                value={(openFile.text ?? openFile.cells?.map((row) => row.join(",")).join("\n") ?? "").slice(0, desktopTextLimit)}
                setValue={(text) => editDesktopFile(openFile.id, { text })} /> : <TextEditor {...guideEditorProps} />}
            </>
          )}

          {view === "Planilha" && (
            <>
              <div className="page-heading">
                <span className="eyebrow">
                  SIMULADOR · ORGANIZE INFORMAÇÕES
                </span>
                <h1 tabIndex={-1}>Planilha</h1>
                <p>
                  Edite células da tabela de treino e pratique organização de
                  dados.
                </p>
              </div>
              <div className="sheet-card">
                <div className="sheet-toolbar">
                  <div className="sheet-brand">
                    ▦ <b>{openFile?.name ?? "Planilha"}</b>
                  </div>
                  <button disabled={!!openFile && sheetRows.length >= desktopSheetRows}
                    onClick={() => updateSheet([...sheetRows, openFile ? [] : ["Novo item", "Descrição"]])}>
                    + Adicionar linha
                  </button>
                  {!openFile && <button onClick={() => setSheet(sheetExample)}>
                    Restaurar exemplo
                  </button>}
                </div>
                <div className="sheet-help">
                  Selecione uma célula para editar. Use Tab para avançar entre as células.
                  {!openFile && " As alterações são temporárias."}
                </div>
                <EditableSheet rows={sheetRows} onChange={updateSheet} cellLimit={openFile ? desktopCellLimit : undefined} />
              </div>
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
              <div className="browser-card">
                <div className="browser-chrome">
                  <div className="browser-lights">
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className="address-bar">
                    {openFile ? <><FileText size={16} aria-hidden="true" /> file:///{openFile.name}</> :
                      <><LockKeyhole size={13} /> https://aprenda.coqueiral.br</>}
                  </div>
                  <Globe size={16} />
                </div>
                {openFile ? (openFile.text?.trim() ? (
                  <iframe className="browser-file-preview" title={openFile.name} sandbox="" referrerPolicy="no-referrer"
                    srcDoc={localPageSource(openFile.text)} />
                ) : <p className="browser-body">Esta página HTML está vazia.</p>) : <div className="browser-body">
                  <div className="browser-logo">
                    <Compass size={20} /> Aprenda<span>+</span>
                  </div>
                  <form
                    className="browser-search"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setBrowserSearch(true);
                    }}
                  >
                    <Search size={17} />
                    <input
                      aria-label="Tema da pesquisa"
                      value={browserQuery}
                      onChange={(e) => setBrowserQuery(e.target.value)}
                      placeholder="Pesquise um tema para aprender"
                    />
                    <button>Pesquisar</button>
                  </form>
                  {browserSearch ? (
                    <div className="search-results" aria-live="polite">
                      <small>
                        RESULTADOS DE TREINO PARA “
                        {browserQuery || "INFORMÁTICA"}”
                      </small>
                      {[
                        "Como criar uma senha segura",
                        "O que é um navegador de internet?",
                        "Dicas para organizar seus arquivos",
                      ].map((r, i) => (
                        <article key={i}>
                          <h3>{r}</h3>
                          <p>
                            Aprenda com exemplos claros e seguros. Lembre-se de
                            conferir a fonte da informação.
                          </p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="browser-topics">
                      {[
                        ["01", "Segurança digital", "Proteja seus dados"],
                        [
                          "02",
                          "Informática básica",
                          "Aprenda os primeiros passos",
                        ],
                        [
                          "03",
                          "Cidadania digital",
                          "Navegue com responsabilidade",
                        ],
                      ].map(([n, t, d]) => (
                        <div key={n}>
                          <span>{n}</span>
                          <b>{t}</b>
                          <small>{d}</small>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="browser-warning">
                    <LockKeyhole size={15} /> Esta é uma internet simulada.
                    Nenhum dado é enviado ou coletado.
                  </div>
                </div>}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
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

function TextEditor({
  value,
  setValue,
  fileName,
  saved,
  pending,
  error,
  save,
}: {
  value: string;
  setValue: (s: string) => void;
  fileName?: string;
  saved?: boolean;
  pending?: boolean;
  error?: string;
  save?: () => void;
}) {
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  return (
    <div className="editor-card">
      <div className="editor-toolbar">
        <span className="editor-brand">
          W <b>{fileName ?? "Meu Guia Digital"}</b>
        </span>
        <button onClick={() => setValue(value + "\n\n## Nova seção\n")}>
          + Nova seção
        </button>
        {save && <button className="save-btn" onClick={save} disabled={pending}>
          <Save size={15} />
          {pending ? "Salvando…" : saved ? "Salvo na sua conta" : "Salvar guia"}
        </button>}
      </div>
      {error && <p className="account-notice" role="alert">{error}</p>}
      <div className="format-toolbar">
        <button onClick={() => setValue(value + "\n# Título\n")}>Título</button>
        <button onClick={() => setValue(value + " **texto em negrito** ")}>
          <b>Negrito</b>
        </button>
        <button onClick={() => setValue(value + "\n- Item da lista\n")}>
          • Lista
        </button>
        <span>{fileName ? "Arquivo de treino" : "Guia de aprendizagem · rascunho"}</span>
      </div>
      <textarea
        aria-label={fileName ? `Conteúdo de ${fileName}` : "Conteúdo do Meu Guia Digital"}
        maxLength={fileName ? desktopTextLimit : undefined}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={
          fileName ? "Digite aqui." : "# Meu Guia Digital\n\nEscreva aqui o que você descobriu nesta trilha…\n\n## Aula 1 — Primeiras descobertas\n\nO computador pode me ajudar a…"
        }
      />
      <div className="editor-footer">
        <span>
          <Save size={14} aria-hidden="true" /> Salvamento automático na sua conta
        </span>
        <span>{words} palavras</span>
      </div>
    </div>
  );
}

function PracticeWidget({
  tool,
  changeView,
  done,
  complete,
}: {
  tool: string;
  changeView: (v: string) => void;
  done: boolean;
  complete: () => Promise<string | undefined>;
}) {
  const [answer, setAnswer] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function markDone() {
    setPending(true);
    setError("");
    try {
      setError(await complete() ?? "");
    } catch {
      setError("Não foi possível salvar a conclusão. Tente novamente.");
    } finally {
      setPending(false);
    }
  }
  const recommended =
    tool === "arquivos"
      ? "Área de trabalho"
      : tool === "texto" || tool === "guia"
        ? "Editor de texto"
        : tool === "planilha"
          ? "Planilha"
          : tool === "navegador"
            ? "Navegador"
            : tool === "digitacao"
              ? "Digitação"
              : "Área de trabalho";
  return (
    <div className="practice-widget">
      <div className="practice-prompt">
        <span className="practice-step">01</span>
        <div>
          <b>Experimente na ferramenta</b>
          <p>
            Use o espaço de prática indicado e volte para marcar sua atividade
            como realizada.
          </p>
        </div>
      </div>
      <button className="secondary-btn" onClick={() => changeView(recommended)}>
        Abrir {recommended} <ArrowUpRight size={14} />
      </button>
      <div className="reflection">
        <label htmlFor="resposta-pratica">O que você percebeu ao experimentar?</label>
        <textarea
          id="resposta-pratica"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Escreva uma observação…"
        />
      </div>
      <button
        className={`primary-btn ${done ? "completed-btn" : ""}`}
        onClick={markDone}
        disabled={done || pending}
      >
        {done ? (
          <>
            <Check size={16} /> Prática concluída
          </>
        ) : (
          <>
            {pending ? "Salvando…" : "Marcar exercício como concluído"} <ChevronRight size={16} />
          </>
        )}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

function EditableSheet({
  rows,
  onChange,
  cellLimit,
}: {
  rows: string[][];
  onChange: (cells: string[][]) => void;
  cellLimit?: number;
}) {
  const columns = Array.from({ length: Math.max(2, ...rows.map((row) => row.length)) }, (_, i) => String.fromCharCode(65 + i));
  return (
    <div className="spreadsheet" role="region" aria-label="Planilha editável" tabIndex={0}>
      <table>
        <thead>
          <tr>
            <th scope="col"><span className="sr-only">Linha</span></th>
            {columns.map((column) => <th scope="col" key={column}>{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <th scope="row">{i + 1}</th>
              {columns.map((column, j) => (
                <td key={column}>
                  <input
                    aria-label={`Coluna ${column}, linha ${i + 1}`}
                    maxLength={cellLimit}
                    value={row[j] || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const editedRow = columns.map((_, index) => index === j ? value : row[index] ?? "");
                      onChange(rows.map((current, index) => index === i ? editedRow : current));
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
