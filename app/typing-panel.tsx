"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, RotateCcw, Star } from "lucide-react";
import { typingLevels } from "@/data/disciplinas";
import { fingerInstruction, keyboardRows, typingHint, type Finger, type Hand } from "@/data/teclado-abnt2";
import "./typing-panel.css";

const fingers = [
  { id: "little", x: 13, y: 35, height: 34 },
  { id: "ring", x: 31, y: 18, height: 50 },
  { id: "middle", x: 49, y: 8, height: 61 },
  { id: "index", x: 67, y: 16, height: 54 },
] as const;

const shortLabels: Record<string, string> = { "Shift esq.": "⇧", "Shift dir.": "⇧", Enter: "↵", Caps: "⇪", Tab: "↹" };

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
  typed: string;
  setLevel: (level: number) => void;
  setTyped: (value: string) => void;
  onComplete: () => void;
  best: number;
};

export default function TypingPanel({ level, typed, setLevel, setTyped, onComplete, best }: TypingPanelProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [compositionBase, setCompositionBase] = useState<string | null>(null);
  const current = typingLevels[level];
  const normalized = (compositionBase ?? typed).normalize("NFC");
  const correct = normalized === current.text;
  const reported = useRef(correct);
  const needsCorrection = !current.text.startsWith(normalized);
  const finished = compositionBase === null && correct;
  const next = needsCorrection ? "" : current.text[normalized.length] ?? "";
  const hints = typingHint(next, needsCorrection);

  useEffect(() => {
    if (!finished) {
      reported.current = false;
      return;
    }
    if (reported.current) return;
    reported.current = true;
    onComplete();
  }, [finished, onComplete]);

  const mainKeys = hints.map((hint) => hint.key);
  const modifiers = hints.flatMap((hint) => hint.shift ? [hint.shift] : []);
  const activeFingers = (hand: Hand) => [...mainKeys, ...modifiers]
    .filter((key) => key.hand === hand)
    .map((key) => key.finger);

  return (
    <section className="typing-card guided-typing" aria-labelledby={`${id}-title`}>
      <div className="typing-head">
        <h2 id={`${id}-title`}>Treino de digitação</h2>
        <span className="level-chip" role="status">Nível {level + 1} de {typingLevels.length}</span>
      </div>
      <div className="level-steps" role="group" aria-label="Níveis de digitação">
        {typingLevels.map((exercise, index) => (
          <button key={exercise.name} className={index === level ? "current" : ""}
            aria-current={index === level ? "step" : undefined} onClick={() => setLevel(index)}>
            <span aria-hidden="true">{index + 1}</span> {exercise.name}
          </button>
        ))}
      </div>
      <p className="typing-instruction" id={`${id}-instruction`}>
        Apoie os indicadores em <strong>F</strong> e <strong>J</strong>. Digite o texto abaixo e acompanhe a dica do dedo recomendado.
      </p>
      <div className="typing-prompt" aria-hidden="true">
        {Array.from(current.text, (letter, index) => {
          const expected = index === normalized.length && !needsCorrection;
          const feedback = index >= normalized.length ? "" : normalized[index] === letter ? "typed-correct" : "typed-wrong";
          return (
            <span className={expected ? "typing-next-character" : feedback} key={index}>
              {letter === " " && expected ? "␣" : letter}
            </span>
          );
        })}
      </div>
      <span className="sr-only" id={`${id}-target`}>{current.text}</span>
      <label className="field-label" htmlFor={`${id}-input`}>Digite o texto do exercício</label>
      <input ref={input} id={`${id}-input`} className="typing-input"
        aria-describedby={`${id}-instruction ${id}-target ${id}-hint`}
        aria-invalid={needsCorrection || undefined}
        autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
        value={typed} onChange={(event) => setTyped(event.currentTarget.value)}
        onCompositionStart={() => setCompositionBase(typed)}
        onCompositionEnd={(event) => {
          setTyped(event.currentTarget.value);
          setCompositionBase(null);
        }}
      />

      <div id={`${id}-hint`} className="typing-coach" role="status" aria-atomic="true">
        {finished ? <p><Check size={20} aria-hidden="true" /> <strong>Você concluiu o exercício!</strong></p> : (
          <>
            <p><strong>{needsCorrection ? "Corrija o texto digitado." : hints.length > 1 ? "Digite nesta ordem" : "Próxima tecla"}</strong></p>
            {hints.length > 0 && (
              <ol className="typing-hints">
                {hints.map(({ key, legend, shift }) => (
                  <li key={legend}>
                    {shift && <><kbd>{shift.label}</kbd> {fingerInstruction(shift)} <span>+</span> </>}
                    <kbd>{legend}</kbd> {fingerInstruction(key)}
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </div>

      <div className="typing-visual" aria-hidden="true">
        <div className="abnt-keyboard">
          <div className="abnt-heading">Teclado brasileiro ABNT2</div>
          {keyboardRows.map((row, index) => (
            <div className="abnt-row" key={index}>
              {row.map((key) => (
                <div className="abnt-key" key={key.label}
                  data-target={mainKeys.includes(key)} data-shift={modifiers.includes(key)}
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
          setLevel(finished ? 0 : level);
          input.current?.focus();
        }}>
          <RotateCcw size={18} aria-hidden="true" /> {finished ? "Recomeçar do nível 1" : "Reiniciar exercício"}
        </button>
      </div>
    </section>
  );
}
