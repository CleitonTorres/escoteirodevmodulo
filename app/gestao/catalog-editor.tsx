import Link from "next/link";
import type { Lesson } from "@/data/lessons";
import { isProgramacaoBasica, type Disciplina } from "@/data/disciplinas";
import { canManage, type Role } from "@/lib/auth/roles";
import {
  excluirAula,
  excluirDisciplina,
  importarAulasProgramacao,
  salvarAula,
  salvarDisciplina,
} from "./actions";
import { managementLink } from "./reports";
import ManageForm from "./manage-form";
import PracticeTaskEditor from "./practice-task-editor";
import LessonVideoEditor from "./lesson-video-editor";

export default function CatalogEditor({
  role,
  disciplines,
  discipline,
  selectedLesson,
}: {
  role: Role;
  disciplines: Disciplina[];
  discipline?: Disciplina;
  selectedLesson?: string;
}) {
  const catalogAccess = canManage(role, "disciplinas");
  const lesson = discipline?.aulas.find(
    ({ id }) => String(id) === selectedLesson,
  );
  return (
    <div className="management-stack">
      <section className="management-card">
        <h2>Disciplinas</h2>
        {disciplines.length > 0 ? (
          <nav
            aria-label="Disciplinas do catálogo"
            className="management-pager"
          >
            {disciplines.map((item) => (
              <Link
                key={item.id}
                href={managementLink({
                  secao: "catalogo",
                  disciplina: item.id,
                })}
                aria-current={discipline?.id === item.id ? "page" : undefined}
              >
                {item.nome}
              </Link>
            ))}
          </nav>
        ) : (
          <p>Nenhuma disciplina cadastrada.</p>
        )}
        {catalogAccess && (
          <details>
            <summary>Nova disciplina</summary>
            <ManageForm action={salvarDisciplina} label="Cadastrar disciplina">
              <input type="hidden" name="mode" value="create" />
              <label>
                Nome
                <input name="nome" maxLength={120} required />
              </label>
              <label>
                Identificador
                <input
                  name="disciplinaId"
                  placeholder="informatica-avancada"
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  maxLength={80}
                  required
                />
              </label>
              <p>
                Use letras minúsculas, números e hífens. O identificador liga a
                disciplina ao progresso dos alunos.
              </p>
            </ManageForm>
          </details>
        )}
      </section>
      {discipline && (
        <>
          <section className="management-card">
            <h2>{discipline.nome}</h2>
            {catalogAccess && (
              <>
                <details key={discipline.id}>
                  <summary>Editar disciplina</summary>
                  <ManageForm
                    action={salvarDisciplina}
                    label="Salvar disciplina"
                  >
                    <input type="hidden" name="mode" value="rename" />
                    <input
                      type="hidden"
                      name="disciplinaId"
                      value={discipline.id}
                    />
                    <label>
                      Nome
                      <input
                        name="nome"
                        maxLength={120}
                        defaultValue={discipline.nome}
                        required
                      />
                    </label>
                  </ManageForm>
                </details>
                {isProgramacaoBasica(discipline) && !discipline.apostilaProgramacaoImportada && (
                  <details>
                    <summary>Importar aulas da apostila</summary>
                    <ManageForm action={importarAulasProgramacao} label="Importar aulas de Programação Básica">
                      <input type="hidden" name="disciplinaId" value={discipline.id} />
                      <p>Adicione as 40 aulas da apostila ao catálogo. Aulas já cadastradas com o mesmo título serão preservadas.</p>
                    </ManageForm>
                  </details>
                )}
                <details key={`excluir-${discipline.id}`}>
                  <summary>Excluir disciplina</summary>
                  <ManageForm
                    action={excluirDisciplina}
                    label="Excluir disciplina"
                    danger
                  >
                    <input
                      type="hidden"
                      name="disciplinaId"
                      value={discipline.id}
                    />
                    <label className="management-check">
                      <input type="checkbox" name="confirm" required /> Confirmo
                      a exclusão de {discipline.nome}, incluindo suas aulas
                    </label>
                  </ManageForm>
                </details>
              </>
            )}
            <nav
              className="management-lesson-list"
              aria-label="Aulas da disciplina"
            >
              <Link
                href={managementLink({
                  secao: "catalogo",
                  disciplina: discipline.id,
                  aula: "nova",
                })}
                aria-current={selectedLesson === "nova" ? "page" : undefined}
              >
                Nova aula
              </Link>

              {discipline.aulas.map((item) => (
                <Link
                  key={item.id}
                  href={managementLink({
                    secao: "catalogo",
                    disciplina: discipline.id,
                    aula: String(item.id),
                  })}
                  aria-current={lesson?.id === item.id ? "page" : undefined}
                >
                  {`${item.id} - ${item.title}`}
                </Link>
              ))}
            </nav>
          </section>
          {(lesson || selectedLesson === "nova") && (
            <LessonEditor
              key={`${discipline.id}:${lesson?.id ?? "nova"}`}
              discipline={discipline}
              lesson={lesson}
              canDelete={canManage(role, "excluir-aula")}
            />
          )}
        </>
      )}
    </div>
  );
}

function LessonEditor({
  discipline,
  lesson,
  canDelete,
}: {
  discipline: Disciplina;
  lesson?: Lesson;
  canDelete: boolean;
}) {
  const tasks = lesson?.practice ?? [];
  const videos = lesson?.videoUrl ?? [];
  const preview = lesson
    ? new URLSearchParams({
        disciplina: discipline.id,
        aula: String(lesson.id),
      })
    : undefined;
  return (
    <section className="management-card">
      <header className="management-card-heading">
        <h2>{lesson ? "Editar aula" : "Nova aula"}</h2>
        {preview && (
          <Link
            className="secondary-btn"
            href={`/gestao/visualizar?${preview}`}
          >
            Visualizar aula
          </Link>
        )}
      </header>
      <ManageForm
        action={salvarAula}
        label={lesson ? "Salvar aula" : "Cadastrar aula"}
      >
        <input type="hidden" name="disciplinaId" value={discipline.id} />
        {lesson && <input type="hidden" name="lessonId" value={lesson.id} />}
        <label>
          Título
          <input
            name="title"
            maxLength={150}
            defaultValue={lesson?.title}
            required
          />
        </label>
        <label>
          Subtítulo
          <input
            name="subtitle"
            maxLength={200}
            defaultValue={lesson?.subtitle}
            required
          />
        </label>
        <div className="management-fields">
          <label>
            Mês
            <input
              name="month"
              type="number"
              min={1}
              max={36}
              defaultValue={lesson?.month ?? 1}
              required
            />
          </label>
          <label>
            Ícone
            <input
              name="icon"
              maxLength={12}
              defaultValue={lesson?.icon ?? "📘"}
            />
          </label>
          <label>
            Ferramenta da prática
            <select name="tool" defaultValue={lesson?.tool ?? ""}>
              <option value="">Sem ferramenta específica</option>
              <option value="arquivos">Área de trabalho</option>
              <option value="digitacao">Digitação</option>
              <option value="navegador">Navegador</option>
            </select>
          </label>
        </div>
        <label>
          Objetivo
          <textarea
            name="objective"
            rows={2}
            maxLength={1000}
            defaultValue={lesson?.objective}
            required
          />
        </label>
        <label>
          Teoria, com um parágrafo por linha
          <textarea
            name="theory"
            rows={5}
            defaultValue={lesson?.theory.join("\n")}
            maxLength={20020}
            required
          />
        </label>
        {(isProgramacaoBasica(discipline) || lesson?.codeExample) && <label>
          Exemplo de código da teoria
          <textarea name="codeExample" rows={5} maxLength={6000} defaultValue={lesson?.codeExample} />
        </label>}
        <label>
          Orientação de Meu guia
          <textarea
            name="guide"
            rows={3}
            maxLength={1600}
            defaultValue={lesson?.guide}
            required
          />
        </label>

        <LessonVideoEditor key={JSON.stringify(videos)} urls={videos} />
        <details>
          <summary>{lesson?.exercise?.length ? "Orientações extras e recursos" : "Recursos da aula"}</summary>
          <div className="management-stack">
            {Boolean(lesson?.exercise?.length) && <label>
              Orientações extras, uma por linha
              <textarea name="exercise" rows={4} maxLength={12012} defaultValue={lesson?.exercise?.join("\n")} />
            </label>}
            <label>
              Recursos, um por linha no formato Nome | endereço HTTPS
              <textarea name="resources" rows={3} maxLength={13000}
                defaultValue={lesson?.resources?.map(({ title, url }) => `${title} | ${url}`).join("\n")} />
            </label>
          </div>
        </details>
        <PracticeTaskEditor key={JSON.stringify(tasks)} tasks={tasks} />
      </ManageForm>

      {lesson && canDelete && (
        <details>
          <summary>Excluir aula</summary>
          <ManageForm action={excluirAula} label="Excluir aula" danger>
            <input type="hidden" name="disciplinaId" value={discipline.id} />
            <input type="hidden" name="lessonId" value={lesson.id} />
            <label className="management-check">
              <input type="checkbox" name="confirm" required /> Confirmo a
              exclusão de {lesson.title}
            </label>
          </ManageForm>
        </details>
      )}
    </section>
  );
}
