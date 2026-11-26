import type { Disciplina } from "./disciplinas";
import type { Lesson, LessonResource } from "./lessons";
import type { PracticeTask } from "../lib/practice";

const repository = "https://github.com/CleitonTorres/escoteirodev-piloto";
const revision = "f3bc4ed16fae0799c507a5fe10aabeb1bfa69b94";
const download = { title: "Baixar o código e os recursos do projeto em ZIP", url: `${repository}/archive/${revision}.zip` };

function source(title: string, path: string): LessonResource {
  return { title, url: `${repository}/blob/${revision}/${path}` };
}

const portfolioHtml = source("Estrutura HTML do portfólio", "index.html");
const portfolioCss = source("Estilos do portfólio", "src/css/home.css");
const portfolioScript = source("JavaScript do portfólio", "src/scripts/scripts.js");
const kaaHtml = source("Página do Jogo da Kaa", "jogoKaa.html");
const kaaScript = source("Código JavaScript do Jogo da Kaa", "src/scripts/scriptsJogoKaa.js");
const kaaCss = source("Estilos do Jogo da Kaa", "src/css/stylesJogoKaa.css");
const scoutHtml = source("Página do Scout Plat", "scoutPlat.html");
const scoutScript = source("Código JavaScript do Scout Plat", "src/scripts/scriptsScoutPlat.js");
const scoutCss = source("Estilos do Scout Plat", "src/css/stylesScoutPlat.css");
const effects = { title: "Efeitos sonoros dos jogos", url: `${repository}/tree/${revision}/src/audios/efeitos` };
const scoutAssets = { title: "Sprites do Scout Plat", url: `${repository}/tree/${revision}/src/assets/scoutPlat` };

export const programacaoBasicaMeses = {
  1: "Introdução à programação e lógica básica",
  2: "Estruturas de repetição e funções",
  3: "Fundamentos da web com HTML e CSS",
  4: "Interatividade na web com JavaScript",
  5: "Jogo da Kaa — lógica e movimento",
  6: "Jogo da Kaa — colisões e pontuação",
  7: "Scout Plat — orientação a objetos e física básica",
  8: "Scout Plat — animação e movimento avançado",
  9: "Scout Plat — inimigos e mecânicas extras",
  10: "Publicação e apresentação dos projetos",
};

export function isProgramacaoBasica({ id, nome }: Pick<Disciplina, "id" | "nome">) {
  return id === "programacao-basica" ||
    nome.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLowerCase() === "programacao basica";
}

function quiz(action: string, options: [string, string, string], answer: 0 | 1 | 2, feedback: string): PracticeTask[] {
  return [{ id: "verificar-conceito", action, check: { kind: "quiz", options, answer, feedback } }];
}

const content: Omit<Lesson, "id" | "icon">[] = [
  {
    month: 1, title: "O que é programação?", subtitle: "Algoritmos no dia a dia",
    objective: "Organizar instruções em uma sequência clara e reconhecer onde usamos algoritmos.",
    theory: [
      "Programar é escrever instruções para que um computador execute uma tarefa. Em um jogo, receber a tecla apertada, mudar a posição do personagem e redesenhar a tela são instruções que trabalham juntas.",
      "Um algoritmo é uma sequência finita de passos para resolver um problema. A ordem e os detalhes importam. Uma pessoa pode completar lacunas por experiência, enquanto o computador segue o que foi especificado.",
      "Em uma receita, os ingredientes são entradas, as etapas são o processamento e o prato pronto é a saída. Pense nessas três partes quando for explicar seu primeiro algoritmo.",
    ],
    exercise: ["Escolha uma tarefa simples, como ligar o computador ou preparar a mochila. Descreva os passos em ordem.", "Peça a alguém para seguir somente as instruções escritas. Reescreva qualquer passo que permita duas interpretações."],
    practice: quiz("Qual instrução é mais fácil de executar sem adivinhar?", ["Deixe tudo pronto.", "Coloque o caderno dentro da mochila e feche o zíper.", "Faça como de costume."], 1, "Instruções precisas dizem o que fazer e em que ordem."),
    guide: "Registre seu algoritmo e um passo que você precisou detalhar depois de testá-lo.",
  },
  {
    month: 1, title: "Variáveis e tipos de dados", subtitle: "Números, textos e booleanos",
    objective: "Declarar variáveis em JavaScript e distinguir os tipos number, string e boolean.",
    theory: [
      "Uma variável dá nome a um valor. Use let se pretende trocar o valor e const quando a referência deve permanecer. No Jogo da Kaa, a pontuação começa em zero e muda durante a partida.",
      "O número 40 tem tipo number. O texto '40', entre aspas, tem tipo string. Os valores true e false são booleanos e servem para representar estados como jogo pausado.",
      "No console, console.log(typeof valor) mostra o tipo de um valor. Compare o número 40 com o texto '40' antes de tentar fazer uma conta.",
    ],
    exercise: ["Declare nomeCurso com o nome Programação Básica Escoteiro Dev, numeroAulas com 40 e projetoConcluido com false.", "Use typeof para identificar os três tipos. Declare a pontuação com let e altere seu valor em seguida."],
    practice: quiz("Qual é o tipo de false quando escrito sem aspas?", ["boolean", "number", "string"], 0, "Os valores true e false são do tipo boolean."),
    guide: "Anote as três declarações e o resultado de typeof para cada uma.", resources: [kaaScript],
  },
  {
    month: 1, title: "Operadores matemáticos e lógicos", subtitle: "Calcule, compare e combine condições",
    objective: "Usar operadores aritméticos, comparações e expressões booleanas.",
    theory: [
      "Use +, -, *, / e % para calcular. O operador % devolve o resto da divisão. Quando numero % 2 === 0, o número é par.",
      "Comparações como >= e === resultam em true ou false. A igualdade estrita === exige o mesmo valor e o mesmo tipo.",
      "O operador && pede que duas condições sejam verdadeiras; || aceita pelo menos uma; ! inverte um valor lógico. Na Kaa, a cabeça encontra a maçã quando as coordenadas x e y coincidem.",
    ],
    exercise: ["Considere nivel = 5, inimigosDerrotados = 10 e chefeFinalDerrotado = false.", "Escreva e teste três condições: nível a partir de 3 e mais de 5 inimigos; nível 10 ou chefe derrotado; chefe ainda não derrotado."],
    practice: quiz("Com nivel igual a 5 e inimigosDerrotados igual a 10, qual é o resultado de nivel >= 3 && inimigosDerrotados > 5?", ["false", "10", "true"], 2, "As duas comparações são verdadeiras, então o resultado de && é true."),
    guide: "Registre as três expressões e explique por que cada resultado é verdadeiro ou falso.", resources: [kaaScript],
  },
  {
    month: 1, title: "Estruturas condicionais", subtitle: "if, else if, else e switch",
    objective: "Escolher qual parte do código executar a partir de uma condição ou de um valor.",
    theory: [
      "O if testa uma condição. Se ela falhar, else if pode testar outra. O bloco else recebe os casos restantes. A sequência executa o primeiro bloco cuja condição for verdadeira.",
      "O switch compara um valor com os casos declarados. O break encerra o caso e default trata os demais valores. Na Kaa, um switch traduz teclas em mudanças de direção ou pausa.",
    ],
    exercise: ["Crie um if/else if/else que mostre mensagens diferentes para os níveis 1, 2 e demais níveis.", "Crie um switch para moeda, vida e estrela. Inclua um caso padrão e teste um item desconhecido."],
    practice: quiz("Em um switch, qual bloco pode tratar um item sem case correspondente?", ["break", "default", "else if"], 1, "O default cuida dos valores sem um caso correspondente."),
    guide: "Registre as mensagens que apareceram para dois níveis e para um item desconhecido.", resources: [kaaScript],
  },
  {
    month: 2, title: "Estruturas de repetição", subtitle: "Repetições com while e for",
    objective: "Escrever laços que terminam e escolher uma estrutura adequada para cada contagem.",
    theory: [
      "O while repete o bloco enquanto a condição for verdadeira. A variável usada na condição precisa avançar até a saída do laço quando a repetição tiver fim.",
      "O for reúne início, condição e atualização em uma linha. Ele é prático quando você sabe de onde começa e até onde vai, como ao percorrer as partes da cobra pelo índice.",
    ],
    exercise: ["Use while para exibir todos os pares de 0 a 10 no console.", "Use for para exibir os números de 10 a 1 em ordem decrescente. Confira o primeiro e o último número."],
    practice: quiz("Qual atualização leva uma contagem de 10 até 1 quando o contador se chama i?", ["i--", "i++", "i = 10"], 0, "i-- diminui o contador em uma unidade a cada repetição."),
    guide: "Anote a saída dos dois laços e explique qual condição faz cada um terminar.", resources: [kaaScript],
  },
  {
    month: 2, title: "Funções, parâmetros e retorno", subtitle: "Divida o código em tarefas reutilizáveis",
    objective: "Declarar, chamar e testar funções com argumentos e retornos.",
    theory: [
      "Uma função reúne instruções sob um nome. No jogo, drawSnake() desenha a cobra, drawApple() desenha a maçã e update() muda o estado da partida.",
      "Parâmetros são os nomes das entradas na declaração. Argumentos são os valores informados na chamada. Em multiplicar(3, 4), os argumentos são 3 e 4.",
      "return entrega um valor para quem chamou a função. console.log mostra um valor no console. Você pode guardar o retorno em uma variável ou usá-lo em outra expressão.",
    ],
    exercise: ["Crie multiplicar(a, b) e devolva o produto. Teste a função com 3 e 4 e também com 8 e 0.", "Crie exibirMensagem(texto) e use console.log para mostrar o texto passado."],
    practice: quiz("Se multiplicar(a, b) retorna a * b, qual valor posso guardar ao chamar multiplicar(3, 4)?", ["3", "4", "12"], 2, "O return entrega o resultado da multiplicação, que neste caso é 12."),
    guide: "Escreva as duas chamadas de teste e explique o que sua função devolve ou exibe.", resources: [kaaScript],
  },
  {
    month: 2, title: "Arrays", subtitle: "Armazene e percorra listas",
    objective: "Criar um array, usar índices e adicionar ou remover elementos.",
    theory: [
      "Um array é uma lista ordenada. O primeiro elemento tem índice 0 e length conta quantos elementos existem. Na Kaa, snake[0] é a cabeça e os elementos seguintes formam o corpo.",
      "push adiciona no fim, unshift adiciona no início, pop remove o último e shift remove o primeiro. Use for ou forEach para percorrer a lista.",
    ],
    exercise: ["Crie um array com cinco nomes. Adicione um nome ao final e remova o primeiro.", "Exiba a lista atualizada com for ou forEach e confira o tamanho final."],
    practice: quiz("Qual método remove o primeiro item de um array?", ["pop()", "shift()", "push()"], 1, "shift() remove o elemento na primeira posição."),
    guide: "Registre a lista antes e depois das mudanças e diga qual nome passou a ocupar o índice 0.", resources: [kaaScript],
  },
  {
    month: 2, title: "Objetos e JSON", subtitle: "Agrupe informações em propriedades",
    objective: "Criar e alterar objetos JavaScript e reconhecer a sintaxe de JSON.",
    theory: [
      "Objetos reúnem valores com nomes. A maçã da Kaa tem propriedades x e y. O Scout Plat agrupa nome, pontuação e personagem em um objeto para representar a partida atual.",
      "Use livro.titulo para ler uma propriedade e livro.anoPublicacao = 2026 para definir um novo valor. Você também pode usar colchetes, como livro['titulo'].",
      "JSON é um formato de texto para trocar dados. Em JSON, os nomes das propriedades e os textos usam aspas duplas. JSON.stringify transforma dados em texto e JSON.parse lê texto JSON válido.",
    ],
    exercise: ["Crie um objeto livro com titulo, autor e anoPublicacao. Exiba o título, mude o ano e acrescente genero.", "Use JSON.stringify para mostrar o objeto em formato JSON."],
    practice: quiz("Qual trecho é JSON válido?", ['{"titulo":"Manual"}', "{titulo: 'Manual'}", '{"titulo":"Manual",}'], 0, "Em JSON, as chaves são textos entre aspas duplas e a última propriedade fica sem vírgula."),
    guide: "Registre o objeto livro em JSON e explique como acessou a propriedade titulo.", resources: [kaaScript, scoutScript],
  },
  {
    month: 3, title: "Introdução ao HTML", subtitle: "Estruture texto, imagens e links",
    objective: "Criar uma página HTML com título, descrição, imagem e link.",
    theory: [
      "HTML descreve a estrutura da página. A declaração <!DOCTYPE html> identifica o documento. Dentro de html, head contém configurações e body reúne o conteúdo visível.",
      "Use h1 para o título principal e p para um parágrafo. Em img, src aponta para a imagem e alt a descreve. Em a, href aponta para o destino do link.",
    ],
    exercise: ["Em uma pasta para seu portfólio, crie index.html com a estrutura básica da página.", "Inclua um h1 com seu nome de apresentação, um parágrafo, uma imagem com texto alternativo e um link. Abra o arquivo no navegador."],
    practice: quiz("Em um link HTML, qual atributo indica o endereço de destino?", ["alt", "src", "href"], 2, "href indica para onde o navegador vai ao abrir o link."),
    guide: "Registre as tags que usou e a descrição alternativa da imagem escolhida.", resources: [portfolioHtml, download],
  },
  {
    month: 3, title: "Introdução ao CSS", subtitle: "Cores, fontes e modelo de caixa",
    objective: "Vincular uma folha CSS e alterar a aparência de texto e imagem.",
    theory: [
      "Uma regra CSS seleciona elementos e aplica propriedades. Um seletor como h1 escolhe títulos desse tipo. A tag link com rel=\"stylesheet\" vincula o arquivo CSS ao HTML.",
      "No modelo de caixa, padding afasta o conteúdo da borda, border desenha a borda e margin cria espaço externo. Use color para o texto, background-color para o fundo e font-family para a fonte.",
    ],
    exercise: ["Crie um arquivo CSS e vincule-o ao index.html da aula anterior.", "Mude o fundo da página, a cor e a fonte do h1. Aplique borda e padding à imagem e confira o resultado."],
    practice: quiz("Qual propriedade cria espaço entre o conteúdo e a borda do elemento?", ["margin", "padding", "color"], 1, "O padding é o espaço interno da caixa, antes da borda."),
    guide: "Anote um seletor que você usou e explique o efeito das regras aplicadas à imagem.", resources: [portfolioHtml, portfolioCss],
  },
  {
    month: 3, title: "Layout com CSS Flexbox", subtitle: "Organize elementos em uma linha ou coluna",
    objective: "Distribuir cartões no contêiner usando as propriedades do Flexbox.",
    theory: [
      "display: flex torna os filhos diretos de um elemento itens flexíveis. flex-direction determina o eixo principal e gap controla o espaço entre os itens.",
      "justify-content distribui os itens no eixo principal e align-items os alinha no eixo transversal. Use flex-wrap quando quiser permitir que os elementos quebrem para outra linha.",
    ],
    exercise: ["Crie um contêiner com três caixas. Use display: flex e centralize-as na horizontal.", "Experimente justify-content: space-between e compare o espaçamento. Reduza a largura da janela e observe."],
    practice: quiz("Qual propriedade distribui os itens no eixo principal do Flexbox?", ["justify-content", "align-items", "font-family"], 0, "justify-content organiza a distribuição ao longo do eixo principal."),
    guide: "Registre a diferença entre center e space-between no teste com três caixas.", resources: [portfolioCss],
  },
  {
    month: 3, title: "Estruturando o portfólio", subtitle: "Monte a primeira versão do site pessoal",
    objective: "Combinar HTML e CSS para organizar a apresentação, habilidades, projetos e contato.",
    theory: [
      "O portfólio piloto usa header e nav no topo, main para o conteúdo e section para dividir Sobre mim, Habilidades, Projetos e Contato. O CSS ajuda a separar visualmente essas áreas.",
      "Um link com href=\"#projetos\" leva à seção com id=\"projetos\". Os identificadores da página precisam ser únicos e corresponder ao destino do menu.",
    ],
    exercise: ["Complete o portfólio com apresentação, habilidades, espaço para os jogos e um contato apropriado para publicação.", "Escolha cores e fontes legíveis. Clique em cada link do menu para confirmar que ele leva à seção correspondente."],
    practice: quiz("Para qual id aponta o link href=\"#habilidades\"?", ["#habilidades", "nav", "habilidades"], 2, "O # inicia o fragmento no endereço. O valor do atributo id é habilidades."),
    guide: "Registre as seções que criou e um ajuste visual que facilitou a leitura.", resources: [portfolioHtml, portfolioCss, download],
  },
  {
    month: 4, title: "JavaScript e o DOM", subtitle: "Encontre os elementos da página",
    objective: "Vincular um script ao HTML e selecionar elementos por id e classe.",
    theory: [
      "O DOM representa a página como elementos que o JavaScript pode consultar e alterar. Use getElementById('tituloPrincipal') para buscar um elemento por id e querySelector('.textoDestaque') para buscar o primeiro com essa classe.",
      "Carregue o script depois do conteúdo ou use defer em um script externo no head. Assim o HTML já estará disponível quando a seleção ocorrer. Uma seleção sem resultado devolve null.",
    ],
    exercise: ["Crie um h1 com id tituloPrincipal e um p com a classe textoDestaque. Vincule um arquivo JavaScript.", "Selecione os dois elementos e exiba-os no console. Em seguida, teste com um seletor que não existe."],
    practice: quiz("Qual seletor busca o primeiro elemento com a classe textoDestaque?", ["#textoDestaque", ".textoDestaque", "textoDestaque"], 1, "Um ponto antes do nome indica seleção por classe."),
    guide: "Anote os seletores e o resultado que obteve ao usar um identificador ausente.", resources: [portfolioHtml, portfolioScript],
  },
  {
    month: 4, title: "Eventos no navegador", subtitle: "Responda a cliques e movimentos do ponteiro",
    objective: "Usar addEventListener para executar funções quando a pessoa interagir com a página.",
    theory: [
      "Um evento sinaliza algo que aconteceu, como click, keydown ou input. addEventListener associa um tipo de evento a uma função que será chamada quando o evento acontecer.",
      "No portfólio piloto, o clique no botão de saudação altera o texto exibido na página. Para testar a passagem do mouse, use mouseover e mouseout; para ações principais, também ofereça uma forma de usar o teclado.",
    ],
    exercise: ["Crie uma div com id minhaDiv. Use mouseover para mudar a cor do fundo ao passar o mouse.", "Use mouseout para restaurar a cor. No portfólio, teste também um botão com click."],
    practice: quiz("Em addEventListener('click', responder), quando responder é executada?", ["Quando o clique alcança o elemento.", "Assim que o ouvinte é cadastrado.", "Antes de o HTML carregar."], 0, "O navegador guarda a função e a chama quando ocorre o evento indicado."),
    guide: "Anote os eventos que testou e as mudanças que viu na página.", resources: [portfolioScript],
  },
  {
    month: 4, title: "Manipulando o CSS com JavaScript", subtitle: "Mostre e esconda elementos com classes",
    objective: "Criar uma interação que alterna uma classe CSS no DOM.",
    theory: [
      "O JavaScript pode alterar um estilo diretamente com element.style. Para um estado visual, defina a regra no CSS e use classList.add, classList.remove ou classList.toggle no código.",
      "classList.toggle alterna entre presença e ausência de uma classe. O portfólio combina eventos de clique com classes e atributos para controlar a abertura do menu em telas pequenas.",
    ],
    exercise: ["Crie um botão e um parágrafo. Defina uma classe escondido com display: none.", "No clique, aplique classList.toggle('escondido') ao parágrafo. Teste dois cliques seguidos."],
    practice: quiz("O que toggle('escondido') faz quando a classe já está no elemento?", ["Adiciona uma cópia da classe.", "Apaga o elemento.", "Remove a classe."], 2, "toggle remove a classe presente e adiciona a classe ausente."),
    guide: "Registre o estado do parágrafo antes do primeiro clique e depois de cada clique.", resources: [portfolioScript, portfolioCss],
  },
  {
    month: 4, title: "Responsividade do portfólio", subtitle: "Ajuste a página para diferentes telas",
    objective: "Testar o portfólio em diferentes larguras e adaptar o layout com media queries.",
    theory: [
      "Um layout responsivo se adapta ao espaço disponível. A configuração viewport no HTML ajuda o navegador do celular a usar a largura do dispositivo.",
      "Uma media query como @media (max-width: 600px) ativa regras em telas de até 600 pixels CSS. Você pode empilhar os cartões, mudar a disposição do menu ou ajustar o espaçamento conforme a necessidade.",
    ],
    exercise: ["Abra o portfólio em uma janela larga e depois reduza a largura. Procure rolagem horizontal, texto cortado ou cartões apertados.", "Use uma media query para corrigir um problema e confirme que o menu continua funcionando com mouse, teclado e toque quando disponível."],
    practice: quiz("Em que situação @media (max-width: 600px) aplica suas regras?", ["Quando a página tem exatamente 600 palavras.", "Quando a área de visualização tem até 600 pixels CSS de largura.", "Somente quando a largura ultrapassa 600 pixels CSS."], 1, "max-width é o limite superior da largura que ativa a regra."),
    guide: "Registre duas larguras que testou, o problema encontrado e a regra que usou para corrigi-lo.", resources: [portfolioHtml, portfolioCss, portfolioScript],
  },
  {
    month: 5, title: "Introdução ao Canvas", subtitle: "Desenhe formas com JavaScript",
    objective: "Obter o contexto 2D do canvas e desenhar um retângulo e caminhos preenchidos.",
    theory: [
      "A tag canvas reserva uma área de desenho. getContext('2d') fornece os métodos para desenhar. A origem das coordenadas fica no canto superior esquerdo, com x aumentando para a direita e y para baixo.",
      "Defina fillStyle antes de chamar fillRect. Para formas feitas com caminhos, comece com beginPath, descreva as linhas com moveTo e lineTo ou use arc para círculos, depois aplique fill.",
    ],
    exercise: ["Crie um HTML com canvas e obtenha seu contexto 2D no JavaScript.", "Desenhe um quadrado azul, um círculo vermelho e um triângulo verde. Ajuste as posições para que as três formas fiquem visíveis."],
    practice: quiz("Para mover um desenho para baixo no canvas, o que normalmente muda?", ["O valor de x aumenta.", "O valor de x diminui.", "O valor de y aumenta."], 2, "O eixo y cresce de cima para baixo no canvas."),
    guide: "Registre as coordenadas de uma das formas e o método usado para desenhá-la.", resources: [kaaHtml, kaaScript, download],
  },
  {
    month: 5, title: "Estrutura do Jogo da Kaa", subtitle: "Estado, grade e loop de jogo",
    objective: "Definir o estado inicial e separar atualização de desenho em um loop.",
    theory: [
      "O estado do jogo reúne a lista de segmentos da cobra, a posição da maçã, as velocidades nos dois eixos, a pontuação e a pausa. O tamanho da célula, gridSize, faz a ligação entre grade e pixels.",
      "A posição 3 em uma grade de células de 20 pixels corresponde ao pixel 60. update() altera posições; draw() limpa e redesenha a cena. No piloto, gameLoop agenda o próximo passo com setTimeout.",
    ],
    exercise: ["Defina gridSize, tileCount, snake, apple, xVelocity, yVelocity, score e isPaused no seu projeto Kaa.", "Crie draw() para mostrar a cobra e a maçã. Faça update() alterar temporariamente a posição x e a pontuação para testar o loop."],
    practice: quiz("Com gridSize igual a 20, qual é a coordenada em pixels da coluna 3?", ["20", "60", "23"], 1, "Multiplique a coordenada da grade pelo tamanho da célula: 3 × 20 = 60."),
    guide: "Liste as variáveis de estado e explique o que draw() e update() fazem no seu teste.", resources: [kaaHtml, kaaScript],
  },
  {
    month: 5, title: "Desenhando a Kaa e a maçã", subtitle: "Represente o estado no canvas",
    objective: "Percorrer os segmentos da cobra e desenhar o alimento na posição da grade.",
    theory: [
      "Cada segmento da cobra é um objeto com x e y. drawSnake() percorre a lista e transforma as coordenadas de cada segmento em pixels. Você pode usar outra cor para destacar a cabeça.",
      "drawApple() usa a posição de um único objeto. Antes de chamar as funções de desenho, limpe a cena com clearRect, evitando que posições antigas fiquem na tela.",
    ],
    exercise: ["Implemente drawSnake() e drawApple(). Chame as duas funções dentro de draw().", "Teste com uma cobra de três segmentos e uma maçã em outra célula. Troque as cores e confira se a posição permanece igual."],
    practice: quiz("Qual método apaga o desenho anterior de uma região do canvas?", ["clearRect()", "fillRect()", "addEventListener()"], 0, "clearRect() limpa a região para o próximo desenho."),
    guide: "Registre a posição da cabeça, a posição da maçã e a regra usada para converter a grade em pixels.", resources: [kaaScript],
  },
  {
    month: 5, title: "Movimentação da Kaa pelo teclado", subtitle: "Use as setas para mudar a direção",
    objective: "Ler eventos de teclado e atualizar o vetor de movimento da cobra.",
    theory: [
      "O evento keydown informa qual tecla foi pressionada. Um switch pode reagir a ArrowUp, ArrowDown, ArrowLeft e ArrowRight, alterando xVelocity e yVelocity.",
      "Subir diminui y. Andar para a direita aumenta x. Ajuste os dois eixos ao mudar de direção e bloqueie a inversão imediata quando ela levar a cabeça ao corpo. No piloto, espaço alterna a pausa.",
    ],
    exercise: ["Adicione um ouvinte keydown para as quatro setas. Atualize as velocidades conforme a direção escolhida.", "Teste cada seta e tente inverter o sentido imediatamente. Se já tiver a função de pausa, ligue-a à barra de espaço."],
    practice: quiz("Em uma grade com y crescente para baixo, qual par (xVelocity, yVelocity) move a cobra para cima?", ["(1, 0)", "(0, 1)", "(0, -1)"], 2, "A coordenada x fica igual e a coordenada y diminui a cada passo."),
    guide: "Registre os vetores das quatro direções e o comportamento quando tentou inverter o movimento.", resources: [kaaScript],
  },
  {
    month: 6, title: "Crescimento da Kaa", subtitle: "Coma a maçã e altere o tamanho da cobra",
    objective: "Mover a cabeça, conservar a cauda na coleta e reposicionar a maçã.",
    theory: [
      "A cada passo, o jogo calcula uma nova cabeça e a coloca no início do array com unshift. Em movimento normal, pop remove a cauda e o tamanho permanece igual.",
      "Quando x e y da cabeça coincidem com os da maçã, preserve a cauda para crescer e sorteie outra posição para o alimento. Como melhoria, descarte posições já ocupadas pela cobra.",
    ],
    exercise: ["Adicione a nova cabeça a cada ciclo e remova a cauda apenas quando a cobra não comer.", "Posicione uma maçã no caminho, teste o crescimento e confira onde a próxima maçã aparece."],
    practice: quiz("Depois de acrescentar a nova cabeça, como obter um segmento a mais na coleta?", ["Remover a cauda duas vezes.", "Manter a cauda nesse passo.", "Voltar a cabeça à posição anterior."], 1, "O array fica um elemento maior quando você adiciona a cabeça e mantém a cauda."),
    guide: "Anote o tamanho da cobra antes e depois de comer e explique o papel de unshift e pop.", resources: [kaaScript],
  },
  {
    month: 6, title: "Pontuação e som no Jogo da Kaa", subtitle: "Dê retorno quando a maçã for coletada",
    objective: "Atualizar a pontuação na tela e reproduzir um efeito sonoro na coleta.",
    theory: [
      "A pontuação é uma variável do jogo. Ao coletar, some um ponto e copie o valor para o textContent do elemento de placar. Ao reiniciar, atualize tanto a variável quanto a tela.",
      "O código do piloto cria um Audio para o som da coleta. Reproduza o som uma vez quando a coleta for detectada. Uma interação para iniciar o jogo ajuda o navegador a autorizar a reprodução.",
    ],
    exercise: ["Adicione um elemento de pontuação ao HTML e atualize-o a cada maçã coletada.", "Use o efeito sonoro do projeto ou outro que você possa usar. Teste duas coletas e confirme que o som e o placar só mudam no momento da coleta."],
    practice: quiz("Em qual situação a pontuação deve aumentar?", ["Quando a cabeça e a maçã têm a mesma posição.", "Toda vez que draw() é executada.", "Quando a partida está pausada."], 0, "A alteração pertence ao evento de coleta detectado na atualização."),
    guide: "Registre como a tela foi atualizada e o que aconteceu ao coletar a segunda maçã.", resources: [kaaHtml, kaaScript, effects],
  },
  {
    month: 6, title: "Colisões no Jogo da Kaa", subtitle: "Detecte o fim da partida",
    objective: "Verificar a colisão com o corpo e decidir a regra das bordas do tabuleiro.",
    theory: [
      "A cabeça está no índice 0. Compare as duas coordenadas da cabeça com as de cada segmento a partir do índice 1. Uma posição repetida indica uma colisão com o próprio corpo.",
      "Ao ultrapassar a borda, o piloto reaparece do lado oposto. Em sua versão, você pode manter essa regra ou encerrar a partida ao sair da grade. Teste uma regra por vez.",
    ],
    exercise: ["Implemente gameOver() para verificar se a cabeça ocupa uma célula do corpo e use seu retorno no loop.", "Escolha atravessar pelas bordas ou encerrar a partida nelas. Teste uma colisão com o corpo e uma saída pela borda."],
    practice: quiz("Por que comparar a cabeça com o corpo a partir do índice 1?", ["Porque o primeiro índice é sempre vazio.", "Porque o índice 0 contém a própria cabeça.", "Porque a última célula nunca é ocupada."], 1, "Comparar a cabeça consigo mesma sempre daria colisão."),
    guide: "Descreva a regra escolhida para a borda e registre o resultado de dois testes de colisão.", resources: [kaaScript],
  },
  {
    month: 6, title: "Finalizando o Jogo da Kaa", subtitle: "Telas de início, pausa e fim de jogo",
    objective: "Organizar a transição entre os estados e reiniciar a partida com os valores iniciais.",
    theory: [
      "As telas inicial e final explicam o que o jogador pode fazer. No piloto, botões de início e nova partida chamam funções que mostram ou escondem essas telas.",
      "A pausa mantém o estado e suspende a atualização do jogo. Ao iniciar outra partida, restaure as posições, o placar e a direção. Confirme que só existe um loop atualizando a partida.",
    ],
    exercise: ["Crie as telas inicial e final com botões de início e reinício. Mostre a pontuação final.", "Ligue os botões aos eventos de clique e mostre um aviso quando a partida estiver pausada.", "Teste iniciar, pausar, retomar, perder e jogar novamente. Verifique o placar e a velocidade após reiniciar."],
    practice: quiz("Ao pausar a partida, qual comportamento preserva o jogo?", ["Zerar a pontuação.", "Criar mais um loop.", "Manter as posições e suspender as atualizações."], 2, "Pausar mantém o estado para que a partida possa continuar de onde parou."),
    guide: "Registre seu roteiro de testes e um ajuste que fez antes de considerar a Kaa pronta.", resources: [kaaHtml, kaaScript, kaaCss, download],
  },
  {
    month: 7, title: "Classes e objetos", subtitle: "Introdução à orientação a objetos",
    objective: "Criar instâncias com propriedades e métodos a partir de uma mesma classe.",
    theory: [
      "Uma classe descreve características e comportamentos que seus objetos compartilham. Uma instância criada com new guarda seus próprios valores. Scout Plat usa classes como Player e Floor para reunir estado e lógica.",
      "O constructor inicia as propriedades de cada instância. Um método pode ler propriedades usando this, que se refere ao objeto que está executando aquele método.",
    ],
    exercise: ["Crie uma classe Animal com propriedades nome e especie e um método emitirSom() que exiba uma mensagem.", "Instancie um cachorro e um gato com valores diferentes. Chame o método de cada objeto."],
    practice: quiz("Qual palavra cria uma instância em new Animal('Luna', 'gato')?", ["class", "new", "return"], 1, "new cria um objeto e chama seu construtor."),
    guide: "Anote os dois objetos que criou e explique por que os valores podem ser diferentes mesmo usando a mesma classe.", resources: [scoutScript, download],
  },
  {
    month: 7, title: "Criando a classe Player", subtitle: "Posição, velocidade, vida e dimensões",
    objective: "Representar as propriedades do jogador em uma classe com um construtor.",
    theory: [
      "Player reúne a posição x e y, as velocidades, as dimensões e os pontos de vida. Use argumentos para valores que podem variar entre instâncias e valores iniciais para propriedades como hp e velocidade.",
      "Estados booleanos como isJump e isOnFloor ajudam a saber se o personagem está no ar ou apoiado. No Scout Plat, movimento e colisão consultam e atualizam esses valores.",
    ],
    exercise: ["Crie Player com character, x, y, width, height e hp. Adicione xVelocity, yVelocity, isJump e isOnFloor.", "Inicie hp em 100, velocidades em 0 e estados em false. Passe os demais valores no construtor e confira sua instância no console."],
    practice: quiz("Qual propriedade representa a velocidade para os lados?", ["hp", "height", "xVelocity"], 2, "xVelocity representa a velocidade ao longo do eixo horizontal."),
    guide: "Registre uma instância de Player e explique quais valores são passados e quais são definidos no construtor.", resources: [scoutScript],
  },
  {
    month: 7, title: "Desenhando o Player e aplicando gravidade", subtitle: "Atualize a queda a cada quadro",
    objective: "Desenhar o personagem no canvas e simular aceleração para baixo.",
    theory: [
      "No primeiro teste, draw() pode mostrar o personagem como um retângulo. update() muda o estado e draw() usa a posição atual para pintar a cena.",
      "A gravidade aumenta a velocidade y a cada quadro. A velocidade muda a posição e o personagem cai. requestAnimationFrame agenda a próxima atualização em sincronia com a renderização do navegador.",
    ],
    exercise: ["Desenhe o Player como um retângulo. No update(), aumente yVelocity pela gravidade e use a velocidade para atualizar y.", "Em um loop com requestAnimationFrame, limpe a tela, atualize e desenhe. Limite a queda ao fundo do canvas e reponha yVelocity em zero ao chegar ao chão."],
    practice: quiz("Ao aplicar gravidade durante a queda, qual valor aumenta primeiro neste modelo?", ["yVelocity", "hp", "width"], 0, "A gravidade altera a velocidade vertical. A velocidade passa a alterar a posição."),
    guide: "Anote a posição e velocidade num quadro inicial e em outro durante a queda. Descreva o que acontece ao tocar o fundo.", resources: [scoutHtml, scoutScript],
  },
  {
    month: 7, title: "Plataformas e colisão com o chão", subtitle: "Crie a classe Floor",
    objective: "Representar várias plataformas e parar a queda do Player sobre uma superfície.",
    theory: [
      "Uma plataforma pode ser um retângulo com posição, largura e altura. O array de plataformas permite desenhá-las e verificar os limites de cada uma no loop.",
      "No pouso, o personagem está descendo, se sobrepõe horizontalmente à plataforma e cruza seu topo com a parte de baixo do corpo. Reposicione-o sobre a plataforma, zere yVelocity e marque o apoio.",
    ],
    exercise: ["Crie Floor com posição, dimensões e draw(). Instancie pelo menos duas plataformas em alturas diferentes.", "Confira a posição anterior e atual do Player. Ao pousar, ajuste y, zere yVelocity e atualize isOnFloor. Teste cair sobre a plataforma e ao lado dela."],
    practice: quiz("Em um pouso vindo de cima, onde deve ficar a parte inferior do jogador?", ["No centro da plataforma.", "No topo da plataforma.", "No fundo da plataforma."], 1, "Encostar a parte inferior do jogador no topo evita que ele fique preso dentro da plataforma."),
    guide: "Registre como seu teste distingue cair sobre a plataforma de cair ao lado dela.", resources: [scoutScript],
  },
  {
    month: 8, title: "Sprites e animação do personagem", subtitle: "Alterne imagens de repouso e caminhada",
    objective: "Carregar quadros de animação e selecionar o conjunto adequado ao movimento.",
    theory: [
      "Um sprite é a imagem que representa algo no jogo. Uma animação alterna quadros em sequência para criar a impressão de movimento. Um array pode reunir os quadros de cada estado.",
      "No Scout Plat, Player seleciona um estado e desenha o quadro escolhido. Um contador ou o tempo decorrido regula a troca. O operador % ajuda o índice a voltar ao início da sequência.",
    ],
    exercise: ["Separe três quadros de repouso e três de caminhada. Use os sprites do projeto como referência ou crie seus próprios quadros.", "Carregue as imagens em arrays. Mostre a animação de caminhada quando xVelocity for diferente de zero e a de repouso ao parar."],
    practice: quiz("Em uma versão com dois estados, qual sequência usar quando xVelocity é zero?", ["Caminhada.", "Coleta.", "Repouso."], 2, "Sem velocidade horizontal, use os quadros de repouso neste exercício."),
    guide: "Anote de onde vieram seus sprites e como o índice volta ao primeiro quadro.", resources: [scoutScript, scoutAssets, download],
  },
  {
    month: 8, title: "Movimento horizontal e pulo", subtitle: "Controle o jogador pelo teclado",
    objective: "Mover o Player para os lados e iniciar o pulo quando ele estiver apoiado.",
    theory: [
      "keydown pode iniciar o movimento e keyup pode encerrá-lo. No piloto, A anda para a esquerda, D para a direita e espaço chama jump().",
      "O pulo começa com velocidade vertical negativa, pois o eixo y cresce para baixo. A gravidade desacelera a subida e faz o jogador cair. O estado de apoio permite controlar quando um novo pulo é aceito.",
    ],
    exercise: ["Escute keydown e keyup para andar para os dois lados e soltar o movimento.", "Implemente jump() com uma velocidade vertical inicial para cima. Teste pular no chão, tentar pular no ar e voltar a pular depois de pousar."],
    practice: quiz("Qual deve ser o sinal da velocidade y no primeiro instante de um pulo para cima?", ["Negativo.", "Positivo.", "Sempre zero."], 0, "Para subir, a coordenada y precisa diminuir."),
    guide: "Registre como o estado isOnFloor muda ao pular e ao pousar.", resources: [scoutScript],
  },
  {
    month: 8, title: "Colisões laterais e verticais", subtitle: "Resolva o contato com os quatro lados",
    objective: "Detectar sobreposição entre retângulos e corrigir o movimento pelo lado de entrada.",
    theory: [
      "Uma caixa de colisão retangular usa bordas esquerda, direita, superior e inferior. Você detecta sobreposição conferindo se os intervalos nos dois eixos se cruzam.",
      "A posição anterior do jogador ajuda a identificar por qual lado ele entrou. Ao colidir pela lateral, corrija x e a velocidade horizontal. Ao bater por baixo, corrija y e interrompa a subida.",
    ],
    exercise: ["Crie checkCollision para dois retângulos no mesmo sistema de coordenadas.", "Guarde a posição anterior do Player e resolva a colisão por lado. Teste tocar cada lateral, bater por baixo e pousar por cima."],
    practice: quiz("Qual informação ajuda a distinguir colisão de lado e pouso?", ["A cor do Player.", "A posição anterior do Player.", "O número de quadros da animação."], 1, "A posição anterior indica de que lado o jogador vinha antes de sobrepor a plataforma."),
    guide: "Registre o resultado de um teste lateral e de um teste batendo por baixo da plataforma.", resources: [scoutScript],
  },
  {
    month: 8, title: "Moedas e pontuação no Scout Plat", subtitle: "Adicione itens coletáveis",
    objective: "Desenhar moedas, detectar a coleta e atribuir pontos uma única vez por item.",
    theory: [
      "Cada moeda tem posição, dimensões e uma imagem. No piloto, a classe Item reúne essas propriedades e desenha sprites de moeda.",
      "Quando o Player toca a moeda, some os pontos e tire a moeda da lista ativa ou marque-a como coletada. O mesmo item só deve pontuar uma vez, mesmo quando o jogador permanece no lugar.",
    ],
    exercise: ["Crie Coin ou Item, distribua moedas pelo cenário e desenhe as que ainda podem ser coletadas.", "Ao detectar a colisão, some um ponto, atualize o placar e retire a moeda de circulação. Teste ficar parado onde a moeda estava."],
    practice: quiz("Como evitar que uma moeda valha pontos de novo no quadro seguinte?", ["Desenhar duas cópias da moeda.", "Zerar o placar a cada quadro.", "Remover a moeda da lista ativa ou marcá-la como coletada."], 2, "O jogo deve deixar de testar essa moeda depois da primeira coleta."),
    guide: "Anote quantas moedas colocou, quantas coletou e como verificou que cada uma pontuou uma vez.", resources: [scoutScript, scoutAssets],
  },
  {
    month: 9, title: "Inimigos com movimento autônomo", subtitle: "Crie uma patrulha para os NPCs",
    objective: "Construir um inimigo que atualiza sua posição sem depender das teclas do jogador.",
    theory: [
      "Um NPC é um personagem controlado pelo jogo. A classe Enemy pode agrupar posição, dimensões, velocidade e o código para atualizar e desenhar cada inimigo.",
      "Uma patrulha pode usar dois limites horizontais. Ao atingir um limite, corrija a posição se necessário e troque o sinal da velocidade. Use um array para atualizar diferentes inimigos no mesmo loop.",
    ],
    exercise: ["Crie Enemy com métodos de atualização e desenho. Faça um inimigo patrulhar de um lado ao outro.", "Teste as duas bordas e adicione uma segunda instância com posição e velocidade diferentes."],
    practice: quiz("O que faz um inimigo inverter o sentido de uma patrulha horizontal?", ["Mudar o sinal da velocidade horizontal.", "Mudar a altura do sprite.", "Aumentar os pontos de vida do jogador."], 0, "O sinal da velocidade determina se a posição diminui ou aumenta."),
    guide: "Registre os limites da patrulha e o que cada instância faz quando chega à borda.", resources: [scoutScript, scoutAssets],
  },
  {
    month: 9, title: "Colisão com inimigos e sistema de vida", subtitle: "Registre dano e encerre a partida",
    objective: "Reduzir HP quando ocorrer dano e atualizar o indicador de vida e o estado de jogo.",
    theory: [
      "Use caixas de colisão no jogador e no inimigo para detectar contato. Ao aplicar dano, atualize o HP e o indicador na tela. A partida termina quando o HP chega a zero ou menos.",
      "Se a colisão durar vários quadros, o mesmo contato pode aplicar dano muitas vezes. Um intervalo curto entre danos, ou afastar os personagens ao colidir, ajuda a dar tempo de reação.",
    ],
    exercise: ["Faça a colisão com inimigos diminuir o HP. Atualize um indicador ao aplicar dano.", "Implemente o fim da partida com HP igual ou abaixo de zero. Teste contato contínuo e ajuste a frequência do dano."],
    practice: quiz("Qual condição cobre tanto chegar a zero quanto passar de zero ao receber dano?", ["hp >= 0", "hp <= 0", "hp === 100"], 1, "O operador <= detecta zero e valores negativos, inclusive quando o último dano é maior que a vida restante."),
    guide: "Anote o HP inicial, o valor de um dano e o que aconteceu no último contato.", resources: [scoutScript],
  },
  {
    month: 9, title: "Arremesso de objetos no Scout Plat", subtitle: "Modele uma bola de tênis como projétil",
    objective: "Criar, mover e remover projéteis e verificar o contato com inimigos.",
    theory: [
      "Um projétil começa perto do jogador e recebe a direção atual. A classe Projectile registra sua posição, dimensões e velocidade. O loop atualiza e desenha os projéteis ativos.",
      "Ao atingir um inimigo ou sair da tela, marque o projétil para remoção. No piloto, Enter chama o arremesso. A remoção evita que objetos sem utilidade permaneçam no loop.",
    ],
    exercise: ["Crie Projectile e use uma tecla para lançar uma bola de tênis no sentido em que o Player está olhando.", "Atualize e desenhe as bolas. Aplique dano ao contato com o inimigo e remova a bola ao atingir um alvo ou sair da tela."],
    practice: quiz("Depois que um projétil atinge o inimigo, o que evita novo dano nos quadros seguintes?", ["Aumentar a velocidade da bola.", "Mudar a cor do inimigo.", "Desativar o projétil ao registrar o contato."], 2, "O projétil desativado deixa de participar das próximas verificações de colisão."),
    guide: "Registre quais teclas usou e o que acontece quando a bola acerta, erra ou sai da tela.", resources: [scoutScript, scoutAssets],
  },
  {
    month: 9, title: "Finalizando o Scout Plat", subtitle: "Telas, áudio e teste de jogabilidade",
    objective: "Concluir o fluxo de uma partida e verificar os efeitos em jogo.",
    theory: [
      "O jogo pode separar os estados de início, partida, pausa e fim. Escolha em quais estados o loop atualiza posições e quais botões aparecem. Reutilize o que já funcionou no Jogo da Kaa.",
      "A trilha sonora acompanha a partida e os efeitos destacam eventos, como pular ou derrotar um inimigo. Acione o som da partida a partir da interação de começar e teste a pausa e a retomada.",
    ],
    exercise: ["Implemente as telas de início e fim, um controle de pausa e a opção de jogar de novo.", "Adicione música com volume ajustável e efeitos para pulo e inimigo derrotado. Teste o áudio durante a pausa.", "Jogue uma partida inteira, teste reinício e corrija um problema de jogabilidade."],
    practice: quiz("Qual teste ajuda a confirmar que o reinício funcionou?", ["Comparar os estados de posição, HP e placar com os valores iniciais.", "Testar somente a cor do menu.", "Aumentar o volume antes de abrir a página."], 0, "Um novo jogo deve iniciar com posição, vida e placar próprios daquela partida."),
    guide: "Registre o roteiro de teste do Scout Plat e um problema que encontrou e corrigiu.", resources: [scoutHtml, scoutScript, scoutCss, effects, download],
  },
  {
    month: 10, title: "Revisão e organização dos projetos", subtitle: "Refatore e teste o portfólio e os jogos",
    objective: "Organizar arquivos e melhorar a leitura de um trecho de código preservando seu comportamento.",
    theory: [
      "Refatorar é melhorar a estrutura do código mantendo o comportamento que já funciona. Você pode extrair instruções repetidas para uma função ou trocar nomes vagos por nomes que descrevem o uso.",
      "O projeto piloto agrupa CSS, JavaScript, imagens e áudio em pastas. Ao mudar um arquivo de lugar, revise os caminhos relativos e teste a navegação e a reprodução de recursos.",
    ],
    exercise: ["Revise o portfólio e os dois jogos. Escolha um trecho para renomear, extrair ou organizar.", "Organize arquivos por tipo, se for útil. Refaça o teste usado antes da mudança e confira os links do portfólio e os recursos dos jogos."],
    practice: quiz("O que indica que uma refatoração preservou a funcionalidade?", ["O arquivo ficou maior.", "O teste do mesmo comportamento continua passando.", "O nome de todas as variáveis mudou."], 1, "Repita o mesmo teste antes e depois para conferir se a funcionalidade foi mantida."),
    guide: "Registre o trecho revisado, a mudança feita e o teste que confirma o resultado.", resources: [download, { title: "Repositório do projeto piloto", url: repository }],
  },
  {
    month: 10, title: "Introdução ao Git e ao GitHub", subtitle: "Faça seu primeiro commit",
    objective: "Inicializar um repositório Git e registrar a primeira versão de um arquivo.",
    theory: [
      "Git registra versões dos arquivos do projeto no computador. Um commit guarda uma versão com uma mensagem. GitHub hospeda repositórios que podem ser compartilhados e sincronizados.",
      "git init cria o repositório local. git status mostra as mudanças, git add seleciona o que vai entrar no commit e git commit grava essa seleção. Faça o primeiro treino em uma pasta de teste.",
    ],
    exercise: ["Com o Git instalado, crie uma pasta de teste e execute git init. Adicione um README.md com uma descrição curta.", "Execute git status, git add README.md e git commit -m \"Primeiro commit\". Veja o resultado com git log --oneline.", "Abra o GitHub e explore a tela de criação de um repositório vazio."],
    practice: quiz("Qual comando grava a versão que você preparou com git add?", ["git init", "git status", "git commit"], 2, "git commit registra os arquivos que foram selecionados para a próxima versão."),
    guide: "Anote os comandos usados e a mensagem exibida em git log --oneline.",
  },
  {
    month: 10, title: "Enviando o projeto para o GitHub", subtitle: "Configure um remoto e faça o primeiro push",
    objective: "Vincular o projeto local ao repositório escolhido e enviar seus commits.",
    theory: [
      "Um remoto é um endereço de outro repositório. origin é um nome comum para o remoto principal. git remote -v mostra os endereços configurados.",
      "Depois de revisar o conteúdo a publicar e criar os commits, git push -u origin main envia a branch main e registra a associação para próximos envios. Compare os arquivos e os commits no GitHub com sua versão local.",
    ],
    exercise: ["Revise o portfólio e os jogos. Confirme que os arquivos escolhidos para publicação podem ser compartilhados e crie um repositório vazio no GitHub.", "Adicione o remoto com git remote add origin ENDERECO. Use git branch -M main se precisar padronizar o nome e envie com git push -u origin main.", "Confira a estrutura das pastas e o último commit no GitHub."],
    practice: quiz("Qual comando lista os endereços dos remotos configurados?", ["git remote -v", "git init", "git log --oneline"], 0, "git remote -v permite conferir o endereço antes de enviar a branch."),
    guide: "Registre o endereço do seu repositório ou seu nome de treino, a branch enviada e a mensagem do último commit.", resources: [{ title: "Estrutura do repositório piloto no GitHub", url: repository }],
  },
  {
    month: 10, title: "Publicando o portfólio e apresentando os jogos", subtitle: "GitHub Pages e apresentação final",
    objective: "Publicar a página estática do portfólio, testar a versão online e apresentar os projetos concluídos.",
    theory: [
      "O GitHub Pages publica um site estático a partir da fonte configurada no repositório. Se a opção de publicar a partir de uma branch estiver disponível, selecione a branch e a pasta que contém index.html.",
      "Teste a versão publicada no endereço do Pages. Confira os links para os jogos e se imagens, estilos, sons e scripts carregam. Caminhos relativos ajudam a manter os recursos dentro do endereço do seu projeto.",
    ],
    exercise: ["Nas configurações do repositório, abra Pages e selecione a origem do site com index.html. Aguarde a publicação e abra o endereço exibido.", "Teste o portfólio e os dois jogos na versão online. Abra pelo menos um link em uma tela pequena.", "Prepare uma apresentação curta com o que construiu, uma decisão técnica e algo que aprendeu durante os testes."],
    practice: quiz("Qual teste confirma que os jogos podem ser abertos por quem visita seu portfólio?", ["Abrir apenas o index.html no editor.", "Abrir o site publicado, seguir os links e iniciar os dois jogos.", "Ver a lista de arquivos do repositório sem abrir o site."], 1, "O teste na versão publicada verifica se os links e os arquivos funcionam para o visitante."),
    guide: "Registre o endereço publicado ou o resultado do teste de publicação e escreva o roteiro resumido da apresentação.", resources: [portfolioHtml, kaaHtml, scoutHtml],
  },
];

export const programacaoBasicaAulas = content.map((lesson) => ({ ...lesson, icon: "⌨" }));
