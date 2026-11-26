"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { Check, RotateCcw, Star } from "lucide-react";
import { typingLevels, type TypingDraft, type TypingEditAction } from "@/data/disciplinas";
import { fingerInstruction, keyboardRows, typingEditHint, typingEditInstructions, typingHint, type Finger, type Hand } from "@/data/teclado-abnt2";
import { typingErrorPenalty, typingInputErrors, typingMinimumScore, typingScore, typingTargetSeconds, type TypingAttempt } from "@/lib/typing-score";
import "./typing-panel.css";

const fingers = [
  { id: "little", x: 13, y: 35, height: 34 },
  { id: "ring", x: 31, y: 18, height: 50 },
  { id: "middle", x: 49, y: 8, height: 61 },
  { id: "index", x: 67, y: 16, height: 54 },
] as const;

const shortLabels: Record<string, string> = { "Shift esq.": "⇧", "Shift dir.": "⇧", "Ctrl esq.": "Ctrl", "Ctrl dir.": "Ctrl", Enter: "↵", Caps: "⇪", Tab: "↹" };

function TypingHand({ hand, active }: { hand: Hand; active: Finger[] }) {
  return (
    <figure className="typing-hand" aria-hidden="true">
      <svg viewBox="0 0 120 116" fill="none" focusable="false">
        <g transform={hand === "right" ? "translate(120 0) scale(-1 1)" : undefined}>
          <path className="typing-palm" d="M13 59 Q13 51 23 51 H76 Q84 51 86 61 L91 70 L86 91 Q84 101 77 106 H34 Q24 103 19 94 Q13 85 13 73 Z" />
          {fingers.map(({ id, x, y, height }) => (
            <rect key={id} className="typing-finger" data-active={active.includes(id)} x={x} y={y} width="15" height={height} rx="7.5" />
          ))}
          <path className="typing-finger" data-active={active.includes("thumb")} d="M82 74 L96 58 Q102 51 108 57 Q114 62 109 69 L94 91 Q90 96 84 92 Q79 89 79 83" />
        </g>
      </svg>
      <figcaption>Mão {hand === "left" ? "esquerda" : "direita"}</figcaption>
    </figure>
  );
}

type TypingPanelProps = {
  level: number;
  draft: TypingDraft;
  setLevel: (level: number) => void;
  setDraft: (draft: TypingDraft) => void;
  onComplete: (attempt: TypingAttempt) => void;
  onRetrySave: () => void;
  result: TypingAttempt | null;
  saving: boolean;
  saveError?: string;
  best: number;
};

function matchesEditAction(event: KeyboardEvent<HTMLInputElement>, action: TypingEditAction) {
  const { key, ctrlKey, altKey, metaKey, shiftKey } = event;
  const wordModifier = !metaKey && ctrlKey !== altKey;
  switch (action) {
    case "backspace": return key === "Backspace" && !ctrlKey && !altKey && !metaKey && !shiftKey;
    case "selectAll": return key.toLowerCase() === "a" && (ctrlKey || metaKey) && !altKey && !shiftKey;
    case "deleteWord": return key === "Backspace" && wordModifier && !shiftKey;
    case "selectWord": return key === "ArrowLeft" && wordModifier && shiftKey;
  }
}

export default function TypingPanel({ level, draft, setLevel, setDraft, onComplete, onRetrySave, result, saving, saveError, best }: TypingPanelProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const caret = useRef<number | null>(null);
  const [composition, setComposition] = useState<string | null>(null);
  const current = typingLevels[level];
  const actions = current.edit?.actions ?? [];
  const action = actions[draft.editStep];
  const normalized = draft.value.normalize("NFC");
  const correct = normalized === current.text;
  const reported = useRef(false);
  const needsCorrection = !action && !current.text.startsWith(normalized);
  const finished = !action && composition === null && correct;
  const score = result ? typingScore(result.level, result.elapsedMs, result.errors) : null;
  const passed = score !== null && score >= typingMinimumScore;
  const canAdvance = passed && best >= level + 1 && level + 1 < typingLevels.length;
  const next = needsCorrection ? "" : current.text[normalized.length] ?? "";
  const hints = action ? typingEditHint(action) : typingHint(next, needsCorrection);

  useLayoutEffect(() => {
    if (caret.current === null) return;
    input.current?.setSelectionRange(caret.current, caret.current);
    caret.current = null;
  }, [draft]);

  useEffect(() => {
    if (!finished) {
      reported.current = false;
      return;
    }
    if (reported.current || result || draft.startedAt === null) return;
    reported.current = true;
    onComplete({
      level: level + 1,
      text: normalized,
      editSteps: draft.editStep,
      elapsedMs: Math.round(performance.now() - draft.startedAt),
      errors: draft.errors,
    });
  }, [finished, onComplete, result, draft, level, normalized]);

  const mainKeys = hints.map((hint) => hint.key);
  const modifiers = hints.flatMap((hint) => hint.modifiers ?? []);
  const activeFingers = (hand: Hand) => [...mainKeys, ...modifiers]
    .filter((key) => key.hand === hand)
    .map((key) => key.finger);

  function applyEditAction() {
    const element = input.current;
    if (!action || !element) return;
    element.focus();
    const value = draft.value;
    const start = element.selectionStart ?? value.length;
    const end = element.selectionEnd ?? start;
    const previousWord = value.slice(0, start).match(/\S+\s*$/u)?.index ?? 0;
    let updated = value;
    if (action === "selectAll") element.select();
    else if (action === "selectWord") {
      if (previousWord === start && start === end) return;
      element.setSelectionRange(previousWord, end, "backward");
    } else {
      let from = start;
      if (start === end) {
        if (start === 0) return;
        const lastCharacter = Array.from(value.slice(0, start)).at(-1);
        from = action === "deleteWord" ? previousWord : start - (lastCharacter?.length ?? 0);
      }
      updated = value.slice(0, from) + value.slice(end);
      caret.current = from;
    }
    setDraft({ ...draft, value: updated, editStep: draft.editStep + 1, startedAt: draft.startedAt ?? performance.now() });
  }

  function enterText(value: string) {
    if (value === draft.value) return;
    setDraft({
      ...draft,
      value: action ? draft.value : value,
      startedAt: draft.startedAt ?? performance.now(),
      errors: draft.errors + (action ? 1 : typingInputErrors(draft.value, value, current.text)),
    });
  }

  return (
    <section className="typing-card guided-typing" aria-labelledby={`${id}-title`}>
      <div className="typing-head">
        <h2 id={`${id}-title`}>Treino de digitação</h2>
        <span className="level-chip" role="status">Nível {level + 1} de {typingLevels.length}</span>
      </div>
      <label className="typing-level-selection">
        <span>Exercício</span>
        <select value={level} onChange={(event) => setLevel(Number(event.currentTarget.value))}>
          {typingLevels.map((exercise, index) => (
            <option key={exercise.name} value={index} disabled={index > best}>
              {index + 1}. {exercise.name}{index > best ? " (bloqueado)" : ""}
            </option>
          ))}
        </select>
      </label>
      <p className="typing-instruction" id={`${id}-instruction`}>
        {action ? "Corrija o rascunho seguindo os atalhos indicados. Depois complete o texto abaixo."
          : <>Apoie os indicadores em <strong>F</strong> e <strong>J</strong>. Digite o texto abaixo e acompanhe a dica do dedo recomendado.</>}
      </p>
      <p id={`${id}-score`} className="typing-score-rules">
        Nota mínima de <strong>{typingMinimumScore}/100</strong> · Meta de <strong>{typingTargetSeconds(level + 1)} s</strong> · Cada erro custa {typingErrorPenalty} pontos.
        O tempo começa na primeira ação do exercício.
      </p>
      <div className="typing-prompt" aria-hidden="true">
        {Array.from(current.text, (letter, index) => {
          const expected = !action && index === normalized.length && !needsCorrection;
          const feedback = action || index >= normalized.length ? "" : normalized[index] === letter ? "typed-correct" : "typed-wrong";
          return (
            <span className={expected ? "typing-next-character" : feedback} key={index}>
              {letter === " " && expected ? "␣" : letter}
            </span>
          );
        })}
      </div>
      <span className="sr-only" id={`${id}-target`}>{current.text}</span>
      <label className="field-label" htmlFor={`${id}-input`}>{action ? "Rascunho para corrigir" : "Digite o texto do exercício"}</label>
      <input ref={input} id={`${id}-input`} className="typing-input"
        aria-describedby={`${id}-instruction ${id}-score ${id}-target ${id}-hint`}
        aria-invalid={needsCorrection || undefined}
        autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
        value={composition ?? draft.value} readOnly={finished}
        onPaste={(event) => event.preventDefault()}
        onDrop={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if (!action || event.nativeEvent.isComposing || !matchesEditAction(event, action)) return;
          event.preventDefault();
          applyEditAction();
        }}
        onChange={(event) => {
          if (composition !== null) setComposition(event.currentTarget.value);
          else enterText(event.currentTarget.value);
        }}
        onCompositionStart={() => {
          setComposition(draft.value);
          if (draft.startedAt === null) setDraft({ ...draft, startedAt: performance.now() });
        }}
        onCompositionEnd={(event) => {
          enterText(event.currentTarget.value);
          setComposition(null);
        }}
      />

      <div id={`${id}-hint`} className="typing-coach" role="status" aria-atomic="true">
        {result ? (
          <>
            <p>{passed && <Check size={20} aria-hidden="true" />} <strong>{passed ? "Nota de corte atingida" : "Nota abaixo do mínimo"}</strong></p>
            <p>{score}/100 · {(result.elapsedMs / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} s · {result.errors} {result.errors === 1 ? "erro" : "erros"}</p>
            {!passed && <p>Reinicie o exercício para fazer outra tentativa.</p>}
            {passed && best < level + 1 && <p>{saving ? "Registrando sua nota…" : saveError}</p>}
          </>
        ) : finished ? null : (
          <>
            <p><strong>{action ? `Edição ${draft.editStep + 1} de ${actions.length}`
              : needsCorrection ? "Corrija o texto digitado." : hints.length > 1 ? "Digite nesta ordem" : "Próxima tecla"}</strong></p>
            {action && <p>{typingEditInstructions[action]}</p>}
            {hints.length > 0 && (
              <ol className="typing-hints">
                {hints.map(({ key, legend, modifiers }) => (
                  <li key={legend}>
                    {modifiers?.map((modifier) => (
                      <span key={modifier.label}><kbd>{modifier.label}</kbd> {fingerInstruction(modifier)} + </span>
                    ))}
                    <kbd>{legend}</kbd> {fingerInstruction(key)}
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </div>
      {canAdvance && <button type="button" className="secondary-btn" onClick={() => {
        setLevel(level + 1);
        input.current?.focus();
      }}>Próximo nível</button>}
      {result && passed && best < level + 1 && saveError && !saving && (
        <button type="button" className="secondary-btn" onClick={onRetrySave}>Tentar salvar novamente</button>
      )}
      {action && <button type="button" className="secondary-btn" onClick={applyEditAction}>Aplicar no teclado virtual</button>}

      <div className="typing-visual" aria-hidden="true">
        <div className="abnt-keyboard">
          <div className="abnt-heading">Teclado brasileiro ABNT2</div>
          {keyboardRows.map((row, index) => (
            <div className="abnt-row" key={index}>
              {row.map((key) => (
                <div className="abnt-key" key={key.label}
                  data-target={mainKeys.includes(key)} data-modifier={modifiers.includes(key)}
                  data-home={key.label === "f" || key.label === "j"}
                  style={{ flexGrow: key.width ?? 1 }}>
                  {shortLabels[key.label] ?? key.label.toUpperCase()}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="typing-hands">
          <TypingHand hand="left" active={activeFingers("left")} />
          <TypingHand hand="right" active={activeFingers("right")} />
        </div>
      </div>
      <div className="typing-footer">
        <span><Star size={18} aria-hidden="true" /> {best ? `Melhor nível concluído: ${best}` : "Nenhum nível concluído ainda"}</span>
        <button className="secondary-btn" onClick={() => {
          setLevel(level);
          setComposition(null);
          input.current?.focus();
          input.current?.setSelectionRange(draft.value.length, draft.value.length);
        }}>
          <RotateCcw size={18} aria-hidden="true" /> Reiniciar exercício
        </button>
      </div>
    </section>
  );
}
