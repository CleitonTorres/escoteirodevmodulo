"use client";

import { useId, useRef, useState } from "react";

export default function LessonVideoEditor({
  urls,
}: {
  urls: readonly string[];
}) {
  const id = useId();
  const nextId = useRef(urls.length);
  const [fields, setFields] = useState(() =>
    urls.map((url, key) => ({ key, url })),
  );

  function addVideo() {
    const key = nextId.current++;
    setFields((current) => [...current, { key, url: "" }]);
  }

  return (
    <fieldset className="lesson-video-fields" aria-describedby={`${id}-help`}>
      <legend>Vídeos da aula</legend>
      <small id={`${id}-help`}>
        Adicione um endereço HTTPS por vídeo. Vídeos do YouTube abrem dentro da
        aula.
      </small>
      {fields.map(({ key, url }, index) => {
        const fieldId = `${id}-${key}`;
        return (
          <div className="lesson-video-field" key={key}>
            <label htmlFor={fieldId}>
              Endereço do vídeo {index + 1}
              <input
                id={fieldId}
                name="videoUrl"
                type="url"
                maxLength={1500}
                defaultValue={url}
                autoFocus={key >= urls.length}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </label>
            <button
              type="button"
              className="secondary-btn"
              aria-label={`Remover vídeo ${index + 1}`}
              onClick={() =>
                setFields((current) =>
                  current.filter((field) => field.key !== key),
                )
              }
            >
              Remover
            </button>
          </div>
        );
      })}
      <button type="button" className="secondary-btn" onClick={addVideo}>
        Adicionar vídeo
      </button>
    </fieldset>
  );
}
