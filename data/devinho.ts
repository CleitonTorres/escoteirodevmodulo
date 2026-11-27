import { informaticaLessons } from "./informatica-basica";
import { situations } from "./informatica-situacoes";
import type { PracticeCheck, PracticeTask } from "@/lib/practice";

export type DevinhoMode = "pista" | "explicar";
export type DevinhoContext = "nenhum" | "janela-fechada" | "janela-minimizada" | "arquivo-na-lixeira" | "intervalo-parcial" | "faltam-subtotais";

type Hint = { text: string; when: DevinhoContext; mode: DevinhoMode };
const hint = (text: string, when: DevinhoContext = "nenhum", mode: DevinhoMode = "pista"): Hint => ({ text, when, mode });

const contextualHints = [
  { title: "Minimizar e voltar", id: "window-minimize", hints: [
    hint("Você fechou a janela. Abra Arquivos novamente e use o botão com o traço – para minimizar.", "janela-fechada"),
    hint("O X fecha a janela. Para deixá-la acessível pela barra de tarefas, abra Arquivos e escolha o traço -.", "janela-fechada", "explicar"),
    hint("Minimizar guarda a janela na barra de tarefas. Com Arquivos aberto, use o traço – no alto da janela.", "nenhum", "explicar"),
  ] },
  { title: "Minimizar e voltar", id: "taskbar-restore", hints: [
    hint("Clique em Explorador na barra de tarefas, na parte de baixo da tela.", "janela-minimizada"),
    hint("O Explorador ainda está aberto. Use o botão dele na barra de baixo para voltar à mesma pasta.", "janela-minimizada", "explicar"),
    hint("Se você usou o X, abra Arquivos e minimize com –. Depois use Explorador na barra de tarefas.", "janela-fechada"),
    hint("Para voltar pela barra, a janela precisa ficar minimizada. Abra Arquivos de novo e use o traço - antes de clicar em Explorador na barra.", "janela-fechada", "explicar"),
  ] },
  { title: "Apagar e recuperar", id: "enviar-lixeira", hints: [
    hint("Escolha só o arquivo Lista de materiais.txt. A opção Mover para a Lixeira deixa você recuperá-lo depois.", "nenhum", "explicar"),
  ] },
  { title: "Apagar e recuperar", id: "restaurar-lista", hints: [
    hint("Abra a Lixeira na barra de tarefas. Procure Lista de materiais.txt e escolha Restaurar no menu do arquivo.", "arquivo-na-lixeira"),
    hint("Restaurar devolve a lista à pasta de origem. Na Lixeira, use Restaurar e confira o arquivo em Textos.", "nenhum", "explicar"),
  ] },
];

const totalHints = [
  hint("Confira se o intervalo da soma começa no primeiro subtotal e termina no último.", "intervalo-parcial"),
  hint("Pense no intervalo como uma lista de células. A soma precisa passar por todas as linhas da coluna Subtotal.", "intervalo-parcial", "explicar"),
  hint("Antes de somar, confira se cada linha da coluna Subtotal tem um valor calculado.", "faltam-subtotais"),
  hint("O total depende dos subtotais. Complete o cálculo de cada compra e depois some os resultados.", "faltam-subtotais", "explicar"),
];

type Guidance = Record<DevinhoMode, string>;

const guidanceByKind: Record<PracticeCheck["kind"], Guidance> = {
  "desktop-control": {
    pista: "Confira se a tela de treino está no ponto de partida que a tarefa pede. Procure o controle na janela, na barra de tarefas ou no menu Iniciar.",
    explicar: "Os botões de uma janela agem só naquela janela. A barra de tarefas ajuda a trocar de aplicativo, e o menu Iniciar reúne os controles do computador.",
  },
  "desktop-event": {
    pista: "Encontre o item pelo nome antes de agir. Para ver as opções dele, abra seu menu com o botão direito ou com um toque longo.",
    explicar: "Primeiro confira em qual pasta você está. Depois faça a ação no item indicado e observe se o nome, o local ou a janela mudou como o exercício pede.",
  },
  entry: {
    pista: "Siga o caminho da tarefa no Explorador. Antes de criar ou copiar, confirme a pasta que aparece na barra de endereço.",
    explicar: "Cada nível do caminho indica uma pasta que você abre para chegar ao destino. Confira se o item ficou na pasta certa com o nome pedido.",
  },
  typing: {
    pista: "Veja qual nível o exercício indica. No treino de digitação, observe qual tecla acende e qual dedo está destacado.",
    explicar: "Pratique primeiro com calma para acertar as teclas. Corrija com Backspace quando necessário e confira o resultado no fim do nível.",
  },
  shortcut: {
    pista: "Clique no campo correto antes do atalho. Se for copiar, selecione o texto de origem primeiro.",
    explicar: "Quem recebe o atalho é o campo onde você está trabalhando. Para colar ou desfazer a colagem, deixe o cursor no campo de destino.",
  },
  code: {
    pista: "Abra no editor de código o arquivo que o exercício indica e confira o nome dele antes de digitar.",
    explicar: "Faça uma alteração pequena no arquivo, confira o efeito com a ferramenta apropriada e compare o que apareceu com o pedido da tarefa.",
  },
  word: {
    pista: "Abra o documento indicado. Clique na linha ou selecione o trecho que você precisa escrever ou formatar.",
    explicar: "Aplique o estilo à parte indicada no exercício e dê uma olhada no documento. O título, a lista e o texto comum têm funções diferentes na leitura.",
  },
  sheet: {
    pista: "Confira a letra da coluna e o número da linha antes de preencher a célula.",
    explicar: "Use os cabeçalhos para encontrar a coluna certa. Depois de preencher uma célula, observe o valor ou o cálculo que ficou registrado.",
  },
  "browser-control": {
    pista: "Observe o alto do navegador de treino. As abas, os botões de navegação e a barra de endereços ficam nessa região.",
    explicar: "Veja se a tarefa pede uma ação na página, na aba ou no navegador. Cada uma delas tem seus próprios controles.",
  },
  search: {
    pista: "Abra o buscador indicado e comece pelas palavras principais do assunto.",
    explicar: "Uma busca funciona com termos que descrevem o que você quer encontrar. Antes de enviar, confira se o assunto principal ficou claro.",
  },
  favorite: {
    pista: "Confira se a página indicada está aberta. Procure a estrela ou o menu Favoritos no navegador de treino.",
    explicar: "Favoritos guardam atalhos para páginas. Verifique o título da página para guardar ou reencontrar o atalho certo.",
  },
  simulation: {
    pista: "Leia a situação e compare as opções da etapa atual. Procure o detalhe que muda a decisão.",
    explicar: "Imagine que isso aconteceu com você. Antes de escolher, pense no que cada opção faria e no que poderia acontecer depois.",
  },
  quiz: {
    pista: "Veja qual assunto a pergunta quer conferir e procure esse trecho na Teoria. Compare todas as opções antes de escolher.",
    explicar: "Tente responder com suas palavras usando um exemplo da aula. Depois veja qual opção combina com o exemplo.",
  },
};

const sheetGuidance: Record<Extract<PracticeCheck, { kind: "sheet" }>["step"], Guidance> = {
  headers: {
    pista: "Use a primeira linha para os nomes das colunas. Confira a ordem pedida antes de preencher.",
    explicar: "O cabeçalho diz o que cada coluna guarda. Coloque um nome em cada célula da linha de cima.",
  },
  items: {
    pista: "Use uma linha por item e confira se a quantidade e o preço ficaram nas colunas correspondentes.",
    explicar: "Leia um cabeçalho de cada vez. O nome identifica o item, a quantidade diz quantas unidades você quer e o valor indica o preço de uma unidade.",
  },
  subtotals: {
    pista: "Na célula do subtotal, comece a fórmula com = e use as duas células da mesma linha.",
    explicar: "Cada subtotal usa a quantidade e o preço unitário de um único item. Confira essas duas referências em cada linha.",
  },
  total: {
    pista: "Na linha Total, confira o começo e o fim do intervalo que a fórmula SOMA usa.",
    explicar: "Cada item tem um subtotal. O total reúne esses valores. Se mudar uma compra, confira se o resultado da soma acompanha a mudança.",
  },
};

const quizGuidance: Readonly<Partial<Record<string, Guidance>>> = {
  "Conhecendo o computador": {
    pista: "Pense em qual peça você olha para conferir as letras que digitou.",
    explicar: "Imagine digitar uma palavra. Uma peça recebe o que você apertou, outra movimenta o ponteiro e outra permite ver o que saiu.",
  },
  "Ligar, entrar e desligar": {
    pista: "Procure o menu que também reúne ações como reiniciar.",
    explicar: "A pergunta pede um controle do computador inteiro. Procure entre as opções a que reúne os comandos para ligar, desligar ou reiniciar.",
  },
  "Primeiros movimentos com o mouse": {
    pista: "Imagine levar um ícone até um espaço livre. Em qual parte do movimento ele já está no destino?",
    explicar: "Pense em arrastar como carregar um objeto. Segurar permite mover. Soltar encerra o movimento.",
  },
  "Primeiras teclas": {
    pista: "Veja a tecla que você usaria para corrigir a última letra de uma palavra recém-digitada.",
    explicar: "Imagine que digitou uma letra a mais no fim. Qual opção corrige o caractere que ficou atrás do cursor?",
  },
  "Selecionar, abrir e fechar": {
    pista: "Depois de fechar a janela, experimente abrir o mesmo ícone de novo.",
    explicar: "A pasta guarda seus arquivos e a janela é por onde você olha para dentro dela. Pense em qual das duas o botão X controla.",
  },
  "Minimizar e voltar": {
    pista: "Observe qual parte da tela continua mostrando o Explorador depois que a janela some.",
    explicar: "Minimizar tira a janela da frente. Procure um lugar na tela que ainda permite voltar ao aplicativo aberto.",
  },
  "Maximizar e voltar ao tamanho anterior": {
    pista: "Observe o botão que mudou de aparência depois que a janela ficou maior.",
    explicar: "Você quer continuar na mesma janela, só que com o tamanho de antes. Compare com o que aconteceria ao fechar a janela ou desligar o computador.",
  },
  "Arquivo, pasta e local": {
    pista: "No Explorador, siga o caminho da aula. Que tipos de ícone você encontra dentro de uma pasta?",
    explicar: "Imagine uma caixa grande para organizar materiais. Você pode usar caixas menores dentro dela para organizar grupos de itens.",
  },
  "Dar nome, salvar e abrir de novo": {
    pista: "Olhe além do ícone e confira se o conteúdo que você salvou voltou a aparecer.",
    explicar: "Dois arquivos podem ter o mesmo desenho de ícone. Pense no que você pode conferir para reconhecer o seu rascunho.",
  },
  "Copiar e mover": {
    pista: "A pergunta pede uma ação que deixa o arquivo original no lugar.",
    explicar: "Imagine tirar uma fotocópia de uma folha ou levá-la para outra pasta. Em qual caso as duas pastas ficam com uma folha?",
  },
  "Apagar e recuperar": {
    pista: "Pense em onde o Explorador guarda um arquivo quando você o exclui pelo menu do exercício.",
    explicar: "A lista sumiu da pasta original. Procure algo que reúna arquivos removidos e permita recuperar um item.",
  },
  "Revisar e formatar": {
    pista: "Compare o tamanho da informação que você quer destacar com o tamanho que cada opção selecionaria.",
    explicar: "O editor aplica a formatação ao trecho selecionado. Pense no que ficaria em destaque em cada uma das opções.",
  },
  "Calcular o subtotal": {
    pista: "Imagine três itens de R$ 2 cada. Que operação dá o mesmo resultado que 2 + 2 + 2?",
    explicar: "Os itens têm o mesmo preço. Procure a operação que repete esse preço pela quantidade de unidades.",
  },
  "Somar e conferir o total": {
    pista: "Olhe a coluna Subtotal e conte quantas linhas de compra têm um valor calculado.",
    explicar: "Cada linha de compra contribui com um subtotal. Compare quais opções juntam todas as compras usando apenas os valores calculados.",
  },
};

const publishedLessons = new Map(informaticaLessons.map((lesson) => [lesson.title, lesson]));

const contexts: Record<DevinhoContext, true> = {
  nenhum: true, "janela-fechada": true, "janela-minimizada": true, "arquivo-na-lixeira": true,
  "intervalo-parcial": true, "faltam-subtotais": true,
};

export function devinhoContext(value: unknown): DevinhoContext {
  return typeof value === "string" && Object.hasOwn(contexts, value) ? value as DevinhoContext : "nenhum";
}

export function devinhoChoices(title: string, task: PracticeTask, mode: DevinhoMode, context: DevinhoContext, stepIndex?: number) {
  // Only published copy and predefined guidance are sent to the model.
  const { check } = task;
  const otherMode = mode === "pista" ? "explicar" : "pista";
  const step = check.kind === "simulation" && stepIndex !== undefined
    ? situations[check.scenario]?.steps[stepIndex] : undefined;
  if (step?.guidance) {
    return {
      goal: step.prompt,
      hints: [hint(step.guidance[mode], "nenhum", mode), hint(step.guidance[otherMode], "nenhum", otherMode)],
      fallback: step.guidance[mode],
    };
  }
  const published = publishedLessons.get(title)?.practice.find((item) =>
    item.id === task.id && item.action === task.action && item.check.kind === task.check.kind);
  const general = guidanceByKind[check.kind];
  const specific = check.kind === "sheet" ? sheetGuidance[check.step] :
    published && check.kind === "quiz" && Object.hasOwn(quizGuidance, title) ? quizGuidance[title] : undefined;
  const matching = check.kind === "sheet" && check.step === "total" ? totalHints :
    published && contextualHints.find((item) => item.title === title && item.id === published.id)?.hints;
  const contextual = matching?.filter((item) => item.when === "nenhum" || item.when === context) ?? [];
  const hints = [
    ...contextual,
    ...(specific ? [hint(specific[mode], "nenhum", mode)] : []),
    ...(published?.hint && check.kind !== "quiz" ? [hint(published.hint)] : []),
    hint(general[mode], "nenhum", mode),
    hint(specific?.[otherMode] ?? general[otherMode], "nenhum", otherMode),
  ];
  const fallback = contextual.find((item) => item.when === context && context !== "nenhum" && item.mode === mode)?.text ??
    (mode === "pista" && check.kind !== "quiz" ? task.hint : undefined) ??
    hints.find((item) => item.mode === mode)?.text ?? general[mode];
  return { goal: published?.action ?? general[mode], hints, fallback };
}
