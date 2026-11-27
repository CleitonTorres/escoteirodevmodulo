"use client";

import { useId, useState, type ReactNode } from "react";
import { Check, ChevronRight, Minus, Plus } from "lucide-react";
import Image from "next/image";
import type { Lesson } from "@/data/lesson-types";
import { situations } from "@/data/informatica-situacoes";
import { currentSimulationStep, practiceKey, taskDone, type PracticeEvent, type PracticeTask } from "@/lib/practice";
import type { Progress } from "@/lib/storage";

export type ObservePractice = (event: PracticeEvent) => Promise<Record<string, string> | null>;

export function PracticeAssistant({ lessonId, task, observe, evidence, minimized, toggle, openGuide, guideLabel, help }: {
  lessonId: number;
  task?: PracticeTask;
  observe: ObservePractice;
  evidence: Progress["practiceEvidence"];
  minimized: boolean;
  toggle: () => void;
  openGuide: () => void;
  guideLabel: string;
  help?: ReactNode;
}) {
  const contentId = useId();
  const [quizFeedback, setQuizFeedback] = useState("");
  const ToggleIcon = minimized ? Plus : Minus;
  const label = minimized ? "Reabrir Devinho" : "Minimizar Devinho";

  return (
    <aside className="practice-assistant" aria-label="Devinho, assistente de prática" data-minimized={minimized}
      onKeyDown={(event) => event.stopPropagation()}>
      <button type="button" className="practice-assistant-toggle" aria-expanded={!minimized}
        aria-controls={contentId} aria-label={label} title={label} onClick={toggle}>
        <span key={task?.id ?? "finished"} className="practice-assistant-icon" aria-hidden="true">
          <Image src="/devinho.svg" alt="" width={44} height={44} unoptimized />
          {!task && <span className="practice-assistant-complete"><Check size={12} /></span>}
        </span>
        <span>Devinho</span>
        <ToggleIcon size={19} aria-hidden="true" />
      </button>
      <div className="practice-assistant-body" id={contentId} hidden={minimized}>
        <div role="status" aria-atomic="true">
          {quizFeedback && <p><strong>Resposta correta.</strong> {quizFeedback}</p>}
        </div>
        <div role="status" aria-atomic="true">
          <strong>{task ? task.action : "Todas as tarefas foram cumpridas."}</strong>
          {task?.hint && <p className="practice-hint"><b>Dica</b> {task.hint}</p>}
        </div>
        {task?.check.kind === "quiz" && <QuizTask key={task.id} lessonId={lessonId} task={task}
          done={false} observe={observe} onFeedback={setQuizFeedback} />}
        {task?.check.kind === "simulation" && <SimulationTask key={task.id} lessonId={lessonId} task={task}
          done={false} evidence={evidence} observe={observe} />}
        {task && help}
        {!task && <button type="button" className="secondary-btn" onClick={openGuide}>Abrir {guideLabel}</button>}
      </div>
    </aside>
  );
}

export function PracticeChecklist({ lesson, progress, observe, renderAction }: {
  lesson: Lesson;
  progress: Progress;
  observe?: ObservePractice;
  renderAction?: (task: PracticeTask) => ReactNode;
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
        {!done && task.hint && <p className="practice-hint">{task.hint}</p>}
        {task.check.kind === "simulation" && observe && <SimulationTask lessonId={lesson.id} task={task} done={done}
          evidence={progress.practiceEvidence} observe={observe} />}
        {renderAction?.(task)}
        {task.check.kind === "quiz" && observe && <QuizTask lessonId={lesson.id} task={task} done={done} observe={observe} />}
      </li>;
    })}
  </ol>;
}

function SimulationTask({ lessonId, task, done, evidence, observe }: {
  lessonId: number; task: PracticeTask; done: boolean; evidence: Progress["practiceEvidence"]; observe: ObservePractice;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  if (task.check.kind !== "simulation" || done) return null;
  const key = practiceKey(lessonId, task.id);
  const index = currentSimulationStep(lessonId, task, evidence);
  if (index === undefined) return null;
  const { title, steps } = situations[task.check.scenario];
  const step = steps[index];

  const answer = async (choice: number) => {
    setPending(true);
    setMessage("");
    try {
      const result = await observe({ kind: "simulation", taskId: task.id, step: index, answer: choice });
      if (result && !result[key]) setMessage(step.feedback);
    } finally {
      setPending(false);
    }
  };

  return <div className="practice-situation">
    <div role="status" aria-atomic="true">
      <div className="practice-situation-header"><strong>{title}</strong><span>Etapa {index + 1} de {steps.length}</span></div>
      <p>{step.prompt}</p>
    </div>
    <div className="practice-answers" role="group" aria-label={step.prompt}>
      {step.options.map((option, choice) => <button type="button" className="secondary-btn" key={option}
        disabled={pending} onClick={() => void answer(choice)}>{option}</button>)}
    </div>
    {message && <p role="status">{message} Tente outra opção.</p>}
  </div>;
}

function QuizTask({ lessonId, task, done, observe, onFeedback }: {
  lessonId: number;
  task: PracticeTask;
  done: boolean;
  observe: ObservePractice;
  onFeedback?: (feedback: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const check = task.check;
  if (check.kind !== "quiz") return null;
  const { feedback } = check;

  async function answer(index: number) {
    setPending(true);
    setMessage("");
    onFeedback?.("");
    try {
      const result = await observe({ kind: "quiz", taskId: task.id, answer: index });
      if (result?.[practiceKey(lessonId, task.id)]) onFeedback?.(feedback);
      else if (result) setMessage("Revise a dica e tente outra opção.");
    } finally {
      setPending(false);
    }
  }

  return <>
    {!done && <div className="practice-answers" role="group" aria-label={task.action}>
      {check.options.map((option, index) => <button type="button" className="secondary-btn" key={option}
        disabled={pending} onClick={() => void answer(index)}>{option}</button>)}
    </div>}
    {(done || message) && <p role="status">{message} {feedback}</p>}
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
