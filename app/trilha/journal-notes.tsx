import type { Lesson } from "@/data/lesson-types";
import type { Progress } from "@/lib/storage";

export default function JournalNotes({ lessons, journal, legacyGuide, canOpenLesson, openLesson }: {
  lessons: readonly Lesson[];
  journal?: Progress["journal"];
  legacyGuide: string;
  canOpenLesson: (id: number) => boolean;
  openLesson: (id: number) => void;
}) {
  const byId = new Map(lessons.map(({ id, title }, order) => [id, { title, order }]));
  const entries = Object.entries(journal ?? {}).flatMap(([key, text]) => {
    if (!text?.trim()) return [];
    const id = Number(key);
    return [{ id, text, lesson: byId.get(id) }];
  }).sort((a, b) => (a.lesson?.order ?? lessons.length) - (b.lesson?.order ?? lessons.length) || a.id - b.id);

  return <>
    <div className="page-heading">
      <h1 tabIndex={-1}>Minhas anotações</h1>
    </div>
    <div className="journal-entries">
      {entries.length === 0 && <p className="journal-entry">As anotações que você salvar no diário de cada aula aparecem aqui.</p>}
      {entries.map(({ id, text, lesson }) => <article className="journal-entry" key={id}>
        <h2>Aula {id}{lesson && ` · ${lesson.title}`}</h2>
        <p className="journal-entry-text">{text}</p>
        {lesson && canOpenLesson(id) && <button type="button" className="secondary-btn"
          aria-label={`Editar anotação da aula ${id}`} onClick={() => openLesson(id)}>Editar anotação</button>}
      </article>)}
      {legacyGuide.trim() && <section className="journal-entry">
        <h2>Guia anterior</h2>
        <p className="journal-entry-text">{legacyGuide}</p>
      </section>}
    </div>
  </>;
}
