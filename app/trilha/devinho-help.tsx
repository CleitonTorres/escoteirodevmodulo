"use client";

import { useState } from "react";
import { devinhoChoices, type DevinhoContext, type DevinhoMode } from "@/data/devinho";
import type { PracticeTask } from "@/lib/practice";
import { pedirDicaDevinho } from "./devinho-actions";

export default function DevinhoHelp({ lessonTitle, lessonId, task, context, step }: {
  lessonTitle: string;
  lessonId: number;
  task: PracticeTask;
  context: DevinhoContext;
  step?: number;
}) {
  const [pending, setPending] = useState(false);
  const [help, setHelp] = useState<{ text: string; ai?: boolean }>();

  async function ask(mode: DevinhoMode) {
    const { fallback } = devinhoChoices(lessonTitle, task, mode, context, step);
    setPending(true);
    try {
      const selected = await pedirDicaDevinho(lessonId, task.id, mode, context);
      setHelp({ text: selected ?? fallback, ai: selected !== null });
    } catch {
      setHelp({ text: fallback });
    } finally {
      setPending(false);
    }
  }

  return <div className="devinho-help">
    <div className="devinho-actions">
      <button type="button" className="secondary-btn" disabled={pending} onClick={() => void ask("pista")}>Me dê uma pista</button>
      <button type="button" className="secondary-btn" disabled={pending} onClick={() => void ask("explicar")}>Explique de outro jeito</button>
    </div>
    <div role="status" aria-atomic="true">
      {pending ? <p>Devinho está procurando uma dica.</p> : help && <>
        <p className="practice-hint">{help.text}</p>
        <small>{help.ai ? "Dica selecionada com IA." : "Dica da aula."}</small>
      </>}
    </div>
  </div>;
}
