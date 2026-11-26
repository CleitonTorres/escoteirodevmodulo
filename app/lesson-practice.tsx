"use client";

import { useId, useState } from "react";
import { Check, ChevronRight, Compass, Minus, Plus } from "lucide-react";
import type { Lesson } from "@/data/lessons";
import { practiceKey, taskDone, type PracticeEvent, type PracticeTask } from "@/lib/practice";
import type { Progress } from "@/lib/storage";

export type ObservePractice = (event: PracticeEvent) => Promise<Record<string, string> | null>;

export function PracticeAssistant({ task, minimized, toggle, openGuide }: {
  task?: PracticeTask;
  minimized: boolean;
  toggle: () => void;
  openGuide: () => void;
}) {
  const contentId = useId();
  const ToggleIcon = minimized ? Plus : Minus;
  const label = minimized ? "Reabrir ajuda da tarefa" : "Minimizar ajuda da tarefa";

  return (
    <aside className="practice-assistant" aria-label="Assistente de prática" data-minimized={minimized}
      onKeyDown={(event) => event.stopPropagation()}>
      <button type="button" className="practice-assistant-toggle" aria-expanded={!minimized}
        aria-controls={contentId} aria-label={label} title={label} onClick={toggle}>
        <span key={task?.id ?? "finished"} className="practice-assistant-icon">
          {task ? <Compass size={23} aria-hidden="true" /> : <Check size={23} aria-hidden="true" />}
        </span>
        <span>Ajuda da tarefa</span>
        <ToggleIcon size={19} aria-hidden="true" />
      </button>
      <div className="practice-assistant-body" id={contentId} hidden={minimized}>
        <div role="status" aria-atomic="true">
          <strong>{task ? task.action : "Todas as tarefas foram cumpridas."}</strong>
          {task?.hint && <p><b>Dica</b> {task.hint}</p>}
        </div>
        {!task && <button type="button" className="secondary-btn" onClick={openGuide}>Ir para Meu guia</button>}
      </div>
    </aside>
  );
}

export function PracticeChecklist({ lesson, progress, observe }: {
  lesson: Lesson;
  progress: Progress;
  observe?: ObservePractice;
}) {
  return <ol className="practice-checklist">
    {lesson.practice.map((task) => {
      const done = taskDone(lesson.id, task, progress);
      return <li key={task.id}>
        <div className="practice-task-heading">
          <strong>{task.action}</strong>
          <span className="practice-task-status" data-done={done}>
            {done && <Check size={17} aria-hidden="true" />}
            {done ? "Cumprida" : "Pendente"}
          </span>
        </div>
        {!done && task.hint && <p>{task.hint}</p>}
        {task.check.kind === "quiz" && observe && <QuizTask lessonId={lesson.id} task={task} done={done} observe={observe} />}
      </li>;
    })}
  </ol>;
}

function QuizTask({ lessonId, task, done, observe }: {
  lessonId: number;
  task: PracticeTask;
  done: boolean;
  observe: ObservePractice;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const check = task.check;
  if (check.kind !== "quiz") return null;

  async function answer(index: number) {
    setPending(true);
    setMessage("");
    try {
      const result = await observe({ kind: "quiz", taskId: task.id, answer: index });
      if (result && !result[practiceKey(lessonId, task.id)]) setMessage("Revise a dica e tente outra opção.");
    } finally {
      setPending(false);
    }
  }

  return <>
    {!done && <div className="practice-answers" role="group" aria-label={task.action}>
      {check.options.map((option, index) => <button type="button" className="secondary-btn" key={option}
        disabled={pending} onClick={() => void answer(index)}>{option}</button>)}
    </div>}
    {(done || message) && <p role="status">{message} {check.feedback}</p>}
  </>;
}

export function PracticeShortcuts({ observe }: { observe: ObservePractice }) {
  const sample = "Aprender fazendo, um passo de cada vez.";
  const [draft, setDraft] = useState("");
  const [pasted, setPasted] = useState(false);
  return <div className="practice-shortcuts">
    <label>Texto de origem
      <input readOnly value={sample} onCopy={(event) => {
        const input = event.currentTarget;
        if (input.selectionStart === 0 && input.selectionEnd === sample.length) void observe({ kind: "shortcut", action: "copy" });
      }} />
    </label>
    <label>Campo de destino
      <textarea maxLength={500} value={draft} onChange={(event) => { setPasted(false); setDraft(event.target.value); }}
        onPaste={(event) => {
          if (draft || event.clipboardData.getData("text/plain") !== sample) return;
          event.preventDefault();
          setDraft(sample);
          setPasted(true);
          void observe({ kind: "shortcut", action: "paste" });
        }}
        onKeyDown={(event) => {
          if (!pasted || !(event.ctrlKey || event.metaKey) || event.shiftKey || event.altKey || event.key.toLowerCase() !== "z") return;
          event.preventDefault();
          setDraft("");
          setPasted(false);
          void observe({ kind: "shortcut", action: "undo" });
        }} />
    </label>
  </div>;
}

export function FinishLesson({ done, blockedReason, busy, complete, next }: {
  done: boolean;
  blockedReason?: string;
  busy: boolean;
  complete: () => Promise<string | undefined>;
  next?: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function finish() {
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

  if (done) return <div className="practice-finish">
    <strong role="status">Aula concluída</strong>
    {next && <button type="button" className="primary-btn" onClick={next}>Próxima aula <ChevronRight size={17} /></button>}
  </div>;
  return <div className="practice-finish">
    {blockedReason && <p>{blockedReason}</p>}
    <button type="button" className="primary-btn" disabled={Boolean(blockedReason) || busy || pending} onClick={() => void finish()}>
      {pending ? "Concluindo aula…" : "Concluir aula"} <ChevronRight size={17} aria-hidden="true" />
    </button>
    {error && <p role="alert">{error}</p>}
  </div>;
}
