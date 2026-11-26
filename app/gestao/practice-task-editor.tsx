"use client";

import { useEffect, useId, useRef, useState } from "react";
import { typingLevels } from "@/data/disciplinas";
import { desktopApps, desktopNameLimit, desktopSheetRows, initialDesktopItems } from "@/lib/desktop-files";
import type { PracticeCheck, PracticeTask } from "@/lib/practice";
import { desktopActions, documentAlignments, documentBlocks, entryTypes, favoritePages,
  listValues, practiceFromFields, practiceKinds, searchEngines, sheetSteps, shortcutActions,
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

  function addTask() {
    // getRandomValues is available on a local network served over HTTP too.
    const id = crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint32Array(4)),
      (part) => part.toString(16).padStart(8, "0")).join("");
    setDrafts((current) => current.length < taskLimit
      ? [...current, { id, instruction: "", kind: "", desktopAction: "" }]
      : current);
  }

  return <section className="practice-editor" ref={panel} aria-label="Tarefas práticas" onInvalidCapture={() => {
    const details = panel.current?.closest("details");
    if (details) details.open = true;
  }}>
    {drafts.length === 0 && <p>Nenhuma tarefa prática cadastrada.</p>}
    {drafts.map((draft, index) => {
      const saved = draft.initial?.check;
      const instructionId = taskField(draft.id, "instruction");
      const hintId = taskField(draft.id, "hint");
      return <fieldset key={draft.id} className="practice-editor-task">
        <legend>Tarefa {index + 1}</legend>
        <input type="hidden" name="practiceTaskId" value={draft.id} />
        <div className="practice-editor-field">
          <label htmlFor={instructionId}>Instrução da tarefa</label>
          <textarea id={instructionId} name={instructionId} rows={2} required maxLength={500}
            value={draft.instruction} onChange={(event) => update(draft.id, { instruction: event.target.value })} />
        </div>
        <div className="practice-editor-field">
          <label htmlFor={hintId}>Dica, opcional</label>
          <textarea id={hintId} name={hintId} rows={2} maxLength={750} defaultValue={draft.initial?.hint} />
        </div>
        <Choice label="Tipo de verificação" name={taskField(draft.id, "kind")} options={practiceKinds}
          value={draft.kind} required onChange={(kind) => {
            if (kind && !Object.hasOwn(practiceKinds, kind)) return;
            update(draft.id, { kind: kind as Draft["kind"], desktopAction: kind === "desktop-event" && saved?.kind === kind ? saved.action : "" });
          }} />
        <CheckFields key={draft.kind} draft={draft} previous={drafts.slice(0, index)}
          onAction={(desktopAction) => update(draft.id, { desktopAction })} />
        <button type="button" className="management-danger" onClick={() => setDrafts((current) => current.filter(({ id }) => id !== draft.id))}
          aria-label={`Remover tarefa ${index + 1}`}>Remover tarefa</button>
      </fieldset>;
    })}
    <button type="button" className="primary-btn" onClick={addTask} disabled={drafts.length >= taskLimit}>Adicionar tarefa</button>
    {drafts.length >= taskLimit && <p>Esta aula atingiu o limite de {taskLimit} tarefas.</p>}
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

function QuizFields({ id, check }: { id: string; check?: Extract<PracticeCheck, { kind: "quiz" }> }) {
  const [options, setOptions] = useState(check?.options.join("\n") ?? "");
  const choices = Object.fromEntries(listValues(options, /\r?\n/).slice(0, 8).map((option, index) => [index, `${index + 1} · ${option}`]));
  const optionsId = taskField(id, "options");
  const feedbackId = taskField(id, "feedback");
  return <>
    <div className="practice-editor-field">
      <label htmlFor={optionsId}>Alternativas</label>
      <textarea id={optionsId} name={optionsId} rows={4} required maxLength={4007} aria-describedby={`${optionsId}-help`}
        value={options} onChange={(event) => setOptions(event.target.value)} />
      <small id={`${optionsId}-help`}>Digite de duas a oito alternativas, uma por linha.</small>
    </div>
    <Choice label="Resposta correta" name={taskField(id, "answer")} options={choices} defaultValue={check?.answer} required />
    <div className="practice-editor-field">
      <label htmlFor={feedbackId}>Explicação da resposta</label>
      <textarea id={feedbackId} name={feedbackId} rows={2} maxLength={1000} required defaultValue={check?.feedback} />
    </div>
  </>;
}
