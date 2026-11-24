"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Home,
  BookOpen,
  Keyboard,
  Folder,
  FileText,
  Table2,
  Globe,
  Settings,
  LogOut,
  Search,
  ChevronRight,
  Play,
  Check,
  Clock,
  Menu,
  X,
  RotateCcw,
  Plus,
  Trash2,
  Undo2,
  Save,
  ArrowUpRight,
  Monitor,
  LockKeyhole,
  Star,
  Compass,
} from "lucide-react";
import { lessons, monthNames, type Lesson } from "@/data/lessons";
import { informaticaBasica, typingLevels } from "@/data/disciplinas";
import { guideLimit, type Progress } from "@/lib/storage";
import { sair } from "./conta-actions";
import { concluirAula, registrarDigitacao, salvarGuia } from "./progresso-actions";

const initialFiles = [
  { name: "Meu Guia Digital", type: "Pasta", parent: "Início", deleted: false },
  {
    name: "Boas-vindas.txt",
    type: "Documento",
    parent: "Início",
    deleted: false,
  },
  { name: "Textos", type: "Pasta", parent: "Meu Guia Digital", deleted: false },
];

type SimFile = { name: string; type: string; parent: string; deleted: boolean };

export default function Trilha({ nome, initialProgress }: { nome: string; initialProgress: Progress }) {
  const [view, setView] = useState("Início"),
    [selected, setSelected] = useState(1),
    [progress, setProgress] = useState(initialProgress),
    [query, setQuery] = useState(""),
    [mobile, setMobile] = useState(false),
    [tab, setTab] = useState("Visão geral"),
    [level, setLevel] = useState(0),
    [typed, setTyped] = useState(""),
    [files, setFiles] = useState<SimFile[]>(initialFiles),
    [folder, setFolder] = useState("Início"),
    [doc, setDoc] = useState(initialProgress.guide),
    [sheet, setSheet] = useState(
      "Ferramenta,Para que serve\nTeclado,Digitar\nMouse,Apontar e clicar",
    ),
    [browserQuery, setBrowserQuery] = useState(""),
    [browserSearch, setBrowserSearch] = useState(false);
  const [guideState, setGuideState] = useState({ checked: initialProgress.guide, error: "" });
  const [guidePending, setGuidePending] = useState(false);
  const savingGuide = useRef(false);
  const [guideChanged, setGuideChanged] = useState(false);
  const [typingPending, setTypingPending] = useState(0);
  const [typingRetry, setTypingRetry] = useState(0);
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

  function startLesson(id: number) {
    setSelected(id);
    setView("Aula");
    setTab("Visão geral");
    setTyped("");
    setLevel(0);
    setMobile(false);
  }
  function changeView(v: string) {
    setView(v);
    setMobile(false);
    if (v === "Digitação") setTab("Digitação");
  }
  function onType(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setTyped(val);
    if (val === typingLevels[level].text) {
      const next = level + 1;
      setLevel(next < typingLevels.length ? next : 0);
      void saveTyping(next);
      setTyped("");
    }
  }
  function addFile(type: string) {
    const n = prompt(
      type === "Pasta" ? "Nome da nova pasta" : "Nome do novo arquivo",
    );
    if (n?.trim())
      setFiles((f) => [
        ...f,
        { name: n.trim(), type, parent: folder, deleted: false },
      ]);
  }
  function renameFile(file: SimFile) {
    const name = prompt("Novo nome:", file.name);
    if (name?.trim())
      setFiles((f) =>
        f.map((x) => (x === file ? { ...x, name: name.trim() } : x)),
      );
  }
  function softDelete(file: SimFile) {
    setFiles((f) => f.map((x) => (x === file ? { ...x, deleted: true } : x)));
  }
  function activeFiles(deleted = false) {
    return files.filter(
      (f) => f.deleted === deleted && (deleted || f.parent === folder),
    );
  }
  const guideWords = useMemo(
    () => (doc.trim() ? doc.trim().split(/\s+/).length : 0),
    [doc],
  );

  const progressCard = (
    <div className="progress-card">
      <div className="progress-top">
        <span>Seu progresso</span>
        <strong>{pct}%</strong>
      </div>
      <div className="progress-track">
        <i style={{ width: `${pct}%` }} />
      </div>
      <small>{progress.completed.length} de {lessons.length} aulas concluídas</small>
    </div>
  );
  const sidebar = (
    <aside className={`sidebar ${mobile ? "open" : ""}`}>
      <div className="brand">
        <div className="brand-mark">
          <Compass size={24} />
        </div>
        <div>
          <b>trilha digital</b>
          <small>19º GE Coqueiral</small>
        </div>
        <button className="close-mobile" onClick={() => setMobile(false)}>
          <X size={19} />
        </button>
      </div>
      <div className="group-tag">
        <span className="tag-dot" /> ESCOTEIRO DEV <span>•</span> INFORMÁTICA
      </div>
      <nav>
        {nav.map(([label, Icon]) => (
          <button
            key={label}
            className={`nav-item ${view === label || (view === "Aula" && label === "Aulas") ? "active" : ""}`}
            onClick={() => changeView(label)}
          >
            <Icon size={18} />
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
        <form action={sair} onSubmit={(event) => {
          if (guideUnsaved && !window.confirm("Há alterações no guia aguardando salvamento. Sair mesmo assim?")) event.preventDefault();
        }}>
          <button className="logout-btn" type="submit" aria-label="Sair da conta" title="Sair da conta"><LogOut size={17} /></button>
        </form>
      </div>
    </aside>
  );
  return (
    <div className="app-shell">
      {sidebar}
      {mobile && <button className="scrim" onClick={() => setMobile(false)} />}
      <main className="main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobile(true)}>
            <Menu size={21} />
          </button>
          <div className="breadcrumbs">
            Trilha de aprendizagem <ChevronRight size={14} />
            <b>{view === "Aula" ? `Aula ${selected}` : view}</b>
          </div>
          <div className="top-actions">
            <span className="today">
              <span className="online-dot" /> {informaticaBasica.nome}
            </span>
            <div className="avatar small-avatar" aria-hidden="true">{initials}</div>
          </div>
        </header>
        <div className="content">
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
                  <h1>
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
                <div className="banner-art">
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
                <h1>Trilha de aulas</h1>
                <p>
                  Do primeiro clique à apresentação do seu próprio guia digital.
                </p>
              </div>
              <div className="search-box">
                <Search size={17} />
                <input
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
                              <Check size={14} />
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
                    <h1>{lesson.title}</h1>
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
              <div className="lesson-tabs">
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
                            setView("Área de trabalho");
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
                  setLevel={setLevel}
                  onType={onType}
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
                <GuideEditor {...guideEditorProps} words={guideWords} />
              )}
            </>
          )}

          {view === "Digitação" && (
            <>
              <div className="page-heading">
                <span className="eyebrow">TREINO DIÁRIO · 5 NÍVEIS</span>
                <h1>Digitação</h1>
                <p>
                  Comece devagar, encontre as teclas e pratique um pouco a cada
                  etapa.
                </p>
              </div>
              <TypingPanel
                level={level}
                typed={typed}
                setLevel={setLevel}
                onType={onType}
                best={progress.typingBest}
              />
            </>
          )}

          {view === "Área de trabalho" && (
            <>
              <div className="page-heading">
                <span className="eyebrow">SIMULADOR · AMBIENTE SEGURO</span>
                <h1>Área de trabalho</h1>
                <p>
                  Pratique arquivos e pastas. As mudanças acontecem apenas aqui
                  no simulador.
                </p>
              </div>
              <div className="sim-window">
                <div className="window-bar">
                  <span>
                    <Monitor size={15} /> Explorador de Arquivos
                  </span>
                  <span>— □ ×</span>
                </div>
                <div className="file-toolbar">
                  <button onClick={() => addFile("Pasta")}>
                    <Plus size={15} /> Nova pasta
                  </button>
                  <button onClick={() => addFile("Documento")}>
                    <FileText size={15} /> Novo arquivo
                  </button>
                  <button onClick={() => setFolder("Início")}>
                    <Home size={14} /> Início
                  </button>
                  <button onClick={() => setFolder("Lixeira")}>
                    <Trash2 size={14} /> Lixeira ({activeFiles(true).length})
                  </button>
                </div>
                <div className="breadcrumbs-file">
                  Este computador <ChevronRight size={13} /> {folder}
                </div>
                <div className="file-list">
                  <div className="file-list-head">
                    <span>Nome</span>
                    <span>Tipo</span>
                    <span>Ações</span>
                  </div>
                  {folder === "Lixeira"
                    ? activeFiles(true).map((f, i) => (
                        <div className="file-row" key={i}>
                          <span className="file-name">
                            <Trash2 size={17} /> {f.name}
                          </span>
                          <span>{f.type}</span>
                          <span>
                            <button
                              title="Restaurar"
                              onClick={() =>
                                setFiles((fs) =>
                                  fs.map((x) =>
                                    x === f ? { ...x, deleted: false } : x,
                                  ),
                                )
                              }
                            >
                              <Undo2 size={16} />
                            </button>
                            <button
                              title="Excluir permanentemente"
                              onClick={() =>
                                setFiles((fs) => fs.filter((x) => x !== f))
                              }
                            >
                              <X size={15} />
                            </button>
                          </span>
                        </div>
                      ))
                    : activeFiles().map((f, i) => (
                        <div className="file-row" key={i}>
                          <button
                            className="file-name"
                            onDoubleClick={() =>
                              f.type === "Pasta" && setFolder(f.name)
                            }
                          >
                            {f.type === "Pasta" ? (
                              <Folder size={18} />
                            ) : (
                              <FileText size={18} />
                            )}{" "}
                            {f.name}
                          </button>
                          <span>{f.type}</span>
                          <span>
                            <button
                              title="Renomear"
                              onClick={() => renameFile(f)}
                            >
                              <Settings size={15} />
                            </button>
                            <button
                              title="Excluir"
                              onClick={() => softDelete(f)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </span>
                        </div>
                      ))}
                </div>
                <div className="window-tip">
                  <LockKeyhole size={14} /> Exercício de treino: nada será
                  alterado nos arquivos reais do seu dispositivo.
                </div>
              </div>
            </>
          )}

          {view === "Editor de texto" && (
            <>
              <div className="page-heading">
                <span className="eyebrow">SIMULADOR · GUIA DIGITAL</span>
                <h1>Editor de texto</h1>
                <p>
                  Escreva e organize ideias para o guia da sua disciplina.
                </p>
              </div>
              <GuideEditor {...guideEditorProps} words={guideWords} />
            </>
          )}

          {view === "Planilha" && (
            <>
              <div className="page-heading">
                <span className="eyebrow">
                  SIMULADOR · ORGANIZE INFORMAÇÕES
                </span>
                <h1>Planilha</h1>
                <p>
                  Edite células da tabela de treino e pratique organização de
                  dados.
                </p>
              </div>
              <div className="sheet-card">
                <div className="sheet-toolbar">
                  <div className="sheet-brand">
                    ▦ <b>Planilha</b>
                  </div>
                  <button
                    onClick={() => setSheet((s) => s + "\nNovo item,Descrição")}
                  >
                    + Adicionar linha
                  </button>
                  <button
                    onClick={() =>
                      setSheet(
                        "Ferramenta,Para que serve\nTeclado,Digitar\nMouse,Apontar e clicar",
                      )
                    }
                  >
                    Restaurar exemplo
                  </button>
                </div>
                <div className="sheet-help">
                  Clique em uma célula para editar · Alterações temporárias
                  nesta sessão
                </div>
                <EditableSheet value={sheet} onChange={setSheet} />
              </div>
            </>
          )}

          {view === "Navegador" && (
            <>
              <div className="page-heading">
                <span className="eyebrow">
                  SIMULADOR · PESQUISA RESPONSÁVEL
                </span>
                <h1>Navegador de internet</h1>
                <p>
                  Explore páginas educativas de demonstração e pratique uma
                  busca segura.
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
                    <LockKeyhole size={13} /> https://aprenda.coqueiral.br
                  </div>
                  <Globe size={16} />
                </div>
                <div className="browser-body">
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
                      value={browserQuery}
                      onChange={(e) => setBrowserQuery(e.target.value)}
                      placeholder="Pesquise um tema para aprender"
                    />
                    <button>Pesquisar</button>
                  </form>
                  {browserSearch ? (
                    <div className="search-results">
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
                          <a>{r}</a>
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
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function TypingPanel({
  level,
  typed,
  setLevel,
  onType,
  best,
}: {
  level: number;
  typed: string;
  setLevel: (v: number) => void;
  onType: (e: React.ChangeEvent<HTMLInputElement>) => void;
  best: number;
}) {
  const current = typingLevels[level];
  return (
    <div className="typing-card">
      <div className="typing-head">
        <div>
          <span className="eyebrow">15 MINUTOS DE PRÁTICA</span>
          <h2>Treino de digitação</h2>
        </div>
        <span className="level-chip">NÍVEL {level + 1} DE 5</span>
      </div>
      <div className="level-steps">
        {typingLevels.map((l, i) => (
          <button
            key={i}
            className={i === level ? "current" : i < level ? "passed" : ""}
            onClick={() => setLevel(i)}
          >
            <span>{i < level ? <Check size={13} /> : i + 1}</span>
            {l.name}
          </button>
        ))}
      </div>
      <p className="typing-instruction">
        Digite o texto abaixo sem pressa. Observe a posição das mãos e mantenha
        os olhos na tela.
      </p>
      <div className="typing-prompt">
        {current.text.split("").map((c, i) => (
          <span
            key={i}
            className={
              i < typed.length
                ? typed[i] === c
                  ? "typed-correct"
                  : "typed-wrong"
                : ""
            }
          >
            {c === " " ? " " : c}
          </span>
        ))}
      </div>
      <input
        className="typing-input"
        autoComplete="off"
        value={typed}
        onChange={onType}
        placeholder="Clique aqui e comece a digitar…"
      />
      <div className="keyboard">
        <div className="keyboard-row">
          {"qwertyuiop".split("").map((x) => (
            <kbd key={x}>{x}</kbd>
          ))}
        </div>
        <div className="keyboard-row middle">
          {"asdfghjklç".split("").map((x) => (
            <kbd key={x}>{x}</kbd>
          ))}
        </div>
        <div className="keyboard-row lower">
          {"zxcvbnm".split("").map((x) => (
            <kbd key={x}>{x}</kbd>
          ))}
        </div>
        <div className="keyboard-row">
          <kbd className="space-key">espaço</kbd>
        </div>
      </div>
      <div className="typing-footer">
        <span>
          <Keyboard size={15} /> Complete o texto para avançar de nível
        </span>
        <span>
          <Star size={15} /> Recorde:{" "}
          {best ? `nível ${best}` : "ainda começando"}
        </span>
      </div>
    </div>
  );
}

function GuideEditor({
  value,
  setValue,
  words,
  saved,
  pending,
  error,
  save,
}: {
  value: string;
  setValue: (s: string) => void;
  words: number;
  saved: boolean;
  pending: boolean;
  error?: string;
  save: () => void;
}) {
  return (
    <div className="editor-card">
      <div className="editor-toolbar">
        <span className="editor-brand">
          W <b>Meu Guia Digital</b>
        </span>
        <button onClick={() => setValue(value + "\n\n## Nova seção\n")}>
          + Nova seção
        </button>
        <button className="save-btn" onClick={save} disabled={pending}>
          <Save size={15} />
          {pending ? "Salvando…" : saved ? "Salvo na sua conta" : "Salvar guia"}
        </button>
      </div>
      {error && <p className="account-notice" role="alert">{error}</p>}
      <div className="format-toolbar">
        <button onClick={() => setValue(value + "\n# Título\n")}>H1</button>
        <button onClick={() => setValue(value + " **texto em negrito** ")}>
          <b>B</b>
        </button>
        <button onClick={() => setValue(value + "\n- Item da lista\n")}>
          • Lista
        </button>
        <span>Guia de aprendizagem · rascunho</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={
          "# Meu Guia Digital\n\nEscreva aqui o que você descobriu nesta trilha…\n\n## Aula 1 — Primeiras descobertas\n\nO computador pode me ajudar a…"
        }
      />
      <div className="editor-footer">
        <span>
          <Save size={14} /> Salvo automaticamente neste dispositivo
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
        <label>O que você percebeu ao experimentar?</label>
        <textarea
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
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const rows = value.split("\n").map((r) => r.split(","));
  return (
    <div className="spreadsheet">
      <div className="sheet-col-headers">
        <span />{" "}
        {Array.from(
          { length: Math.max(...rows.map((r) => r.length)) },
          (_, i) => (
            <span key={i}>{String.fromCharCode(65 + i)}</span>
          ),
        )}
      </div>
      {rows.map((row, i) => (
        <div className="sheet-row" key={i}>
          <span className="row-num">{i + 1}</span>
          {Array.from({ length: Math.max(2, row.length) }, (_, j) => (
            <input
              key={j}
              aria-label={`Linha ${i + 1} coluna ${j + 1}`}
              value={row[j] || ""}
              onChange={(e) => {
                const copy = rows.map((r) => [...r]);
                if (!copy[i]) copy[i] = [];
                copy[i][j] = e.target.value;
                onChange(copy.map((r) => r.join(",")).join("\n"));
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
