export const lessonRoutine = [
  "Sempre que chegar faça:",
  "",
  "1) 15 minutos de Digitação.",
  "2) depois leia a teoria com calma e tente entender o conteúdo.",
  "3) depois faça a prática.",
  "4) e por fim tome nota no seu Guia ou em Anotações.",
].join("\n");

export const objectiveLimit = 1000;
export const objectiveWithRoutineLimit = objectiveLimit + 2 + lessonRoutine.length;

export function withLessonRoutine<T extends { objective: string }>(lesson: T): T {
  const objective = lesson.objective.replace(/\r\n?/g, "\n").trimEnd();
  if (objective.includes(lessonRoutine)) return lesson;
  return { ...lesson, objective: objective ? `${objective}\n\n${lessonRoutine}` : lessonRoutine };
}
