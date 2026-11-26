"use client";

import { useEffect, useId, useRef, useState } from "react";
import { typingLevels } from "@/data/disciplinas";
import { desktopApps, desktopNameLimit, desktopSheetRows, initialDesktopItems } from "@/lib/desktop-files";
import type { PracticeCheck, PracticeTask } from "@/lib/practice";
import { codeRules, desktopActions, documentAlignments, documentBlocks, entryTypes, favoritePages,
  practiceFromFields, practiceKinds, searchEngines, sheetSteps, shortcutActions,
  taskField, taskLimit } from "@/lib/practice-form";

type Kind = PracticeCheck["kind"];
type Draft = {
  id: string;
  initial?: PracticeTask;
  instruction: string;
  kind: Kind | "";
  desktopAction: string;
};

const typingOptions = Object.fromEntries(typingLevels.map((level, index) => [index + 1, `${index + 1} · ${level.name}`]));
const appOptions = Object.fromEntries(desktopApps.map((app) => [app, app]));
const taskKinds = Object.fromEntries(Object.entries(practiceKinds).filter(([kind]) => kind !== "quiz"));

export default function PracticeTaskEditor({ tasks }: { tasks: PracticeTask[] }) {
  const panel = useRef<HTMLElement>(null);
  const [drafts, setDrafts] = useState<Draft[]>(() => tasks.map((task) => ({
    id: task.id, initial: task, instruction: task.action, kind: task.check.kind,
    desktopAction: task.check.kind === "desktop-event" ? task.check.action : "",
  })));

  useEffect(() => {
    const form = panel.current?.closest("form");
    if (!form) return;
    function serialize({ formData }: FormDataEvent) {
      const practice = practiceFromFields(formData);
      if (!practice) return;
      formData.set("practice", JSON.stringify(practice));
      for (const key of [...formData.keys()]) {
        if (key === "practiceTaskId" || key.startsWith("practice.")) formData.delete(key);
      }
    }
    form.addEventListener("formdata", serialize);
    return () => form.removeEventListener("formdata", serialize);
  }, []);

  function update(id: string, changes: Partial<Pick<Draft, "instruction" | "kind" | "desktopAction">>) {
    setDrafts((current) => current.map((draft) => draft.id === id ? { ...draft, ...changes } : draft));
  }

  function addTask(kind: Draft["kind"]) {
    // getRandomValues is available on a local network served over HTTP too.
    const id = crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint32Array(4)),
      (part) => part.toString(16).padStart(8, "0")).join("");
    setDrafts((current) => {
      if (current.length >= taskLimit) return current;
      const draft = { id, instruction: "", kind, desktopAction: "" };
      const firstQuiz = current.findIndex((item) => item.kind === "quiz");
      if (kind === "quiz" || firstQuiz < 0) return [...current, draft];
      return [...current.slice(0, firstQuiz), draft, ...current.slice(firstQuiz)];
    });
  }

  function renderDraft(draft: Draft, index: number) {
    const quiz = draft.kind === "quiz";
    const saved = draft.initial?.check;
    const instructionId = taskField(draft.id, "instruction");
    const hintId = taskField(draft.id, "hint");
    const label = quiz ? "Pergunta" : "Tarefa";
    const remove = quiz ? "Remover pergunta" : "Remover tarefa";
    return <fieldset key={draft.id} className="practice-editor-task">
      <legend>{label} {index + 1}</legend>
      <div className="practice-editor-field">
        <label htmlFor={instructionId}>{quiz ? "Enunciado" : "Instrução da tarefa"}</label>
        <textarea id={instructionId} name={instructionId} rows={2} required maxLength={500}
          value={draft.instruction} onChange={(event) => update(draft.id, { instruction: event.target.value })} />
      </div>
      <div className="practice-editor-field">
        <label htmlFor={hintId}>Dica, opcional</label>
        <textarea id={hintId} name={hintId} rows={2} maxLength={750} defaultValue={draft.initial?.hint} />
      </div>
      {quiz ? <input type="hidden" name={taskField(draft.id, "kind")} value="quiz" /> :
        <Choice label="Tipo de verificação" name={taskField(draft.id, "kind")} options={taskKinds}
          value={draft.kind} required onChange={(kind) => {
            if (kind && !Object.hasOwn(taskKinds, kind)) return;
            update(draft.id, { kind: kind as Draft["kind"], desktopAction: kind === "desktop-event" && saved?.kind === kind ? saved.action : "" });
          }} />}
      <CheckFields key={draft.kind} draft={draft} previous={drafts.slice(0, drafts.indexOf(draft))}
        onAction={(desktopAction) => update(draft.id, { desktopAction })} />
      <button type="button" className="management-danger" onClick={() => setDrafts((current) => current.filter(({ id }) => id !== draft.id))}
        aria-label={`${remove} ${index + 1}`}>{remove}</button>
    </fieldset>;
  }

  const practical = drafts.filter(({ kind }) => kind !== "quiz");
  const questions = drafts.filter(({ kind }) => kind === "quiz");
  const atLimit = drafts.length >= taskLimit;
  return <section ref={panel} aria-label="Atividades da aula" className="management-stack" onInvalidCapture={(event) => {
    const details = (event.target as HTMLElement).closest("details");
    if (details) details.open = true;
  }}>
    {drafts.map(({ id }) => <input key={id} type="hidden" name="practiceTaskId" value={id} />)}
    <details>
      <summary>Tarefas práticas ({practical.length})</summary>
      <div className="practice-editor">
        {practical.map(renderDraft)}
        {practical.length === 0 && <p>Nenhuma tarefa prática cadastrada.</p>}
        <button type="button" className="primary-btn" onClick={() => addTask("")} disabled={atLimit}>Adicionar tarefa</button>
      </div>
    </details>
    <details>
      <summary>Quiz da aula ({questions.length} {questions.length === 1 ? "pergunta" : "perguntas"})</summary>
      <div className="practice-editor">
        {questions.map(renderDraft)}
        {questions.length === 0 && <p>Nenhuma pergunta cadastrada.</p>}
        <button type="button" className="primary-btn" onClick={() => addTask("quiz")} disabled={atLimit}>Adicionar pergunta</button>
      </div>
    </details>
    {atLimit && <p>Esta aula atingiu o limite de {taskLimit} atividades.</p>}
  </section>;
}

function Choice({ label, name, options, value, defaultValue, onChange, required, placeholder = "Selecione" }: {
  label: string;
  name?: string;
  options: Record<string, string>;
  value?: string;
  defaultValue?: string | number;
  onChange?: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  const id = useId();
  return <div className="practice-editor-field">
    <label htmlFor={id}>{label}</label>
    <select id={id} name={name} value={value} defaultValue={value === undefined ? defaultValue ?? "" : undefined}
      required={required} onChange={onChange && ((event) => onChange(event.target.value))}>
      <option value="">{placeholder}</option>
      {Object.entries(options).map(([key, description]) => <option key={key} value={key}>{description}</option>)}
    </select>
  </div>;
}

function NameField({ label, name, itemKind, value, required }: {
  label: string;
  name: string;
  itemKind: "folder" | "file";
  value?: string;
  required?: boolean;
}) {
  const custom = "Outro nome…";
  const known = initialDesktopItems.filter((item) => item.kind === itemKind).map((item) => item.name);
  const [selection, setSelection] = useState(value && !known.includes(value) ? custom : value ?? "");
  const isCustom = selection === custom;
  return <>
    <Choice label={label} name={isCustom ? undefined : name} options={Object.fromEntries([...known, custom].map((option) => [option, option]))}
      value={selection} onChange={setSelection} required={required} placeholder={required ? "Selecione" : "Qualquer nome"} />
    {isCustom && <label>{label} personalizado<input name={name} required maxLength={desktopNameLimit}
      defaultValue={value && !known.includes(value) ? value : undefined} /></label>}
  </>;
}

function PathField({ label, name, value }: { label: string; name: string; value?: string[] }) {
  return <div className="practice-editor-field">
    <label htmlFor={name}>{label}</label>
    <input id={name} name={name} required defaultValue={value?.join(" / ")} maxLength={1233}
      placeholder="Arquivos / Nome do item" aria-describedby={`${name}-help`} />
    <small id={`${name}-help`}>Separe as pastas e o nome do item com uma barra (/).</small>
  </div>;
}

function CheckFields({ draft, previous, onAction }: {
  draft: Draft;
  previous: Draft[];
  onAction: (action: string) => void;
}) {
  const field = (key: string) => taskField(draft.id, key);
  const saved = draft.initial?.check;
  switch (draft.kind) {
    case "entry":
      return <EntryFields id={draft.id} check={saved?.kind === "entry" ? saved : undefined} />;
    case "desktop-event": {
      const check = saved?.kind === "desktop-event" ? saved : undefined;
      const action = draft.desktopAction;
      const nameLabel = action === "open" ? "Nome da pasta" : action === "rename" ? "Novo nome do arquivo" : "Nome do arquivo";
      const dependencies = previous.flatMap((task, index) =>
        task.id === check?.after || (task.kind === "desktop-event" && task.desktopAction && task.desktopAction !== "open")
          ? [[task.id, `${index + 1} · ${task.instruction || "Tarefa sem instrução"}`]] : []);
      return <>
        <Choice label="Ação no simulador" name={field("action")} options={desktopActions} value={action} required onChange={onAction} />
        {action && <NameField key={action} label={nameLabel} name={field("name")} itemKind={action === "open" ? "folder" : "file"}
          value={check?.name} required />}
        {(action === "rename" || (action === check?.action && check?.from)) &&
          <NameField label="Nome anterior, opcional" name={field("from")} itemKind="file" value={check?.from} />}
        {(action === "restore" || (action === check?.action && check?.after)) &&
          <Choice label="Tarefa anterior com o mesmo arquivo" name={field("after")} options={Object.fromEntries(dependencies)}
            defaultValue={check?.after} placeholder="Sem tarefa anterior" />}
      </>;
    }
    case "shortcut":
      return <Choice label="Ação do atalho" name={field("action")} options={shortcutActions}
        defaultValue={saved?.kind === "shortcut" ? saved.action : undefined} required />;
    case "typing":
      return <Choice label="Nível mínimo" name={field("level")} options={typingOptions}
        defaultValue={saved?.kind === "typing" ? saved.level : undefined} required />;
    case "word":
      return <WordFields id={draft.id} check={saved?.kind === "word" ? saved : undefined} />;
    case "code":
      return <CodeFields id={draft.id} check={saved?.kind === "code" ? saved : undefined} />;
    case "sheet": {
      const check = saved?.kind === "sheet" ? saved : undefined;
      return <>
        <PathField label="Caminho da planilha" name={field("file")} value={check?.file} />
        <div className="management-fields">
          <Choice label="Etapa a verificar" name={field("step")} options={sheetSteps} defaultValue={check?.step} required />
          <label>Quantidade de itens<input name={field("itemCount")} type="number" min={1} max={desktopSheetRows - 2}
            defaultValue={check?.itemCount ?? 3} required /></label>
        </div>
        <div className="management-fields">{["Item", "Quantidade", "Valor", "Subtotal"].map((heading, index) =>
          <label key={heading}>Cabeçalho da coluna {"ABCD"[index]}<input name={field(`header${index + 1}`)} required
            maxLength={100} defaultValue={check?.headers[index] ?? heading} /></label>)}</div>
      </>;
    }
    case "quiz":
      return <QuizFields id={draft.id} check={saved?.kind === "quiz" ? saved : undefined} />;
    case "search":
      return <>
        <Choice label="Buscador" name={field("engine")} options={searchEngines}
          defaultValue={saved?.kind === "search" ? saved.engine : undefined} required />
        <div className="practice-editor-field">
          <label htmlFor={field("terms")}>Palavras que devem aparecer na busca</label>
          <input id={field("terms")} name={field("terms")} required maxLength={502} aria-describedby={field("terms-help")}
            defaultValue={saved?.kind === "search" ? saved.terms.join(", ") : undefined} />
          <small id={field("terms-help")}>Separe as palavras por vírgulas.</small>
        </div>
      </>;
    case "favorite": {
      const url = saved?.kind === "favorite" ? saved.url : undefined;
      return <Choice label="Página a favoritar" name={field("url")} options={{ ...favoritePages, ...(url && !Object.hasOwn(favoritePages, url) && { [url]: url }) }}
        defaultValue={url} required />;
    }
  }
  return null;
}

function EntryFields({ id, check }: { id: string; check?: Extract<PracticeCheck, { kind: "entry" }> }) {
  const field = (key: string) => taskField(id, key);
  const [entry, setEntry] = useState<string>(check?.entry ?? "");
  return <>
    <Choice label="Tipo de item" name={field("entry")} options={entryTypes} value={entry} required onChange={setEntry} />
    <PathField label="Caminho do item" name={field("path")} value={check?.path} />
    {entry === "shortcut" && <Choice label="Aplicativo do atalho, opcional" name={field("app")} options={appOptions}
      defaultValue={check?.app} placeholder="Qualquer aplicativo" />}
    {check?.itemId && <input type="hidden" name={field("itemId")} value={check.itemId} />}
  </>;
}

function WordFields({ id, check }: { id: string; check?: Extract<PracticeCheck, { kind: "word" }> }) {
  const field = (key: string) => taskField(id, key);
  const [block, setBlock] = useState<string>(check?.block.type ?? "");
  return <>
    <PathField label="Caminho do documento" name={field("file")} value={check?.file} />
    <div className="management-fields">
      <Choice label="Elemento do documento" name={field("block")} options={documentBlocks} value={block} required onChange={setBlock} />
      {(block === "heading" || (block === check?.block.type && check.block.level !== undefined)) &&
        <Choice label="Nível do título" name={field("headingLevel")} options={{ 1: "Título 1", 2: "Título 2", 3: "Título 3" }}
          defaultValue={check?.block.level} placeholder="Qualquer nível" />}
      {(block === "heading" || block === "paragraph" || (block === check?.block.type && check.block.alignment)) &&
        <Choice label="Alinhamento" name={field("alignment")} options={documentAlignments} defaultValue={check?.block.alignment}
          placeholder="Qualquer alinhamento" />}
      <label>Mínimo de caracteres, opcional<input name={field("minLength")} type="number" min={1} max={50000} defaultValue={check?.block.minLength} /></label>
      {(block === "bulletList" || block === "orderedList" || (block === check?.block.type && check.block.minItems !== undefined)) &&
        <label>Mínimo de itens, opcional<input name={field("minItems")} type="number" min={1} max={100} defaultValue={check?.block.minItems} /></label>}
      {(block === "heading" || (block === check?.block.type && check.distinctHeadings !== undefined)) &&
        <label>Mínimo de títulos diferentes, opcional<input name={field("distinctHeadings")} type="number" min={1} max={100} defaultValue={check?.distinctHeadings} /></label>}
    </div>
    {(block === "heading" || block === "paragraph" || (block === check?.block.type && check.block.bold)) &&
      <label className="management-check"><input name={field("bold")} type="checkbox" defaultChecked={check?.block.bold} /> Exigir texto em negrito</label>}
  </>;
}

function CodeFields({ id, check }: { id: string; check?: Extract<PracticeCheck, { kind: "code" }> }) {
  const [rule, setRule] = useState<string>(check?.rule ?? "markers");
  const field = (name: string) => taskField(id, name);
  return <>
    <PathField label="Caminho do arquivo de código" name={field("file")} value={check?.file} />
    <Choice label="Critério do código" name={field("rule")} options={{ markers: "Trechos esperados no arquivo", ...codeRules }}
      value={rule} onChange={setRule} required />
    {rule === "markers" && <label>Trechos esperados, um por linha
      <textarea name={field("markers")} defaultValue={check?.markers?.join("\n")} rows={4} required />
      <small>Em JavaScript, use palavras e símbolos completos, como console.log( ou while.</small>
    </label>}
    <label className="management-check">
      <input type="checkbox" name={field("quickStart")} defaultChecked={check?.quickStart} /> Criar o arquivo ao abrir pela prática
    </label>
  </>;
}

function QuizFields({ id, check }: { id: string; check?: Extract<PracticeCheck, { kind: "quiz" }> }) {
  const [options, setOptions] = useState(() => (check?.options ?? ["", ""]).map((text, key) => ({ key, text })));
  const [answer, setAnswer] = useState(check?.answer);
  const nextKey = useRef(options.length);
  const optionName = taskField(id, "option");
  const answerName = taskField(id, "answer");
  const feedbackId = taskField(id, "feedback");
  return <>
    <fieldset className="quiz-alternatives">
      <legend>Alternativas</legend>
      {options.map(({ key, text }, index) => <div className="quiz-option" key={key}>
        <label>Alternativa {index + 1}
          <input name={optionName} required maxLength={500} defaultValue={text} />
        </label>
        <label className="management-check">
          <input type="radio" name={answerName} required value={index} checked={answer === key} onChange={() => setAnswer(key)} />
          Marcar alternativa {index + 1} como correta
        </label>
        {options.length > 2 && <button type="button" className="secondary-btn" onClick={() => {
          setOptions((current) => current.filter((option) => option.key !== key));
          if (answer === key) setAnswer(undefined);
        }}>Remover alternativa {index + 1}</button>}
      </div>)}
      {options.length < 8 && <button type="button" className="secondary-btn" onClick={() => {
        const key = nextKey.current++;
        setOptions((current) => [...current, { key, text: "" }]);
      }}>Adicionar alternativa</button>}
    </fieldset>
    <div className="practice-editor-field">
      <label htmlFor={feedbackId}>Explicação da resposta</label>
      <textarea id={feedbackId} name={feedbackId} rows={2} maxLength={1000} required defaultValue={check?.feedback} />
    </div>
  </>;
}
