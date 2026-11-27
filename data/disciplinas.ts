import type { Lesson } from "./lesson-types";
import { informaticaCurriculumVersion, informaticaLessons, informaticaMonths } from "./informatica-basica";

export type Disciplina = {
  id: string;
  nome: string;
  aulas: readonly Lesson[];
  meses?: Readonly<Partial<Record<number, string>>>;
  versaoApostilaInformatica?: number;
  apostilaProgramacaoImportada?: true;
  versaoApostilaProgramacao?: number;
};

export function isProgramacaoBasica({ id, nome }: Pick<Disciplina, "id" | "nome">) {
  return id === "programacao-basica" ||
    nome.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLowerCase() === "programacao basica";
}

export const informaticaBasica: Disciplina = {
  id: "informatica-basica",
  nome: "Informática básica",
  aulas: informaticaLessons,
  meses: informaticaMonths,
  versaoApostilaInformatica: informaticaCurriculumVersion,
};

export function usesLessonRoutine(disciplina: Pick<Disciplina, "id" | "nome">) {
  return disciplina.id === informaticaBasica.id || isProgramacaoBasica(disciplina);
}

export const disciplinas: readonly Disciplina[] = [informaticaBasica];

export function buscarDisciplina(id: unknown) {
  return disciplinas.find((disciplina) => disciplina.id === id);
}

export type TypingEditAction = "backspace" | "selectAll" | "deleteWord" | "selectWord";

type TypingLevel = {
  name: string;
  text: string;
  edit?: { initial: string; actions: TypingEditAction[] };
};

export type TypingDraft = { value: string; editStep: number; startedAt: number | null; errors: number };

export const typingLevels: TypingLevel[] = [
  { name: "Fila guia", text: "asdf jklç asdf jklç" },
  { name: "Vogais e espaço", text: "aqui eu leio e aprendo" },
  { name: "Palavras", text: "mouse teclado pasta janela" },
  { name: "Frase curta", text: "Aprender fazendo é descobrir." },
  { name: "Desafio escoteiro", text: "Você já praticou? Amanhã tem mais 1 lição." },

  { name: "Shift e a primeira letra", text: "Ana abriu o jogo." },
  { name: "Shift dos dois lados", text: "Lia e Pedro leem juntos." },
  { name: "Maiúsculas em siglas", text: "Use ABNT2 no PC." },
  { name: "Agudo nas vogais", text: "Café, lápis, avó e música." },
  { name: "Til no A e no O", text: "Pão, maçã e balões." },
  { name: "Circunflexo", text: "Você lê sobre o ônibus." },
  { name: "Crase", text: "Saí às oito e fui à escola." },
  { name: "Cedilha e Shift", text: "Atenção: Ç é o cê-cedilha." },
  { name: "Acentos em maiúsculas", text: "Água, Érica, Íris e Óscar." },
  { name: "Acentos na mesma frase", text: "À tarde, você verá pássaros e balões." },

  { name: "Exclamação e pergunta", text: "Olá! Tudo bem com você?" },
  { name: "Vírgula e ponto e vírgula", text: "Pegue a régua, o lápis e o papel; depois conte." },
  { name: "Dois pontos e hífen", text: "Etapas: ler, digitar e conferir - nessa ordem." },
  { name: "Aspas simples e duplas", text: 'Lia escreveu "olá" e depois digitou \'até logo\'.' },
  { name: "Parênteses e operações", text: "Calcule (8 + 2) - 3 = 7." },
  { name: "Porcentagem e moeda", text: "Desconto de 10%: pague R$ 18,00." },
  { name: "Arroba e cerquilha", text: "Conta de treino: aluno@trilha.example #aula" },
  { name: "Colchetes e chaves", text: "Lista [1, 2, 3] e grupo {A, B}." },
  { name: "Comparações e asterisco", text: "3 < 5, 9 > 7 e 4 * 2 = 8." },
  { name: "Barra e sublinhado", text: "Pasta: aulas/guia_01 (versão 2)." },

  { name: "Apagar uma letra", text: "pasta", edit: { initial: "pastx", actions: ["backspace"] } },
  { name: "Apagar duas letras", text: "teclado", edit: { initial: "teclaxx", actions: ["backspace", "backspace"] } },
  { name: "Tirar a letra repetida", text: "O mapa está aqui.", edit: { initial: "O mapa está aquii", actions: ["backspace"] } },
  { name: "Corrigir o agudo", text: "O café está quente.", edit: { initial: "O cafê", actions: ["backspace"] } },
  { name: "Corrigir a cedilha", text: "A ação começa às 9h.", edit: { initial: "A ac", actions: ["backspace"] } },
  { name: "Trocar o sinal final", text: "Você chegou?", edit: { initial: "Você chegou!", actions: ["backspace"] } },
  { name: "Corrigir um número", text: "A aula começa às 18h30.", edit: { initial: "A aula começa às 19", actions: ["backspace"] } },
  { name: "Completar um parêntese", text: "A turma trouxe 3 itens (papel, lápis e régua).", edit: { initial: "A turma trouxe 3 itens [", actions: ["backspace"] } },
  { name: "Ajustar o sublinhado", text: "Salve o arquivo lição_02.txt.", edit: { initial: "Salve o arquivo lição-", actions: ["backspace"] } },
  { name: "Corrigir o valor", text: "O total é R$ 45,90 (10% de desconto).", edit: { initial: "O total é R$ 47,09", actions: ["backspace", "backspace", "backspace", "backspace"] } },

  { name: "Selecionar tudo com Ctrl", text: "Novo rascunho.", edit: { initial: "rascunho antigo", actions: ["selectAll", "backspace"] } },
  { name: "Substituir uma frase inteira", text: "Olá, equipe! A reunião será às 8h.", edit: { initial: "mensagem antiga sem horário", actions: ["selectAll", "backspace"] } },
  { name: "Apagar uma palavra com Ctrl", text: "Abra a pasta azul.", edit: { initial: "Abra a pasta verde", actions: ["deleteWord"] } },
  { name: "Trocar uma palavra acentuada", text: "Escolha o botão Próximo.", edit: { initial: "Escolha o botão Último", actions: ["deleteWord"] } },
  { name: "Apagar duas palavras", text: "Leve água e protetor solar.", edit: { initial: "Leve água mochila pesada", actions: ["deleteWord", "deleteWord"] } },
  { name: "Selecionar a última palavra", text: "O time Azul marcou 3 pontos.", edit: { initial: "O time Verde", actions: ["selectWord", "backspace"] } },
  { name: "Corrigir título e continuar", text: "Digite: Revisão de informática (parte 2).", edit: { initial: "Digite: Rascunho", actions: ["selectWord", "backspace"] } },
  { name: "Apagar palavra e letra", text: "Troque a pasta por um arquivo .txt.", edit: { initial: "Troque a pastx antiga", actions: ["deleteWord", "backspace", "backspace"] } },
  { name: "Reescrever uma busca", text: 'Onde encontrar "segurança digital"?', edit: { initial: "pesquisa geral sem detalhes", actions: ["selectAll", "backspace"] } },
  { name: "Trocar a extensão digitada", text: "O nome do arquivo é guia_02.pdf.", edit: { initial: "O nome do arquivo é guia_02.x", actions: ["backspace"] } },

  { name: "Correção e desconto", text: "Oferta válida até às 17h: 15% de desconto.", edit: { initial: "Oferta válida até às meia", actions: ["deleteWord"] } },
  { name: "Endereço de treino", text: "Escreva para equipe@trilha.example e use o assunto [Revisão].", edit: { initial: "endereço e assunto antigos", actions: ["selectAll", "backspace"] } },
  { name: "Dois cortes e uma troca", text: "Ação de sábado: água, chapéu e protetor solar.", edit: { initial: "Ação de sexta itens extras", actions: ["deleteWord", "deleteWord", "selectWord", "backspace"] } },
  { name: "Combinação de símbolos", text: "Se (8 + 4) / 2 = 6, então 6 > 5 e 6 < 7." },
  { name: "Nomes próprios e trema", text: "Às 9h, Müller entregou a revisão a Érica." },
  { name: "Barras e atalhos", text: "Caminho: aulas\\digitação | Arquivo: prática_03.txt." },
  { name: "Confirmar uma instrução", text: 'Na caixa [Busca], digite "computação básica" e confira: 3 resultados?', edit: { initial: "Na caixa antiga", actions: ["selectWord", "backspace"] } },
  { name: "Corrigir uma lista", text: "Equipe {A, B}: 2 cadernos a R$ 12,50 e 1 régua a R$ 4,00.", edit: { initial: "Equipe {A, C", actions: ["backspace"] } },
  { name: "Revisar antes de enviar", text: 'Antes de enviar, confira: "Olá, João! A ação começa às 8h30 (equipe 2)."', edit: { initial: "mensagem anterior com erros", actions: ["selectAll", "backspace"] } },
  { name: "Desafio final de edição", text: "Missão concluída! Salve a revisão em aulas/guia_05.txt e confira: 100% correto?", edit: { initial: "Missão pendente dois ajustes", actions: ["deleteWord", "deleteWord", "selectWord", "backspace"] } },
];

export function initialTypingDraft(level: number): TypingDraft {
  return { value: typingLevels[level].edit?.initial ?? "", editStep: 0, startedAt: null, errors: 0 };
}
