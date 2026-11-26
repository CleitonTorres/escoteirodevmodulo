import { challenges } from "../app/browser-content";
import type { PracticeTask } from "../lib/practice";

export type LessonResource = { title: string; url: string };

export type Lesson = {
  id: number;
  month: number;
  title: string;
  subtitle: string;
  icon: string;
  objective: string;
  theory: string[];
  practice: PracticeTask[];
  exercise?: string[];
  resources?: LessonResource[];
  guide: string;
  tool?: "arquivos" | "digitacao" | "navegador";
  videoUrl?: string[];
};

function securityTask(
  id: string,
  { question, options, answer, feedback }: (typeof challenges)[number],
): PracticeTask {
  return {
    id,
    action: question,
    check: { kind: "quiz", options, answer, feedback },
  };
}

const presentationFile = ["Apresentação.docx"];
const shoppingList = {
  kind: "sheet",
  file: ["Lista de compras.xlsx"],
  headers: ["Item", "Quantidade", "Valor", "Subtotal"],
  itemCount: 3,
} satisfies Omit<Extract<PracticeTask["check"], { kind: "sheet" }>, "step">;

/**
 * Para adicionar ou remover tarefas, edite o array practice da aula em data/lessons.ts. Cada tarefa tem um id estável,
 * uma instrução em action, uma dica opcional em hint e o critério de verificação em check.
 */
export const lessons: Lesson[] = [
  {
    id: 1,
    month: 1,
    title: "Introdução ao Mundo Digital e Projeto Inicial",
    subtitle: "Conheça seu novo espaço de descobertas",
    icon: "✦",
    objective:
      "Reconhecer o computador, o sistema operacional e a área de trabalho.",
    theory: [
      "Um computador recebe informações, processa instruções e apresenta resultados. Ele pode ajudar a aprender, criar e se comunicar.",
      "O sistema operacional é o programa principal que organiza arquivos, janelas e dispositivos. A área de trabalho reúne atalhos, pastas e a barra de tarefas.",
    ],
    practice: [
      {
        id: "abrir-arquivos",
        action: "Abra a pasta Arquivos.",
        hint: "Dê dois cliques no ícone ou selecione-o e pressione Enter.",
        check: { kind: "desktop-event", action: "open", name: "Arquivos" },
      },
      {
        id: "criar-pasta",
        action: "Dentro de Arquivos, crie a pasta Atividades da aula.",
        hint: "Clique com o botão direito do mouse no espaço vazio e escolha Nova pasta. Em telas de toque, pressione e segure.",
        check: {
          kind: "entry",
          entry: "folder",
          path: ["Arquivos", "Atividades da aula"],
        },
      },
    ],
    guide:
      "Escreva a capa do guia: seu nome, a data e três coisas que você quer aprender.",
    tool: "arquivos",
    videoUrl: ["https://youtu.be/0uRHWr6usNU?si=r11VjEPoIP1_DasD"],
  },
  {
    id: 2,
    month: 1,
    title: "O Teclado e a Arte da Digitação",
    subtitle: "Descubra as teclas e ganhe confiança",
    icon: "⌨",
    objective:
      "Identificar as seções do teclado e praticar postura e teclas especiais.",
    theory: [
      "O teclado reúne letras, números, teclas de função e teclas especiais. A fila-guia ASDF e JKLÇ ajuda os dedos a encontrar sua posição.",
      "Use os polegares na barra de espaço. Digite com leveza, mantenha os punhos relaxados e olhe para a tela sempre que puder.",
    ],
    practice: [
      {
        id: "fila-guia",
        action: "Seja aprovado no nível 1 de digitação.",
        check: { kind: "typing", level: 1 },
      },
      {
        id: "palavras",
        action: "Avance até ser aprovado no nível 3.",
        hint: "Conclua o nível 2 antes de praticar as palavras do nível 3.",
        check: { kind: "typing", level: 3 },
      },
      {
        id: "frase",
        action: "Seja aprovado no nível 4, Frase curta.",
        hint: "Observe espaços, maiúsculas e pontuação.",
        check: { kind: "typing", level: 4 },
      },
    ],
    guide:
      "Registre a postura correta e explique para que servem Enter, Backspace, Shift e espaço.",
    tool: "digitacao",
    videoUrl: ["https://youtu.be/NXTuSzQcFCI?si=L1dCokXbuGzpREGo"],
  },
  {
    id: 3,
    month: 1,
    title: "O Mouse e a Interação com o Sistema",
    subtitle: "Mova, selecione e organize",
    icon: "⌖",
    objective:
      "Praticar clique, duplo clique, botão direito, arrastar, copiar e colar.",
    theory: [
      "O clique seleciona; o duplo clique abre; o botão direito mostra opções. Arrastar permite mover itens na tela.",
      "Copiar cria uma duplicata. Recortar prepara para mover. Colar coloca o conteúdo no destino.",
    ],
    practice: [
      {
        id: "renomear",
        action: "Renomeie um arquivo de texto para Apresentação.txt.",
        hint: "Use Boas-vindas.txt ou crie um arquivo de treino. Abra seu menu e escolha Renomear.",
        check: {
          kind: "desktop-event",
          action: "rename",
          name: "Apresentação.txt",
        },
      },
      {
        id: "mover",
        action: "Mova Apresentação.txt para Arquivos → Atividades da aula.",
        hint: "Se a pasta não existir, crie-a dentro de Arquivos. Use Mover para ou Recortar e Colar.",
        check: {
          kind: "entry",
          entry: "file",
          path: ["Arquivos", "Atividades da aula", "Apresentação.txt"],
        },
      },
    ],
    guide: "Descreva quando usar clique simples, duplo clique e botão direito.",
    tool: "arquivos",
    videoUrl: ["https://youtu.be/ad-8-NMXExI?si=1iF5PgVG-j5hRRKW"],
  },
  {
    id: 4,
    month: 1,
    title: "Hardware — Os Componentes do Computador",
    subtitle: "Conheça a equipe por dentro e por fora",
    icon: "▣",
    objective:
      "Reconhecer componentes internos e periféricos de entrada e saída.",
    theory: [
      "O processador executa instruções; a memória RAM mantém dados temporários; o armazenamento guarda arquivos mesmo após desligar.",
      "Teclado e mouse são periféricos de entrada. Monitor e alto-falantes são de saída. A tela sensível ao toque pode fazer os dois papéis.",
    ],
    practice: [
      {
        id: "teclado",
        action: "Qual é a função principal do teclado?",
        check: {
          kind: "quiz",
          options: ["Armazenar", "Receber dados de entrada", "Exibir imagens"],
          answer: 1,
          feedback:
            "O teclado envia ao computador as teclas que você pressiona.",
        },
      },
      {
        id: "processador",
        action: "Que componente executa instruções?",
        check: {
          kind: "quiz",
          options: ["Processador", "Monitor", "SSD"],
          answer: 0,
          feedback: "O processador executa as instruções dos programas.",
        },
      },
      {
        id: "armazenamento",
        action:
          "Qual componente mantém os arquivos quando o computador é desligado?",
        check: {
          kind: "quiz",
          options: ["Mouse", "Memória RAM", "SSD"],
          answer: 2,
          feedback:
            "O SSD armazena os arquivos mesmo com o computador desligado.",
        },
      },
      {
        id: "monitor",
        action: "Qual destes é um dispositivo de saída?",
        check: {
          kind: "quiz",
          options: ["Microfone", "Monitor", "Teclado"],
          answer: 1,
          feedback: "O monitor mostra as imagens produzidas pelo computador.",
        },
      },
    ],
    guide: "Monte uma lista de componentes e explique a função de cada um.",
    videoUrl: ["https://youtu.be/0GOt95IWPXs?si=0ScGmW6gxPKHKxtX"],
  },
  {
    id: 5,
    month: 2,
    title: "Sistema Operacional — O Cérebro da Máquina",
    subtitle: "Organize arquivos e pastas com segurança",
    icon: "▤",
    objective: "Navegar no explorador e gerenciar arquivos, pastas e lixeira.",
    theory: [
      "Pastas organizam arquivos por assunto. Um nome claro ajuda a encontrar o que você precisa. Extensões como .txt indicam o tipo do arquivo.",
      "Excluir costuma enviar itens para a lixeira, de onde podem ser restaurados. Confira o nome e o local antes de mover ou apagar.",
    ],
    practice: [
      {
        id: "rascunhos",
        action: "Crie a pasta Rascunhos dentro de Arquivos → Meu Guia Digital.",
        check: {
          kind: "entry",
          entry: "folder",
          path: ["Arquivos", "Meu Guia Digital", "Rascunhos"],
        },
      },
      {
        id: "imagens",
        action: "Crie a pasta Imagens ao lado de Rascunhos.",
        check: {
          kind: "entry",
          entry: "folder",
          path: ["Arquivos", "Meu Guia Digital", "Imagens"],
        },
      },
      {
        id: "lixeira",
        action: "Envie Revisão.txt para a Lixeira.",
        hint: "Crie Revisão.txt em Rascunhos. Em seguida, selecione o arquivo e use Delete ou escolha Mover para a Lixeira no menu.",
        check: { kind: "desktop-event", action: "trash", name: "Revisão.txt" },
      },
      {
        id: "restaurar",
        action: "Abra a Lixeira e restaure Revisão.txt.",
        hint: "Na Lixeira, abra o menu Ações ao lado do arquivo e escolha Restaurar. Ele deve voltar à pasta Rascunhos.",
        check: {
          kind: "desktop-event",
          action: "restore",
          name: "Revisão.txt",
          after: "lixeira",
        },
      },
      {
        id: "arquivo",
        action:
          "Deixe o arquivo Revisão.txt dentro da pasta Rascunhos ao terminar.",
        hint: "Confira se o arquivo restaurado voltou à pasta Rascunhos.",
        check: {
          kind: "entry",
          entry: "file",
          path: ["Arquivos", "Meu Guia Digital", "Rascunhos", "Revisão.txt"],
        },
      },
    ],
    guide: "Desenhe a estrutura de pastas escolhida para organizar o guia.",
    tool: "arquivos",
    videoUrl: ["https://youtu.be/gKJ9JXQznUQ?si=f8NRZxRMst_j93Rv"],
  },
  {
    id: 6,
    month: 2,
    title: "Atalhos Essenciais — Agilizando o Trabalho",
    subtitle: "Faça mais com combinações simples",
    icon: "⌘",
    objective: "Usar atalhos comuns e alternar entre janelas.",
    theory: [
      "Ctrl+C copia, Ctrl+X recorta e Ctrl+V cola. Ctrl+Z desfaz a última ação. Ctrl+S salva. Esses atalhos funcionam em muitos programas.",
      "Alt+Tab alterna entre janelas abertas. Atalhos economizam tempo, mas é importante saber o que cada combinação faz.",
    ],
    practice: [
      {
        id: "copiar",
        action: "Selecione todo o texto de origem e copie com Ctrl+C.",
        check: { kind: "shortcut", action: "copy" },
      },
      {
        id: "colar",
        action: "No campo de destino vazio, cole o texto com Ctrl+V.",
        check: { kind: "shortcut", action: "paste" },
      },
      {
        id: "desfazer",
        action: "No campo de destino, use Ctrl+Z para desfazer a colagem.",
        check: { kind: "shortcut", action: "undo" },
      },
    ],
    guide: "Registre cinco atalhos úteis e uma situação em que usaria cada um.",
    videoUrl: ["https://youtu.be/gYvj3lKjMeY?si=3g2UN49KTASur1R_"],
  },
  {
    id: 7,
    month: 2,
    title: "Personalizando o Ambiente de Trabalho",
    subtitle: "Deixe o espaço de trabalho com a sua cara",
    icon: "◐",
    objective:
      "Personalizar a área de trabalho e criar atalhos para as ferramentas usadas no curso.",
    theory: [
      "Papel de parede e tema ajudam a personalizar a área de trabalho. Contraste e tamanho do texto também podem melhorar a leitura.",
      "Configurações de data, hora e volume afetam o uso diário. Faça mudanças com atenção e peça ajuda quando necessário.",
      "Um atalho abre uma ferramenta com poucos cliques. Você pode dar nomes aos seus atalhos de acordo com sua rotina.",
    ],
    practice: [
      {
        id: "atalho-guia",
        action:
          "Na área de trabalho, crie um atalho chamado Meu Editor para o Editor de texto.",
        hint: "Abra o menu de uma área vazia, escolha Novo atalho e selecione o destino.",
        check: {
          kind: "entry",
          entry: "shortcut",
          path: ["Meu Editor"],
          app: "Editor de texto",
        },
      },
      {
        id: "atalho-web",
        action:
          "Na área de trabalho, crie um atalho chamado Minha Pesquisa para o Navegador.",
        check: {
          kind: "entry",
          entry: "shortcut",
          path: ["Minha Pesquisa"],
          app: "Navegador",
        },
      },
    ],
    guide:
      "Explique quais configurações tornam o computador mais confortável para você.",
    tool: "arquivos",
    videoUrl: ["https://youtu.be/yRwFNk5yIsE?si=zFo8e4mlJw5GEAIn"],
  },
  {
    id: 8,
    month: 2,
    title: "Introdução à Internet e Navegadores",
    subtitle: "Navegue, pesquise e avalie informações",
    icon: "◎",
    objective:
      "Entender internet, navegador, endereço web e pesquisa responsável.",
    theory: [
      "A internet conecta redes e dispositivos. O navegador abre páginas da web; um mecanismo de busca ajuda a encontrar conteúdo.",
      "Observe o endereço, a autoria e a data de uma página. Não informe senhas nem dados pessoais em sites desconhecidos.",
    ],
    practice: [
      {
        id: "google",
        action: "No Google do simulador, pesquise por senha.",
        check: { kind: "search", engine: "google", terms: ["senha"] },
      },
      {
        id: "bing",
        action: "Faça a mesma pesquisa usando o Bing.",
        hint: "Use o seletor de buscador ou volte à página inicial do simulador.",
        check: { kind: "search", engine: "bing", terms: ["senha"] },
      },
      {
        id: "favorito",
        action:
          "Abra o resultado Como criar senhas fortes e salve a página nos favoritos.",
        hint: "Clique na estrela da barra de endereços. Se já for favorita, remova e adicione a página novamente.",
        check: { kind: "favorite", url: "https://trilha.example/senhas" },
      },
    ],
    guide:
      "Anote três critérios para avaliar se uma informação online é confiável.",
    tool: "navegador",
    videoUrl: ["https://youtu.be/YVZVAuOr0kg?si=Fzdp6a_QLUcGkeHH"],
  },
  {
    id: 9,
    month: 3,
    title: "Editor de Texto — Ferramentas Básicas",
    subtitle: "Dê forma e clareza às suas ideias",
    icon: "¶",
    objective: "Editar texto, selecionar trechos e formatar fonte e parágrafo.",
    theory: [
      "Um editor de texto permite escrever, revisar e formatar documentos. Títulos, parágrafos e listas deixam as ideias mais fáceis de acompanhar.",
      "Salve o documento com um nome reconhecível e revise antes de compartilhar.",
    ],
    practice: [
      {
        id: "documento",
        action: "Na área de trabalho, crie Apresentação.docx.",
        hint: "Escolha Novo arquivo, digite o nome com a extensão .docx e abra o arquivo para continuar.",
        check: { kind: "entry", entry: "file", path: presentationFile },
      },
      {
        id: "titulo",
        action: "Escreva um título no estilo Título 1 e centralize-o.",
        hint: "Use Estilo do parágrafo e o botão Centralizar.",
        check: {
          kind: "word",
          block: { type: "heading", level: 1, alignment: "center" },
          file: presentationFile,
        },
      },
      {
        id: "subtitulo",
        action: "Adicione um subtítulo no estilo Título 2.",
        check: {
          kind: "word",
          block: { type: "heading", level: 2 },
          file: presentationFile,
        },
      },
      {
        id: "paragrafo",
        action:
          "Escreva um parágrafo de pelo menos 40 caracteres, justifique e coloque uma palavra em negrito.",
        hint: "Use Texto normal para o parágrafo. Selecione a palavra antes de aplicar Negrito.",
        check: {
          kind: "word",
          block: {
            type: "paragraph",
            alignment: "justify",
            minLength: 40,
            bold: true,
          },
          file: presentationFile,
        },
      },
      {
        id: "lista",
        action:
          "Insira uma lista com marcadores com pelo menos dois itens preenchidos.",
        check: {
          kind: "word",
          block: { type: "bulletList", minItems: 2 },
          file: presentationFile,
        },
      },
    ],
    guide:
      "Formate uma seção do guia explicando o que você aprendeu até agora.",
    tool: "arquivos",
    videoUrl: ["https://youtu.be/FJcibvPCwrw?si=cI2pLz0BWvfuisoP"],
  },
  {
    id: 10,
    month: 3,
    title: "Planilha - Lista de Compras",
    subtitle: "Organize dados e calcule valores com fórmulas",
    icon: "▧",
    objective:
      "Montar uma tabela, calcular subtotais e somar o valor das compras.",
    theory: [
      "Cada célula combina uma coluna e uma linha. A célula B2 fica na coluna B, linha 2.",
      "Fórmulas começam com =. Use * para multiplicar e SOMA (SUM no simulador) para somar um intervalo.",
    ],
    practice: [
      {
        id: "arquivo",
        action: "Na área de trabalho, crie Lista de compras.xlsx.",
        hint: "Depois, abra o arquivo para preencher as células.",
        check: { kind: "entry", entry: "file", path: shoppingList.file },
      },
      {
        id: "colunas",
        action:
          "Na primeira aba, escreva Item, Quantidade, Valor e Subtotal em A1, B1, C1 e D1, nessa ordem.",
        check: { ...shoppingList, step: "headers" },
      },
      {
        id: "compras",
        action:
          "Preencha três itens nas linhas 2 a 4, com quantidades inteiras e preços maiores que zero.",
        hint: "Digite números nas colunas Quantidade e Valor. Use vírgula para separar os centavos, como em 4,50.",
        check: { ...shoppingList, step: "items" },
      },
      {
        id: "subtotais",
        action:
          "Nas células D2 a D4, calcule o subtotal multiplicando a quantidade pelo valor da mesma linha.",
        hint: "Digite =B2*C2 em D2 e ajuste a referência para as duas linhas seguintes.",
        check: { ...shoppingList, step: "subtotals" },
      },
      {
        id: "total",
        action: "Escreva Total em A5 e some os subtotais na célula D5.",
        hint: "No simulador, use =SUM(D2:D4), o equivalente de =SOMA(D2:D4).",
        check: { ...shoppingList, step: "total" },
      },
    ],
    guide:
      "Explique com um exemplo como você usou fórmulas para calcular o total.",
    tool: "arquivos",
  },
  {
    id: 11,
    month: 3,
    title: "Segurança Digital e Boas Práticas",
    subtitle: "Cuide dos seus dados e da sua privacidade",
    icon: "⬡",
    objective:
      "Identificar senhas seguras, mensagens suspeitas e hábitos de proteção.",
    theory: [
      "Use senhas longas e únicas. Nunca compartilhe sua senha. Ative autenticação em duas etapas quando disponível.",
      "Desconfie de mensagens urgentes com links inesperados. Confirme pedidos por outro canal e converse com um adulto de confiança.",
    ],
    practice: [
      securityTask("mensagem-suspeita", challenges[0]),
      securityTask("https", challenges[1]),
      securityTask("computador-compartilhado", challenges[2]),
    ],
    guide:
      "Escreva cinco dicas de segurança digital para compartilhar com a família.",
    videoUrl: ["https://youtu.be/fny8loFEJTI?si=DXdlGtuMfO63jzPO"],
  },
  {
    id: 12,
    month: 3,
    title: "Revisão Final e Apresentação dos Projetos",
    subtitle: "Celebre o que você já consegue fazer",
    icon: "⚑",
    objective:
      "Revisar conceitos, concluir o guia e apresentar o próprio aprendizado.",
    theory: [
      "Revisar é uma oportunidade de perceber o quanto você avançou. Explique cada etapa com suas próprias palavras.",
      "Ao apresentar, fale com clareza, mostre exemplos e valorize as perguntas. Aprender também é compartilhar.",
    ],
    practice: [],
    guide:
      "Finalize e revise seu Guia Digital de Informática Básica. Organize o conteúdo em pelo menos três seções com subtítulos diferentes. Escreva um parágrafo resumindo o que aprendeu e monte uma lista numerada com pelo menos três pontos para sua apresentação.",
    videoUrl: ["https://youtu.be/WvXdGio_cjo?si=MnHwUU7101eItVdD"],
  },
];
export const monthNames: Record<number, string> = {
  1: "Fundamentos e Primeiros Passos",
  2: "Explorando o Sistema Operacional",
  3: "Ferramentas de Produtividade e Finalização",
};
