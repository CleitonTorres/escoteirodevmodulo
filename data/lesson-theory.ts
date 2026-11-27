export const sceneWidth = 800;
export const sceneHeight = 440;
export const layerLimit = 24;
export const theoryLimit = 20;

export function newTheoryId() {
  return crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint32Array(4)),
    (part) => part.toString(16).padStart(8, "0")).join("");
}

// a key tem que ser igual o nome do arquivo.
export const sceneAssets = {
  desktop: { label: "Área de trabalho", width: 800, height: 440 },
  explorer: { label: "Explorador de arquivos", width: 740, height: 370 },
  taskbar: { label: "Barra de tarefas", width: 700, height: 58 },
  browser: { label: "Navegador", width: 540, height: 290 },
  document: { label: "Editor de texto", width: 480, height: 270 },
  sheet: { label: "Planilha", width: 480, height: 247 },
  code: { label: "Editor de código", width: 480, height: 270 },
  keyboard: { label: "Teclado de treino", width: 520, height: 190 },
  folder: { label: "Ícone de pasta", width: 70, height: 56 },
  file: { label: "Ícone de arquivo", width: 54, height: 64 },
  globe: { label: "Ícone de navegador", width: 60, height: 60 },
  rectangle: { label: "Contorno retangular", width: 180, height: 52 },
  circle: { label: "Contorno circular", width: 80, height: 80 },
  arrow: { label: "Seta", width: 95, height: 36 },
  label: { label: "Rótulo de texto", width: 240, height: 38 },
  monitor: {label: "Monitor", width: 80, height: 80},
  mouse: {label: "Monitor", width: 150, height: 150},
  power_button: {label: "Botão Ligar", width: 150, height: 150},
};

export type SceneAsset = keyof typeof sceneAssets;
export type SceneLayer = {
  id: string;
  asset: SceneAsset;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  color?: string;
  text?: string;
  hidden?: boolean;
  locked?: boolean;
};

export const sceneColors = {
  "#b42318": "Vermelho",
  "#1458a0": "Azul",
  "#124936": "Verde",
  "#182b32": "Escuro",
};
export const defaultSceneColor = "#b42318";

export type TheoryImagePolicy = { origins: string[]; bucket?: string };

export function theoryImageUrl(value: string, { origins, bucket }: TheoryImagePolicy) {
  if (/^\/teoria\/[a-z0-9_-]+\.(?:png|jpe?g|webp|svg)$/i.test(value)) return value;
  if (!value.startsWith("https://") || value.length > 2048) return;
  try {
    const url = new URL(value);
    if (url.username || url.password) return;
    if (origins.includes(url.origin) ||
      (url.origin === "https://storage.googleapis.com" && bucket && url.pathname.startsWith(`/${bucket}/`))) return url.href;
  } catch {
    return;
  }
}

type FigureText = { alt: string; caption?: string };
export type TheoryFigure = FigureText & (
  { kind: "image"; url: string } | { kind: "scene"; layers: SceneLayer[] }
);
export type TheoryBlock = { id: string; text: string; figure?: TheoryFigure };
export type TheoryItem = string | TheoryBlock;

export function theoryBlocks(items: TheoryItem[]): TheoryBlock[] {
  const ids = new Set(items.flatMap((item) => typeof item === "string" ? [] : [item.id]));
  return items.map((item, index) => {
    if (typeof item !== "string") return item;
    let id = `paragrafo-${index + 1}`;
    while (ids.has(id)) id += "-a";
    ids.add(id);
    return { id, text: item };
  });
}

export const folderNavigationBlock: TheoryBlock = {
  id: "conferir-local-no-explorador",
  text: "Antes de criar uma pasta, abra o lugar onde ela deve ficar. O nome no alto do Explorador ajuda a conferir o local.",
  figure: {
    kind: "scene",
    alt: "No Explorador de arquivos, uma seta e um contorno destacam a barra de navegação. Ela mostra que a pasta Arquivos está aberta.",
    caption: "Confira na barra de navegação em qual pasta você está.",
    layers: [
      { id: "janela", asset: "explorer", x: 30, y: 10, width: 740, height: 370, locked: true },
      { id: "contorno", asset: "rectangle", x: 167, y: 58, width: 378, height: 50 },
      { id: "seta", asset: "arrow", x: 240, y: 122, width: 72, height: 31, rotation: -90 },
      { id: "rotulo", asset: "label", x: 162, y: 177, width: 230, height: 38, text: "Barra de navegação" },
    ],
  },
};

export function illustrateFolderNavigation(theory: TheoryItem[]) {
  return theory.map((item) => item === folderNavigationBlock.text ? folderNavigationBlock : item);
}
