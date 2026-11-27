"use client";

import { useState } from "react";
import { newTheoryId, theoryBlocks, theoryImageUrl, theoryLimit, type TheoryBlock, type TheoryFigure, type TheoryImagePolicy, type TheoryItem } from "@/data/lesson-theory";
import TheoryIllustration from "@/app/trilha/theory-figure";
import TheorySceneEditor from "./theory-scene-editor";

function FigureEditor({ figure, change, imagePolicy }: {
  figure?: TheoryFigure;
  change: (figure?: TheoryFigure) => void;
  imagePolicy: TheoryImagePolicy;
}) {
  const [preview, setPreview] = useState(false);
  const safeUrl = figure?.kind === "image" ? theoryImageUrl(figure.url.trim(), imagePolicy) : undefined;
  return <div className="theory-figure-editor">
    <label>Ilustração
      <select value={figure?.kind ?? ""} onChange={(event) => {
        setPreview(false);
        const kind = event.target.value;
        const description = { alt: figure?.alt ?? "", caption: figure?.caption ?? "" };
        change(kind === "image" ? { ...description, kind, url: "" } :
          kind === "scene" ? { ...description, kind, layers: [] } : undefined);
      }}>
        <option value="">Sem ilustração</option>
        <option value="image">Link de imagem ou SVG</option>
        <option value="scene">Montar cena SVG</option>
      </select>
    </label>
    {figure && <>
      <label>Descrição da imagem para leitores de tela
        <textarea rows={2} maxLength={350} value={figure.alt} required onChange={(event) => change({ ...figure, alt: event.target.value })} />
      </label>
      <label>Legenda (opcional)
        <input maxLength={230} value={figure.caption ?? ""} onChange={(event) => change({ ...figure, caption: event.target.value })} />
      </label>
      {figure.kind === "image" ? <>
        <label>Endereço da imagem
          <input maxLength={2048} value={figure.url} required onChange={(event) => {
            setPreview(false);
            change({ ...figure, url: event.target.value });
          }} />
        </label>
        <small>Use uma URL HTTPS de origem autorizada ou o caminho de um arquivo em /teoria/.</small>
        {figure.url.trim() && !safeUrl && <small>Esse endereço está fora das origens autorizadas.</small>}
      </> : <TheorySceneEditor layers={figure.layers} change={(layers) => change({ ...figure, layers })} />}
      {(figure.kind === "scene" || safeUrl) && <details onToggle={(event) => setPreview(event.currentTarget.open)}>
        <summary>Prévia para o aluno</summary>
        {preview && <TheoryIllustration figure={figure.kind === "image" && safeUrl ? { ...figure, url: safeUrl } : figure} />}
      </details>}
    </>}
  </div>;
}

export default function LessonTheoryEditor({ theory, imagePolicy }: { theory?: TheoryItem[]; imagePolicy: TheoryImagePolicy }) {
  const [blocks, setBlocks] = useState<TheoryBlock[]>(() => theory?.length ? theoryBlocks(theory) : [{ id: "paragrafo-1", text: "" }]);

  function update(id: string, values: Partial<TheoryBlock>) {
    setBlocks((current) => current.map((block) => block.id === id ? { ...block, ...values } : block));
  }

  function reorder(index: number, offset: number) {
    setBlocks((current) => {
      const next = [...current];
      [next[index], next[index + offset]] = [next[index + offset], next[index]];
      return next;
    });
  }

  return <section className="theory-editor" aria-label="Teoria da aula" onInvalidCapture={(event) => {
    const enclosing = (event.target as HTMLElement).closest("details");
    if (enclosing) enclosing.open = true;
  }}>
    <h3>Teoria da aula</h3>
    <input type="hidden" name="theoryBlocks" value={JSON.stringify(blocks)} />
    {blocks.map(({ id, text, figure }, index) => <fieldset key={id} className="theory-editor-block">
      <legend>Parágrafo {index + 1}</legend>
      <label>Texto do parágrafo
        <textarea rows={3} maxLength={1000} value={text} required onChange={(event) => update(id, { text: event.target.value })} />
      </label>
      <details>
        <summary>{figure ? "Editar ilustração" : "Adicionar ilustração"}</summary>
        <FigureEditor figure={figure} change={(next) => update(id, { figure: next })} imagePolicy={imagePolicy} />
      </details>
      <div className="theory-buttons">
        <button className="secondary-btn" type="button" disabled={!index} onClick={() => reorder(index, -1)}>Subir parágrafo</button>
        <button className="secondary-btn" type="button" disabled={index === blocks.length - 1} onClick={() => reorder(index, 1)}>Descer parágrafo</button>
        <button className="management-danger" type="button" disabled={blocks.length === 1}
          onClick={() => setBlocks((current) => current.filter((block) => block.id !== id))}>Remover parágrafo</button>
      </div>
    </fieldset>)}
    <button className="secondary-btn" type="button" disabled={blocks.length >= theoryLimit} onClick={() => {
      const id = newTheoryId();
      setBlocks((current) => [...current, { id, text: "" }]);
    }}>Adicionar parágrafo</button>
  </section>;
}
