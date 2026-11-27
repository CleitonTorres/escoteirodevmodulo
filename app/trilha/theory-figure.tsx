import type { PointerEventHandler, Ref } from "react";
import { defaultSceneColor, sceneHeight, sceneWidth, type SceneLayer, type TheoryFigure } from "@/data/lesson-theory";

export function LayerGraphic({ layer }: { layer: SceneLayer }) {
  const { asset, width, height } = layer;
  const color = layer.color ?? defaultSceneColor;
  switch (asset) {
    case "rectangle":
      return <rect x={3} y={3} width={width - 6} height={height - 6} rx={6} fill="none" stroke={color} strokeWidth={5} />;
    case "circle":
      return <ellipse cx={width / 2} cy={height / 2} rx={width / 2 - 3} ry={height / 2 - 3} fill="none" stroke={color} strokeWidth={5} />;
    case "arrow": {
      const point = width - 4;
      const head = Math.min(height / 2 - 2, width / 3);
      return <path d={`M4 ${height / 2}H${point} M${point - head} ${height / 2 - head}L${point} ${height / 2}L${point - head} ${height / 2 + head}`}
        fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />;
    }
    case "label":
      return <svg width={width} height={height} overflow="hidden">
        <rect x={1} y={1} width={width - 2} height={height - 2} rx={6} fill="#fff" stroke={color} strokeWidth={2} />
        <text x={8} y={height / 2} dominantBaseline="central" fontFamily="system-ui, sans-serif"
          fontSize={Math.min(22, height * 0.55)} fontWeight={700} fill={color}>{layer.text}</text>
      </svg>;
    default:
      return <image href={`/teoria/${asset}.svg`} width={width} height={height} />;
  }
}

export function TheoryScene({ layers, alt, selected, onLayerPointerDown, canvasRef }: {
  layers: SceneLayer[];
  alt?: string;
  selected?: string;
  onLayerPointerDown?: (layer: SceneLayer) => PointerEventHandler<SVGGElement>;
  canvasRef?: Ref<SVGSVGElement>;
}) {
  return <svg className="theory-scene" ref={canvasRef} viewBox={`0 0 ${sceneWidth} ${sceneHeight}`}
    role={alt ? "img" : undefined} aria-label={alt} aria-hidden={alt ? undefined : true}>
    <rect width={sceneWidth} height={sceneHeight} fill="#f2f7f4" />
    {layers.filter(({ hidden }) => !hidden).map((layer) => (
      <g key={layer.id} transform={`translate(${layer.x} ${layer.y}) rotate(${layer.rotation ?? 0} ${layer.width / 2} ${layer.height / 2})`}
        onPointerDown={onLayerPointerDown?.(layer)} data-movable={onLayerPointerDown && !layer.locked ? "true" : undefined}>
        {onLayerPointerDown && !layer.locked && <rect width={layer.width} height={layer.height} fill="transparent" />}
        <LayerGraphic layer={layer} />
        {selected === layer.id && <rect x={1} y={1} width={layer.width - 2} height={layer.height - 2} fill="none"
          stroke="#1458a0" strokeWidth={2} strokeDasharray="6 4" pointerEvents="none" />}
      </g>
    ))}
  </svg>;
}

export default function TheoryIllustration({ figure }: { figure: TheoryFigure }) {
  return <figure className="theory-figure">
    {figure.kind === "scene" ? <TheoryScene layers={figure.layers} alt={figure.alt} /> :
      // Image links are validated before saving and loaded in the browser as passive images.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={figure.url} alt={figure.alt} loading="lazy" referrerPolicy="no-referrer" />}
    {figure.caption && <figcaption>{figure.caption}</figcaption>}
  </figure>;
}
