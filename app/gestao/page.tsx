import Link from "next/link";
import { ArrowRight, BookOpen, Compass, LogOut, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { currentAccount } from "@/lib/auth/session";
import { canManage } from "@/lib/auth/roles";
import { listarDisciplinas } from "@/lib/catalogo";
import { sair } from "../conta-actions";
import CatalogEditor from "./catalog-editor";
import Reports, { managementLink } from "./reports";
import "./management.css";

type Query = {
  secao?: string;
  disciplina?: string;
  aula?: string;
  aluno?: string;
  apos?: string;
};

export default async function ManagementPage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const account = await currentAccount();
  if (!account) redirect("/entrar");
  if (!canManage(account.role, "relatorios")) redirect("/");
  const query = await searchParams;
  const admin = canManage(account.role, "promover-contas");
  if (query.secao === "contas" && !admin) redirect("/gestao?secao=relatorios");
  const section =
    query.secao === "relatorios" ||
    query.secao === "catalogo" ||
    query.secao === "contas"
      ? query.secao
      : undefined;
  const disciplines =
    section && section !== "contas" ? await listarDisciplinas() : [];
  const discipline = query.disciplina
    ? disciplines.find(({ id }) => id === query.disciplina)
    : disciplines[0];
  const links = [
    {
      id: "relatorios",
      label: "Relatórios de alunos",
      icon: Users,
      description: "Consulte a progressão e o guia por aluno e disciplina.",
    },
    {
      id: "catalogo",
      label: admin ? "Aulas e disciplinas" : "Aulas",
      icon: BookOpen,
      description: "Organize o conteúdo da trilha.",
    },
    ...(admin
      ? [
          {
            id: "contas",
            label: "Contas e acessos",
            icon: Users,
            description: "Promova contas para professor ou administrador.",
          },
        ]
      : []),
  ];
  return (
    <div className="management-shell">
      <header className="management-header">
        <Link href="/gestao" className="management-brand">
          <Compass size={26} aria-hidden="true" /> Trilha Digital
        </Link>
        <div className="management-profile">
          <div>
            <strong>{account.nome}</strong>
            <span>{admin ? "Administração" : "Professor"}</span>
          </div>
          <form action={sair}>
            <button type="submit" className="management-signout">
              <LogOut size={19} aria-hidden="true" /> Sair
            </button>
          </form>
        </div>
      </header>
      <main className="management-main">
        <h1>
          {section
            ? links.find(({ id }) => id === section)?.label
            : "Painel de gestão"}
        </h1>
        <nav className="management-nav" aria-label="Navegação da gestão">
          {links.map(({ id, label, icon: Icon, description }) => (
            <Link
              href={managementLink({ secao: id })}
              key={id}
              aria-current={section === id ? "page" : undefined}
            >
              <Icon size={21} aria-hidden="true" />
              <span>
                <strong>{label}</strong>
                {!section && <small>{description}</small>}
              </span>
              {!section && <ArrowRight size={18} aria-hidden="true" />}
            </Link>
          ))}
        </nav>
        {section === "catalogo" && (
          <CatalogEditor
            role={account.role}
            disciplines={disciplines}
            discipline={discipline}
            selectedLesson={query.aula}
          />
        )}
        {(section === "relatorios" || section === "contas") && (
          <Reports
            role={account.role}
            accounts={section === "contas"}
            discipline={discipline}
            disciplines={disciplines}
            studentId={query.aluno}
            after={query.apos}
          />
        )}
      </main>
    </div>
  );
}
