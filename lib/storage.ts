import type { DesktopProgress } from "./desktop-files";
import type { WordValue } from "./word-document";

export type Progress = {
  completed: number[];
  guide: string;
  guideDocument?: WordValue["document"];
  guideEditedLessons?: number[];
  journal?: Partial<Record<number, string>>;
  typingBest: number;
  desktop?: DesktopProgress;
  practiceEvidence?: Record<string, string>;
};

export const emptyProgress: Progress = { completed: [], guide: "", typingBest: 0 };
export const guideLimit = 50_000;
export const journalNoteLimit = 5000;
