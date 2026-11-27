"use client";

import { useRef, useState, type PointerEvent } from "react";
import { defaultSceneColor, layerLimit, newTheoryId, sceneAssets, sceneColors, sceneHeight, sceneWidth, type SceneAsset, type SceneLayer } from "@/data/lesson-theory";
import { LayerGraphic, TheoryScene } from "@/app/trilha/theory-figure";

const assets = Object.entries(sceneAssets) as [SceneAsset, (typeof sceneAssets)[SceneAsset]][];
const clamp = (value: number, min: number, max: number) => Math.round(Math.max(min, Math.min(max, value)));
function position(layer: SceneLayer, x: number, y: number) {
  return { ...layer, x: clamp(x, 0, sceneWidth - layer.width), y: clamp(y, 0, sceneHeight - layer.height) };
}

function LayerNumber({ label, min, max, value, change }: {
  label: string;
  min: number;
  max: number;
  value: number;
  change: (value: number) => void;
}) {
  const [draft, setDraft] = useState<string>();
  return <label>{label}
    <input type="number" min={min} max={max} value={draft ?? value} onChange={(event) => {
      const input = event.currentTarget;
      setDraft(input.value);
      if (input.validity.valid && Number.isFinite(input.valueAsNumber)) change(input.valueAsNumber);
    }} onBlur={(event) => {
      const number = event.currentTarget.valueAsNumber;
      if (Number.isFinite(number)) change(clamp(number, min, max));
      setDraft(undefined);
    }} />
  </label>;
}

export default function TheorySceneEditor({ layers, change }: {
  layers: SceneLayer[];
  change: (layers: SceneLayer[]) => void;
}) {
  const [selectedId, select] = useState<string>();
  const canvas = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: string; pointer: number; offsetX: number; offsetY: number } | null>(null);
  const index = layers.findIndex((layer) => layer.id === selectedId);
  const selected = layers[index];
  const full = layers.length >= layerLimit;

  function canvasPoint(clientX: number, clientY: number) {
    const matrix = canvas.current?.getScreenCTM();
    return matrix ? new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse()) : null;
  }

  function add(asset: SceneAsset, point?: { x: number; y: number }) {
    if (full) return;
    const { width, height } = sceneAssets[asset];
    const layer = position({
      id: newTheoryId(), asset, x: 0, y: 0, width, height,
      ...(asset === "label" && { text: "Escreva o destaque" }),
    }, (point?.x ?? sceneWidth / 2) - width / 2, (point?.y ?? sceneHeight / 2) - height / 2);
    change([...layers, layer]);
    select(layer.id);
  }

  function update(id: string, modify: (layer: SceneLayer) => SceneLayer) {
    change(layers.map((layer) => layer.id === id ? modify(layer) : layer));
  }

  function reorder(direction: number) {
    const next = index + direction;
    if (!selected || next < 0 || next >= layers.length) return;
    const order = [...layers];
    [order[index], order[next]] = [order[next], order[index]];
    change(order);
  }

  function startDrag(layer: SceneLayer, event: PointerEvent<SVGGElement>) {
    if (event.button !== 0) return;
    select(layer.id);
    if (layer.locked) return;
    const point = canvasPoint(event.clientX, event.clientY);
    if (!point) return;
    event.preventDefault();
    drag.current = { id: layer.id, pointer: event.pointerId, offsetX: point.x - layer.x, offsetY: point.y - layer.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  return <div className="theory-builder">
    <details open>
      <summary>Biblioteca de peças SVG</summary>
      <p>Arraste uma peça para a cena ou selecione seu botão para inseri-la no centro.</p>
      <div className="theory-assets">
        {assets.map(([asset, { label, width, height }]) => (
          <button type="button" key={asset} className="secondary-btn" disabled={full} draggable={!full}
            onDragStart={(event) => {
              event.dataTransfer.setData("application/x-trilha-scene-asset", asset);
              event.dataTransfer.effectAllowed = "copy";
            }} onClick={() => add(asset)}>
            <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
              <LayerGraphic layer={{ id: asset, asset, x: 0, y: 0, width, height, text: "Texto" }} />
            </svg>
            {label}
          </button>
        ))}
      </div>
      {full && <p role="status">A cena já tem {layerLimit} camadas.</p>}
    </details>
    <div className="theory-canvas" onDragOver={(event) => {
      if (full || !event.dataTransfer.types.includes("application/x-trilha-scene-asset")) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    }} onDrop={(event) => {
      event.preventDefault();
      const asset = event.dataTransfer.getData("application/x-trilha-scene-asset");
      const point = canvasPoint(event.clientX, event.clientY);
      if (point && Object.hasOwn(sceneAssets, asset)) add(asset as SceneAsset, point);
    }} onPointerMove={(event) => {
      const active = drag.current;
      if (!active || active.pointer !== event.pointerId) return;
      const point = canvasPoint(event.clientX, event.clientY);
      if (point) update(active.id, (layer) => position(layer, point.x - active.offsetX, point.y - active.offsetY));
    }} onLostPointerCapture={() => { drag.current = null; }}>
      <TheoryScene canvasRef={canvas} layers={layers} selected={selectedId} onLayerPointerDown={(layer) => (event) => startDrag(layer, event)} />
    </div>
    <div className="theory-layers">
      <h4>Camadas</h4>
      {layers.length ? <ol aria-label="Camadas da frente para trás">
        {[...layers].reverse().map((layer) => <li key={layer.id}>
          <button type="button" className="secondary-btn" aria-pressed={selectedId === layer.id} onClick={() => select(layer.id)}>
            {sceneAssets[layer.asset].label}{layer.asset === "label" ? ` · ${layer.text}` : ""}
            {layer.hidden && " · oculta"}{layer.locked && " · bloqueada"}
          </button>
        </li>)}
      </ol> : <p>Adicione uma peça da biblioteca para começar.</p>}
    </div>
    {selected && <div className="theory-layer-properties" key={selected.id}>
      <h4>{sceneAssets[selected.asset].label}</h4>
      <div className="theory-buttons">
        <button type="button" className="secondary-btn" disabled={index === layers.length - 1} onClick={() => reorder(1)}>Trazer para frente</button>
        <button type="button" className="secondary-btn" disabled={index === 0} onClick={() => reorder(-1)}>Enviar para trás</button>
        <button type="button" className="secondary-btn" onClick={() => update(selected.id, (layer) => ({ ...layer, hidden: !layer.hidden }))}>
          {selected.hidden ? "Mostrar camada" : "Ocultar camada"}
        </button>
        <button type="button" className="secondary-btn" onClick={() => update(selected.id, (layer) => ({ ...layer, locked: !layer.locked }))}>
          {selected.locked ? "Desbloquear camada" : "Bloquear camada"}
        </button>
        <button type="button" className="management-danger" onClick={() => {
          change(layers.filter(({ id }) => id !== selected.id));
          select(layers[index - 1]?.id ?? layers[index + 1]?.id);
        }}>Remover camada</button>
      </div>
      <fieldset disabled={selected.locked} className="theory-layer-fields">
        <legend>Posição e tamanho</legend>
        {([
          ["x", "Horizontal", 0, sceneWidth - selected.width],
          ["y", "Vertical", 0, sceneHeight - selected.height],
          ["width", "Largura", 16, sceneWidth],
          ["height", "Altura", 16, sceneHeight],
          ["rotation", "Rotação (°)", -180, 180],
        ] as const).map(([field, label, min, max]) => (
          <LayerNumber key={field} label={label} min={min} max={max} value={selected[field] ?? 0} change={(value) => {
            update(selected.id, (layer) => {
              const next = { ...layer, [field]: value };
              return position(next, next.x, next.y);
            });
          }} />
        ))}
        {["rectangle", "circle", "arrow", "label"].includes(selected.asset) && <label>
          Cor do destaque
          <select value={selected.color ?? defaultSceneColor} onChange={(event) => {
            const color = event.target.value;
            update(selected.id, (layer) => ({ ...layer, color }));
          }}>
            {Object.entries(sceneColors).map(([color, name]) => <option key={color} value={color}>{name}</option>)}
          </select>
        </label>}
        {selected.asset === "label" && <label>Texto do rótulo
          <input value={selected.text ?? ""} maxLength={80} onChange={(event) => {
            const text = event.target.value;
            update(selected.id, (layer) => ({ ...layer, text }));
          }} />
        </label>}
      </fieldset>
    </div>}
  </div>;
}
