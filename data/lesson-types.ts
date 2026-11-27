import type { PracticeTask } from "@/lib/practice";
import type { TheoryItem } from "./lesson-theory";

export type LessonResource = { title: string; url: string };

export type Lesson = {
  id: number;
  month: number;
  title: string;
  subtitle: string;
  icon: string;
  objective: string;
  theory: TheoryItem[];
  codeExample?: string;
  practice: PracticeTask[];
  exercise?: string[];
  resources?: LessonResource[];
  guide: string;
  tool?: "arquivos" | "digitacao" | "navegador";
  videoUrl?: string[];
};
