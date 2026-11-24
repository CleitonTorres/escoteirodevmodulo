export type Hand = "left" | "right";
export type Finger = "little" | "ring" | "middle" | "index" | "thumb";

type TypingKey = {
  label: string;
  hand: Hand;
  finger: Finger;
  shifted?: string;
  width?: number;
};

const left = "left";
const right = "right";
const key = (label: string, hand: Hand, finger: Finger, options?: Pick<TypingKey, "shifted" | "width">): TypingKey =>
  ({ label, hand, finger, ...options });

function letterRow(letters: string, hand: Hand, fingers: Finger[]) {
  return Array.from(letters, (letter, index) => key(letter, hand, fingers[index], { shifted: letter.toUpperCase() }));
}

const leftFingers: Finger[] = ["little", "ring", "middle", "index", "index"];
const rightFingers: Finger[] = ["index", "index", "middle", "ring", "little"];
const shiftLeft = key("Shift esq.", left, "little", { width: 1.6 });
const shiftRight = key("Shift dir.", right, "little", { width: 1.8 });
const backspace = key("⌫", right, "little", { width: 1.5 });
const space = key("Espaço", right, "thumb", { width: 5 });

export const keyboardRows = [
  [
    key("'", left, "little", { shifted: '"' }),
    ...Array.from("1234567890", (digit, i) => key(digit, i < 5 ? left : right,
      i < 5 ? leftFingers[i] : rightFingers[i - 5], { shifted: "!@#$%¨&*()"[i] })),
    key("-", right, "little", { shifted: "_" }), key("=", right, "little", { shifted: "+" }), backspace,
  ],
  [
    key("Tab", left, "little", { width: 1.5 }),
    ...letterRow("qwert", left, leftFingers), ...letterRow("yuiop", right, rightFingers),
    key("´", right, "little", { shifted: "`" }), key("[", right, "little", { shifted: "{" }),
  ],
  [
    key("Caps", left, "little", { width: 1.75 }),
    ...letterRow("asdfg", left, leftFingers), ...letterRow("hjklç", right, rightFingers),
    key("~", right, "little", { shifted: "^" }), key("]", right, "little", { shifted: "}" }),
    key("Enter", right, "little", { width: 1.25 }),
  ],
  [
    shiftLeft, key("\\", left, "little", { shifted: "|" }),
    ...letterRow("zxcvb", left, leftFingers), ...letterRow("nm", right, rightFingers),
    key(",", right, "middle", { shifted: "<" }), key(".", right, "ring", { shifted: ">" }),
    key(";", right, "little", { shifted: ":" }), key("/", right, "little", { shifted: "?" }), shiftRight,
  ],
  [space],
];

const accentedKeys: Record<string, string> = { "\u0301": "´", "\u0300": "`", "\u0303": "~", "\u0302": "^", "\u0308": "¨" };
const fingerNames: Record<Finger, string> = {
  thumb: "Polegar", index: "Indicador", middle: "Dedo médio", ring: "Anelar", little: "Mindinho",
};

type Keystroke = { key: TypingKey; legend: string; shift?: TypingKey };

function keystroke(character: string): Keystroke | undefined {
  if (character === " ") return { key: space, legend: space.label };
  for (const row of keyboardRows) {
    for (const key of row) {
      if (key.label === character) return { key, legend: character };
      if (key.shifted === character) return { key, legend: character, shift: key.hand === left ? shiftRight : shiftLeft };
    }
  }
}

export function typingHint(character: string, needsCorrection = false): Keystroke[] {
  if (needsCorrection) return [{ key: backspace, legend: "Backspace (apagar)" }];

  const direct = keystroke(character);
  if (direct) return [direct];

  const [base, accent, extra] = Array.from(character.normalize("NFD"));
  if (!accent || extra) return [];
  const first = keystroke(accentedKeys[accent] ?? "");
  const second = keystroke(base);
  return first && second ? [first, second] : [];
}

export function fingerInstruction({ hand, finger }: TypingKey) {
  return `${fingerNames[finger]} · mão ${hand === left ? "esquerda" : "direita"}`;
}
