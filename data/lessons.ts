import { challenges } from "./browser-content";
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
  codeExample?: string;
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
      "Você já usa recursos digitais quando consulta um horário, escreve uma mensagem ou organiza fotos. Num computador, hardware é a parte física, como o teclado e o monitor. Software são os programas, como o editor de texto e o navegador.",
      "Experimente pensar em entrada, processamento e saída. Ao digitar seu nome, o teclado envia os dados de entrada, o programa interpreta as teclas e o monitor exibe o resultado. Se você salvar, o texto também passa a ficar guardado como um arquivo.",
      "O sistema operacional organiza o uso do computador e abre os aplicativos. Cada aplicativo tem uma finalidade. Use o editor para escrever o guia, o explorador para organizar pastas e o navegador para consultar páginas da web.",
      "Na área de trabalho, um ícone pode representar um arquivo, uma pasta, um aplicativo ou um atalho. A barra de tarefas ajuda a encontrar e alternar entre janelas. Minimizar libera espaço na tela e mantém a janela aberta para voltar a ela depois.",
      "O Guia Digital vai reunir o que você descobrir durante o curso. Comece criando um lugar para guardar as atividades. Use um nome que faça sentido para você e confira em qual pasta o item aparece.",
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
      {
        id: "revisao-entrada-saida",
        action: "Você digita seu nome e o vê aparecer na tela. Qual par corresponde à entrada e à saída?",
        check: {
          kind: "quiz",
          options: ["Monitor e teclado", "Teclado e monitor", "Pasta e atalho"],
          answer: 1,
          feedback: "O teclado envia as teclas para o computador e o monitor mostra o resultado.",
        },
      },
      {
        id: "revisao-janela",
        action: "Você precisa consultar outra janela e quer voltar ao arquivo que está editando. O que pode fazer?",
        check: {
          kind: "quiz",
          options: ["Minimizar a janela e voltar a ela pela barra de tarefas", "Renomear o aplicativo", "Mover o arquivo para a Lixeira"],
          answer: 0,
          feedback: "Minimizar esconde a janela temporariamente e ela continua aberta na barra de tarefas.",
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
      "No teclado ABNT2, procure o Ç ao lado do L. As letras ficam no bloco principal. As setas movem o cursor em um texto e também podem mudar a seleção em menus. O teclado numérico, quando existe, é um bloco próprio para digitar números.",
      "Enter insere uma nova linha em um editor e pode confirmar uma ação em um formulário. Backspace apaga o caractere imediatamente à esquerda do cursor. Se houver um trecho selecionado, Backspace apaga a seleção inteira.",
      "Segure Shift enquanto pressiona uma letra para escrever uma maiúscula. A tecla também dá acesso ao símbolo superior de muitas teclas. Caps Lock mantém as letras em maiúsculas até ser pressionado novamente.",
      "Para escrever uma palavra com acento, como café, pressione a tecla do acento agudo e depois a letra e. Em teclados com outro idioma, a posição das teclas pode mudar. O teclado virtual da prática ajuda a localizar cada uma.",
      "Apoie os pés, deixe os ombros relaxados e ajuste a distância do teclado para manter os punhos confortáveis. Comece pela fila-guia, volte a ela entre as teclas e priorize acertar as letras. Treine espaços, pontuação e maiúsculas antes de acelerar.",
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
      {
        id: "revisao-maiuscula",
        action: "Você quer digitar apenas a letra A em maiúscula no início de uma palavra. Qual combinação pode usar?",
        check: {
          kind: "quiz",
          options: ["Enter + A", "Backspace + A", "Shift + A"],
          answer: 2,
          feedback: "Shift permite digitar uma letra maiúscula enquanto a tecla está pressionada.",
        },
      },
      {
        id: "revisao-backspace",
        action: "O cursor está logo depois de uma letra digitada a mais. Qual tecla apaga a letra que está à esquerda do cursor?",
        check: {
          kind: "quiz",
          options: ["Backspace", "Enter", "Seta para a esquerda"],
          answer: 0,
          feedback: "Backspace apaga o caractere à esquerda. A seta apenas desloca o cursor.",
        },
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
      "Mover o mouse desloca o ponteiro na tela. A roda serve para rolar o conteúdo quando ele ocupa mais espaço do que a janela. Coloque o ponteiro sobre a área desejada antes de rolar.",
      "Na área de trabalho de treino, clique uma vez para destacar um arquivo e duas vezes seguidas para abri-lo. Em botões e links, normalmente basta um clique. Com o teclado, você também pode abrir um item selecionado usando Enter.",
      "O clique direito abre o menu de contexto. As opções aparecem de acordo com o lugar que você clicou. Em cima de um arquivo, procure Renomear ou Mover para. Em um espaço vazio da pasta, procure opções para criar itens.",
      "Para arrastar, mantenha o botão pressionado, leve o ponteiro até o destino e solte. Para conservar uma cópia na origem, use Copiar seguido de Colar. Para transferir o arquivo, use Recortar seguido de Colar ou escolha Mover para.",
      "No exercício, deixe a extensão .txt no nome Apresentação.txt e confirme que o arquivo chegou em Arquivos → Atividades da aula. Se estiver usando uma tela sensível ao toque, o simulador permite abrir o menu tocando e segurando.",
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
      {
        id: "revisao-menu-contexto",
        action: "Como você abre o menu com a opção Renomear para um arquivo no simulador usando o mouse?",
        check: {
          kind: "quiz",
          options: ["Role a roda sobre o arquivo", "Dê dois cliques com o botão esquerdo no arquivo", "Clique com o botão direito sobre o arquivo"],
          answer: 2,
          feedback: "O menu de contexto do arquivo reúne opções como Renomear, Copiar e Mover para.",
        },
      },
      {
        id: "revisao-mover-arquivo",
        action: "Qual operação leva um arquivo para outra pasta e deixa uma única cópia no destino?",
        check: {
          kind: "quiz",
          options: ["Copiar e Colar", "Recortar e Colar", "Dar duplo clique"],
          answer: 1,
          feedback: "Recortar e Colar move o arquivo. Copiar e Colar mantém o original e cria outra cópia.",
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
      "Os componentes de um computador trabalham juntos. A placa-mãe conecta componentes como o processador, a memória e as unidades de armazenamento. A fonte fornece energia para os componentes de um computador de mesa.",
      "O processador interpreta instruções e realiza operações. A memória RAM guarda os dados que os programas estão usando naquele momento. Abrir várias janelas e aplicativos pode aumentar a quantidade de memória em uso.",
      "O SSD ou HD armazena arquivos e programas. Imagine que você abra uma foto. Ela vem do armazenamento, fica disponível na memória para edição e volta ao armazenamento quando você salva a versão editada.",
      "Classifique os periféricos pelo caminho da informação. O microfone recebe som e a impressora coloca informações no papel. Uma tela sensível ao toque mostra o que o computador produz e também recebe o toque como entrada.",
      "Observe o equipamento que você está usando e escolha um componente interno e um periférico. Tente explicar a função de cada um em uma frase e dê um exemplo de quando os dois participam da mesma tarefa.",
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
      {
        id: "revisao-memoria-em-uso",
        action: "Qual componente mantém disponíveis os dados que o editor está usando enquanto você digita?",
        check: {
          kind: "quiz",
          options: ["Impressora", "Memória RAM", "Placa de rede"],
          answer: 1,
          feedback: "A RAM mantém os dados em uso durante o trabalho. Ao salvar, o documento fica no armazenamento.",
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
      "Ao ligar o computador, o sistema operacional carrega o ambiente onde você entra na sua conta e abre programas. Ele administra recursos como memória e armazenamento e oferece ferramentas para encontrar arquivos e ajustar configurações.",
      "No explorador, a barra de endereço mostra a sequência de pastas até o local atual. Em Arquivos → Meu Guia Digital → Rascunhos, Rascunhos fica dentro de Meu Guia Digital. Use a barra para conferir onde está antes de criar ou colar um arquivo.",
      "Arquivos guardam conteúdo e pastas agrupam itens. Use nomes que indiquem assunto ou versão, como Revisão do guia.txt. No nome Revisão.txt, .txt indica um arquivo de texto simples. Trocar a extensão ao renomear altera o nome, enquanto a conversão exige salvar ou exportar em outro formato.",
      "A Lixeira do simulador guarda itens removidos. Quando você restaura Revisão.txt, ele volta à pasta de origem. Abrir essa pasta após restaurar é uma forma rápida de conferir se o arquivo reapareceu.",
      "Organize o Guia Digital por finalidade. Guarde ideias em Rascunhos e reúna ilustrações em Imagens. Separar as versões em andamento dos materiais que você vai apresentar ajuda a escolher o arquivo certo.",
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
      {
        id: "revisao-local-origem",
        action: "No simulador, você enviou Revisão.txt de Rascunhos para a Lixeira e escolheu Restaurar. Onde deve procurar o arquivo?",
        check: {
          kind: "quiz",
          options: ["Em Rascunhos", "Na pasta Imagens", "Na pasta Downloads"],
          answer: 0,
          feedback: "Restaurar devolve o item à pasta de onde ele foi removido, que neste caso é Rascunhos.",
        },
      },
      {
        id: "revisao-extensao",
        action: "Você quer transformar um documento .docx em PDF. Qual ação realiza a conversão?",
        check: {
          kind: "quiz",
          options: ["Arrastar o documento para outra pasta", "Trocar .docx por .pdf no nome do arquivo", "Usar a opção de exportar ou salvar como PDF"],
          answer: 2,
          feedback: "Exportar ou salvar como PDF grava o conteúdo no novo formato. Renomear altera somente o nome.",
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
      "Uma combinação como Ctrl+C significa segurar Ctrl, pressionar C e soltar as duas teclas. Os atalhos agem sobre a janela ativa. Quando a ação depende de um conteúdo selecionado, destaque o trecho ou o item antes de usar a combinação.",
      "Copiar e recortar colocam informações na área de transferência. Para colar texto, clique no campo de destino e confira onde está o cursor. Em seguida, use Ctrl+V. O navegador e alguns editores podem oferecer as mesmas ações pelo menu.",
      "Em muitos editores, Ctrl+A seleciona todo o conteúdo da área ativa. Ctrl+Z desfaz a última mudança que o aplicativo permite desfazer. Use um texto de treino para observar o que acontece depois de colar e desfazer.",
      "No Windows, Alt+Tab alterna entre aplicativos ou janelas abertas. No navegador, Ctrl+Tab costuma alternar entre abas. As combinações podem variar com o sistema e o programa, por isso vale consultar os atalhos mostrados nos menus.",
      "Treine uma sequência curta. Selecione a frase de origem, copie, clique no campo de destino, cole e desfaça. Observe a cada etapa qual campo está ativo e o que mudou.",
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
      {
        id: "revisao-desfazer-colagem",
        action: "Você colou uma frase no lugar errado e essa foi a última mudança. Qual atalho pode desfazer a colagem?",
        check: {
          kind: "quiz",
          options: ["Ctrl+S", "Ctrl+V", "Ctrl+Z"],
          answer: 2,
          feedback: "Ctrl+Z desfaz a última edição do campo ativo em um editor que oferece essa função.",
        },
      },
      {
        id: "revisao-alternar-janelas",
        action: "No Windows, qual atalho ajuda a alternar entre o editor de texto e outra janela aberta?",
        check: {
          kind: "quiz",
          options: ["Alt+Tab", "Ctrl+C", "Ctrl+A"],
          answer: 0,
          feedback: "Alt+Tab permite escolher outra janela aberta sem encerrar o que você estava fazendo.",
        },
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
      "Personalizar a área de trabalho pode melhorar a leitura e facilitar a rotina. A imagem do fundo, o contraste do tema e o tamanho do texto mudam como você enxerga ícones e menus.",
      "Se os rótulos parecem pequenos, procure o tamanho do texto, a escala da tela ou o zoom do aplicativo. Teste um ajuste e observe se consegue ler sem esforço. Um fundo simples também pode facilitar a leitura dos nomes dos arquivos.",
      "O atalho aponta para um aplicativo, arquivo ou pasta. Criar um atalho para o Editor de texto coloca um novo ponto de acesso na área de trabalho. O aplicativo continua instalado no lugar de origem quando você remove apenas o atalho.",
      "Escolha nomes curtos e fáceis de distinguir, como Meu Editor e Minha Pesquisa. Separe ferramentas de arquivos de trabalho e deixe os itens mais usados em um local que você reconheça ao abrir o computador.",
      "Observe também os controles de som. O volume geral afeta o aparelho e o volume do aplicativo pode ajustar apenas o áudio em uso. Em um computador compartilhado, combine as mudanças de aparência e som com quem usa o equipamento.",
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
      {
        id: "revisao-atalho-editor",
        action: "Você quer abrir o editor rapidamente e dar ao ícone o nome Meu Editor. O que deve criar?",
        check: {
          kind: "quiz",
          options: ["Um atalho para o Editor de texto", "Uma pasta vazia chamada Meu Editor", "Uma cópia do último documento editado"],
          answer: 0,
          feedback: "O atalho associa o nome que você escolheu ao aplicativo que deseja abrir.",
        },
      },
      {
        id: "revisao-texto-legivel",
        action: "Os nomes dos ícones estão pequenos e difíceis de ler. Qual ajuste atende melhor a essa necessidade?",
        check: {
          kind: "quiz",
          options: ["Aumentar o volume dos alertas", "Aumentar o tamanho do texto ou a escala da tela", "Alterar a hora do computador"],
          answer: 1,
          feedback: "O tamanho do texto e a escala ajudam a tornar rótulos e elementos da interface mais legíveis.",
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
      "A internet é a rede que permite a comunicação entre equipamentos. A web é um dos serviços que funcionam sobre ela. Você acessa páginas da web com um navegador, como o navegador do simulador.",
      "Google e Bing são mecanismos de busca. Eles apresentam páginas que podem corresponder ao que você digitou. Quando souber o endereço de uma página, digite-o na barra de endereços do navegador para ir direto ao destino.",
      "Uma URL é o endereço de uma página. Em https://trilha.example/senhas, trilha.example identifica o site e /senhas indica a página que você quer abrir. Observe especialmente o nome do site para reconhecer o destino.",
      "Comece a pesquisa com palavras que descrevam o que você quer aprender. Compare resultados e abra as páginas para conferir autoria, data e evidências. Um anúncio ou um resultado no topo pode atender à busca, mas sua posição não confirma a qualidade da informação.",
      "Os favoritos guardam o endereço para voltar depois. Depois de comparar os resultados do Google e do Bing no simulador, salve a página sobre senhas. Na vida real, confira a origem da página antes de usar ou compartilhar suas orientações.",
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
      {
        id: "revisao-buscador",
        action: "Qual é o papel do Google e do Bing na atividade do simulador?",
        check: {
          kind: "quiz",
          options: ["Salvar senhas do computador", "Substituir a conexão com a internet", "Encontrar páginas relacionadas à pesquisa"],
          answer: 2,
          feedback: "O buscador encontra e apresenta páginas. O navegador é o aplicativo que permite abri-las.",
        },
      },
      {
        id: "revisao-avaliar-resultado",
        action: "Duas páginas oferecem dicas diferentes sobre senhas. Como você decide qual usar no guia?",
        check: {
          kind: "quiz",
          options: ["Compare autoria, data e evidências e confira em uma fonte reconhecida", "Escolha a página com mais imagens", "Use sempre o primeiro resultado da busca"],
          answer: 0,
          feedback: "Autoria, data e evidências ajudam a avaliar a informação. Comparar fontes reduz o risco de repetir uma dica incorreta.",
        },
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
      "Um documento costuma ter títulos, parágrafos e, quando necessário, listas. Use Título 1 para seções principais, Título 2 para assuntos dentro delas e Texto normal para desenvolver as ideias em parágrafos.",
      "Estilos de título dão estrutura ao documento. Negrito, itálico e sublinhado mudam a aparência das palavras. Selecione o trecho para aplicar negrito a uma palavra, depois leia o parágrafo para confirmar que o destaque ficou onde você queria.",
      "O alinhamento vale para o parágrafo. À esquerda, as linhas começam no mesmo ponto. Centralizar distribui o texto em torno do meio da página. Justificar ajusta o espaço entre palavras para alinhar as linhas aos dois lados, exceto normalmente a última.",
      "Use marcadores para itens sem ordem obrigatória, como materiais, e números quando a sequência fizer diferença, como os passos de uma tarefa. Mantenha os itens curtos e com formatação parecida.",
      "Em Apresentação.docx, comece pelo título, acrescente um subtítulo e escreva um parágrafo antes de montar a lista. Releia o documento como se outra pessoa fosse abri-lo pela primeira vez e confira se a estrutura ajuda a localizar cada assunto.",
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
      {
        id: "revisao-estilo-subtitulo",
        action: "Qual estilo identifica um subtítulo dentro de uma seção que usa Título 1?",
        check: {
          kind: "quiz",
          options: ["Negrito", "Título 2", "Texto normal"],
          answer: 1,
          feedback: "Título 2 indica uma subseção de Título 1. Negrito serve para destacar a aparência de um trecho.",
        },
      },
      {
        id: "revisao-lista-etapas",
        action: "Você quer mostrar os passos para abrir o editor e criar um documento. Que formato ajuda a comunicar a ordem?",
        check: {
          kind: "quiz",
          options: ["Lista numerada", "Lista com marcadores", "Título centralizado"],
          answer: 0,
          feedback: "A numeração indica a sequência em que a pessoa deve realizar os passos.",
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
      "Uma planilha é organizada em abas, linhas e colunas. O endereço de uma célula vem da letra da coluna e do número da linha. Use a primeira linha para descrever as colunas da lista e mantenha um item por linha abaixo dela.",
      "Um dado pode ser texto, número ou fórmula. Digite a quantidade e o preço como números para que possam entrar nas contas. Você pode exibir o preço como moeda por formatação, mantendo o valor numérico para as fórmulas.",
      "O subtotal de uma compra é a quantidade multiplicada pelo preço de uma unidade. Se B2 tiver 3 e C2 tiver 4,50, a fórmula =B2*C2 em D2 calcula 13,50. Alterar a quantidade recalcula o resultado.",
      "Um intervalo com dois-pontos inclui as células entre os endereços indicados. D2:D4 abrange D2, D3 e D4. No simulador, =SUM(D2:D4) soma os três subtotais. Em planilhas configuradas em português, a função pode aparecer como SOMA.",
      "Confira as referências ao repetir uma fórmula na próxima linha. Em D3, use a quantidade B3 e o preço C3. Mantenha a célula do total fora do intervalo que ela soma e compare o resultado com uma conta simples feita à mão.",
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
      {
        id: "revisao-formula-subtotal",
        action: "A quantidade está em B3 e o preço unitário em C3. Qual fórmula calcula o subtotal dessa linha?",
        check: {
          kind: "quiz",
          options: ["=B2*C2", "=B3+C3", "=B3*C3"],
          answer: 2,
          feedback: "O subtotal usa a quantidade e o preço da mesma linha, ligados pelo operador de multiplicação *.",
        },
      },
      {
        id: "revisao-intervalo-total",
        action: "Os subtotais estão em D2, D3 e D4. Qual fórmula você digita em D5 para calcular o total no simulador?",
        check: {
          kind: "quiz",
          options: ["=SUM(D2:D4)", "=SUM(D2:D5)", "=D2*D4"],
          answer: 0,
          feedback: "O intervalo D2:D4 reúne os três subtotais e deixa a célula D5 fora da própria soma.",
        },
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
      "Use uma senha longa e diferente para cada conta. Pense em uma frase que só você conheça, sem expor nome, aniversário ou outros dados fáceis de descobrir. Em uma demonstração da aula, use dados inventados.",
      "A verificação em duas etapas acrescenta uma segunda confirmação ao login. Ela pode usar um aplicativo autenticador ou outro método da conta. Guarde os códigos de verificação para você, mesmo se uma mensagem alegar ser do suporte.",
      "Phishing é uma tentativa de enganar você para obter dados ou induzir uma ação. Uma mensagem pode copiar o nome de uma instituição e pedir que você aja depressa. Quando houver dúvida, procure o serviço pelo aplicativo oficial ou por um endereço que já conhece.",
      "HTTPS indica que a conexão com o endereço exibido usa criptografia. A confiabilidade do site exige conferir também o domínio e a origem do pedido. Uma página falsa pode usar HTTPS e, ainda assim, tentar recolher dados.",
      "Em computador compartilhado, use somente os dados necessários, recuse salvar a senha e encerre a sessão quando terminar. Proteja também a privacidade ao compartilhar documentos e fotos. Confira o que aparece no arquivo e quem poderá acessá-lo.",
      "Em casa, combine como confirmar pedidos urgentes e quem procurar se algo parecer estranho. Se inseriu uma senha em um link suspeito, procure o serviço pelo endereço oficial, troque a senha e peça ajuda a uma pessoa de confiança.",
    ],
    practice: [
      securityTask("mensagem-suspeita", challenges[0]),
      securityTask("https", challenges[1]),
      securityTask("computador-compartilhado", challenges[2]),
      {
        id: "revisao-senhas-diferentes",
        action: "Por que é importante usar senhas diferentes para o e-mail e as demais contas?",
        check: {
          kind: "quiz",
          options: ["Porque todas as contas passam a dispensar a verificação em duas etapas", "Porque uma senha vazada em um serviço não serve para entrar diretamente nos outros", "Porque isso torna qualquer site confiável"],
          answer: 1,
          feedback: "Senhas únicas limitam o impacto do vazamento de uma conta sobre as outras.",
        },
      },
      {
        id: "revisao-codigo-verificacao",
        action: "Uma mensagem de suposto suporte pede o código que acabou de chegar ao seu celular. Como agir?",
        check: {
          kind: "quiz",
          options: ["Envie o código e feche a conversa", "Publique o código para pedir orientação", "Guarde o código e confirme a solicitação pelo canal oficial"],
          answer: 2,
          feedback: "O código confirma uma tentativa de acesso. Compartilhá-lo pode permitir que outra pessoa entre na conta.",
        },
      },
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
      "Relacione o que aprendeu com a montagem do Guia Digital. Use o explorador para localizar os arquivos, o editor para organizar as explicações e o navegador para confirmar informações que pretende incluir.",
      "Revise o guia em duas passagens. Primeiro, confira a ordem das ideias e se as seções têm títulos claros. Depois, corrija palavras, pontuação e formatação. Abra o documento salvo e verifique se ele é a versão que você quer apresentar.",
      "Faça uma demonstração curta com começo, meio e fim. Diga o que pretendia fazer, mostre uma tarefa que realizou e explique como resolveu uma dificuldade. Escolha exemplos que você consiga reproduzir, como restaurar um arquivo ou calcular um subtotal.",
      "Antes de compartilhar a tela ou o arquivo, confira se as imagens, abas e documentos abertos podem ser mostrados ao público. Use exemplos de treino e deixe de fora senhas, dados pessoais de outras pessoas e informações particulares.",
      "Ensaie contando os passos em voz alta e convide alguém a fazer uma pergunta. Se perceber que uma parte ficou confusa, volte ao guia e explique com um exemplo concreto. Anote uma habilidade que já consegue usar e outra que quer praticar depois do curso.",
    ],
    practice: [
      {
        id: "revisao-conferir-guia",
        action: "Qual ação ajuda a encontrar um assunto rapidamente em um guia com várias seções?",
        check: {
          kind: "quiz",
          options: ["Usar o mesmo título para todas as seções", "Dar títulos diferentes e descritivos às seções", "Colocar todo o texto em um único parágrafo"],
          answer: 1,
          feedback: "Títulos descritivos mostram onde cada assunto começa e facilitam a navegação pelo guia.",
        },
      },
      {
        id: "revisao-mostrar-aprendizado",
        action: "Qual demonstração ajuda mais a plateia a entender o que você aprendeu?",
        check: {
          kind: "quiz",
          options: ["Mostrar como calculou um subtotal e explicar o que a fórmula faz", "Ler todos os nomes dos arquivos sem abri-los", "Mostrar apenas a imagem de fundo da área de trabalho"],
          answer: 0,
          feedback: "Reproduzir uma tarefa e explicar uma decisão mostra o caminho que levou ao resultado.",
        },
      },
      {
        id: "revisao-compartilhar-com-cuidado",
        action: "Seu guia de apresentação inclui uma captura com dados pessoais de outra pessoa. O que fazer antes de compartilhar?",
        check: {
          kind: "quiz",
          options: ["Aumentar o tamanho da captura", "Enviar para todo o grupo conferir os dados", "Substituir a imagem por um exemplo de treino ou ocultar os dados pessoais"],
          answer: 2,
          feedback: "Uma apresentação pública deve mostrar as habilidades praticadas e proteger as informações particulares.",
        },
      },
    ],
    guide:
      "Finalize e revise seu Guia Digital de Informática Básica. Organize o conteúdo em pelo menos três seções com subtítulos diferentes. Escreva um parágrafo resumindo o que aprendeu e monte uma lista numerada com pelo menos três pontos para sua apresentação.",
    videoUrl: ["https://youtu.be/WvXdGio_cjo?si=MnHwUU7101eItVdD"],
  },
];

export const informaticaBasicaVersion = 1;

export const monthNames: Record<number, string> = {
  1: "Fundamentos e Primeiros Passos",
  2: "Explorando o Sistema Operacional",
  3: "Ferramentas de Produtividade e Finalização",
};
