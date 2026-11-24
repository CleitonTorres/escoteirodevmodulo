export type Progress = {
  completed: number[];
  guide: string;
  typingBest: number;
};

export const emptyProgress: Progress = { completed: [], guide: "", typingBest: 0 };
export const guideLimit = 50_000;
