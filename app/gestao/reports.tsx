import Link from "next/link";
import { ObjectId } from "mongodb";
import { authStore, type Aluno } from "@/lib/auth/store";
import { accountRole, canManage, type Role } from "@/lib/auth/roles";
import { getDb } from "@/lib/mongodb";
import type { Disciplina } from "@/data/disciplinas";
import type { Progress } from "@/lib/storage";
import { promoverConta } from "./actions";
import ManageForm from "./manage-form";

type ListedAccount = Pick<Aluno, "nome" | "email" | "status" | "role" | "createdAt"> & { _id: ObjectId };
const projection = { nome: 1, email: 1, status: 1, role: 1, createdAt: 1 };
const pageSize = 20;
const date = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" });
const studentFilter = { $or: [{ role: "aluno" as const }, { role: { $exists: false } }] };

export function managementLink(query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value) params.set(key, value);
  return "/gestao" + (params.size ? `?${params}` : "");
}

export default async function Reports({ role, discipline, disciplines, studentId, after, accounts }: {
  role: Role;
  discipline?: Disciplina;
  disciplines: Disciplina[];
  studentId?: string;
  after?: string;
  accounts: boolean;
}) {
  if (!canManage(role, accounts ? "promover-contas" : "relatorios")) return null;
  const { alunos } = await authStore();
  const filter = accounts ? {} : studentFilter;
  const section = accounts ? "contas" : "relatorios";
  const selected = typeof studentId === "string" && /^[0-9a-f]{24}$/i.test(studentId)
    ? await alunos.findOne<ListedAccount>({ ...filter, _id: new ObjectId(studentId) }, { projection }) : null;
  const disciplineId = discipline?.id;
  const link = (params: Record<string, string | undefined> = {}) => managementLink({ secao: section, disciplina: disciplineId, ...params });

  if (selected) {
    const selectedRole = accountRole(selected.role);
    const progress = !accounts && discipline && await (await getDb())
      .collection<Partial<Progress> & { _id: string }>("progresso_alunos").findOne(
        { _id: `${selected._id}:${discipline.id}` }, { projection: { completed: 1, typingBest: 1, guide: 1 } },
      );
    return <section className="management-card">
      <Link href={link()}>Voltar para {accounts ? "contas" : "relatórios"}</Link>
      <h2>{selected.nome}</h2>
      <dl className="management-data">
        <div><dt>E-mail</dt><dd>{selected.email}</dd></div>
        <div><dt>Perfil</dt><dd>{selectedRole}</dd></div>
        <div><dt>Cadastro</dt><dd>{selected.createdAt ? date.format(selected.createdAt) : "Sem data"}</dd></div>
        <div><dt>Situação</dt><dd>{selected.status === "pendente" ? "Pendente" : "Ativo"}</dd></div>
      </dl>
      {accounts && selectedRole !== "administrador" && <ManageForm action={promoverConta} label="Promover conta">
        <input type="hidden" name="accountId" value={selected._id.toHexString()} />
        <label>Novo perfil<select name="role" defaultValue="" required>
          <option value="" disabled>Selecione o perfil</option>
          {selectedRole === "aluno" && <option value="professor">Professor</option>}
          <option value="administrador">Administrador</option>
        </select></label>
        <label className="management-check"><input type="checkbox" name="confirm" required /> Confirmo a promoção desta conta</label>
      </ManageForm>}
      {!accounts && discipline && <>
        <h3>{discipline.nome}</h3>
        <p>Níveis de digitação concluídos: {progress && progress.typingBest || 0}</p>
        <ul className="management-progress">{discipline.aulas.map((lesson) => <li key={lesson.id}>
          <span>{lesson.title}</span><strong>{progress && progress.completed?.includes(lesson.id) ? "Concluída" : "Pendente"}</strong>
        </li>)}</ul>
        <details><summary>Guia do aluno</summary>
          <p className="management-guide">{progress && progress.guide || "O aluno ainda não escreveu no guia."}</p>
        </details>
      </>}
    </section>;
  }

  const cursor = typeof after === "string" && /^[0-9a-f]{24}$/i.test(after) ? new ObjectId(after) : undefined;
  const fetched = await alunos.find<ListedAccount>({ ...filter, ...(cursor && { _id: { $gt: cursor } }) }, { projection })
    .sort({ _id: 1 }).limit(pageSize + 1).toArray();
  const rows = fetched.slice(0, pageSize);
  const ids = rows.map(({ _id }) => `${_id}:${disciplineId}`);
  const progressRows = !accounts && discipline && ids.length > 0
    ? await (await getDb()).collection<Partial<Progress> & { _id: string }>("progresso_alunos")
      .find({ _id: { $in: ids } }, { projection: { completed: 1, typingBest: 1 } }).toArray() : [];
  const progressById = new Map(progressRows.map((row) => [row._id, row]));
  return <section className="management-card">
    <h2>{accounts ? "Contas da plataforma" : "Relatórios de alunos"}</h2>
    {!accounts && disciplines.length > 0 && <nav className="management-pager" aria-label="Disciplina do relatório">
      {disciplines.map((item) => <Link key={item.id} href={link({ disciplina: item.id })} aria-current={item.id === disciplineId ? "page" : undefined}>{item.nome}</Link>)}
    </nav>}
    {studentId && <p role="status">Conta não encontrada nesta lista.</p>}
    {rows.length === 0 ? <p>Nenhuma conta encontrada.</p> : <div className="management-table-scroll">
      <table>
        <thead><tr><th scope="col">Nome</th><th scope="col">E-mail</th><th scope="col">Situação</th>
          <th scope="col">{accounts ? "Perfil" : "Aulas concluídas"}</th>
          {!accounts && <th scope="col">Níveis de digitação</th>}
        </tr></thead>
        <tbody>{rows.map((row) => {
          const progress = progressById.get(`${row._id}:${disciplineId}`);
          const completed = discipline?.aulas.filter(({ id }) => progress?.completed?.includes(id)).length ?? 0;
          return <tr key={row._id.toHexString()}>
            <th scope="row"><Link href={link({ aluno: row._id.toHexString() })}>{row.nome}</Link></th><td>{row.email}</td>
            <td>{row.status === "pendente" ? "Pendente" : "Ativo"}</td>
            <td>{accounts ? accountRole(row.role) : discipline ? `${completed} de ${discipline.aulas.length}` : "—"}</td>
            {!accounts && <td>{progress?.typingBest ?? 0}</td>}
          </tr>;
        })}</tbody>
      </table>
    </div>}
    <nav className="management-pager" aria-label="Páginas da lista">
      {cursor && <Link href={link()}>Primeira página</Link>}
      {fetched.length > pageSize && <Link href={link({ apos: rows.at(-1)?._id.toHexString() })}>Próxima página</Link>}
    </nav>
  </section>;
}
