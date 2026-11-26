import { parse } from "acorn";

const javascriptWords = [
  "console", "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "break", "continue", "true", "false", "null", "undefined", "new", "class",
  "async", "await", "try", "catch", "throw", "this", "document", "Math", "Array", "String", "Number",
];
const javascriptMembers = new Map([
  ["console", ["log", "info", "warn", "error", "table"]],
  ["document", ["querySelector", "querySelectorAll", "getElementById", "createElement", "addEventListener"]],
  ["Math", ["abs", "ceil", "floor", "max", "min", "random", "round"]],
  ["Array", ["from", "isArray", "of"]],
  ["Number", ["isInteger", "isNaN", "parseFloat", "parseInt"]],
]);
const htmlTags = [
  "html", "head", "meta", "title", "link", "body", "header", "nav", "main", "section", "article",
  "aside", "footer", "div", "span", "p", "h1", "h2", "h3", "a", "img", "ul", "ol", "li",
  "button", "form", "label", "input", "canvas", "script", "style",
];
const cssProperties = [
  "background", "background-color", "border", "border-radius", "color", "display", "font-family",
  "font-size", "font-weight", "gap", "align-items", "justify-content", "margin", "padding",
  "position", "text-align", "width", "height", "max-width", "flex-direction", "grid-template-columns",
];
const cssValues = [
  "block", "inline", "inline-block", "flex", "grid", "none", "center", "space-between",
  "relative", "absolute", "transparent", "inherit", "auto", "solid", "bold",
];

export type CodeSuggestions = { from: number; to: number; cursor: number; options: string[] };
export type CodeDiagnostic = { offset: number; line: number; column: number; message: string };

export function codeLanguage(filename: string) {
  if (/\.js$/i.test(filename)) return "javascript";
  if (/\.html?$/i.test(filename)) return "html";
  if (/\.css$/i.test(filename)) return "css";
  if (/\.json$/i.test(filename)) return "json";
}

export function suggestCode(
  language: ReturnType<typeof codeLanguage>, text: string, cursor: number, explicit = false,
): CodeSuggestions | null {
  const before = text.slice(text.lastIndexOf("\n", cursor - 1) + 1, cursor);
  const word = language === "javascript" ? /[\w$]+$/ : /[\w-]+$/;
  const prefix = word.exec(before)?.[0] ?? "";
  const beforeWord = before.slice(0, before.length - prefix.length);
  let choices: readonly string[] | undefined;
  let minPrefix = 1;

  switch (language) {
    case "javascript": {
      const receiver = /([\w$]+)\.$/.exec(beforeWord)?.[1];
      if (beforeWord.endsWith(".")) {
        choices = receiver ? javascriptMembers.get(receiver) : undefined;
        minPrefix = 0;
      } else {
        choices = javascriptWords;
        minPrefix = 2;
      }
      break;
    }
    case "html":
      if (/<\/?$/.test(beforeWord)) {
        choices = htmlTags;
        minPrefix = 0;
      }
      break;
    case "css":
      choices = /(?:^|[;{}])\s*[\w-]+\s*:\s*[^;{}]*$/.test(before) ? cssValues : cssProperties;
      break;
    case "json":
      choices = ["true", "false", "null"];
      break;
  }

  if (!choices || (!explicit && prefix.length < minPrefix)) return null;
  // Replace the rest of the word as well when the caret is in the middle.
  const suffix = (language === "javascript" ? /^[\w$]+/ : /^[\w-]+/).exec(text.slice(cursor))?.[0] ?? "";
  const lowerPrefix = prefix.toLowerCase();
  const options = choices.filter((choice) => choice.toLowerCase().startsWith(lowerPrefix) && choice !== prefix + suffix)
    .slice(0, 6);
  return options.length ? { from: cursor - prefix.length, to: cursor + suffix.length, cursor, options } : null;
}

export function javascriptDiagnostic(text: string): CodeDiagnostic | null {
  // The console evaluates the source in a strict async function.
  const strict = '"use strict";\n';
  try {
    parse(strict + text, { ecmaVersion: "latest", allowAwaitOutsideFunction: true, allowReturnOutsideFunction: true });
    return null;
  } catch (error) {
    // Deeply nested input can exceed the parser's call stack before it can report a position.
    if (error instanceof RangeError) return null;
    if (!(error instanceof SyntaxError) || !("pos" in error) || typeof error.pos !== "number" ||
        !("loc" in error) || !error.loc || typeof error.loc !== "object" ||
        !("line" in error.loc) || typeof error.loc.line !== "number" ||
        !("column" in error.loc) || typeof error.loc.column !== "number") throw error;

    const original = error.message.replace(/ \(\d+:\d+\)$/, "");
    const message = original === "Unexpected token" ? "Trecho inesperado. Confira os sinais e valores desta instrução."
      : original === "Unterminated string constant" ? "Falta fechar o texto com aspas."
      : original === "Unterminated template" ? "Falta fechar o texto com uma crase."
      : original === "Unterminated comment" ? "Falta fechar o comentário com */."
      : original === "Not enough stack space to parse input" ? "Há níveis de aninhamento demais para analisar este trecho."
      : original;
    return { offset: error.pos - strict.length, line: error.loc.line - 1, column: error.loc.column + 1, message };
  }
}
