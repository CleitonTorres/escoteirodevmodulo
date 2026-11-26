import { typingLevels } from "@/data/disciplinas";

const accuracyPoints = 70;
const timePoints = 30;
export const typingErrorPenalty = 3;
export const typingMinimumScore = 80;

export type TypingAttempt = {
  level: number;
  text: string;
  editSteps: number;
  elapsedMs: number;
  errors: number;
};

export function typingTargetSeconds(level: number) {
  const exercise = typingLevels[level - 1];
  return Math.max(8, Math.ceil(exercise.text.length / 2 + (exercise.edit?.actions.length ?? 0) * 2));
}

export function typingScore(level: number, elapsedMs: number, errors: number) {
  const accuracy = Math.max(0, accuracyPoints - typingErrorPenalty * errors);
  const time = timePoints * Math.min(1, (typingTargetSeconds(level) * 1000) / Math.max(1, elapsedMs));
  return Math.floor(accuracy + time);
}

export function typingInputErrors(previous: string, next: string, target: string) {
  const before = previous.normalize("NFC");
  const after = next.normalize("NFC");
  let start = 0;
  while (start < Math.min(before.length, after.length) && before[start] === after[start]) start++;
  let end = after.length;
  let oldEnd = before.length;
  while (end > start && oldEnd > start && after[end - 1] === before[oldEnd - 1]) { end--; oldEnd--; }

  let errors = 0;
  for (let index = start; index < end; index++) {
    if (after[index] !== target[index]) errors++;
  }
  return errors;
}
