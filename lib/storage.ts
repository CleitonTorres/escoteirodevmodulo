import type { DesktopProgress } from "./desktop-files";

export type Progress = {
  completed: number[];
  guide: string;
  typingBest: number;
  desktop?: DesktopProgress;
};

export const emptyProgress: Progress = { completed: [], guide: "", typingBest: 0 };
export const guideLimit = 50_000;
