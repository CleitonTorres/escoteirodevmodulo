import "server-only";
import { layerLimit, sceneAssets, sceneColors, sceneHeight, sceneWidth, theoryImageUrl, theoryLimit, type SceneAsset, type SceneLayer, type TheoryBlock, type TheoryFigure, type TheoryImagePolicy } from "@/data/lesson-theory";

const validId = (value: unknown): value is string => typeof value === "string" && /^[a-z0-9-]{1,64}$/.test(value);
const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value);
const numberIn = (value: unknown, min: number, max: number): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
const text = (value: unknown, max: number) => typeof value === "string" && value.length <= max ? value.trim() : undefined;

export function theoryImagePolicy(): TheoryImagePolicy {
  return {
    origins: (process.env.THEORY_IMAGE_ORIGINS ?? "").split(",").map((origin) => origin.trim()).filter(Boolean),
    bucket: process.env.BUCKET_NAME?.trim(),
  };
}

function readLayers(input: unknown): SceneLayer[] | string {
  if (!Array.isArray(input)) return "Revise as camadas da cena.";
  if (input.length > layerLimit) return `A cena pode ter até ${layerLimit} camadas.`;
  const ids = new Set<string>();
  const layers: SceneLayer[] = [];
  for (const [index, item] of input.entries()) {
    const layer = `Camada ${index + 1}`;
    if (!record(item)) return `${layer}. Revise os dados da peça.`;
    const { id, asset, x, y, width, height } = item;
    if (!validId(id) || ids.has(id)) return `${layer}. Remova e adicione a peça novamente.`;
    if (typeof asset !== "string" || !Object.hasOwn(sceneAssets, asset)) {
      return `${layer}. Escolha uma peça disponível na biblioteca.`;
    }
    if (!numberIn(width, 16, sceneWidth) || !numberIn(height, 16, sceneHeight) ||
      !numberIn(x, 0, sceneWidth - width) || !numberIn(y, 0, sceneHeight - height) ||
      (item.rotation != null && !numberIn(item.rotation, -180, 180))) {
      return `${layer}. Revise a posição, o tamanho e a rotação da peça.`;
    }
    // Earlier saves stored unset optional fields as BSON null.
    const rotation = item.rotation ?? undefined;
    const color = item.color ?? undefined;
    const hidden = item.hidden ?? undefined;
    const locked = item.locked ?? undefined;
    if (
      (color !== undefined && (typeof color !== "string" || !Object.hasOwn(sceneColors, color))) ||
      (hidden !== undefined && typeof hidden !== "boolean") || (locked !== undefined && typeof locked !== "boolean")
    ) return `${layer}. Revise a cor, a visibilidade e o bloqueio da peça.`;
    const label = text(item.text, 80);
    if (asset === "label" && !label) return `${layer}. Informe o texto do rótulo.`;
    ids.add(id);
    layers.push({
      id, asset: asset as SceneAsset, x, y, width, height,
      ...(typeof rotation === "number" && { rotation }),
      ...(color !== undefined && { color }),
      ...(hidden !== undefined && { hidden }),
      ...(locked !== undefined && { locked }),
      ...(label && { text: label }),
    });
  }
  return layers.some(({ hidden }) => !hidden) ? layers : "A cena deve ter pelo menos uma peça visível.";
}

function readFigure(item: unknown): TheoryFigure | string {
  if (!record(item)) return "Revise a ilustração.";
  const alt = text(item.alt, 350);
  const caption = text(item.caption ?? "", 230);
  if (!alt || caption === undefined) return "Informe a descrição da ilustração e revise a legenda.";
  if (item.kind === "image") {
    const url = typeof item.url === "string" ? theoryImageUrl(item.url.trim(), theoryImagePolicy()) : undefined;
    return url ? { kind: "image", url, alt, caption } : "Use o endereço de uma imagem de origem autorizada.";
  }
  if (item.kind !== "scene") return "Escolha um tipo de ilustração válido.";
  const layers = readLayers(item.layers);
  return typeof layers === "string" ? layers : { kind: "scene", layers, alt, caption };
}

export function readTheory(raw: FormDataEntryValue | null): TheoryBlock[] | string {
  if (typeof raw !== "string" || raw.length > 150_000) return "Revise os parágrafos da teoria.";
  let input: unknown;
  try {
    input = JSON.parse(raw);
  } catch {
    return "Revise os parágrafos da teoria.";
  }
  if (!Array.isArray(input) || !input.length || input.length > theoryLimit) return "Informe de 1 a 20 parágrafos de teoria.";
  const ids = new Set<string>();
  const blocks: TheoryBlock[] = [];
  for (const [index, item] of input.entries()) {
    if (!record(item) || !validId(item.id) || ids.has(item.id)) return "Revise os parágrafos da teoria.";
    const paragraph = text(item.text, 1000);
    if (!paragraph) return `Informe o texto do parágrafo ${index + 1} (até 1.000 caracteres).`;
    const figure = item.figure === undefined ? undefined : readFigure(item.figure);
    if (typeof figure === "string") return `Parágrafo ${index + 1}. ${figure}`;
    blocks.push({ id: item.id, text: paragraph, ...(figure && { figure }) });
    ids.add(item.id);
  }
  return blocks;
}
