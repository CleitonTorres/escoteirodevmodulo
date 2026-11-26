import { parse, tokenizer, type Expression, type Token } from "acorn";
import type { DesktopFile } from "./desktop-files";

export type CodeRule = "variable-types";

function isConsoleLog(expression: Expression) {
  if (expression.type !== "CallExpression") return false;
  const { callee } = expression;
  return callee.type === "MemberExpression" &&
    callee.object.type === "Identifier" && callee.object.name === "console" &&
    (callee.computed ? callee.property.type === "Literal" && callee.property.value === "log"
      : callee.property.type === "Identifier" && callee.property.name === "log");
}

type Primitive = "string" | "number" | "boolean";
type Value = { kind: "primitive"; type: Primitive } | { kind: "typeof"; type: Primitive; variable: string };

function variableTypes(body: ReturnType<typeof parse>["body"]) {
  const variables = new Map<string, Value | undefined>();
  const shown = { string: new Set<string>(), number: new Set<string>(), boolean: new Set<string>() };

  function value(expression: Expression | null | undefined): Value | undefined {
    if (!expression) return;
    switch (expression.type) {
      case "Identifier": return variables.get(expression.name);
      case "Literal": {
        const type = typeof expression.value;
        if (type === "string" || type === "number" || type === "boolean") return { kind: "primitive", type };
        break;
      }
      case "TemplateLiteral": return { kind: "primitive", type: "string" };
      case "UnaryExpression": {
        const operand = value(expression.argument);
        if (expression.operator === "typeof" && expression.argument.type === "Identifier" && operand?.kind === "primitive") {
          return { kind: "typeof", type: operand.type, variable: expression.argument.name };
        }
        if (["+", "-"].includes(expression.operator) && operand?.type === "number") return { kind: "primitive", type: "number" };
        break;
      }
    }
  }

  function observe(expression: Expression) {
    const result = value(expression);
    if (result?.kind === "typeof") shown[result.type].add(result.variable);
    if (expression.type === "TemplateLiteral") expression.expressions.forEach(observe);
    if (expression.type === "ArrayExpression") {
      expression.elements.forEach((item) => { if (item && item.type !== "SpreadElement") observe(item); });
    }
    if (expression.type === "BinaryExpression" && expression.operator === "+") {
      if (expression.left.type !== "PrivateIdentifier") observe(expression.left);
      observe(expression.right);
    }
  }

  for (const statement of body) {
    if (statement.type === "VariableDeclaration") {
      for (const declaration of statement.declarations) {
        if (declaration.id.type === "Identifier") variables.set(declaration.id.name, value(declaration.init));
      }
    }
    if (statement.type !== "ExpressionStatement") continue;
    const expression = statement.expression;
    if (expression.type === "AssignmentExpression" && expression.operator === "=" &&
        expression.left.type === "Identifier" && variables.has(expression.left.name)) {
      variables.set(expression.left.name, value(expression.right));
    }
    if (expression.type === "CallExpression" && isConsoleLog(expression)) {
      for (const argument of expression.arguments) {
        if (argument.type !== "SpreadElement") observe(argument);
      }
    }
  }
  // At most two names can be excluded at each choice.
  const strings = [...shown.string].slice(0, 3);
  const numbers = [...shown.number].slice(0, 3);
  const booleans = [...shown.boolean].slice(0, 3);
  return strings.some((a) => numbers.some((b) => a !== b && booleans.some((c) => c !== a && c !== b)));
}

const options = { ecmaVersion: "latest" } as const;
const keyAndEventNames = new Set(["keydown", "keyup", "mouseover", "mouseout", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
function tokenKey(token: Token): string {
  const { value } = token as Token & { value?: unknown };
  if (token.type.label === "string" && typeof value === "string" && keyAndEventNames.has(value)) return `name:${value}`;
  if (token.type.label === "regexp") return `regexp:${JSON.stringify(value)}`;
  return `${token.type.label}:${typeof value === "bigint" ? `${value}n` : String(value ?? "")}`;
}

function javascriptTokens(source: string) {
  return Array.from(tokenizer(source, options), tokenKey);
}

export function validJavascriptMarker(marker: string) {
  try { return javascriptTokens(marker).length > 0; }
  catch { return false; }
}

function javascriptMatches(source: string, markers: string[], rule?: CodeRule) {
  const { body } = parse('"use strict";\n' + source, {
    ...options, sourceType: "module", allowAwaitOutsideFunction: true, allowReturnOutsideFunction: true,
  });
  if (rule === "variable-types") return variableTypes(body);
  if (markers.every((marker) => marker.replace(/\s/g, "") === "console.log(")) {
    return body.filter((statement) => {
      if (statement.type !== "ExpressionStatement" || statement.expression.type !== "CallExpression" ||
          !isConsoleLog(statement.expression)) return false;
      return statement.expression.arguments.some((arg) => arg.type !== "Literal" ||
        typeof arg.value !== "string" || arg.value.trim().length > 0);
    }).length >= markers.length;
  }
  const tokens = javascriptTokens(source);
  const positions = new Map<string, number>();
  return markers.every((marker) => {
    const expected = javascriptTokens(marker);
    if (!expected.length) return false;
    const key = JSON.stringify(expected);
    for (let index = positions.get(key) ?? 0; index <= tokens.length - expected.length; index++) {
      if (!expected.every((token, offset) => tokens[index + offset] === token)) continue;
      positions.set(key, index + expected.length);
      return true;
    }
    return false;
  });
}

export function codeMatches(file: DesktopFile, markers: string[] = [], rule?: CodeRule) {
  const source = file.text ?? "";
  if (!source.trim() || (!rule && !markers.length)) return false;
  const name = file.name.toLowerCase();
  if (name.endsWith(".js")) {
    try { return javascriptMatches(source, markers, rule); }
    catch { return false; }
  }
  if (rule) return false;
  const html = /\.html?$/.test(name);
  const uncommented = html ? source.replace(/<!--[\s\S]*?(?:-->|$)/g, "")
    : name.endsWith(".css") ? source.replace(/("(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*')|\/\*[\s\S]*?(?:\*\/|$)/g,
      (_, quoted) => quoted ?? " ")
    : source;
  const compact = (value: string) => value.replace(/\s+/g, "").replaceAll("'", '"');
  const normalized = compact(uncommented);
  const positions = new Map<string, number>();
  return markers.every((marker) => {
    if (html && /^<[a-z][\w-]*$/i.test(marker)) {
      const matches = uncommented.match(new RegExp(`${marker}(?=[\\s/>])`, "gi"))?.length ?? 0;
      const count = (positions.get(marker) ?? 0) + 1;
      positions.set(marker, count);
      return count <= matches;
    }
    const needle = compact(marker);
    const index = normalized.indexOf(needle, positions.get(needle) ?? 0);
    if (!needle || index < 0) return false;
    positions.set(needle, index + needle.length);
    return true;
  });
}
