"use client";

import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, FileText, Italic, List, ListOrdered,
  Minus, Plus, Quote, Redo2, Save, Strikethrough, Underline, Undo2, type LucideIcon,
} from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import { readWordDocument, wordExtensions, type WordValue } from "@/lib/word-document";
import "./word-editor.css";

type EditorProps = {
  name: string;
  value: WordValue;
  onChange: (value: WordValue) => void;
  canChange?: (value: WordValue) => string | undefined;
  save?: () => void;
  saved?: boolean;
  pending?: boolean;
  error?: string;
};

const alignButtons = [
  ["left", "Alinhar à esquerda", AlignLeft], ["center", "Centralizar", AlignCenter],
  ["right", "Alinhar à direita", AlignRight], ["justify", "Justificar", AlignJustify],
] as const;

function Tool({ label, icon: Icon, active, disabled, run }: {
  label: string; icon: LucideIcon; active?: boolean; disabled?: boolean; run: () => void;
}) {
  return <button type="button" className="word-tool" aria-label={label} title={label} aria-pressed={active} disabled={disabled}
    onMouseDown={(event) => event.preventDefault()} onClick={run}><Icon size={19} aria-hidden="true" /></button>;
}

export default function WordEditor(props: EditorProps) {
  const { name, value, saved, pending, error, save } = props;
  const [tab, setTab] = useState<"format" | "insert">("format");
  const [editError, setEditError] = useState("");
  const toolbarId = useId();
  const activeProps = useRef(props);
  activeProps.current = props;
  const accepted = useRef<WordValue | null>(null);
  const extensions = useMemo(() => [...wordExtensions, Extension.create({
    name: "wordDocumentLimits",
    addProseMirrorPlugins() {
      return [new Plugin({
        filterTransaction(transaction) {
          if (!transaction.docChanged) return true;
          const next = readWordDocument(transaction.doc.toJSON());
          const issue = next ? activeProps.current.canChange?.(next) : "Este documento atingiu o limite de tamanho ou formatação.";
          setEditError(issue ?? "");
          if (issue || !next) return false;
          accepted.current = next;
          return true;
        },
      })];
    },
  })], []);

  const editor = useEditor({
    extensions,
    content: value.document,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: { role: "textbox", "aria-multiline": "true", "aria-label": `Conteúdo de ${name}`, spellcheck: "true" },
    },
    onUpdate: () => {
      if (accepted.current) activeProps.current.onChange(accepted.current);
    },
  });
  const current = useEditorState({ editor, selector: ({ editor }) => editor && ({
    undo: editor.can().undo(), redo: editor.can().redo(),
    bold: editor.isActive("bold"), italic: editor.isActive("italic"), underline: editor.isActive("underline"),
    strike: editor.isActive("strike"), bulletList: editor.isActive("bulletList"), orderedList: editor.isActive("orderedList"),
    blockquote: editor.isActive("blockquote"), empty: editor.isEmpty,
    heading: [1, 2, 3].find((level) => editor.isActive("heading", { level })) ?? 0,
    alignment: alignButtons.find(([alignment]) => editor.isActive({ textAlign: alignment }))?.[0] ?? "left",
  }) });
  const wordCount = value.text.trim() ? value.text.trim().split(/\s+/).length : 0;

  return <section className="word-editor" aria-label="Simulador de editor de texto">
    <header className="word-titlebar">
      <span className="word-document-title"><span className="word-file-icon"><FileText size={21} aria-hidden="true" /></span><strong>{name}</strong></span>
      <div className="word-quick" role="group" aria-label="Ações do documento">
        <Tool label="Desfazer" icon={Undo2} disabled={!current?.undo} run={() => editor?.chain().focus().undo().run()} />
        <Tool label="Refazer" icon={Redo2} disabled={!current?.redo} run={() => editor?.chain().focus().redo().run()} />
        {save && <button type="button" className="word-save" onClick={save} disabled={pending}>
          <Save size={16} aria-hidden="true" /> {pending ? "Salvando…" : saved ? "Salvo na sua conta" : "Salvar guia"}
        </button>}
      </div>
    </header>
    <div className="word-tabs" role="group" aria-label="Faixa de ferramentas">
      <button type="button" aria-pressed={tab === "format"} aria-controls={toolbarId} onClick={() => setTab("format")}>Início</button>
      <button type="button" aria-pressed={tab === "insert"} aria-controls={toolbarId} onClick={() => setTab("insert")}>Inserir</button>
    </div>
    <div className="word-ribbon" id={toolbarId}>
      {tab === "format" ? <>
        <div className="word-tool-group" role="group" aria-label="Formatação de texto">
          <Tool label="Negrito" icon={Bold} active={current?.bold} disabled={!editor} run={() => editor?.chain().focus().toggleBold().run()} />
          <Tool label="Itálico" icon={Italic} active={current?.italic} disabled={!editor} run={() => editor?.chain().focus().toggleItalic().run()} />
          <Tool label="Sublinhado" icon={Underline} active={current?.underline} disabled={!editor} run={() => editor?.chain().focus().toggleUnderline().run()} />
          <Tool label="Tachado" icon={Strikethrough} active={current?.strike} disabled={!editor} run={() => editor?.chain().focus().toggleStrike().run()} />
        </div>
        <div className="word-tool-group" role="group" aria-label="Parágrafo">
          {alignButtons.map(([alignment, label, icon]) => <Tool key={alignment} label={label} icon={icon} active={current?.alignment === alignment}
            disabled={!editor} run={() => editor?.chain().focus().setTextAlign(alignment).run()} />)}
          <Tool label="Lista com marcadores" icon={List} active={current?.bulletList} disabled={!editor} run={() => editor?.chain().focus().toggleBulletList().run()} />
          <Tool label="Lista numerada" icon={ListOrdered} active={current?.orderedList} disabled={!editor} run={() => editor?.chain().focus().toggleOrderedList().run()} />
        </div>
        <label className="word-style">
          <span>Estilo</span>
          <select aria-label="Estilo do parágrafo" value={current?.heading ?? 0} disabled={!editor} onChange={(event) => {
            const level = Number(event.target.value);
            if (level === 1 || level === 2 || level === 3) editor?.chain().focus().setHeading({ level }).run();
            else editor?.chain().focus().setParagraph().run();
          }}>
            <option value={0}>Texto normal</option><option value={1}>Título 1</option>
            <option value={2}>Título 2</option><option value={3}>Título 3</option>
          </select>
        </label>
      </> : <div className="word-tool-group word-insert" role="group" aria-label="Inserir no documento">
        <button type="button" disabled={!editor} onClick={() => editor?.chain().focus("end").insertContent([
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Nova seção" }] }, { type: "paragraph" },
        ]).run()}><Plus size={18} aria-hidden="true" /> Nova seção</button>
        <button type="button" disabled={!editor} onClick={() => editor?.chain().focus().setHorizontalRule().run()}><Minus size={18} aria-hidden="true" /> Linha separadora</button>
        <button type="button" disabled={!editor} aria-pressed={current?.blockquote}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}><Quote size={18} aria-hidden="true" /> Citação</button>
      </div>}
    </div>
    {(error || editError) && <p className="word-error" role="alert">{editError || error}</p>}
    <div className="word-desk" data-empty={current?.empty || undefined}>
      <EditorContent className="word-sheet" editor={editor} />
    </div>
    <footer className="word-status"><span><Save size={15} aria-hidden="true" /> Salvamento automático</span><span>{wordCount} {wordCount === 1 ? "palavra" : "palavras"}</span></footer>
  </section>;
}
