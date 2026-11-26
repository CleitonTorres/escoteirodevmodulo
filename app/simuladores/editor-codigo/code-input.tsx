import { useDeferredValue, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { desktopTextLimit } from "@/lib/desktop-files";
import { codeLanguage, javascriptDiagnostic, suggestCode, type CodeSuggestions } from "./code-assistance";

type Completion = { source: string; suggestions: CodeSuggestions; selected: number };

export default function CodeInput({ filename, text, change }: {
  filename: string;
  text: string;
  change: (text: string) => void;
}) {
  const id = useId();
  const input = useRef<HTMLTextAreaElement>(null);
  const editor = useRef<HTMLDivElement>(null);
  const [pendingCompletion, setCompletion] = useState<Completion | null>(null);
  const completion = pendingCompletion?.source === text ? pendingCompletion : null;
  const language = codeLanguage(filename);
  const deferredText = useDeferredValue(text);
  const syntaxError = useMemo(() => language === "javascript" ? javascriptDiagnostic(deferredText) : null,
    [language, deferredText]);
  const error = deferredText === text ? syntaxError : null;
  const listId = `${id}-suggestions`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  function replace(from: number, to: number, replacement: string) {
    const next = text.slice(0, from) + replacement + text.slice(to);
    if (next.length > desktopTextLimit) return;
    change(next);
    const cursor = from + replacement.length;
    requestAnimationFrame(() => {
      const field = input.current;
      if (field?.value === next) field.setSelectionRange(cursor, cursor);
    });
  }

  function choose(option: string) {
    if (!completion) return;
    setCompletion(null);
    input.current?.focus();
    replace(completion.suggestions.from, completion.suggestions.to, option);
  }

  function handleKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing) return;
    const { selectionStart: start, selectionEnd: end } = event.currentTarget;
    if (event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey &&
        (event.code === "Space" || event.key === " ") && language) {
      event.preventDefault();
      const suggestions = start === end ? suggestCode(language, text, start, true) : null;
      setCompletion(suggestions ? { source: text, suggestions, selected: 0 } : null);
      return;
    }
    if (event.ctrlKey || event.altKey || event.metaKey) return;

    if (completion && !event.shiftKey) {
      const { suggestions, selected } = completion;
      const count = suggestions.options.length;
      switch (event.key) {
        case "ArrowDown":
        case "ArrowUp": {
          event.preventDefault();
          const next = event.key === "ArrowDown" ? (selected + 1) % count
            : (selected < 0 ? count - 1 : (selected - 1 + count) % count);
          setCompletion({ ...completion, selected: next });
          return;
        }
        case "Escape":
          event.preventDefault();
          setCompletion(null);
          return;
        case "Enter":
          if (selected >= 0) {
            event.preventDefault();
            choose(suggestions.options[selected]);
            return;
          }
          setCompletion(null);
          break;
      }
    }

    if (event.key !== "Enter") return;
    const currentLine = text.slice(text.lastIndexOf("\n", start - 1) + 1, start);
    const whitespace = /^[ \t]*/.exec(currentLine)?.[0] ?? "";
    const opensBlock = currentLine.trimEnd().endsWith("{");
    if (!whitespace && !opensBlock) return;
    const insertion = `\n${whitespace}${opensBlock ? "  " : ""}`;
    if (text.length - (end - start) + insertion.length > desktopTextLimit) return;
    event.preventDefault();
    replace(start, end, insertion);
  }

  function goToError() {
    const field = input.current;
    if (!field || !error) return;
    field.focus();
    field.setSelectionRange(error.offset, error.offset);
    const lineHeight = parseFloat(getComputedStyle(field).lineHeight);
    const lineTop = (error.line - 1) * lineHeight;
    if (lineTop < field.scrollTop || lineTop + 2 * lineHeight > field.scrollTop + field.clientHeight) {
      field.scrollTop = Math.max(0, lineTop - lineHeight);
    }
  }

  return <>
    <div className="code-input" ref={editor}>
      <div className="code-line-numbers" aria-hidden="true">
        <div>{text.split("\n").map((_, index) => <div key={index}
          className={error?.line === index + 1 ? "code-line-number-error" : undefined}>{index + 1}</div>)}</div>
      </div>
      <div className="code-editing-area">
        {error && <div className="code-error-track" aria-hidden="true">
          <div className="code-error-line" style={{ top: `calc(var(--code-padding) + ${error.line - 1} * var(--code-line-height))` }} />
        </div>}
        <textarea ref={input} value={text} maxLength={desktopTextLimit}
          onChange={({ currentTarget: field }) => {
            change(field.value);
            const suggestions = field.selectionStart === field.selectionEnd
              ? suggestCode(language, field.value, field.selectionStart) : null;
            setCompletion(suggestions ? { source: field.value, suggestions, selected: -1 } : null);
          }}
          onKeyDown={handleKey}
          onSelect={({ currentTarget: field }) => {
            const { selectionStart: start, selectionEnd: end } = field;
            setCompletion((current) => current?.suggestions.cursor === start && start === end ? current : null);
          }}
          onBlur={() => setCompletion(null)}
          onScroll={({ currentTarget: field }) => editor.current?.style.setProperty("--code-scroll", `${field.scrollTop}px`)}
          aria-label={`Código de ${filename}`}
          aria-describedby={[language && hintId, error && errorId].filter(Boolean).join(" ") || undefined}
          aria-invalid={error ? true : undefined}
          aria-autocomplete={language ? "list" : undefined}
          aria-controls={completion ? listId : undefined}
          aria-activedescendant={completion && completion.selected >= 0 ? `${listId}-${completion.selected}` : undefined}
          spellCheck={false} autoCapitalize="off" autoCorrect="off" wrap="off"
          placeholder="Escreva seu código aqui" />
      </div>
    </div>
    {completion && <ul className="code-suggestions" id={listId} role="listbox" aria-label="Sugestões de código">
      {completion.suggestions.options.map((option, index) => <li key={option} id={`${listId}-${index}`}
        role="option" aria-selected={index === completion.selected}
        onMouseDown={(event) => event.preventDefault()} onClick={() => choose(option)}>{option}</li>)}
    </ul>}
    {language && <p className="code-input-hint" id={hintId}>
      <kbd>Ctrl</kbd> + <kbd>Espaço</kbd> abre sugestões. Use as setas e pressione <kbd>Enter</kbd> para inserir.
    </p>}
    {error && <button className="code-diagnostic" type="button" id={errorId} onClick={goToError}>
      <strong>Linha {error.line}, coluna {error.column}.</strong> {error.message}
    </button>}
  </>;
}
