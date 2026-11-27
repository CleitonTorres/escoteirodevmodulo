import { legacyInformaticaLessons } from "./informatica-basica-legado";
import type { Lesson } from "./lesson-types";
import { folderNavigationBlock } from "./lesson-theory";
import { withLessonRoutine } from "./lesson-routine";
import { pageAddress } from "./browser-content";
import { energyExercise, type Situation } from "./informatica-situacoes";
import type {
  DesktopControl,
  PracticeCheck,
  PracticeTask,
} from "@/lib/practice";

export const informaticaCurriculumVersion = 2;

export const informaticaMonths: Record<number, string> = {
  1: "Meu primeiro contato com o computador",
  2: "Entendendo janelas e aplicativos",
  3: "Encontrando e guardando arquivos",
  4: "Organizando o computador e corrigindo erros",
  5: "Usando a internet",
  6: "Contas, mensagens e privacidade",
  7: "Escrevendo e formatando documentos",
  8: "Planilhas para o dia a dia",
  9: "Cuidando do computador",
  10: "Projeto final e autonomia",
};

export const legacyLessonAt: Readonly<Partial<Record<number, number>>> = {
  1: 4,
  3: 3,
  4: 2,
  5: 1,
  9: 5,
  15: 6,
  16: 7,
  18: 8,
  24: 11,
  26: 9,
  32: 10,
  40: 12,
};

const task = (
  id: string,
  action: string,
  hint: string,
  check: PracticeCheck,
): PracticeTask => ({ id, action, hint, check });

const control = (action: DesktopControl, instruction: string, hint: string) =>
  task(action, instruction, hint, { kind: "desktop-control", action });

const situation = (id: Situation, action: string, hint: string) =>
  task(id, action, hint, { kind: "simulation", scenario: id });

const quiz = (
  action: string,
  options: string[],
  answer: number,
  feedback: string,
): PracticeTask => ({
  id: "revisar-conceito",
  action,
  check: { kind: "quiz", options, answer, feedback },
});

const entry = (
  id: string,
  action: string,
  hint: string,
  path: string[],
  kind: "folder" | "file",
) => task(id, action, hint, { kind: "entry", path, entry: kind });

const openFolder = (id: string, name: string, hint: string) =>
  task(id, `Abra a pasta ${name}.`, hint, {
    kind: "desktop-event",
    action: "open",
    name,
  });

const project = ["Arquivos", "Meu Projeto Digital"];
const texts = [...project, "Textos"];
const notice = [...texts, "Comunicado.docx"];
const budget = [...project, "Orçamento.xlsx"];
const createDocument =
  "No Explorador, abra Arquivos → Meu Projeto Digital → Textos. Clique com o botão direito em um espaço vazio, escolha Novo arquivo, digite Comunicado.docx e abra o arquivo com dois cliques ou Enter.";
const createBudget =
  "Abra Arquivos → Meu Projeto Digital. Pelo menu de contexto, crie Orçamento.xlsx. Abra o arquivo para editar a planilha.";

const word = (
  id: string,
  action: string,
  hint: string,
  block: Extract<PracticeCheck, { kind: "word" }>["block"],
) => task(id, action, hint, { kind: "word", file: notice, block });

const sheet = (
  step: Extract<PracticeCheck, { kind: "sheet" }>["step"],
  action: string,
  hint: string,
  firstQuantity?: number,
) =>
  task(`planilha-${step}`, action, hint, {
    kind: "sheet",
    file: budget,
    step,
    headers: ["Item", "Quantidade", "Valor", "Subtotal"],
    itemCount: 3,
    ...(firstQuantity !== undefined && { firstQuantity }),
  });

const search = (id: string, term: string, hint: string) =>
  task(id, `Pesquise por “${term}” usando o Google de treino.`, hint, {
    kind: "search",
    engine: "google",
    terms: term.split(" "),
  });
  
const favorite = (id: string, action: string, hint: string, article: string) =>
  task(id, action, hint, {
    kind: "favorite",
    url: pageAddress({ kind: "article", id: article }),
  });

type Draft = Omit<Lesson, "id" | "month" | "icon" | "subtitle">;
function unit(
  title: string,
  objective: string,
  theory: Lesson["theory"],
  practice: PracticeTask[],
  guide: string,
  tool?: Lesson["tool"],
): Draft {
  return { title, objective, theory, practice, guide, ...(tool && { tool }) };
}

const content = [
  unit(
    "Conhecendo o computador",
    "Reconhecer as partes mais comuns do computador e dizer para que servem.",
    [
      "O monitor mostra as imagens. Num notebook, a tela faz esse papel. Se o monitor tiver um botão próprio, ele controla a tela.",
      "O teclado recebe letras, números e comandos. O mouse move o ponteiro, a pequena seta que aparece na tela. Se você usa notebook, a área sensível ao toque pode fazer o papel do mouse.",
      "As peças que fazem o computador funcionar ficam no gabinete ou dentro do notebook. O botão de ligar costuma trazer um símbolo que parece um círculo com um traço.",
    ],
    [
      situation(
        "hardware",
        "Escolha as peças da mesa de treino para ver, escrever e apontar.",
        "Observe a tela, as teclas e o formato do mouse.",
      ),
      quiz(
        "Qual peça mostra o que você acabou de digitar?",
        ["Monitor", "Mouse", "Teclado"],
        0,
        "A tela do monitor mostra o que você fez.",
      ),
    ],
    "Escreva o nome de duas peças que você aprendeu a identificar.",
  ),
  unit(
    "Ligar, entrar e desligar",
    "Ligar o computador de treino, entrar numa sessão e desligar pelo menu.",
    [
      "Ao apertar Ligar, o computador começa a preparar a tela de entrada. Depois de entrar, você vê os ícones e a barra de tarefas.",
      "No treino, use o botão Entrar na sessão de treino. Em alguns computadores, a tela de entrada pode pedir a senha da pessoa que vai usar a máquina.",
      "Quando terminar, abra Iniciar e procure Energia. Escolha Desligar e aguarde a tela mostrar que o computador está desligado.",
    ],
    [
      control(
        "power-on",
        "Ligue o computador de treino.",
        "Abra Área de trabalho e use o botão Ligar que aparece na tela escura.",
      ),
      control(
        "session-enter",
        "Entre na sessão de treino.",
        "Na tela de entrada, escolha Entrar na sessão de treino.",
      ),
      control(
        "power-off",
        "Desligue o computador de treino pelo menu.",
        "Na barra inferior, abra Iniciar → Energia → Desligar.",
      ),
      quiz(
        "Onde você encontra a opção de desligar neste treino?",
        ["Lixeira", "Menu Iniciar, em Energia", "Explorador"],
        1,
        "O menu Energia agrupa as ações do computador.",
      ),
    ],
    "Anote em que ordem você ligou, entrou e desligou.",
    "arquivos",
  ),
  unit(
    "Primeiros movimentos com o mouse",
    "Mover o ponteiro, selecionar, rolar e arrastar.",
    [
      "Mova o mouse devagar e acompanhe a seta na tela. Pare sobre um ícone e dê um clique. O ícone fica em destaque, mostrando que está selecionado.",
      "Para arrastar, pressione o botão principal sobre o ícone, mova o mouse mantendo o botão pressionado e solte no lugar desejado.",
      "Use a rodinha para ler o que ficou mais abaixo. No touchpad, a rolagem costuma ser feita com dois dedos. Em telas de toque, deslize o conteúdo.",
    ],
    [
      control(
        "select-icon",
        "Selecione um ícone na Área de trabalho.",
        "Dê um clique no ícone Arquivos. Com teclado, use Tab para chegar até o ícone.",
      ),
      control(
        "move-icon",
        "Mova um ícone para outro lugar da Área de trabalho.",
        "Arraste até um espaço livre. No toque, pressione e segure o ícone e escolha Reposicionar ícone. Com teclado, selecione o ícone e use Alt com uma seta.",
      ),
      quiz(
        "Quando você solta o botão no fim de um arrasto?",
        ["Antes de mover o ponteiro", "Ao chegar ao lugar desejado", "Nunca"],
        1,
        "Solte quando o ponteiro chegar ao destino.",
      ),
    ],
    "Escreva a diferença entre clicar uma vez e arrastar.",
    "arquivos",
  ),
  unit(
    "Primeiras teclas",
    "Usar as teclas que ajudam a escrever e corrigir texto.",
    [
      "Localize as letras e os números. A barra comprida embaixo escreve um espaço entre as palavras.",
      "Enter inicia outra linha num campo de texto. Backspace apaga o caractere que está à esquerda do cursor.",
      "Para escrever uma letra maiúscula, mantenha Shift pressionado enquanto aperta essa letra. Experimente comparar lia e Lia.",
    ],
    [
      task(
        "primeiras-teclas",
        "Faça o nível Fila guia no treino de digitação.",
        "Abra Digitação. Observe as teclas pedidas e corrija as letras erradas com Backspace.",
        { kind: "typing", level: 1 },
      ),
      quiz(
        "Que tecla apaga uma letra à esquerda do cursor?",
        ["Enter", "Espaço", "Backspace"],
        2,
        "Backspace apaga o caractere que acabou de ficar atrás do cursor.",
      ),
    ],
    "Anote para que você usaria Espaço, Enter e Backspace.",
    "digitacao",
  ),
  unit(
    "Selecionar, abrir e fechar",
    "Distinguir um ícone selecionado de uma pasta aberta e fechar sua janela.",
    [
      "Ícone é uma figura pequena que representa uma pasta, arquivo ou aplicativo. Um clique pode apenas selecionar o ícone.",
      "Na Área de trabalho, dê dois cliques sobre Arquivos para abrir a pasta. Você também pode selecionar a pasta e apertar Enter.",
      "A moldura que aparece se chama janela. Procure o X no alto da janela. Ele fecha a janela. A pasta continua guardada.",
    ],
    [
      openFolder(
        "abrir-arquivos",
        "Arquivos",
        "Use dois cliques ou selecione o ícone e pressione Enter.",
      ),
      control(
        "window-close",
        "Feche a janela do Explorador pelo X.",
        "O X fica no canto superior direito da janela.",
      ),
      quiz(
        "O que acontece com a pasta quando você fecha sua janela?",
        [
          "A pasta é apagada",
          "A pasta continua guardada",
          "A pasta vai para a Lixeira",
        ],
        1,
        "Fechar encerra a janela, e a pasta continua no mesmo local.",
      ),
    ],
    "Anote como você abriu e fechou a pasta Arquivos.",
    "arquivos",
  ),
  unit(
    "Minimizar e voltar",
    "Minimizar uma janela e voltar a ela pela barra de tarefas.",
    [
      "Na janela aberta, procure o botão com um traço –. Ele minimiza a janela e libera espaço na tela.",
      "Olhe a barra de tarefas, na parte de baixo. O aplicativo que você minimizou continua disponível ali.",
      "Clique no ícone do Explorador na barra para voltar à mesma pasta. Se usou o X, abra a pasta de novo e tente o botão com o traço.",
    ],
    [
      control(
        "window-minimize",
        "Minimize a janela do Explorador.",
        "Abra Arquivos e procure o botão com um traço – no alto da janela.",
      ),
      control(
        "taskbar-restore",
        "Volte à janela pela barra de tarefas.",
        "Clique em Explorador na barra da parte de baixo da tela.",
      ),
      quiz(
        "Onde procurar uma janela minimizada?",
        ["Na barra de tarefas", "Na Lixeira", "No teclado"],
        0,
        "A barra mantém o acesso às janelas minimizadas.",
      ),
    ],
    "Escreva onde procuraria uma janela que acabou de minimizar.",
    "arquivos",
  ),
  unit(
    "Maximizar e voltar ao tamanho anterior",
    "Ampliar a janela do Explorador e restaurar o tamanho anterior.",
    [
      "Janela maximizada é uma janela aberta no maior tamanho. Procure o botão de ampliar que fica entre o traço e o X.",
      "Depois que a janela cresce, o mesmo lugar mostra o controle de restaurar tamanho. Ele volta a ocupar menos espaço.",
      "Confira o nome da pasta antes e depois. A mudança de tamanho deixa você no mesmo local.",
    ],
    [
      control(
        "window-maximize",
        "Maximize a janela do Explorador.",
        "Abra Arquivos e procure o botão ao lado do X.",
      ),
      control(
        "window-restore-size",
        "Volte ao tamanho anterior da janela.",
        "Use Restaurar tamanho da janela no mesmo lugar do botão anterior.",
      ),
      quiz(
        "Qual controle faz a janela voltar ao tamanho anterior?",
        ["Desligar", "Restaurar tamanho", "Fechar"],
        1,
        "Restaurar tamanho mantém a janela aberta e diminui seu tamanho.",
      ),
    ],
    "Anote quando você usaria uma janela em tamanho máximo.",
    "arquivos",
  ),
  unit(
    "Trocar de aplicativo e usar o menu Iniciar",
    "Usar a barra de tarefas e distinguir Bloquear, Reiniciar e Desligar.",
    [
      "A barra de tarefas reúne atalhos para aplicativos. Clique em Navegador para mudar o que está usando. Volte à Área de trabalho para encontrar o Explorador.",
      "No menu Energia, Bloquear protege a sessão enquanto você sai por pouco tempo. Entrar de novo devolve a sessão.",
      "Reiniciar faz o computador começar de novo. Desligar encerra o uso até alguém ligá-lo outra vez. Salve o que estiver fazendo antes dessas duas ações.",
    ],
    [
      control(
        "power-lock",
        "Bloqueie a sessão pelo menu.",
        "Abra Iniciar → Energia → Bloquear.",
      ),
      control(
        "session-unlock",
        "Volte à sessão que você bloqueou.",
        "Na tela bloqueada, use Desbloquear sessão de treino.",
      ),
      control(
        "taskbar-browser",
        "Abra o Navegador pela barra de tarefas.",
        "Na parte de baixo da Área de trabalho, procure o botão Navegador, com o símbolo de globo.",
      ),
      situation("energia", energyExercise.action, energyExercise.hint),
    ],
    "Anote uma ocasião para bloquear e outra para reiniciar.",
    "arquivos",
  ),
  unit(
    "Arquivo, pasta e local",
    "Distinguir pastas de arquivos e seguir um caminho no Explorador.",
    [
      "Um arquivo guarda algo, como um texto ou uma foto. Uma pasta ajuda a juntar arquivos e pode ter outras pastas dentro dela.",
      "O Explorador mostra em que local você está. No caminho Arquivos → Meu Guia Digital → Textos, cada nome mostra uma pasta dentro da anterior.",
      "A Área de trabalho é um lugar onde aparecem ícones. Use o Explorador para olhar dentro das pastas e voltar pelo botão de seta.",
    ],
    [
      openFolder(
        "encontrar-textos",
        "Textos",
        "Abra Arquivos, depois Meu Guia Digital e, por fim, Textos. Se Textos não estiver lá, crie-a dentro de Meu Guia Digital.",
      ),
      quiz(
        "Uma pasta pode guardar outras pastas?",
        ["Só se for a Lixeira", "Sim", "Nunca"],
        1,
        "Você pode organizar arquivos em vários níveis de pastas.",
      ),
    ],
    "Escreva o caminho que você seguiu para chegar a Textos.",
    "arquivos",
  ),
  unit(
    "Criar pastas",
    "Criar uma pasta de projeto e duas pastas dentro dela.",
    [
      folderNavigationBlock,
      "Clique com o botão direito num espaço vazio e escolha Nova pasta. Digite um nome e confirme.",
      "Crie Meu Projeto Digital dentro de Arquivos. Depois abra sua nova pasta e coloque Textos e Imagens dentro dela.",
    ],
    [
      entry(
        "pasta-projeto",
        "Crie Meu Projeto Digital dentro de Arquivos.",
        "Abra Arquivos e use Nova pasta no menu de contexto.",
        project,
        "folder",
      ),
      entry(
        "pasta-textos",
        "Crie Textos dentro de Meu Projeto Digital.",
        "Abra Meu Projeto Digital antes de criar Textos.",
        texts,
        "folder",
      ),
      entry(
        "pasta-imagens",
        "Crie Imagens dentro de Meu Projeto Digital.",
        "Imagens fica ao lado de Textos, dentro de Meu Projeto Digital.",
        [...project, "Imagens"],
        "folder",
      ),
    ],
    "Desenhe ou escreva a árvore das pastas que criou.",
    "arquivos",
  ),
  unit(
    "Dar nome, salvar e abrir de novo",
    "Guardar um texto com nome claro e recuperá-lo depois.",
    [
      "Um bom nome diz o que o arquivo guarda. Rascunho.docx ajuda mais que um nome genérico se você sabe que ali está escrevendo.",
      "Primeiro escolha o lugar do arquivo. No treino, a pasta Textos do projeto é o lugar do rascunho.",
      "Abra o arquivo, escreva uma frase e espere aparecer o aviso de salvamento. Volte ao Explorador e abra o mesmo arquivo para conferir o texto.",
    ],
    [
      task(
        "rascunho",
        "Escreva e salve uma frase em Rascunho.docx.",
        "Abra Arquivos → Meu Projeto Digital → Textos. Crie Rascunho.docx, abra-o e escreva uma frase com pelo menos cinco palavras.",
        {
          kind: "word",
          file: [...texts, "Rascunho.docx"],
          block: { type: "paragraph", minLength: 18 },
        },
      ),
      control(
        "file-reopen",
        "Abra o rascunho outra vez e confira a frase.",
        "Depois de salvar, volte à Área de trabalho e abra novamente Rascunho.docx em Textos.",
      ),
      quiz(
        "O que mostra que você encontrou o arquivo certo?",
        [
          "Ele tem o mesmo nome e contém sua frase",
          "Ele tem qualquer ícone",
          "O arquivo está vazio",
        ],
        0,
        "Confira o nome, o local e o texto que salvou.",
      ),
    ],
    "Anote o nome e o local do seu rascunho.",
    "arquivos",
  ),
  unit(
    "Copiar e mover",
    "Criar uma cópia e mudar um arquivo de lugar.",
    [
      "Copiar guarda uma segunda versão. Use Copiar, abra o destino e use Colar. Volte à origem e confira que a primeira versão continua lá.",
      "Mover troca o arquivo de lugar. Você pode escolher Mover para pelo menu do arquivo e indicar uma pasta de destino.",
      "Antes de colar ou mover, confira a pasta aberta. Depois confira o resultado pelo nome do arquivo.",
    ],
    [
      entry(
        "conferir-copia",
        "Copie Rascunho.docx de Textos para Meu Projeto Digital.",
        "Use Copiar no arquivo. Suba uma pasta e use Colar. Mantenha o rascunho original em Textos.",
        [...project, "Rascunho.docx"],
        "file",
      ),
      entry(
        "conferir-movido",
        "Crie Recado.txt na pasta do projeto e mova-o para Textos.",
        "Em Meu Projeto Digital crie Recado.txt. Em seguida, use Mover para no menu do arquivo e escolha Textos.",
        [...texts, "Recado.txt"],
        "file",
      ),
      quiz(
        "Em qual ação o arquivo original fica no lugar onde estava?",
        ["Mover", "Copiar", "Apagar"],
        1,
        "Copiar deixa a versão original e cria outra no destino.",
      ),
    ],
    "Explique uma situação em que copiar seria melhor que mover.",
    "arquivos",
  ),
  unit(
    "Renomear e pesquisar arquivos",
    "Trocar um nome genérico e usar a pesquisa do Explorador.",
    [
      "Antes de renomear, selecione o arquivo pelo nome atual. Abra seu menu e escolha Renomear.",
      "Mude o nome de Recado.txt para Lista de materiais.txt. A parte .txt indica o tipo de arquivo e pode ficar como está.",
      "Abra a pasta Textos e digite materiais em Pesquisar. A lista fica menor. Apague a busca para voltar a ver todos os arquivos daquele local.",
    ],
    [
      task(
        "renomear-lista",
        "Renomeie Recado.txt para Lista de materiais.txt.",
        "Encontre Recado.txt em Textos. No menu do arquivo, escolha Renomear e confira a extensão .txt.",
        {
          kind: "desktop-event",
          action: "rename",
          name: "Lista de materiais.txt",
          from: "Recado.txt",
        },
      ),
      control(
        "file-search",
        "Encontre e abra a lista usando a pesquisa do Explorador.",
        "Abra Textos, digite materiais em Buscar itens e abra Lista de materiais.txt no resultado.",
      ),
    ],
    "Anote o novo nome e o que você digitou para encontrá-lo.",
    "arquivos",
  ),
  unit(
    "Apagar e recuperar",
    "Usar a Lixeira para recuperar um arquivo enviado para lá.",
    [
      "A Lixeira guarda itens removidos do espaço de treino. Quando percebe que apagou o arquivo errado, procure pelo nome dentro dela.",
      "Envie somente Lista de materiais.txt para a Lixeira. Depois abra a Lixeira pela barra de tarefas.",
      "Abra o menu do arquivo e escolha Restaurar. Volte a Textos e confira que a lista retornou.",
    ],
    [
      task(
        "enviar-lixeira",
        "Envie Lista de materiais.txt para a Lixeira.",
        "Abra Textos. No menu do arquivo, escolha Excluir ou pressione Delete com ele selecionado.",
        {
          kind: "desktop-event",
          action: "trash",
          name: "Lista de materiais.txt",
        },
      ),
      task(
        "restaurar-lista",
        "Restaure Lista de materiais.txt da Lixeira.",
        "Abra Lixeira. No menu do arquivo, escolha Restaurar e volte a Textos para conferir.",
        {
          kind: "desktop-event",
          action: "restore",
          name: "Lista de materiais.txt",
          after: "enviar-lixeira",
        },
      ),
      quiz(
        "Onde procurar primeiro se você apagou a lista por engano?",
        ["Histórico do navegador", "Menu de fontes", "Lixeira"],
        2,
        "A Lixeira ajuda a recuperar itens que foram enviados para lá.",
      ),
    ],
    "Anote como você encontrou e recuperou o arquivo.",
    "arquivos",
  ),
  unit(
    "Selecionar, copiar, colar e desfazer",
    "Praticar atalhos comuns e entender o que cada um faz.",
    [
      "Selecionar é indicar qual parte do texto você quer usar. Arraste sobre uma palavra e observe o destaque.",
      "Copiar guarda uma cópia da seleção por um momento. Colar coloca a cópia onde está o cursor. Segure Ctrl e pressione C para copiar, ou V para colar.",
      "Se colou no lugar errado, use Ctrl+Z. Esse atalho desfaz a última mudança do campo.",
    ],
    [
      task(
        "copiar-pratica",
        "Copie uma seleção no campo de treino.",
        "Selecione parte da frase e use Ctrl+C.",
        { kind: "shortcut", action: "copy" },
      ),
      task(
        "colar-pratica",
        "Cole o trecho no campo de destino.",
        "Clique no campo de destino e use Ctrl+V.",
        { kind: "shortcut", action: "paste" },
      ),
      task(
        "desfazer-pratica",
        "Desfaça a colagem.",
        "Com o cursor no campo de destino, pressione Ctrl+Z.",
        { kind: "shortcut", action: "undo" },
      ),
    ],
    "Anote os três atalhos e diga qual corrige uma colagem feita por engano.",
  ),
  unit(
    "Ajustar a tela para usar com conforto",
    "Reconhecer ajustes de tamanho e navegar pelo teclado.",
    [
      "Se o texto estiver pequeno, procure Zoom no navegador. Aumente um pouco e confira se ainda consegue ver o começo e o fim da página.",
      "Pressione Tab para passar de um controle a outro. A borda em destaque mostra qual deles recebe o teclado naquele momento.",
      "Quando um botão está em destaque, Enter pode acioná-lo. Experimente esses passos também usando os botões desta página.",
    ],
    [
      situation(
        "acessibilidade",
        "Resolva três situações de leitura e navegação pelo teclado.",
        "Pense em como aumentar o texto, passar ao controle seguinte e abrir o que está selecionado.",
      ),
    ],
    "Anote uma configuração que deixaria a tela mais confortável para você.",
  ),
  unit(
    "Internet, Wi-Fi e navegador",
    "Distinguir a conexão, o navegador e a página que ele abre.",
    [
      "Internet é a rede que liga computadores. Wi-Fi é uma forma de ligar seu computador a uma rede próxima sem usar cabo.",
      "O navegador é o aplicativo que mostra páginas. A janela dele pode abrir mesmo quando a conexão está indisponível.",
      "Se várias páginas deixam de abrir e aparece Sem conexão, comece conferindo a rede. Se só uma falha, confira o endereço que digitou.",
    ],
    [
      situation(
        "conexao",
        "Compare duas mensagens e descubra o que conferir em cada caso.",
        "Leia com atenção: sem conexão e endereço inválido indicam problemas diferentes.",
      ),
    ],
    "Descreva com suas palavras a diferença entre Wi-Fi e navegador.",
  ),
  unit(
    "Endereços e links",
    "Abrir uma página pelo endereço, seguir um link e voltar.",
    [
      "A caixa comprida na parte de cima do navegador é a barra de endereços. Digite um endereço nela e pressione Enter.",
      "Um link leva de uma página a outra. Pode ser um texto, como Veja as dicas de pesquisa, ou um botão.",
      "Quando quiser voltar à página anterior, procure a seta para a esquerda no navegador.",
    ],
    [
      task(
        "abrir-endereco",
        "Digite trilha.example na barra de endereços e abra a página.",
        "Use a barra de endereços do Navegador, não a caixa de busca. Pressione Enter.",
        { kind: "browser-control", action: "address" },
      ),
      task(
        "seguir-link",
        "Abra um link dentro da página.",
        "Na página de treino, escolha Pesquisa guiada ou Central de segurança.",
        { kind: "browser-control", action: "link" },
      ),
      task(
        "voltar-pagina",
        "Volte à página anterior pela seta do navegador.",
        "Use o botão Voltar no alto da janela.",
        { kind: "browser-control", action: "back" },
      ),
    ],
    "Anote onde você digitou o endereço e como voltou.",
    "navegador",
  ),
  unit(
    "Abas, histórico e favoritos",
    "Reconhecer formas de manter e reencontrar páginas.",
    [
      "Abas permitem manter mais de uma página na mesma janela. Você pode ir de uma aba para outra para comparar as leituras.",
      "O histórico é a lista de páginas visitadas. Favoritos guardam os endereços que você escolheu para consultar depois.",
      "No Navegador de treino, use a estrela para marcar uma página. Abra Favoritos para encontrá-la novamente.",
    ],
    [
      task(
        "abrir-aba",
        "Abra uma segunda aba.",
        "Use o botão Nova aba no alto do navegador.",
        { kind: "browser-control", action: "new-tab" },
      ),
      task(
        "trocar-aba",
        "Volte à primeira aba.",
        "Clique na primeira aba para alternar entre as duas páginas.",
        { kind: "browser-control", action: "switch-tab" },
      ),
      task(
        "abrir-historico",
        "Abra o Histórico.",
        "Procure o botão Histórico, perto de Favoritos.",
        { kind: "browser-control", action: "history" },
      ),
      search(
        "pesquisar-fontes",
        "fontes",
        "Use o Google do Navegador de treino e pesquise fontes.",
      ),
      favorite(
        "favoritar-fontes",
        "Guarde a página Como comparar fontes em uma pesquisa nos Favoritos.",
        "Abra a página no resultado da busca e clique na estrela.",
        "fontes",
      ),
    ],
    "Anote uma página que valeria guardar e explique por quê.",
    "navegador",
  ),
  unit(
    "Pesquisar e conferir uma informação",
    "Escolher palavras de busca e comparar informações antes de usá-las.",
    [
      "Uma busca fica melhor quando você escreve o assunto e o que quer descobrir. Para saber o horário da biblioteca, escreva biblioteca horário e o nome do bairro.",
      "Observe quem publicou cada resultado. Um anúncio pode aparecer no alto da lista. Para confirmar um horário da biblioteca, procure primeiro a informação publicada pela própria biblioteca.",
      "Se encontrar duas respostas diferentes, confira as datas. Procure outra fonte ou fale com o lugar que publicou a informação.",
    ],
    [
      search(
        "buscar-comparacao",
        "comparar fontes",
        "Digite comparar fontes no Google de treino e abra um resultado.",
      ),
      situation(
        "fontes",
        "Encontre o horário mais confiável da biblioteca de treino.",
        "Observe quem publicou a informação e quando ela foi atualizada.",
      ),
    ],
    "Registre duas coisas que você verifica antes de confiar num resultado.",
    "navegador",
  ),
  unit(
    "Preencher formulários com cuidado",
    "Reconhecer campos obrigatórios e evitar compartilhar dados sem necessidade.",
    [
      "Formulários usam caixas para receber informações. Leia o nome de cada campo antes de escrever. Um asterisco costuma marcar campos obrigatórios.",
      "Antes de enviar, veja se o pedido faz sentido. Um formulário que só pergunta sua cor favorita provavelmente não precisa do seu endereço.",
      "Na prática, use os dados fictícios que aparecem nas opções. Pergunte a um adulto de confiança se um formulário real pedir algo que você não entende.",
    ],
    [
      situation(
        "formulario",
        "Revise e preencha um cadastro fictício.",
        "Escolha apenas os dados que o exemplo pede e conferiu.",
      ),
    ],
    "Anote um dado que você teria cuidado antes de colocar num formulário.",
  ),
  unit(
    "E-mail e anexos",
    "Entender os campos e conferir uma mensagem antes de enviar.",
    [
      "Para é onde fica o endereço de quem vai receber. Assunto é uma linha curta dizendo sobre o que é a mensagem.",
      "Na mensagem, escreva a informação principal com calma. Antes de enviar, releia e veja se a outra pessoa vai entender o que precisa fazer.",
      "Um anexo é um arquivo junto da mensagem. Use Anexar, escolha o arquivo e confira se o nome dele aparece antes de enviar.",
    ],
    [
      situation(
        "email",
        "Monte um e-mail de treino com um anexo fictício.",
        "Comece pelo destinatário e assunto. Antes de enviar, confira a lista de materiais.",
      ),
    ],
    "Escreva um bom assunto para um e-mail que avisa a data de uma reunião.",
  ),
  unit(
    "Senhas e verificação em duas etapas",
    "Reconhecer uma senha mais segura e saber onde usar um código de verificação.",
    [
      "Uma senha longa e diferente para cada conta ajuda a protegê-la. Nas atividades de treino, use somente exemplos fictícios.",
      "Algumas contas pedem um segundo passo depois da senha. Pode ser um código ou uma confirmação no aparelho. Isso ajuda a verificar que é você.",
      "Se alguém pedir seu código por mensagem, faça uma pausa. Use o site ou aplicativo que você já conhece e peça ajuda se tiver dúvida.",
    ],
    [
      situation(
        "contas",
        "Proteja a conta fictícia e responda a um pedido de código.",
        "Use o código somente na tela oficial que você abriu e conferiu.",
      ),
    ],
    "Anote para que serve o segundo passo, sem escrever suas senhas.",
  ),
  unit(
    "Mensagens suspeitas",
    "Reconhecer urgência, links inesperados e pedidos de senha.",
    [
      "Mensagens que tentam enganar podem parecer vir de uma pessoa conhecida. Uma frase como «Você tem cinco minutos» tenta fazer você agir depressa.",
      "Se a mensagem diz que veio da escola ou de um amigo, use um contato que você já conhece para confirmar. Um nome conhecido na tela sozinho não prova a origem.",
      "Mantenha links e anexos inesperados fechados enquanto verifica. Em caso de dúvida, mostre a mensagem a um adulto de confiança.",
    ],
    [
      situation(
        "mensagens",
        "Escolha como reagir a três mensagens de treino.",
        "Pare, confira por outro caminho e peça ajuda se precisar.",
      ),
    ],
    "Escreva uma frase que te lembre o que fazer antes de abrir um link inesperado.",
  ),
  unit(
    "Escrever e salvar um texto",
    "Criar um comunicado, salvar o rascunho e saber onde encontrá-lo.",
    [
      "Um comunicado curto pode dizer o que vai acontecer, quando e onde. Imagine um aviso de reunião ou de uma atividade do seu grupo.",
      "No documento em branco, escreva uma frase de cada vez. Se precisar separar ideias, pressione Enter e comece um novo parágrafo.",
      "Confira o salvamento e o nome da pasta Textos. Você vai continuar editando esse mesmo arquivo nas próximas aulas.",
    ],
    [
      word(
        "escrever-comunicado",
        "Escreva um aviso com pelo menos uma frase completa em Comunicado.docx.",
        `${createDocument} Escreva o que vai acontecer, quando e onde.`,
        { type: "paragraph", minLength: 28 },
      ),
    ],
    "Anote o título que gostaria de dar ao seu comunicado.",
    "arquivos",
  ),
  unit(
    "Revisar e formatar",
    "Corrigir o aviso e destacar uma informação importante.",
    [
      "Releia o texto procurando palavras faltando e informações erradas. Clique no ponto que quer corrigir ou selecione o trecho para substituí-lo.",
      "Negrito deixa a letra mais forte. Selecione apenas a data ou o horário para chamar atenção a essa parte.",
      "Alinhamento muda a posição do parágrafo. Volte a ler o texto e veja se o destaque ajuda a encontrar a informação mais rápido.",
    ],
    [
      word(
        "destacar-data",
        "Deixe uma parte do parágrafo em negrito no Comunicado.docx.",
        "Abra o comunicado em Textos. Selecione a data ou o horário e clique no botão Negrito.",
        { type: "paragraph", bold: true },
      ),
      quiz(
        "O que selecionar para destacar só o horário?",
        [
          "Todo o documento",
          "A palavra ou o trecho do horário",
          "O nome da pasta",
        ],
        1,
        "Formate apenas a parte que deve chamar atenção.",
      ),
    ],
    "Escreva qual parte você destacou e por quê.",
    "arquivos",
  ),
  unit(
    "Título, subtítulo e lista",
    "Organizar um documento para que a informação seja fácil de achar.",
    [
      "O título diz sobre o que é o aviso. Selecione a linha do título e escolha Título 1 no editor. Você pode centralizá-lo para aparecer no meio.",
      "O subtítulo divide o aviso por assunto. Use Título 2 para uma seção chamada Materiais.",
      "Embaixo de Materiais, use Lista com marcadores para colocar um item por linha. Quem lê consegue conferir cada item rapidamente.",
    ],
    [
      word(
        "titulo-comunicado",
        "Adicione um Título 1 centralizado.",
        "Escreva o título numa linha separada, selecione Título 1 e use Centralizar.",
        { type: "heading", level: 1, alignment: "center" },
      ),
      word(
        "subtitulo-comunicado",
        "Adicione um subtítulo com Título 2.",
        "Numa linha separada, escreva Materiais e selecione Título 2.",
        { type: "heading", level: 2 },
      ),
      word(
        "lista-comunicado",
        "Monte uma lista com marcadores de pelo menos três itens.",
        "Use Lista com marcadores e pressione Enter após cada item.",
        { type: "bulletList", minItems: 3 },
      ),
    ],
    "Anote como você separou o título, a seção e a lista.",
    "arquivos",
  ),
  unit(
    "Preparar um documento para entregar",
    "Distinguir uma cópia em PDF de um documento editável.",
    [
      "A prévia mostra como o comunicado vai aparecer ao imprimir ou compartilhar. Procure palavras cortadas e páginas com conteúdo sobrando.",
      "O arquivo editável é aquele que você pode abrir e corrigir no editor. Uma cópia em PDF ajuda na leitura e na impressão.",
      "Guarde as duas versões se precisar mudar o comunicado depois. Use nomes parecidos para saber que se referem ao mesmo assunto.",
    ],
    [
      situation(
        "pdf",
        "Escolha como revisar e preparar uma cópia de treino.",
        "Confira a prévia. Pense em qual versão será entregue e em qual poderá mudar amanhã.",
      ),
    ],
    "Anote por que você guardaria o documento editável mesmo depois de preparar um PDF.",
  ),
  unit(
    "Linhas, colunas e células",
    "Localizar células e criar os cabeçalhos de uma lista de compras.",
    [
      "As linhas têm números e as colunas têm letras. Onde uma linha cruza uma coluna há uma célula, que é uma caixa da planilha.",
      "A célula A1 fica na coluna A e na linha 1. Clique nela, digite Item e pressione Enter para gravar.",
      "Os nomes das colunas ajudam a saber o que preencher. Na primeira linha, use Item, Quantidade, Valor e Subtotal.",
    ],
    [
      sheet(
        "headers",
        "Crie os quatro cabeçalhos na primeira linha.",
        `${createBudget} Escreva Item em A1, Quantidade em B1, Valor em C1 e Subtotal em D1.`,
      ),
    ],
    "Anote a diferença entre uma linha, uma coluna e uma célula.",
    "arquivos",
  ),
  unit(
    "Preencher e organizar os valores",
    "Separar nomes, quantidades e preços na planilha.",
    [
      "Cada compra fica numa linha. Coloque seu nome na coluna Item, o número de unidades em Quantidade e o preço de uma unidade em Valor.",
      "Digite números sem escrever a moeda dentro da célula. Depois use a formatação de moeda para exibir os preços em reais.",
      "Se um nome ficou cortado, ajuste a largura da coluna pela divisão entre as letras que ficam no alto.",
    ],
    [
      sheet(
        "items",
        "Preencha três itens com quantidades e preços.",
        "Abra Orçamento.xlsx. Nas linhas 2, 3 e 4, escreva o nome do item em A, a quantidade inteira em B e o preço em C.",
      ),
    ],
    "Registre um item, sua quantidade e o preço por unidade.",
    "arquivos",
  ),
  unit(
    "Calcular o subtotal",
    "Multiplicar quantidade pelo valor unitário em cada linha.",
    [
      "Se você compra três cadernos de 10 reais, o subtotal é 30 reais. Subtotal é o valor daquela linha.",
      "Uma fórmula começa com =. O sinal * manda multiplicar. Na linha 2, combine o número de unidades em B2 com o preço em C2.",
      "Use as células da linha certa nos três subtotais. Troque uma quantidade e confira se o subtotal da mesma linha muda.",
    ],
    [
      sheet(
        "subtotals",
        "Calcule os três subtotais com fórmulas.",
        "Em D2, digite =B2*C2. Repita em D3 e D4, ajustando o número para a linha certa.",
      ),
      quiz(
        "Que operação calcula o preço de três itens iguais?",
        [
          "Somar o preço com a quantidade",
          "Dividir a quantidade pelo preço",
          "Multiplicar a quantidade pelo preço de um",
        ],
        2,
        "A multiplicação aplica o preço unitário a todas as unidades.",
      ),
    ],
    "Anote qual subtotal muda quando você altera a primeira quantidade.",
    "arquivos",
  ),
  unit(
    "Somar e conferir o total",
    "Somar os subtotais e testar o recálculo.",
    [
      "O total reúne os subtotais de todas as linhas. Escreva Total em A5 para deixar claro o que a última linha significa.",
      "Para somar do primeiro até o último subtotal, use a função SUM ou SOMA conforme o editor apresentar. Os dois pontos separam o começo e o fim do intervalo.",
      "Mude a quantidade de um item. Confira se o subtotal da linha e o total geral ficaram de acordo com a mudança.",
    ],
    [
      sheet(
        "total",
        "Rotule a linha Total e some todos os subtotais.",
        "Escreva Total em A5. Em D5, use =SUM(D2:D4) ou a opção SOMA do editor para incluir D2, D3 e D4.",
      ),
      quiz(
        "Quais células precisam entrar no total?",
        ["D2, D3 e D4", "Só D2", "A1 até D1"],
        0,
        "Some os três subtotais, um de cada linha de compra.",
      ),
    ],
    "Registre o total antes e depois de mudar uma quantidade.",
    "arquivos",
  ),
  unit(
    "Atualizar o sistema e os aplicativos",
    "Reconhecer o lugar certo para buscar atualizações e o momento de reiniciar.",
    [
      "Atualizações corrigem problemas do sistema e de aplicativos. Abra as Configurações do sistema para conferir a atualização do computador.",
      "Se aparecer uma atualização disponível, leia o aviso. Salve os arquivos que estiver usando antes de começar.",
      "Algumas mudanças terminam quando você reinicia. Leia o estado mostrado depois que o computador volta.",
    ],
    [
      situation(
        "atualizacao",
        "Complete o roteiro simulado de atualização.",
        "Procure a área de atualizações nas Configurações e salve o trabalho antes de reiniciar.",
      ),
      control(
        "power-restart",
        "Reinicie o computador de treino pelo menu.",
        "Abra Iniciar → Energia → Reiniciar. Aguarde a tela de entrada aparecer.",
      ),
    ],
    "Anote onde procuraria atualizações e o que faria antes de reiniciar.",
    "arquivos",
  ),
  unit(
    "Instalar programas de fontes confiáveis",
    "Escolher uma fonte confiável e reconhecer cópias piratas.",
    [
      "Baixe programas pelo site oficial de quem os cria ou por uma loja confiável. Leia o endereço, o nome do programa e quem oferece o download.",
      "Um anúncio pode parecer o botão certo. Se houver vários botões de baixar ou um pedido estranho, faça uma pausa para conferir.",
      "Se a ferramenta custa dinheiro, procure uma alternativa gratuita, livre ou autorizada. Uma cópia pirata pode vir modificada e causar problemas.",
    ],
    [
      situation(
        "programas",
        "Escolha a melhor origem para um programa de desenho fictício.",
        "Confira o endereço, quem oferece o programa e o que a instalação pede.",
      ),
    ],
    "Escreva duas coisas que você conferiria antes de instalar um aplicativo.",
  ),
  unit(
    "Entender os avisos do antivírus",
    "Encontrar a área de proteção e reagir a um alerta sem abrir o arquivo.",
    [
      "O antivírus ajuda a detectar programas e arquivos que podem causar problemas. Você pode conferir seu estado na área de segurança do computador.",
      "Um anúncio da internet pode imitar um alerta. Abra a área de segurança pelo próprio sistema para conferir a situação.",
      "Se um arquivo foi bloqueado, mantenha-o bloqueado enquanto procura ajuda. Continue conferindo a origem dos arquivos que recebe.",
    ],
    [
      situation(
        "antivirus",
        "Resolva um alerta fictício de proteção.",
        "Use a área de segurança do sistema e leia o aviso antes de escolher.",
      ),
    ],
    "Anote a diferença entre consultar um alerta do sistema e clicar num anúncio.",
  ),
  unit(
    "Fazer e conferir uma cópia de segurança",
    "Guardar uma cópia e conferir se pode ser recuperada.",
    [
      "Backup é uma cópia de segurança. Se perder o arquivo principal, você tem outra versão para abrir.",
      "Guarde o backup num local separado. No treino usaremos uma pasta de simulação. Num computador real, pode ser outra unidade ou um serviço de backup confiável.",
      "Depois de copiar, abra a cópia e confira se o conteúdo está certo. Repita quando fizer mudanças importantes.",
    ],
    [
      situation(
        "copia",
        "Escolha onde guardar e como conferir uma cópia.",
        "Pense no que aconteceria se a versão original sumisse.",
      ),
      entry(
        "pasta-backup",
        "Crie a pasta Backup dentro de Meu Projeto Digital.",
        "Abra Meu Projeto Digital, escolha Nova pasta e digite Backup.",
        [...project, "Backup"],
        "folder",
      ),
      entry(
        "copiar-orcamento",
        "Copie Orçamento.xlsx para Backup.",
        "Selecione o orçamento na pasta do projeto, use Copiar e cole em Backup.",
        [...project, "Backup", "Orçamento.xlsx"],
        "file",
      ),
    ],
    "Anote qual arquivo você copiou e onde está a segunda versão.",
    "arquivos",
  ),
  unit(
    "O que fazer quando algo dá errado",
    "Investigar um problema por vez e explicar o que você já tentou.",
    [
      "Quando uma janela some, pense na última ação que você fez. Procure na barra de tarefas se tiver minimizado.",
      "Se não achar um arquivo, confira a pasta ou pesquise pelo nome. Se apagou por engano, verifique a Lixeira.",
      "Leia a mensagem na tela antes de repetir uma ação. Se precisar de ajuda, diga o que queria fazer, o que apareceu e quais passos já tentou.",
    ],
    [
      situation(
        "ajuda",
        "Resolva três problemas de treino e escolha como pedir ajuda.",
        "Use o que aprendeu sobre janela, arquivo e conexão.",
      ),
    ],
    "Escreva um exemplo de como você pediria ajuda se uma página não abrisse.",
  ),
  unit(
    "Planejar uma atividade com pesquisa",
    "Escolher informações e organizar as fontes de uma atividade.",
    [
      "Escolha uma atividade simples para planejar, como uma oficina ou uma reunião. Pense em quem vai participar e em quais materiais serão usados.",
      "Pesquise um assunto por vez. Confira quem escreveu cada resultado e compare com outra fonte quando encontrar informações diferentes.",
      "Guarde um favorito que ajude a consultar de novo. No Meu Guia, escreva o nome do seu projeto e uma informação que encontrou.",
    ],
    [
      search(
        "pesquisar-projeto",
        "organize arquivos",
        "No Google de treino, escreva organize arquivos e leia um resultado sobre organizar o material do projeto.",
      ),
      favorite(
        "favoritar-organizacao",
        "Guarde Organize os arquivos do computador nos Favoritos.",
        "Abra o artigo dos resultados e use a estrela de Favoritos.",
        "arquivos",
      ),
      favorite(
        "revisitar-fontes",
        "Consulte também Como comparar fontes em uma pesquisa.",
        "Abra o artigo pelos Favoritos ou pesquise fontes e salve o artigo nos Favoritos.",
        "fontes",
      ),
    ],
    "Anote a atividade escolhida e o nome das fontes que você consultou.",
    "navegador",
  ),
  unit(
    "Montar os materiais do projeto",
    "Conferir um comunicado, um orçamento e sua cópia de segurança.",
    [
      "Abra o comunicado. Confira data, local e materiais. Complete o que está faltando e destaque a informação mais importante.",
      "Abra o orçamento e confira as três quantidades, os valores e o total. Faça uma alteração pequena e veja se a planilha recalculou.",
      "Guarde os arquivos em seus lugares. Atualize a cópia de segurança quando concluir mudanças importantes.",
    ],
    [
      word(
        "conferir-comunicado",
        "Confira que o comunicado tem um parágrafo com as informações da atividade.",
        "Abra Comunicado.docx em Textos. Inclua data e local num parágrafo com pelo menos cinco palavras.",
        { type: "paragraph", minLength: 30 },
      ),
      sheet(
        "total",
        "Confira que o orçamento soma os três subtotais.",
        "Abra o Orçamento.xlsx principal e revise a fórmula da linha Total.",
      ),
      entry(
        "conferir-backup",
        "Confira a cópia de Orçamento.xlsx na pasta Backup.",
        "Se alterou o orçamento, atualize a cópia guardada em Backup e confira o arquivo.",
        [...project, "Backup", "Orçamento.xlsx"],
        "file",
      ),
    ],
    "Registre uma informação que corrigiu e como conferiu o total.",
    "arquivos",
  ),
  unit(
    "Resolver uma missão com autonomia",
    "Reunir o que aprendeu para resolver um problema novo e registrar como fez.",
    [
      "O horário mudou e serão necessárias quatro unidades do primeiro material. Atualize o aviso e a quantidade no orçamento.",
      "Uma mensagem estranha diz que você precisa abrir um anexo para confirmar a atividade. Use o que aprendeu para conferir a origem por outro caminho.",
      "No Meu Guia, conte o que resolveu sozinho e o que ainda quer praticar. Esse registro ajuda a lembrar o caminho que você encontrou.",
    ],
    [
      word(
        "missao-secao",
        "Adicione um subtítulo chamado Horário atualizado e revise o comunicado.",
        "Abra Comunicado.docx em Textos. Use Título 2 em uma nova linha e escreva o horário atualizado logo abaixo.",
        {
          type: "heading",
          level: 2,
          minLength: 12,
          contains: "Horário atualizado",
        },
      ),
      sheet(
        "items",
        "Atualize para 4 a quantidade do primeiro material.",
        "Abra Orçamento.xlsx. Digite 4 em B2 e confira o novo subtotal e o total.",
        4,
      ),
      sheet(
        "total",
        "Confira que o total ainda soma todos os subtotais.",
        "Confira a fórmula em D5. Ela deve incluir D2, D3 e D4.",
      ),
      situation(
        "mensagens",
        "Decida como reagir à mensagem suspeita que chegou durante a missão.",
        "Considere o que você faria antes de clicar ou compartilhar dados.",
      ),
    ],
    "Registre o que conseguiu fazer sozinho e uma habilidade que quer praticar mais.",
    "arquivos",
  ),
] satisfies Draft[];

let nextId = 13;
export const informaticaLessons = content.map((lesson, index): Lesson => {
  const month = Math.floor(index / 4) + 1;
  const legacy = legacyInformaticaLessons.find(
    ({ id }) => id === legacyLessonAt[index + 1],
  );
  return withLessonRoutine({
    ...lesson,
    id: legacy?.id ?? nextId++,
    month,
    icon: "▦",
    subtitle: informaticaMonths[month],
    ...(legacy?.videoUrl && { videoUrl: legacy.videoUrl }),
  });
});
