import { getSchema, type JSONContent } from "@tiptap/core";
import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

const headingLevels = [1, 2, 3] as const;
export const wordAlignments = ["left", "center", "right", "justify"] as const;
export const wordTextLimit = 50_000;
const wordByteLimit = 300_000;
const wordNodeLimit = 8_000;
const wordDepthLimit = 24;

export const wordExtensions = [
  StarterKit.configure({
    heading: { levels: [...headingLevels] },
    link: false,
    code: false,
    codeBlock: false,
    trailingNode: false,
  }),
  TextAlign.configure({ types: ["heading", "paragraph"], alignments: [...wordAlignments] }),
];

export type WordValue = { document: JSONContent; text: string };

function wordValue(node: ProseMirrorNode): WordValue | null {
  const text = node.textBetween(0, node.content.size, "\n", (leaf) => leaf.type.name === "hardBreak" ? "\n" : "");
  if (text.length > wordTextLimit) return null;
  const serialized = JSON.stringify(node.toJSON());
  if (new TextEncoder().encode(serialized).length > wordByteLimit) return null;
  // ProseMirror attributes can have a null prototype. Server Actions need plain objects.
  return { document: JSON.parse(serialized), text };
}

const wordSchema = getSchema(wordExtensions);

function validAttribute(type: string, key: string, value: unknown) {
  if (key === "textAlign" && (type === "heading" || type === "paragraph")) {
    return value === null || wordAlignments.some((alignment) => alignment === value);
  }
  if (key === "level" && type === "heading") return headingLevels.some((level) => level === value);
  if (key === "start" && type === "orderedList") return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 999_999;
  if (key === "type" && type === "orderedList") return value === null || ["1", "a", "A", "i", "I"].some((style) => style === value);
  return false;
}

export function readWordDocument(value: unknown): WordValue | null {
  let nodes = 0;
  let characters = 0;

  function validNode(raw: unknown, depth: number): boolean {
    if (!raw || typeof raw !== "object" || depth > wordDepthLimit || ++nodes > wordNodeLimit) return false;
    const { type, attrs, marks, text, content } = raw as Record<string, unknown>;
    if (typeof type !== "string" || !Object.hasOwn(wordSchema.nodes, type) || (depth === 0 && type !== "doc")) return false;
    if (attrs !== undefined && (!attrs || typeof attrs !== "object" || Array.isArray(attrs) ||
      Object.entries(attrs).some(([key, attribute]) => !validAttribute(type, key, attribute)))) return false;
    if (marks !== undefined && (!Array.isArray(marks) || marks.length > 5 || marks.some((mark) =>
      !mark || typeof mark.type !== "string" || !Object.hasOwn(wordSchema.marks, mark.type) || mark.attrs !== undefined))) return false;

    if (type === "text") {
      if (typeof text !== "string" || !text || content !== undefined) return false;
      characters += text.length;
      return characters <= wordTextLimit;
    }
    return text === undefined && (content === undefined || (Array.isArray(content) && content.length <= wordNodeLimit &&
      content.every((child) => validNode(child, depth + 1))));
  }

  if (!validNode(value, 0)) return null;
  try {
    const document = wordSchema.nodeFromJSON(value);
    document.check();
    return wordValue(document);
  } catch {
    return null;
  }
}

export function wordFromText(text: string, legacyGuide = false): JSONContent {
  const blocks: JSONContent[] = [];
  const inline = (line: string): JSONContent[] => (legacyGuide ? line.split(/(\*\*[^*]+\*\*)/g) : [line])
    .filter(Boolean).map((part) => legacyGuide && /^\*\*[^*]+\*\*$/.test(part)
      ? { type: "text", text: part.slice(2, -2), marks: [{ type: "bold" }] }
      : { type: "text", text: part });

  for (const line of text.split(/\r?\n/)) {
    const heading = legacyGuide ? /^(#{1,3}) (.+)$/.exec(line) : null;
    const bullet = legacyGuide ? /^- (.+)$/.exec(line) : null;
    if (heading) blocks.push({ type: "heading", attrs: { level: heading[1].length }, content: inline(heading[2]) });
    else if (bullet) {
      const item = { type: "listItem", content: [{ type: "paragraph", content: inline(bullet[1]) }] };
      const previous = blocks.at(-1);
      if (previous?.type === "bulletList") previous.content?.push(item);
      else blocks.push({ type: "bulletList", content: [item] });
    } else blocks.push({ type: "paragraph", content: inline(line) });
  }
  return { type: "doc", content: blocks };
}
