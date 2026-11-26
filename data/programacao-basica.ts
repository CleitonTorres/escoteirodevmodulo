import type { Lesson, LessonResource } from "./lessons";
import type { PracticeTask } from "../lib/practice";
import { programmingPortfolio } from "../lib/desktop-files";

export const programmingJournalPrompt =
  "Anote o que fez hoje, o que conseguiu testar e o que quer retomar na próxima aula.";

const repository = "https://github.com/CleitonTorres/escoteirodev-piloto";
const revision = "f3bc4ed16fae0799c507a5fe10aabeb1bfa69b94";
const download = {
  title: "Baixar o código e os recursos do projeto em ZIP",
  url: `${repository}/archive/${revision}.zip`,
};

function source(title: string, path: string): LessonResource {
  return { title, url: `${repository}/blob/${revision}/${path}` };
}

const portfolioHtml = source("Estrutura HTML do portfólio", "index.html");
const portfolioCss = source("Estilos do portfólio", "src/css/home.css");
const portfolioScript = source(
  "JavaScript do portfólio",
  "src/scripts/scripts.js",
);
const kaaHtml = source("Página do Jogo da Kaa", "jogoKaa.html");
const kaaScript = source(
  "Código JavaScript do Jogo da Kaa",
  "src/scripts/scriptsJogoKaa.js",
);
const kaaCss = source("Estilos do Jogo da Kaa", "src/css/stylesJogoKaa.css");
const scoutHtml = source("Página do Scout Plat", "scoutPlat.html");
const scoutScript = source(
  "Código JavaScript do Scout Plat",
  "src/scripts/scriptsScoutPlat.js",
);
const scoutCss = source("Estilos do Scout Plat", "src/css/stylesScoutPlat.css");
const effects = {
  title: "Efeitos sonoros dos jogos",
  url: `${repository}/tree/${revision}/src/audios/efeitos`,
};
const scoutAssets = {
  title: "Sprites do Scout Plat",
  url: `${repository}/tree/${revision}/src/assets/scoutPlat`,
};

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

function quiz(
  action: string,
  options: [string, string, string],
  answer: 0 | 1 | 2,
  feedback: string,
): PracticeTask {
  return { id: "verificar-conceito", action, check: { kind: "quiz", options, answer, feedback } };
}

const content: Omit<Lesson, "id" | "icon">[] = [
  {
    month: 1,
    title: "O que é programação?",
    subtitle: "Algoritmos no dia a dia",
    objective:
      "Organizar instruções em uma sequência clara e reconhecer onde usamos algoritmos.",
    theory: [
      "Programar é escrever instruções para que um computador execute uma tarefa. Em um jogo, receber a tecla apertada, mudar a posição do personagem e redesenhar a tela são instruções que trabalham juntas.",
      "Um algoritmo é uma sequência finita de passos para resolver um problema. A ordem e os detalhes importam. Uma pessoa pode completar lacunas por experiência, enquanto o computador segue o que foi especificado.",
      "Em uma receita, os ingredientes são entradas, as etapas são o processamento e o prato pronto é a saída. Pense nessas três partes quando for explicar seu primeiro algoritmo.",
      "Pense em três partes. A entrada é a informação disponível, o processamento são os passos e a saída é o resultado. Em um programa para organizar a mochila, os materiais são a entrada e a mochila pronta é o resultado.",
      "Na execução sequencial, o JavaScript lê as instruções deste exemplo de cima para baixo. O console é onde o programa pode mostrar mensagens para ajudar você a conferir o que aconteceu. As aspas indicam que a mensagem é texto.",
      "Faça uma previsão antes de executar. Troque a ordem de duas linhas e rode de novo. Se remover uma aspa, observe a mensagem de erro e restaure-a. O erro de sintaxe indica que o JavaScript não conseguiu interpretar a instrução.",
    ],
    codeExample: "console.log(\"1. Pegue a lanterna.\");\nconsole.log(\"2. Confira as pilhas.\");\nconsole.log(\"3. Guarde a lanterna na mochila.\");",
    practice: [
      {
        id: "escrever-codigo",
        action: "Escreva três instruções console.log() para exibir em ordem os passos do seu algoritmo.",
        hint: [
          "Use o botão desta tarefa para abrir aula-01.js.",
          "Escolha uma tarefa simples, como ligar o computador ou preparar a mochila. Descreva os passos em ordem.",
          "Peça a alguém para seguir somente as instruções escritas. Reescreva qualquer passo que permita duas interpretações.",
          "Use Executar JavaScript e confira a saída no console.",
        ].join("\n"),
        check: {
          kind: "code",
          file: ["Arquivos", "aula-01.js"],
          markers: ["console.log(", "console.log(", "console.log("],
          quickStart: true,
        },
      },
      quiz(
        "Qual instrução é mais fácil de executar sem adivinhar?",
        [
          "Deixe tudo pronto.",
          "Coloque o caderno dentro da mochila e feche o zíper.",
          "Faça como de costume.",
        ],
        1,
        "Instruções precisas dizem o que fazer e em que ordem.",
      ),
    ],
    guide: programmingJournalPrompt,
  },
  {
    month: 1,
    title: "Variáveis e tipos de dados",
    subtitle: "Números, textos e booleanos",
    objective:
      "Declarar variáveis em JavaScript e distinguir os tipos number, string e boolean.",
    theory: [
      "Uma variável dá nome a um valor. Use let se pretende trocar o valor e const quando a referência deve permanecer. No Jogo da Kaa, a pontuação começa em zero e muda durante a partida.",
      "O número 40 tem tipo number. O texto '40', entre aspas, tem tipo string. Os valores true e false são booleanos e servem para representar estados como jogo pausado.",
      "No console, console.log(typeof valor) mostra o tipo de um valor. Compare o número 40 com o texto '40' antes de tentar fazer uma conta.",
      "Em let pontos = 0, let declara uma variável, pontos é o nome e 0 é o valor inicial. O sinal = atribui o valor à variável. Uma segunda atribuição, pontos = 1, reaproveita o nome já declarado.",
      "Use const para um nome que não precisa receber outro valor. Em const equipe = ['Lia'], a referência da lista fica fixa, mas os itens da lista podem mudar. Para os números e textos deste exercício, pense em const como um rótulo que guarda um valor fixo.",
      "As aspas mudam o tipo. O número 40 somado a 2 dá 42. O texto '40' somado a 2 com + produz '402' por concatenação. Um teste com typeof mostra o tipo antes que você use o valor numa conta.",
    ],
    codeExample: "const nomeCurso = \"Programação Básica Escoteiro Dev\";\nconst numeroAulas = 40;\nconst projetoConcluido = false;\n\nconsole.log(typeof nomeCurso); // string\nconsole.log(typeof numeroAulas); // number\nconsole.log(typeof projetoConcluido); // boolean",
    practice: [
      {
        id: "escrever-codigo",
        action: "Declare três variáveis, uma de cada tipo, e exiba seus tipos com typeof.",
        hint: [
          "Use o botão desta tarefa para abrir aula-02.js.",
          "Declare três variáveis diferentes: uma com texto entre aspas, uma com número sem aspas e uma com true ou false.",
          "Passe typeof seguido do nome de cada variável para console.log(). Você pode usar uma chamada para cada tipo ou mostrar os três na mesma chamada.",
          "Use Executar JavaScript e confira a saída no console.",
        ].join("\n"),
        check: {
          kind: "code",
          file: ["Arquivos", "aula-02.js"],
          rule: "variable-types",
          quickStart: true,
        },
      },
      quiz(
        "Qual é o tipo de false quando escrito sem aspas?",
        ["boolean", "number", "string"],
        0,
        "Os valores true e false são do tipo boolean.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [kaaScript],
  },
  {
    month: 1,
    title: "Operadores matemáticos e lógicos",
    subtitle: "Calcule, compare e combine condições",
    objective:
      "Usar operadores aritméticos, comparações e expressões booleanas.",
    theory: [
      "Use +, -, *, / e % para calcular. O operador % devolve o resto da divisão. Quando numero % 2 === 0, o número é par.",
      "Comparações como >= e === resultam em true ou false. A igualdade estrita === exige o mesmo valor e o mesmo tipo.",
      "O operador && pede que duas condições sejam verdadeiras; || aceita pelo menos uma; ! inverte um valor lógico. Na Kaa, a cabeça encontra a maçã quando as coordenadas x e y coincidem.",
      "Multiplicação, divisão e resto são avaliados antes da adição e subtração. Escreva parênteses para tornar a intenção clara, especialmente ao combinar cálculos com comparações.",
      "Compare o valor numérico 5 com o texto '5'. A expressão 5 === '5' é false. Com !== você testa a desigualdade estrita. Use >= para incluir o limite, por exemplo quando nível 3 já é suficiente.",
      "Você pode prever as condições montando uma tabela curta com valores verdadeiros e falsos. No jogo, ter vidas ou moedas pode permitir continuar. Já a colisão com a maçã exige encaixar as duas coordenadas.",
    ],
    codeExample: "const pontos = 10;\nconst temBonus = false;\nconsole.log(pontos >= 10 && temBonus); // false\nconsole.log(pontos >= 10 || temBonus); // true\nconsole.log(!temBonus); // true",
    practice: [
      {
        id: "escrever-codigo",
        action: "Escreva e exiba o resultado das três expressões do exercício usando &&, || e !.",
        hint: [
          "Use o botão desta tarefa para abrir aula-03.js.",
          "Considere nivel = 5, inimigosDerrotados = 10 e chefeFinalDerrotado = false.",
          "Escreva e teste três condições: nível a partir de 3 e mais de 5 inimigos; nível 10 ou chefe derrotado; chefe ainda não derrotado.",
          "Use Executar JavaScript e confira a saída no console.",
        ].join("\n"),
        check: {
          kind: "code",
          file: ["Arquivos", "aula-03.js"],
          markers: ["&&", "||", "!", "console.log("],
          quickStart: true,
        },
      },
      quiz(
        "Com nivel igual a 5 e inimigosDerrotados igual a 10, qual é o resultado de nivel >= 3 && inimigosDerrotados > 5?",
        ["false", "10", "true"],
        2,
        "As duas comparações são verdadeiras, então o resultado de && é true.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [kaaScript],
  },
  {
    month: 1,
    title: "Estruturas condicionais",
    subtitle: "if, else if, else e switch",
    objective:
      "Escolher qual parte do código executar a partir de uma condição ou de um valor.",
    theory: [
      "O if testa uma condição. Se ela falhar, else if pode testar outra. O bloco else recebe os casos restantes. A sequência executa o primeiro bloco cuja condição for verdadeira.",
      "O switch compara um valor com os casos declarados. O break encerra o caso e default trata os demais valores. Na Kaa, um switch traduz teclas em mudanças de direção ou pausa.",
      "As chaves delimitam o bloco que pertence à condição. Coloque a regra mais específica antes da geral. Se testar pontuação >= 50 antes de pontuação >= 100 em um if/else if, a segunda regra fica inacessível para pontuações altas.",
      "No switch, break encerra o caso. Se ele faltar, o fluxo pode continuar pelas próximas instruções. O default oferece um comportamento para valores inesperados, como um item desconhecido.",
      "Teste três cenários para o nível e pelo menos um item sem case. Alterar a entrada e comparar a saída é uma maneira de testar todos os caminhos.",
    ],
    codeExample: "const direcao = \"cima\";\nswitch (direcao) {\n  case \"cima\":\n    console.log(\"Movendo para cima.\");\n    break;\n  default:\n    console.log(\"Direção desconhecida.\");\n}",
    practice: [
      {
        id: "escrever-codigo",
        action: "Escreva um if com alternativas para os níveis e um switch para os itens coletados.",
        hint: [
          "Use o botão desta tarefa para abrir aula-04.js.",
          "Crie um if/else if/else que mostre mensagens diferentes para os níveis 1, 2 e demais níveis.",
          "Crie um switch para moeda, vida e estrela. Inclua um caso padrão e teste um item desconhecido.",
          "Use Executar JavaScript e confira a saída no console.",
        ].join("\n"),
        check: {
          kind: "code",
          file: ["Arquivos", "aula-04.js"],
          markers: ["if (", "else if", "switch (", "default:", "console.log("],
          quickStart: true,
        },
      },
      quiz(
        "Em um switch, qual bloco pode tratar um item sem case correspondente?",
        ["break", "default", "else if"],
        1,
        "O default cuida dos valores sem um caso correspondente.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [kaaScript],
  },
  {
    month: 2,
    title: "Estruturas de repetição",
    subtitle: "Repetições com while e for",
    objective:
      "Escrever laços que terminam e escolher uma estrutura adequada para cada contagem.",
    theory: [
      "O while repete o bloco enquanto a condição for verdadeira. A variável usada na condição precisa avançar até a saída do laço quando a repetição tiver fim.",
      "O for reúne início, condição e atualização em uma linha. Ele é prático quando você sabe de onde começa e até onde vai, como ao percorrer as partes da cobra pelo índice.",
      "Monte um quadro com o valor inicial, o valor testado e a atualização. No código do exemplo, o primeiro valor é 0, o último é 4 e, após somar 2, o teste falha com 6.",
      "No for, os três campos separam inicialização, condição e atualização. Em uma contagem regressiva, a atualização precisa reduzir o valor. Confira se deseja incluir o último número.",
    ],
    codeExample: "let numero = 0;\nwhile (numero <= 4) {\n  console.log(numero);\n  numero += 2;\n}\nfor (let i = 3; i >= 1; i--) {\n  console.log(i);\n}",
    practice: [
      {
        id: "escrever-codigo",
        action: "Use while para os números pares e for para a contagem regressiva.",
        hint: [
          "Use o botão desta tarefa para abrir aula-05.js.",
          "Use while para exibir todos os pares de 0 a 10 no console.",
          "Use for para exibir os números de 10 a 1 em ordem decrescente. Confira o primeiro e o último número.",
          "Use Executar JavaScript e confira a saída no console.",
        ].join("\n"),
        check: {
          kind: "code",
          file: ["Arquivos", "aula-05.js"],
          markers: ["while (", "for (", "console.log("],
          quickStart: true,
        },
      },
      quiz(
        "Qual atualização leva uma contagem de 10 até 1 quando o contador se chama i?",
        ["i--", "i++", "i = 10"],
        0,
        "i-- diminui o contador em uma unidade a cada repetição.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [kaaScript],
  },
  {
    month: 2,
    title: "Funções, parâmetros e retorno",
    subtitle: "Divida o código em tarefas reutilizáveis",
    objective: "Declarar, chamar e testar funções com argumentos e retornos.",
    theory: [
      "Uma função reúne instruções sob um nome. No jogo, drawSnake() desenha a cobra, drawApple() desenha a maçã e update() muda o estado da partida.",
      "Parâmetros são os nomes das entradas na declaração. Argumentos são os valores informados na chamada. Em multiplicar(3, 4), os argumentos são 3 e 4.",
      "return entrega um valor para quem chamou a função. console.log mostra um valor no console. Você pode guardar o retorno em uma variável ou usá-lo em outra expressão.",
      "O corpo da função só roda quando ela é chamada. Crie a função primeiro, depois faça uma chamada com valores simples para observar a saída.",
      "Separe o cálculo da apresentação. Uma função que devolve o produto pode ser usada para decidir uma condição ou calcular um total. Uma função que imprime se ocupa de exibir o resultado.",
    ],
    codeExample: "function somar(a, b) {\n  return a + b;\n}\nconst total = somar(3, 4);\nconsole.log(total);",
    practice: [
      {
        id: "escrever-codigo",
        action: "Implemente multiplicar e exibirMensagem e chame as duas funções com valores de teste.",
        hint: [
          "Use o botão desta tarefa para abrir aula-06.js.",
          "Crie multiplicar(a, b) e devolva o produto. Teste a função com 3 e 4 e também com 8 e 0.",
          "Crie exibirMensagem(texto) e use console.log para mostrar o texto passado.",
          "Use Executar JavaScript e confira a saída no console.",
        ].join("\n"),
        check: {
          kind: "code",
          file: ["Arquivos", "aula-06.js"],
          markers: ["function multiplicar", "return", "function exibirMensagem", "console.log("],
          quickStart: true,
        },
      },
      quiz(
        "Se multiplicar(a, b) retorna a * b, qual valor posso guardar ao chamar multiplicar(3, 4)?",
        ["3", "4", "12"],
        2,
        "O return entrega o resultado da multiplicação, que neste caso é 12.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [kaaScript],
  },
  {
    month: 2,
    title: "Arrays",
    subtitle: "Armazene e percorra listas",
    objective: "Criar um array, usar índices e adicionar ou remover elementos.",
    theory: [
      "Um array é uma lista ordenada. O primeiro elemento tem índice 0 e length conta quantos elementos existem. Na Kaa, snake[0] é a cabeça e os elementos seguintes formam o corpo.",
      "push adiciona no fim, unshift adiciona no início, pop remove o último e shift remove o primeiro. Use for ou forEach para percorrer a lista.",
      "Escreva os índices de uma lista de cinco itens de 0 a 4. Ao tirar o primeiro com shift, cada item restante passa a ocupar o índice anterior.",
      "No forEach, a função recebe o item atual e pode receber também o índice. Combine os dois para criar uma lista numerada. Essa mesma ideia aparece quando o jogo desenha cada parte da cobra.",
    ],
    codeExample: "const equipe = [\"Lia\", \"Ana\", \"João\"];\nequipe.push(\"Caio\");\nequipe.shift();\nequipe.forEach((nome, indice) => console.log(indice + 1, nome));",
    practice: [
      {
        id: "escrever-codigo",
        action: "Adicione e retire nomes da lista e mostre os nomes restantes no console.",
        hint: [
          "Use o botão desta tarefa para abrir aula-07.js.",
          "Crie um array com cinco nomes. Adicione um nome ao final e remova o primeiro.",
          "Exiba a lista atualizada com for ou forEach e confira o tamanho final.",
          "Use push para inserir e shift para remover.",
          "Use Executar JavaScript e confira a saída no console.",
        ].join("\n"),
        check: {
          kind: "code",
          file: ["Arquivos", "aula-07.js"],
          markers: [".push(", ".shift(", "console.log("],
          quickStart: true,
        },
      },
      quiz(
        "Qual método remove o primeiro item de um array?",
        ["pop()", "shift()", "push()"],
        1,
        "shift() remove o elemento na primeira posição.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [kaaScript],
  },
  {
    month: 2,
    title: "Objetos e JSON",
    subtitle: "Agrupe informações em propriedades",
    objective:
      "Criar e alterar objetos JavaScript e reconhecer a sintaxe de JSON.",
    theory: [
      "Objetos reúnem valores com nomes. A maçã da Kaa tem propriedades x e y. O Scout Plat agrupa nome, pontuação e personagem em um objeto para representar a partida atual.",
      "Use livro.titulo para ler uma propriedade e livro.anoPublicacao = 2026 para definir um novo valor. Você também pode usar colchetes, como livro['titulo'].",
      "JSON é um formato de texto para trocar dados. Em JSON, os nomes das propriedades e os textos usam aspas duplas. JSON.stringify transforma dados em texto e JSON.parse lê texto JSON válido.",
      "A notação com ponto funciona quando você sabe o nome da propriedade. Use colchetes quando esse nome estiver armazenado em uma variável. O mesmo objeto pode combinar números, textos e listas.",
      "JSON é útil para salvar ou compartilhar apenas dados. Experimente exibir o retorno de JSON.stringify e depois ler o texto com JSON.parse. Uma aspa ou vírgula sobrando torna o texto JSON inválido.",
    ],
    codeExample: "const jogador = { nome: \"Lia\", pontos: 0 };\njogador.pontos = 3;\nconst salvo = JSON.stringify(jogador);\nconsole.log(salvo);\nconsole.log(JSON.parse(salvo).pontos);",
    practice: [
      {
        id: "escrever-codigo",
        action: "Crie e altere o objeto livro e mostre sua versão em JSON.",
        hint: [
          "Use o botão desta tarefa para abrir aula-08.js.",
          "Crie um objeto livro com titulo, autor e anoPublicacao. Exiba o título, mude o ano e acrescente genero.",
          "Use JSON.stringify para mostrar o objeto em formato JSON.",
          "Use Executar JavaScript e confira a saída no console.",
        ].join("\n"),
        check: {
          kind: "code",
          file: ["Arquivos", "aula-08.js"],
          markers: ["titulo", "anoPublicacao", "genero", "JSON.stringify("],
          quickStart: true,
        },
      },
      quiz(
        "Qual trecho é JSON válido?",
        ['{"titulo":"Manual"}', "{titulo: 'Manual'}", '{"titulo":"Manual",}'],
        0,
        "Em JSON, as chaves são textos entre aspas duplas e a última propriedade fica sem vírgula.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [kaaScript, scoutScript],
  },
  {
    month: 3,
    title: "Introdução ao HTML",
    subtitle: "Estruture texto, imagens e links",
    objective: "Criar uma página HTML com título, descrição, imagem e link.",
    theory: [
      "HTML descreve a estrutura da página. A declaração <!DOCTYPE html> identifica o documento. Dentro de html, head contém configurações e body reúne o conteúdo visível.",
      "Use h1 para o título principal e p para um parágrafo. Em img, src aponta para a imagem e alt a descreve. Em a, href aponta para o destino do link.",
      "Tags descrevem o papel do conteúdo. O navegador mostra o texto entre <h1> e </h1> como o título principal. Elementos como img recebem atributos e não têm tag de fechamento.",
      "Use lang=\"pt-BR\" e meta charset=\"utf-8\" para indicar idioma e codificação. Um caminho relativo, como imagens/foto.png, aponta para um arquivo em relação ao HTML.",
    ],
    codeExample: "<!doctype html>\n<html lang=\"pt-BR\">\n  <head><meta charset=\"utf-8\"><title>Meu portfólio</title></head>\n  <body>\n    <h1>Minha trilha de programação</h1>\n    <p>Conheça os projetos que estou construindo.</p>\n  </body>\n</html>",
    tool: "arquivos",
    practice: [
      {
        id: "criar-pasta-portfolio",
        action: `Crie a pasta ${programmingPortfolio} na Área de trabalho.`,
        check: { kind: "entry", path: [programmingPortfolio], entry: "folder" },
      },
      {
        id: "escrever-codigo",
        action: "Crie index.html na pasta do portfólio e escreva o título, a apresentação, uma imagem e um link.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie index.html se ele ainda não existir.",
          "Em uma pasta para seu portfólio, crie index.html com a estrutura básica da página.",
          "Inclua um h1 com seu nome de apresentação, um parágrafo, uma imagem com texto alternativo e um link. Abra o arquivo no navegador.",
          "Confira o resultado com a Prévia HTML e CSS.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "index.html"],
          markers: ["<h1", "<p", "<img", "<a", "alt=", "href="],
        },
      },
      quiz(
        "Em um link HTML, qual atributo indica o endereço de destino?",
        ["alt", "src", "href"],
        2,
        "href indica para onde o navegador vai ao abrir o link.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [portfolioHtml, download],
  },
  {
    month: 3,
    title: "Introdução ao CSS",
    subtitle: "Cores, fontes e modelo de caixa",
    objective:
      "Vincular uma folha CSS e alterar a aparência de texto e imagem.",
    theory: [
      'Uma regra CSS seleciona elementos e aplica propriedades. Um seletor como h1 escolhe títulos desse tipo. A tag link com rel="stylesheet" vincula o arquivo CSS ao HTML.',
      "No modelo de caixa, padding afasta o conteúdo da borda, border desenha a borda e margin cria espaço externo. Use color para o texto, background-color para o fundo e font-family para a fonte.",
      "Cada regra tem um seletor e declarações entre chaves. Uma declaração combina uma propriedade e um valor, por exemplo color: #163d32. Use espaços e recuos para reconhecer onde começa cada regra.",
      "Compare padding e margin mudando um valor por vez. O padding faz parte da caixa interna. A margem cria espaço entre caixas, útil para afastar os cartões do portfólio.",
    ],
    codeExample: "<!-- No head do index.html -->\n<link rel=\"stylesheet\" href=\"style.css\">\n\n/* No arquivo style.css */\nbody { background: #f1f7f0; }\nh1 { color: #163d32; }\nimg { border: 1px solid #163d32; padding: 8px; }",
    tool: "arquivos",
    practice: [
      {
        id: "vincular-arquivo",
        action: "No index.html, vincule style.css.",
        hint: "Use <link> com href=\"style.css\".",
        check: { kind: "code", file: [programmingPortfolio, "index.html"], markers: ["<link", "href=\"style.css\""] },
      },
      {
        id: "escrever-codigo",
        action: "Crie style.css e ajuste o fundo, o título e o preenchimento da imagem.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie style.css se ele ainda não existir.",
          "Crie um arquivo CSS e vincule-o ao index.html da aula anterior.",
          "Mude o fundo da página, a cor e a fonte do h1. Aplique borda e padding à imagem e confira o resultado.",
          "Confira o resultado com a Prévia HTML e CSS.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "style.css"],
          markers: ["body", "background", "h1", "padding"],
        },
      },
      quiz(
        "Qual propriedade cria espaço entre o conteúdo e a borda do elemento?",
        ["margin", "padding", "color"],
        1,
        "O padding é o espaço interno da caixa, antes da borda.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [portfolioHtml, portfolioCss],
  },
  {
    month: 3,
    title: "Layout com CSS Flexbox",
    subtitle: "Organize elementos em uma linha ou coluna",
    objective:
      "Distribuir cartões no contêiner usando as propriedades do Flexbox.",
    theory: [
      "display: flex torna os filhos diretos de um elemento itens flexíveis. flex-direction determina o eixo principal e gap controla o espaço entre os itens.",
      "justify-content distribui os itens no eixo principal e align-items os alinha no eixo transversal. Use flex-wrap quando quiser permitir que os elementos quebrem para outra linha.",
      "Aplique display: flex ao pai dos elementos que você quer organizar. Com flex-direction: row, o eixo principal é horizontal. Ao mudar para column, justify-content passa a distribuir os itens verticalmente.",
      "Compare center e space-between com três cartões. gap define uma folga constante e flex-wrap permite uma nova linha quando faltar largura.",
    ],
    codeExample: ".projetos {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: space-between;\n  gap: 1rem;\n}",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Use Flexbox no contêiner dos cartões e teste duas distribuições no navegador de prévia.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie style.css se ele ainda não existir.",
          "Crie um contêiner com três caixas. Use display: flex e centralize-as na horizontal.",
          "Experimente justify-content: space-between e compare o espaçamento. Reduza a largura da janela e observe.",
          "Confira o resultado com a Prévia HTML e CSS.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "style.css"],
          markers: ["display: flex", "justify-content:"],
        },
      },
      quiz(
        "Qual propriedade distribui os itens no eixo principal do Flexbox?",
        ["justify-content", "align-items", "font-family"],
        0,
        "justify-content organiza a distribuição ao longo do eixo principal.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [portfolioCss],
  },
  {
    month: 3,
    title: "Estruturando o portfólio",
    subtitle: "Monte a primeira versão do site pessoal",
    objective:
      "Combinar HTML e CSS para organizar a apresentação, habilidades, projetos e contato.",
    theory: [
      "O portfólio piloto usa header e nav no topo, main para o conteúdo e section para dividir Sobre mim, Habilidades, Projetos e Contato. O CSS ajuda a separar visualmente essas áreas.",
      'Um link com href="#projetos" leva à seção com id="projetos". Os identificadores da página precisam ser únicos e corresponder ao destino do menu.',
      "Estruture a navegação com nav e reserve main para o conteúdo principal. Em cada section, um h2 descreve o assunto. Essa hierarquia ajuda quem lê a página e quem navega com tecnologia assistiva.",
      "Crie o menu apontando para identificadores de seção. A etiqueta do link pode ter acentos e espaços, enquanto um id curto e único facilita manter o href correspondente.",
    ],
    codeExample: "<nav><a href=\"#projetos\">Projetos</a></nav>\n<main>\n  <section id=\"projetos\">\n    <h2>Projetos</h2>\n    <p>Aqui vou apresentar meus jogos.</p>\n  </section>\n</main>",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Organize o portfólio com menu, apresentação, habilidades, projetos e contato.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie index.html se ele ainda não existir.",
          "Complete o portfólio com apresentação, habilidades, espaço para os jogos e um contato apropriado para publicação.",
          "Escolha cores e fontes legíveis. Clique em cada link do menu para confirmar que ele leva à seção correspondente.",
          "Use id=\"projetos\" na seção dos jogos e href=\"#projetos\" em seu link no menu.",
          "Confira o resultado com a Prévia HTML e CSS.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "index.html"],
          markers: ["<nav", "<main", "<section", "#projetos"],
        },
      },
      quiz(
        'Para qual id aponta o link href="#habilidades"?',
        ["#habilidades", "nav", "habilidades"],
        2,
        "O # inicia o fragmento no endereço. O valor do atributo id é habilidades.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [portfolioHtml, portfolioCss, download],
  },
  {
    month: 4,
    title: "JavaScript e o DOM",
    subtitle: "Encontre os elementos da página",
    objective:
      "Vincular um script ao HTML e selecionar elementos por id e classe.",
    theory: [
      "O DOM representa a página como elementos que o JavaScript pode consultar e alterar. Use getElementById('tituloPrincipal') para buscar um elemento por id e querySelector('.textoDestaque') para buscar o primeiro com essa classe.",
      "Carregue o script depois do conteúdo ou use defer em um script externo no head. Assim o HTML já estará disponível quando a seleção ocorrer. Uma seleção sem resultado devolve null.",
      "Depois de interpretar o HTML, o navegador cria uma árvore de elementos. querySelector sobe e desce por essa estrutura conforme o seletor e devolve o primeiro resultado. getElementById recebe somente o id, sem #.",
      "Leia o console quando o resultado for null. Confira o seletor e o momento da execução. Carregar com defer faz um script externo esperar a leitura do HTML.",
    ],
    codeExample: "const titulo = document.getElementById(\"tituloPrincipal\");\nconst destaque = document.querySelector(\".textoDestaque\");\nconsole.log(titulo?.textContent, destaque?.textContent);",
    tool: "arquivos",
    practice: [
      {
        id: "vincular-arquivo",
        action: "No index.html, vincule script.js.",
        hint: "Use <script> com src=\"script.js\".",
        check: { kind: "code", file: [programmingPortfolio, "index.html"], markers: ["<script", "src=\"script.js\""] },
      },
      {
        id: "escrever-codigo",
        action: "Crie script.js para selecionar um elemento pelo id e outro pela classe.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie script.js se ele ainda não existir.",
          "Crie um h1 com id tituloPrincipal e um p com a classe textoDestaque. Vincule um arquivo JavaScript.",
          "Selecione os dois elementos e exiba-os no console. Em seguida, teste com um seletor que não existe.",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "script.js"],
          markers: ["getElementById(", "querySelector("],
        },
      },
      quiz(
        "Qual seletor busca o primeiro elemento com a classe textoDestaque?",
        ["#textoDestaque", ".textoDestaque", "textoDestaque"],
        1,
        "Um ponto antes do nome indica seleção por classe.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [portfolioHtml, portfolioScript],
  },
  {
    month: 4,
    title: "Eventos no navegador",
    subtitle: "Responda a cliques e movimentos do ponteiro",
    objective:
      "Usar addEventListener para executar funções quando a pessoa interagir com a página.",
    theory: [
      "Um evento sinaliza algo que aconteceu, como click, keydown ou input. addEventListener associa um tipo de evento a uma função que será chamada quando o evento acontecer.",
      "No portfólio piloto, o clique no botão de saudação altera o texto exibido na página. Para testar a passagem do mouse, use mouseover e mouseout; para ações principais, também ofereça uma forma de usar o teclado.",
      "Passe uma função como segundo argumento. Ao usar responder() ali, você chama a função imediatamente e passa o retorno no lugar dela. Ao passar responder, o navegador pode chamá-la quando o evento ocorrer.",
      "Teste a passagem do mouse em um cartão. Em um botão de saudação, use click para que a ação também possa ser usada com Enter ou Espaço.",
    ],
    codeExample: "const cartao = document.querySelector(\".cartao\");\ncartao?.addEventListener(\"mouseover\", () => {\n  cartao.style.backgroundColor = \"#e5f0e8\";\n});\ncartao?.addEventListener(\"mouseout\", () => {\n  cartao.style.backgroundColor = \"\";\n});",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Adicione ouvintes para mudar e restaurar a cor de um elemento do portfólio.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie script.js se ele ainda não existir.",
          "Crie uma div com id minhaDiv. Use mouseover para mudar a cor do fundo ao passar o mouse.",
          "Use mouseout para restaurar a cor. No portfólio, teste também um botão com click.",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "script.js"],
          markers: ["addEventListener(", "mouseover", "mouseout"],
        },
      },
      quiz(
        "Em addEventListener('click', responder), quando responder é executada?",
        [
          "Quando o clique alcança o elemento.",
          "Assim que o ouvinte é cadastrado.",
          "Antes de o HTML carregar.",
        ],
        0,
        "O navegador guarda a função e a chama quando ocorre o evento indicado.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [portfolioScript],
  },
  {
    month: 4,
    title: "Manipulando o CSS com JavaScript",
    subtitle: "Mostre e esconda elementos com classes",
    objective: "Criar uma interação que alterna uma classe CSS no DOM.",
    theory: [
      "O JavaScript pode alterar um estilo diretamente com element.style. Para um estado visual, defina a regra no CSS e use classList.add, classList.remove ou classList.toggle no código.",
      "classList.toggle alterna entre presença e ausência de uma classe. O portfólio combina eventos de clique com classes e atributos para controlar a abertura do menu em telas pequenas.",
      "Declare o comportamento visual no CSS e altere a classe no JavaScript. Assim, o mesmo estilo pode ser reaproveitado por outros elementos.",
      "Para um controle que expande um bloco, atualize aria-expanded no botão. O valor deve acompanhar o estado visível do bloco.",
    ],
    codeExample: "botao.addEventListener(\"click\", () => {\n  const oculto = mensagem.classList.toggle(\"escondido\");\n  botao.setAttribute(\"aria-expanded\", String(!oculto));\n});",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Ligue um botão a um trecho do portfólio que pode aparecer e desaparecer.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie script.js se ele ainda não existir.",
          "Crie um botão e um parágrafo. Defina uma classe escondido com display: none.",
          "No clique, aplique classList.toggle('escondido') ao parágrafo. Teste dois cliques seguidos.",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "script.js"],
          markers: ["classList.toggle("],
        },
      },
      quiz(
        "O que toggle('escondido') faz quando a classe já está no elemento?",
        [
          "Adiciona uma cópia da classe.",
          "Apaga o elemento.",
          "Remove a classe.",
        ],
        2,
        "toggle remove a classe presente e adiciona a classe ausente.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [portfolioScript, portfolioCss],
  },
  {
    month: 4,
    title: "Responsividade do portfólio",
    subtitle: "Ajuste a página para diferentes telas",
    objective:
      "Testar o portfólio em diferentes larguras e adaptar o layout com media queries.",
    theory: [
      "Um layout responsivo se adapta ao espaço disponível. A configuração viewport no HTML ajuda o navegador do celular a usar a largura do dispositivo.",
      "Uma media query como @media (max-width: 600px) ativa regras em telas de até 600 pixels CSS. Você pode empilhar os cartões, mudar a disposição do menu ou ajustar o espaçamento conforme a necessidade.",
      "Defina o ponto de mudança observando onde o conteúdo começa a ficar apertado. Um valor fixo como 600px funciona neste exercício, mas outros portfólios podem precisar de outro limite.",
      "Evite larguras maiores que a área visível. Combine max-width: 100% em imagens com flex-wrap nos cartões. Confira se o texto continua legível após a mudança.",
    ],
    codeExample: "@media (max-width: 600px) {\n  .projetos { flex-direction: column; }\n  img { max-width: 100%; height: auto; }\n}",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Adicione uma media query e teste a disposição do portfólio em larguras diferentes.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie style.css se ele ainda não existir.",
          "Abra o portfólio em uma janela larga e depois reduza a largura. Procure rolagem horizontal, texto cortado ou cartões apertados.",
          "Use uma media query para corrigir um problema e confirme que o menu continua funcionando com mouse, teclado e toque quando disponível.",
          "Use max-width na condição, por exemplo @media (max-width: 600px).",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "style.css"],
          markers: ["@media", "max-width"],
        },
      },
      quiz(
        "Em que situação @media (max-width: 600px) aplica suas regras?",
        [
          "Quando a página tem exatamente 600 palavras.",
          "Quando a área de visualização tem até 600 pixels CSS de largura.",
          "Somente quando a largura ultrapassa 600 pixels CSS.",
        ],
        1,
        "max-width é o limite superior da largura que ativa a regra.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [portfolioHtml, portfolioCss, portfolioScript],
  },
  {
    month: 5,
    title: "Introdução ao Canvas",
    subtitle: "Desenhe formas com JavaScript",
    objective:
      "Obter o contexto 2D do canvas e desenhar um retângulo e caminhos preenchidos.",
    theory: [
      "A tag canvas reserva uma área de desenho. getContext('2d') fornece os métodos para desenhar. A origem das coordenadas fica no canto superior esquerdo, com x aumentando para a direita e y para baixo.",
      "Defina fillStyle antes de chamar fillRect. Para formas feitas com caminhos, comece com beginPath, descreva as linhas com moveTo e lineTo ou use arc para círculos, depois aplique fill.",
      "Defina width e height como atributos do canvas, pois essas medidas determinam sua área interna de desenho. A largura definida apenas por CSS pode esticar o desenho existente.",
      "Cada forma usa o estado atual do contexto. Chame beginPath para iniciar um novo caminho e closePath para fechar o triângulo antes de preencher.",
    ],
    codeExample: "const tela = document.querySelector(\"canvas\");\nconst ctx = tela.getContext(\"2d\");\nctx.fillStyle = \"blue\";\nctx.fillRect(20, 20, 80, 80);\nctx.beginPath();\nctx.arc(160, 60, 24, 0, Math.PI * 2);\nctx.fill();",
    tool: "arquivos",
    practice: [
      {
        id: "vincular-arquivo",
        action: "No jogoKaa.html, vincule kaa.js e adicione um canvas.",
        hint: "Use <script> com src=\"kaa.js\".",
        check: { kind: "code", file: [programmingPortfolio, "jogoKaa.html"], markers: ["<script", "src=\"kaa.js\"", "<canvas"] },
      },
      {
        id: "escrever-codigo",
        action: "Vincule kaa.js a jogoKaa.html. Desenhe as três formas no Canvas.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie kaa.js se ele ainda não existir.",
          "Crie um HTML com canvas e obtenha seu contexto 2D no JavaScript.",
          "Desenhe um quadrado azul, um círculo vermelho e um triângulo verde. Ajuste as posições para que as três formas fiquem visíveis.",
          "Use fillRect para o quadrado, arc para o círculo e moveTo e lineTo para o triângulo.",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "kaa.js"],
          markers: ["getContext(", "fillRect(", ".arc(", ".moveTo(", ".lineTo("],
        },
      },
      quiz(
        "Para mover um desenho para baixo no canvas, o que normalmente muda?",
        [
          "O valor de x aumenta.",
          "O valor de x diminui.",
          "O valor de y aumenta.",
        ],
        2,
        "O eixo y cresce de cima para baixo no canvas.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [kaaHtml, kaaScript, download],
  },
  {
    month: 5,
    title: "Estrutura do Jogo da Kaa",
    subtitle: "Estado, grade e loop de jogo",
    objective:
      "Definir o estado inicial e separar atualização de desenho em um loop.",
    theory: [
      "O estado do jogo reúne a lista de segmentos da cobra, a posição da maçã, as velocidades nos dois eixos, a pontuação e a pausa. O tamanho da célula, gridSize, faz a ligação entre grade e pixels.",
      "A posição 3 em uma grade de células de 20 pixels corresponde ao pixel 60. update() altera posições; draw() limpa e redesenha a cena. No piloto, gameLoop agenda o próximo passo com setTimeout.",
      "Guarde a posição em células. Converta para pixels no desenho. Assim a lógica de colisão continua a mesma quando o tamanho visual da grade muda.",
      "Agende apenas o próximo passo do jogo. Começar dois loops na mesma partida faz o estado avançar duas vezes no intervalo esperado.",
    ],
    codeExample: "function loop() {\n  update();\n  draw();\n  setTimeout(loop, 120);\n}\nloop();",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Separe o estado inicial, a atualização e o desenho do Jogo da Kaa.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie kaa.js se ele ainda não existir.",
          "Defina gridSize, tileCount, snake, apple, xVelocity, yVelocity, score e isPaused no seu projeto Kaa.",
          "Crie draw() para mostrar a cobra e a maçã. Faça update() alterar temporariamente a posição x e a pontuação para testar o loop.",
          "Agende o próximo ciclo com setTimeout.",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "kaa.js"],
          markers: ["gridSize", "tileCount", "function update", "function draw", "setTimeout("],
        },
      },
      quiz(
        "Com gridSize igual a 20, qual é a coordenada em pixels da coluna 3?",
        ["20", "60", "23"],
        1,
        "Multiplique a coordenada da grade pelo tamanho da célula: 3 × 20 = 60.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [kaaHtml, kaaScript],
  },
  {
    month: 5,
    title: "Desenhando a Kaa e a maçã",
    subtitle: "Represente o estado no canvas",
    objective:
      "Percorrer os segmentos da cobra e desenhar o alimento na posição da grade.",
    theory: [
      "Cada segmento da cobra é um objeto com x e y. drawSnake() percorre a lista e transforma as coordenadas de cada segmento em pixels. Você pode usar outra cor para destacar a cabeça.",
      "drawApple() usa a posição de um único objeto. Antes de chamar as funções de desenho, limpe a cena com clearRect, evitando que posições antigas fiquem na tela.",
      "Os segmentos são objetos com posição, então o mesmo desenho vale para uma cobra de qualquer comprimento. A cabeça é o primeiro item e pode receber uma cor diferente.",
      "Defina uma posição conhecida para a maçã enquanto estiver conferindo o desenho. Isso facilita perceber se trocou os eixos ou esqueceu de multiplicar pelo tamanho da célula.",
    ],
    codeExample: "function desenharCelula({ x, y }, cor) {\n  ctx.fillStyle = cor;\n  ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);\n}",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Desenhe cada segmento da cobra e a maçã com as coordenadas da grade.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie kaa.js se ele ainda não existir.",
          "Implemente drawSnake() e drawApple(). Chame as duas funções dentro de draw().",
          "Teste com uma cobra de três segmentos e uma maçã em outra célula. Troque as cores e confira se a posição permanece igual.",
          "Use clearRect no início de draw() para apagar o desenho anterior.",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "kaa.js"],
          markers: ["drawSnake(", "drawApple(", "clearRect("],
        },
      },
      quiz(
        "Qual método apaga o desenho anterior de uma região do canvas?",
        ["clearRect()", "fillRect()", "addEventListener()"],
        0,
        "clearRect() limpa a região para o próximo desenho.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [kaaScript],
  },
  {
    month: 5,
    title: "Movimentação da Kaa pelo teclado",
    subtitle: "Use as setas para mudar a direção",
    objective:
      "Ler eventos de teclado e atualizar o vetor de movimento da cobra.",
    theory: [
      "O evento keydown informa qual tecla foi pressionada. Um switch pode reagir a ArrowUp, ArrowDown, ArrowLeft e ArrowRight, alterando xVelocity e yVelocity.",
      "Subir diminui y. Andar para a direita aumenta x. Ajuste os dois eixos ao mudar de direção e bloqueie a inversão imediata quando ela levar a cabeça ao corpo. No piloto, espaço alterna a pausa.",
      "O vetor de direção soma um deslocamento à cabeça a cada passo. Em um movimento na horizontal, mantenha o deslocamento vertical em zero.",
      "Se a partida já tem corpo, rejeite uma direção que volte imediatamente sobre ele. Trate também a rolagem padrão das setas quando o jogo estiver focado.",
    ],
    codeExample: "document.addEventListener(\"keydown\", (evento) => {\n  if (evento.key === \"ArrowUp\" && yVelocity !== 1) {\n    xVelocity = 0;\n    yVelocity = -1;\n  }\n});",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Controle a direção pelas quatro setas e confira os vetores de movimento.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie kaa.js se ele ainda não existir.",
          "Adicione um ouvinte keydown para as quatro setas. Atualize as velocidades conforme a direção escolhida.",
          "Teste cada seta e tente inverter o sentido imediatamente. Se já tiver a função de pausa, ligue-a à barra de espaço.",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "kaa.js"],
          markers: ["keydown", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"],
        },
      },
      quiz(
        "Em uma grade com y crescente para baixo, qual par (xVelocity, yVelocity) move a cobra para cima?",
        ["(1, 0)", "(0, 1)", "(0, -1)"],
        2,
        "A coordenada x fica igual e a coordenada y diminui a cada passo.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [kaaScript],
  },
  {
    month: 6,
    title: "Crescimento da Kaa",
    subtitle: "Coma a maçã e altere o tamanho da cobra",
    objective:
      "Mover a cabeça, conservar a cauda na coleta e reposicionar a maçã.",
    theory: [
      "A cada passo, o jogo calcula uma nova cabeça e a coloca no início do array com unshift. Em movimento normal, pop remove a cauda e o tamanho permanece igual.",
      "Quando x e y da cabeça coincidem com os da maçã, preserve a cauda para crescer e sorteie outra posição para o alimento. Como melhoria, descarte posições já ocupadas pela cobra.",
      "Calcule uma cabeça nova antes de alterar a lista. Se a célula contém a maçã, mantenha a cauda. Caso contrário, remover a cauda desloca a cobra sem alterar o tamanho.",
      "Math.random devolve um valor a partir de zero e menor que um. Multiplique pelo total de células e aplique Math.floor para obter um índice válido.",
    ],
    codeExample: "const coluna = Math.floor(Math.random() * tileCount);\nconst ocupada = snake.some((parte) => parte.x === coluna && parte.y === linha);",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Faça a Kaa crescer e reposicione a maçã depois de cada coleta.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie kaa.js se ele ainda não existir.",
          "Adicione a nova cabeça a cada ciclo e remova a cauda apenas quando a cobra não comer.",
          "Posicione uma maçã no caminho, teste o crescimento e confira onde a próxima maçã aparece.",
          "Use unshift para inserir a cabeça, pop para tirar a cauda e Math.random para escolher a célula da maçã.",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "kaa.js"],
          markers: [".unshift(", ".pop(", "Math.random("],
        },
      },
      quiz(
        "Depois de acrescentar a nova cabeça, como obter um segmento a mais na coleta?",
        [
          "Remover a cauda duas vezes.",
          "Manter a cauda nesse passo.",
          "Voltar a cabeça à posição anterior.",
        ],
        1,
        "O array fica um elemento maior quando você adiciona a cabeça e mantém a cauda.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [kaaScript],
  },
  {
    month: 6,
    title: "Pontuação e som no Jogo da Kaa",
    subtitle: "Dê retorno quando a maçã for coletada",
    objective:
      "Atualizar a pontuação na tela e reproduzir um efeito sonoro na coleta.",
    theory: [
      "A pontuação é uma variável do jogo. Ao coletar, some um ponto e copie o valor para o textContent do elemento de placar. Ao reiniciar, atualize tanto a variável quanto a tela.",
      "O código do piloto cria um Audio para o som da coleta. Reproduza o som uma vez quando a coleta for detectada. Uma interação para iniciar o jogo ajuda o navegador a autorizar a reprodução.",
      "O placar visível é uma representação da pontuação. Atualize a variável e escreva o valor no elemento do HTML quando a pontuação mudar, incluindo o reinício.",
      "O navegador pode recusar áudio antes da primeira interação. Trate a resposta de play para que a partida continue mesmo se o som não estiver disponível.",
    ],
    codeExample: "score += 1;\nplacar.textContent = String(score);\nvoid somColeta.play().catch(() => {});",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Atualize o placar e acione um som quando a maçã for coletada.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie kaa.js se ele ainda não existir.",
          "Adicione um elemento de pontuação ao HTML e atualize-o a cada maçã coletada.",
          "Use o efeito sonoro do projeto ou outro que você possa usar. Teste duas coletas e confirme que o som e o placar só mudam no momento da coleta.",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "kaa.js"],
          markers: ["score", "textContent", ".play("],
        },
      },
      quiz(
        "Em qual situação a pontuação deve aumentar?",
        [
          "Quando a cabeça e a maçã têm a mesma posição.",
          "Toda vez que draw() é executada.",
          "Quando a partida está pausada.",
        ],
        0,
        "A alteração pertence ao evento de coleta detectado na atualização.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [kaaHtml, kaaScript, effects],
  },
  {
    month: 6,
    title: "Colisões no Jogo da Kaa",
    subtitle: "Detecte o fim da partida",
    objective:
      "Verificar a colisão com o corpo e decidir a regra das bordas do tabuleiro.",
    theory: [
      "A cabeça está no índice 0. Compare as duas coordenadas da cabeça com as de cada segmento a partir do índice 1. Uma posição repetida indica uma colisão com o próprio corpo.",
      "Ao ultrapassar a borda, o piloto reaparece do lado oposto. Em sua versão, você pode manter essa regra ou encerrar a partida ao sair da grade. Teste uma regra por vez.",
      "Compare x e y na mesma célula. Compartilhar apenas a coluna ou apenas a linha não é suficiente para indicar colisão.",
      "A decisão sobre as bordas muda como você atualiza a coordenada. Faça dois testes separados: tocar o corpo e ultrapassar a última coluna.",
    ],
    codeExample: "const cabeca = snake[0];\nconst colidiu = snake.slice(1).some((parte) =>\n  parte.x === cabeca.x && parte.y === cabeca.y\n);",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Detecte colisão entre a cabeça e o corpo e escolha uma regra para as bordas.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie kaa.js se ele ainda não existir.",
          "Implemente gameOver() para verificar se a cabeça ocupa uma célula do corpo e use seu retorno no loop.",
          "Escolha atravessar pelas bordas ou encerrar a partida nelas. Teste uma colisão com o corpo e uma saída pela borda.",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "kaa.js"],
          markers: ["gameOver(", "return"],
        },
      },
      quiz(
        "Por que comparar a cabeça com o corpo a partir do índice 1?",
        [
          "Porque o primeiro índice é sempre vazio.",
          "Porque o índice 0 contém a própria cabeça.",
          "Porque a última célula nunca é ocupada.",
        ],
        1,
        "Comparar a cabeça consigo mesma sempre daria colisão.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [kaaScript],
  },
  {
    month: 6,
    title: "Finalizando o Jogo da Kaa",
    subtitle: "Telas de início, pausa e fim de jogo",
    objective:
      "Organizar a transição entre os estados e reiniciar a partida com os valores iniciais.",
    theory: [
      "As telas inicial e final explicam o que o jogador pode fazer. No piloto, botões de início e nova partida chamam funções que mostram ou escondem essas telas.",
      "A pausa mantém o estado e suspende a atualização do jogo. Ao iniciar outra partida, restaure as posições, o placar e a direção. Confirme que só existe um loop atualizando a partida.",
      "Deixe claras as transições entre início, partida, pausa e fim. É útil atualizar posições somente no estado de partida, mantendo a tela legível quando o jogo para.",
      "Ao reiniciar, redefina direção, pontuação, cobra, maçã e pausa. Confira que o loop anterior foi interrompido para não acelerar a próxima rodada.",
    ],
    codeExample: "<section id=\"startScreen\">\n  <h1>Jogo da Kaa</h1>\n  <button id=\"startGameButton\">Começar</button>\n</section>",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Adicione telas de início e fim de jogo e conecte os botões ao script da Kaa.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie jogoKaa.html se ele ainda não existir.",
          "Crie as telas inicial e final com botões de início e reinício. Mostre a pontuação final.",
          "Ligue os botões aos eventos de clique e mostre um aviso quando a partida estiver pausada.",
          "Teste iniciar, pausar, retomar, perder e jogar novamente. Verifique o placar e a velocidade após reiniciar.",
          "Use startScreen e gameOverScreen como IDs dessas telas.",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "jogoKaa.html"],
          markers: ["startScreen", "gameOverScreen", "<button"],
        },
      },
      quiz(
        "Ao pausar a partida, qual comportamento preserva o jogo?",
        [
          "Zerar a pontuação.",
          "Criar mais um loop.",
          "Manter as posições e suspender as atualizações.",
        ],
        2,
        "Pausar mantém o estado para que a partida possa continuar de onde parou.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [kaaHtml, kaaScript, kaaCss, download],
  },
  {
    month: 7,
    title: "Classes e objetos",
    subtitle: "Introdução à orientação a objetos",
    objective:
      "Criar instâncias com propriedades e métodos a partir de uma mesma classe.",
    theory: [
      "Uma classe descreve características e comportamentos que seus objetos compartilham. Uma instância criada com new guarda seus próprios valores. Scout Plat usa classes como Player e Floor para reunir estado e lógica.",
      "O constructor inicia as propriedades de cada instância. Um método pode ler propriedades usando this, que se refere ao objeto que está executando aquele método.",
      "O construtor recebe os dados iniciais e escreve as propriedades com this. A classe define os métodos que podem ser usados em cada instância.",
      "Crie dois objetos com nomes diferentes e teste o mesmo método. O resultado muda porque this aponta para o objeto que invocou o método.",
    ],
    codeExample: "class Patrulha {\n  constructor(nome) { this.nome = nome; }\n  apresentar() { return `Patrulha ${this.nome}`; }\n}\nconsole.log(new Patrulha(\"Lobo\").apresentar());",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Escreva a classe Animal e crie duas instâncias para treinar antes do Scout Plat.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie objetos.js se ele ainda não existir.",
          "Crie uma classe Animal com propriedades nome e especie e um método emitirSom() que exiba uma mensagem.",
          "Instancie um cachorro e um gato com valores diferentes. Chame o método de cada objeto.",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "objetos.js"],
          markers: ["class Animal", "constructor(", "new Animal("],
        },
      },
      quiz(
        "Qual palavra cria uma instância em new Animal('Luna', 'gato')?",
        ["class", "new", "return"],
        1,
        "new cria um objeto e chama seu construtor.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [scoutScript, download],
  },
  {
    month: 7,
    title: "Criando a classe Player",
    subtitle: "Posição, velocidade, vida e dimensões",
    objective:
      "Representar as propriedades do jogador em uma classe com um construtor.",
    theory: [
      "Player reúne a posição x e y, as velocidades, as dimensões e os pontos de vida. Use argumentos para valores que podem variar entre instâncias e valores iniciais para propriedades como hp e velocidade.",
      "Estados booleanos como isJump e isOnFloor ajudam a saber se o personagem está no ar ou apoiado. No Scout Plat, movimento e colisão consultam e atualizam esses valores.",
      "Separe propriedades escolhidas no construtor das que têm um padrão para todo jogador. A posição pode depender do cenário, enquanto a vida inicial pode começar em 100.",
      "As dimensões ajudam no desenho e na colisão. Mantenha a mesma unidade em posições, velocidades e tamanhos sempre que for compará-los.",
    ],
    codeExample: "class Player {\n  constructor(x, y) {\n    this.x = x;\n    this.y = y;\n    this.hp = 100;\n  }\n}",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Crie a classe Player e inicialize suas propriedades.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie scout-plat.js se ele ainda não existir.",
          "Crie Player com character, x, y, width, height e hp. Adicione xVelocity, yVelocity, isJump e isOnFloor.",
          "Inicie hp em 100, velocidades em 0 e estados em false. Passe os demais valores no construtor e confira sua instância no console.",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "scout-plat.js"],
          markers: ["class Player", "constructor(", "this.hp", "this.xVelocity", "this.yVelocity"],
        },
      },
      quiz(
        "Qual propriedade representa a velocidade para os lados?",
        ["hp", "height", "xVelocity"],
        2,
        "xVelocity representa a velocidade ao longo do eixo horizontal.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [scoutScript],
  },
  {
    month: 7,
    title: "Desenhando o Player e aplicando gravidade",
    subtitle: "Atualize a queda a cada quadro",
    objective:
      "Desenhar o personagem no canvas e simular aceleração para baixo.",
    theory: [
      "No primeiro teste, draw() pode mostrar o personagem como um retângulo. update() muda o estado e draw() usa a posição atual para pintar a cena.",
      "A gravidade aumenta a velocidade y a cada quadro. A velocidade muda a posição e o personagem cai. requestAnimationFrame agenda a próxima atualização em sincronia com a renderização do navegador.",
      "Uma velocidade vertical positiva desloca o personagem para baixo. A gravidade soma um pouco à velocidade a cada atualização, acelerando a queda.",
      "No loop de animação, limpe a tela, atualize o estado e desenhe. Se calcular o tempo entre quadros, use valores compatíveis com o tempo da sua gravidade.",
    ],
    codeExample: "this.yVelocity += gravity;\nthis.y += this.yVelocity;\nctx.fillRect(this.x, this.y, this.width, this.height);",
    tool: "arquivos",
    practice: [
      {
        id: "vincular-arquivo",
        action: "No scoutPlat.html, vincule scout-plat.js e adicione um canvas.",
        hint: "Use <script> com src=\"scout-plat.js\".",
        check: { kind: "code", file: [programmingPortfolio, "scoutPlat.html"], markers: ["<script", "src=\"scout-plat.js\"", "<canvas"] },
      },
      {
        id: "escrever-codigo",
        action: "Vincule scout-plat.js a scoutPlat.html e desenhe o jogador caindo com gravidade.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie scout-plat.js se ele ainda não existir.",
          "Desenhe o Player como um retângulo. No update(), aumente yVelocity pela gravidade e use a velocidade para atualizar y.",
          "Em um loop com requestAnimationFrame, limpe a tela, atualize e desenhe. Limite a queda ao fundo do canvas e reponha yVelocity em zero ao chegar ao chão.",
          "Chame de gravity a constante que representa a gravidade.",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "scout-plat.js"],
          markers: ["requestAnimationFrame(", "gravity", "fillRect("],
        },
      },
      quiz(
        "Ao aplicar gravidade durante a queda, qual valor aumenta primeiro neste modelo?",
        ["yVelocity", "hp", "width"],
        0,
        "A gravidade altera a velocidade vertical. A velocidade passa a alterar a posição.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [scoutHtml, scoutScript],
  },
  {
    month: 7,
    title: "Plataformas e colisão com o chão",
    subtitle: "Crie a classe Floor",
    objective:
      "Representar várias plataformas e parar a queda do Player sobre uma superfície.",
    theory: [
      "Uma plataforma pode ser um retângulo com posição, largura e altura. O array de plataformas permite desenhá-las e verificar os limites de cada uma no loop.",
      "No pouso, o personagem está descendo, se sobrepõe horizontalmente à plataforma e cruza seu topo com a parte de baixo do corpo. Reposicione-o sobre a plataforma, zere yVelocity e marque o apoio.",
      "Verifique se a parte inferior do jogador estava acima do topo da plataforma e o cruzou neste movimento. Isso distingue um pouso de um contato lateral.",
      "No pouso, ajuste y para deixar o jogador encostado na face superior, zere a velocidade vertical e sinalize que ele já pode pular de novo.",
    ],
    codeExample: "if (sobrepoeNoX && cruzouTopo && this.yVelocity >= 0) {\n  this.y = plataforma.y - this.height;\n  this.yVelocity = 0;\n  this.isOnFloor = true;\n}",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Crie obstáculos do tipo Floor e faça o Player pousar em plataformas.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie scout-plat.js se ele ainda não existir.",
          "Crie Floor com posição, dimensões e draw(). Instancie pelo menos duas plataformas em alturas diferentes.",
          "Confira a posição anterior e atual do Player. Ao pousar, ajuste y, zere yVelocity e atualize isOnFloor. Teste cair sobre a plataforma e ao lado dela.",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "scout-plat.js"],
          markers: ["class Floor", "isOnFloor", "new Floor("],
        },
      },
      quiz(
        "Em um pouso vindo de cima, onde deve ficar a parte inferior do jogador?",
        [
          "No centro da plataforma.",
          "No topo da plataforma.",
          "No fundo da plataforma.",
        ],
        1,
        "Encostar a parte inferior do jogador no topo evita que ele fique preso dentro da plataforma.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [scoutScript],
  },
  {
    month: 8,
    title: "Sprites e animação do personagem",
    subtitle: "Alterne imagens de repouso e caminhada",
    objective:
      "Carregar quadros de animação e selecionar o conjunto adequado ao movimento.",
    theory: [
      "Um sprite é a imagem que representa algo no jogo. Uma animação alterna quadros em sequência para criar a impressão de movimento. Um array pode reunir os quadros de cada estado.",
      "No Scout Plat, Player seleciona um estado e desenha o quadro escolhido. Um contador ou o tempo decorrido regula a troca. O operador % ajuda o índice a voltar ao início da sequência.",
      "Carregue os arquivos antes de desenhar. Cada quadro é uma imagem. Separe os quadros em listas, por exemplo repouso e caminhada.",
      "Use o resto da divisão para voltar ao índice 0 após o último quadro. Controle o intervalo entre trocas de imagem, pois atualizar a cada quadro do navegador pode deixar a animação rápida demais.",
    ],
    codeExample: "currentFrame = (currentFrame + 1) % quadros.length;\nctx.drawImage(quadros[currentFrame], player.x, player.y);",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Carregue sprites e desenhe um quadro diferente conforme o estado do personagem.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie scout-plat.js se ele ainda não existir.",
          "Separe três quadros de repouso e três de caminhada. Use os sprites do projeto como referência ou crie seus próprios quadros.",
          "Carregue as imagens em arrays. Mostre a animação de caminhada quando xVelocity for diferente de zero e a de repouso ao parar.",
          "Carregue os quadros com new Image(), guarde o índice em currentFrame e desenhe com drawImage().",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "scout-plat.js"],
          markers: ["new Image(", "drawImage(", "currentFrame"],
        },
      },
      quiz(
        "Em uma versão com dois estados, qual sequência usar quando xVelocity é zero?",
        ["Caminhada.", "Coleta.", "Repouso."],
        2,
        "Sem velocidade horizontal, use os quadros de repouso neste exercício.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [scoutScript, scoutAssets, download],
  },
  {
    month: 8,
    title: "Movimento horizontal e pulo",
    subtitle: "Controle o jogador pelo teclado",
    objective:
      "Mover o Player para os lados e iniciar o pulo quando ele estiver apoiado.",
    theory: [
      "keydown pode iniciar o movimento e keyup pode encerrá-lo. No piloto, A anda para a esquerda, D para a direita e espaço chama jump().",
      "O pulo começa com velocidade vertical negativa, pois o eixo y cresce para baixo. A gravidade desacelera a subida e faz o jogador cair. O estado de apoio permite controlar quando um novo pulo é aceito.",
      "Use keydown para iniciar movimento e keyup para parar. Se o jogador pressiona duas direções, veja como o código se comporta ao soltar apenas uma tecla.",
      "O impulso do pulo é uma velocidade inicial negativa. A gravidade acaba invertendo o movimento. Impedir outro pulo durante a subida evita impulsos em sequência sem pousar.",
    ],
    codeExample: "jump(forca) {\n  if (!this.isOnFloor) return;\n  this.yVelocity = -forca;\n  this.isOnFloor = false;\n}",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Controle movimento lateral e pulo do Player, com apoio na plataforma.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie scout-plat.js se ele ainda não existir.",
          "Escute keydown e keyup para andar para os dois lados e soltar o movimento.",
          "Implemente jump() com uma velocidade vertical inicial para cima. Teste pular no chão, tentar pular no ar e voltar a pular depois de pousar.",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "scout-plat.js"],
          markers: ["keydown", "keyup", "jump("],
        },
      },
      quiz(
        "Qual deve ser o sinal da velocidade y no primeiro instante de um pulo para cima?",
        ["Negativo.", "Positivo.", "Sempre zero."],
        0,
        "Para subir, a coordenada y precisa diminuir.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [scoutScript],
  },
  {
    month: 8,
    title: "Colisões laterais e verticais",
    subtitle: "Resolva o contato com os quatro lados",
    objective:
      "Detectar sobreposição entre retângulos e corrigir o movimento pelo lado de entrada.",
    theory: [
      "Uma caixa de colisão retangular usa bordas esquerda, direita, superior e inferior. Você detecta sobreposição conferindo se os intervalos nos dois eixos se cruzam.",
      "A posição anterior do jogador ajuda a identificar por qual lado ele entrou. Ao colidir pela lateral, corrija x e a velocidade horizontal. Ao bater por baixo, corrija y e interrompa a subida.",
      "Uma sobreposição atual diz que as caixas se cruzam, mas a posição anterior ajuda a saber de onde o jogador veio. Percorra os casos de cima, de baixo e dos lados.",
      "Ao resolver um contato horizontal, mude x antes de atualizar o próximo quadro. Ao resolver um contato vertical, atualize y. Confira a aproximação em diagonal.",
    ],
    codeExample: "const previousX = player.x;\nconst previousY = player.y;\nplayer.update();\nif (checkCollision(player, plataforma)) {\n  // Corrija o eixo pelo lado de entrada.\n}",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Guarde a posição anterior e resolva cada lado da colisão.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie scout-plat.js se ele ainda não existir.",
          "Crie checkCollision para dois retângulos no mesmo sistema de coordenadas.",
          "Guarde a posição anterior do Player e resolva a colisão por lado. Teste tocar cada lateral, bater por baixo e pousar por cima.",
          "Guarde a posição anterior em previousX e previousY.",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "scout-plat.js"],
          markers: ["checkCollision(", "previousX", "previousY"],
        },
      },
      quiz(
        "Qual informação ajuda a distinguir colisão de lado e pouso?",
        [
          "A cor do Player.",
          "A posição anterior do Player.",
          "O número de quadros da animação.",
        ],
        1,
        "A posição anterior indica de que lado o jogador vinha antes de sobrepor a plataforma.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [scoutScript],
  },
  {
    month: 8,
    title: "Moedas e pontuação no Scout Plat",
    subtitle: "Adicione itens coletáveis",
    objective:
      "Desenhar moedas, detectar a coleta e atribuir pontos uma única vez por item.",
    theory: [
      "Cada moeda tem posição, dimensões e uma imagem. No piloto, a classe Item reúne essas propriedades e desenha sprites de moeda.",
      "Quando o Player toca a moeda, some os pontos e tire a moeda da lista ativa ou marque-a como coletada. O mesmo item só deve pontuar uma vez, mesmo quando o jogador permanece no lugar.",
      "Moedas são itens do cenário com posição e estado. Uma moeda coletada pode sair da lista ou passar a ter collected igual a true.",
      "Faça o desenho e a detecção consultar o mesmo estado. Teste ficar parado sobre a posição da moeda por vários quadros e confirme um único aumento no placar.",
    ],
    codeExample: "if (!moeda.collected && checkCollision(player, moeda)) {\n  moeda.collected = true;\n  score += 1;\n}",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Adicione moedas e garanta que cada uma some pontos apenas uma vez.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie scout-plat.js se ele ainda não existir.",
          "Crie Coin ou Item, distribua moedas pelo cenário e desenhe as que ainda podem ser coletadas.",
          "Ao detectar a colisão, some um ponto, atualize o placar e retire a moeda de circulação. Teste ficar parado onde a moeda estava.",
          "Ao coletar a moeda, marque collected e incremente score.",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "scout-plat.js"],
          markers: ["collected", "score", "checkCollision("],
        },
      },
      quiz(
        "Como evitar que uma moeda valha pontos de novo no quadro seguinte?",
        [
          "Desenhar duas cópias da moeda.",
          "Zerar o placar a cada quadro.",
          "Remover a moeda da lista ativa ou marcá-la como coletada.",
        ],
        2,
        "O jogo deve deixar de testar essa moeda depois da primeira coleta.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [scoutScript, scoutAssets],
  },
  {
    month: 9,
    title: "Inimigos com movimento autônomo",
    subtitle: "Crie uma patrulha para os NPCs",
    objective:
      "Construir um inimigo que atualiza sua posição sem depender das teclas do jogador.",
    theory: [
      "Um NPC é um personagem controlado pelo jogo. A classe Enemy pode agrupar posição, dimensões, velocidade e o código para atualizar e desenhar cada inimigo.",
      "Uma patrulha pode usar dois limites horizontais. Ao atingir um limite, corrija a posição se necessário e troque o sinal da velocidade. Use um array para atualizar diferentes inimigos no mesmo loop.",
      "Defina dois extremos da patrulha para cada inimigo. O próprio inimigo atualiza sua posição conforme a velocidade e o tempo do quadro.",
      "Ao cruzar um extremo, ajuste a posição e inverta a velocidade. O ajuste impede que um inimigo rápido fique fora do intervalo por mais de um quadro.",
    ],
    codeExample: "if (this.x >= this.limiteDireito) {\n  this.x = this.limiteDireito;\n  this.velocidade = -Math.abs(this.velocidade);\n}",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Crie Enemy e faça as instâncias patrulharem o cenário.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie scout-plat.js se ele ainda não existir.",
          "Crie Enemy com métodos de atualização e desenho. Faça um inimigo patrulhar de um lado ao outro.",
          "Teste as duas bordas e adicione uma segunda instância com posição e velocidade diferentes.",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "scout-plat.js"],
          markers: ["class Enemy", "new Enemy("],
        },
      },
      quiz(
        "O que faz um inimigo inverter o sentido de uma patrulha horizontal?",
        [
          "Mudar o sinal da velocidade horizontal.",
          "Mudar a altura do sprite.",
          "Aumentar os pontos de vida do jogador.",
        ],
        0,
        "O sinal da velocidade determina se a posição diminui ou aumenta.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [scoutScript, scoutAssets],
  },
  {
    month: 9,
    title: "Colisão com inimigos e sistema de vida",
    subtitle: "Registre dano e encerre a partida",
    objective:
      "Reduzir HP quando ocorrer dano e atualizar o indicador de vida e o estado de jogo.",
    theory: [
      "Use caixas de colisão no jogador e no inimigo para detectar contato. Ao aplicar dano, atualize o HP e o indicador na tela. A partida termina quando o HP chega a zero ou menos.",
      "Se a colisão durar vários quadros, o mesmo contato pode aplicar dano muitas vezes. Um intervalo curto entre danos, ou afastar os personagens ao colidir, ajuda a dar tempo de reação.",
      "Aplique dano no momento certo. Em um jogo a vários quadros por segundo, dois personagens podem se sobrepor por tempo suficiente para esgotar toda a vida de uma vez.",
      "Defina um intervalo mínimo entre danos. Atualize o indicador e use a condição HP igual ou abaixo de zero para lidar com um dano maior que a vida restante.",
    ],
    codeExample: "player.hp = Math.max(0, player.hp - dano);\nif (player.hp <= 0) {\n  encerrarPartida();\n}",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Aplique dano, atualize o HP e termine a partida quando a vida se esgotar.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie scout-plat.js se ele ainda não existir.",
          "Faça a colisão com inimigos diminuir o HP. Atualize um indicador ao aplicar dano.",
          "Implemente o fim da partida com HP igual ou abaixo de zero. Teste contato contínuo e ajuste a frequência do dano.",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "scout-plat.js"],
          markers: ["player.hp", "<= 0", "checkCollision("],
        },
      },
      quiz(
        "Qual condição cobre tanto chegar a zero quanto passar de zero ao receber dano?",
        ["hp >= 0", "hp <= 0", "hp === 100"],
        1,
        "O operador <= detecta zero e valores negativos, inclusive quando o último dano é maior que a vida restante.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [scoutScript],
  },
  {
    month: 9,
    title: "Arremesso de objetos no Scout Plat",
    subtitle: "Modele uma bola de tênis como projétil",
    objective:
      "Criar, mover e remover projéteis e verificar o contato com inimigos.",
    theory: [
      "Um projétil começa perto do jogador e recebe a direção atual. A classe Projectile registra sua posição, dimensões e velocidade. O loop atualiza e desenha os projéteis ativos.",
      "Ao atingir um inimigo ou sair da tela, marque o projétil para remoção. No piloto, Enter chama o arremesso. A remoção evita que objetos sem utilidade permaneçam no loop.",
      "O projétil nasce na posição do jogador, mas passa a guardar posição e direção próprias. Alterar a direção do jogador depois do lançamento não deve virar a bola em movimento.",
      "Depois de resolver uma colisão, marque o projétil e retire os marcados fora da iteração. Isso evita pular elementos da lista ao remover um durante o percurso.",
    ],
    codeExample: "projeteis = projeteis.filter((bola) => !bola.markedForDeletion);",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Modele o lançamento, a atualização e a remoção das bolas de tênis no jogo.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie scout-plat.js se ele ainda não existir.",
          "Crie Projectile e use uma tecla para lançar uma bola de tênis no sentido em que o Player está olhando.",
          "Atualize e desenhe as bolas. Aplique dano ao contato com o inimigo e remova a bola ao atingir um alvo ou sair da tela.",
          "Ao remover uma bola, use markedForDeletion para marcá-la antes de filtrar a lista.",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "scout-plat.js"],
          markers: ["class Projectile", "new Projectile(", "markedForDeletion"],
        },
      },
      quiz(
        "Depois que um projétil atinge o inimigo, o que evita novo dano nos quadros seguintes?",
        [
          "Aumentar a velocidade da bola.",
          "Mudar a cor do inimigo.",
          "Desativar o projétil ao registrar o contato.",
        ],
        2,
        "O projétil desativado deixa de participar das próximas verificações de colisão.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [scoutScript, scoutAssets],
  },
  {
    month: 9,
    title: "Finalizando o Scout Plat",
    subtitle: "Telas, áudio e teste de jogabilidade",
    objective:
      "Concluir o fluxo de uma partida e verificar os efeitos em jogo.",
    theory: [
      "O jogo pode separar os estados de início, partida, pausa e fim. Escolha em quais estados o loop atualiza posições e quais botões aparecem. Reutilize o que já funcionou no Jogo da Kaa.",
      "A trilha sonora acompanha a partida e os efeitos destacam eventos, como pular ou derrotar um inimigo. Acione o som da partida a partir da interação de começar e teste a pausa e a retomada.",
      "Separe os controles das telas do desenho no canvas. Use um botão de início para a pessoa escolher quando a partida e o áudio começam.",
      "Verifique a pausa, retomada, derrota e reinício com a mesma sequência de teste. Compare a música da partida com os efeitos breves das ações.",
    ],
    codeExample: "<button id=\"iniciar\" type=\"button\">Iniciar partida</button>\n<audio id=\"trilha\" loop></audio>\n<canvas id=\"jogo\" width=\"720\" height=\"400\"></canvas>",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Complete as telas do Scout Plat e conecte o áudio às ações da partida.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie scoutPlat.html se ele ainda não existir.",
          "Implemente as telas de início e fim, um controle de pausa e a opção de jogar de novo.",
          "Adicione música com volume ajustável e efeitos para pulo e inimigo derrotado. Teste o áudio durante a pausa.",
          "Jogue uma partida inteira, teste reinício e corrija um problema de jogabilidade.",
          "Para testar as interações no navegador, baixe o portfólio e abra o HTML no computador.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "scoutPlat.html"],
          markers: ["<canvas", "<audio", "<button"],
        },
      },
      quiz(
        "Qual teste ajuda a confirmar que o reinício funcionou?",
        [
          "Comparar os estados de posição, HP e placar com os valores iniciais.",
          "Testar somente a cor do menu.",
          "Aumentar o volume antes de abrir a página.",
        ],
        0,
        "Um novo jogo deve iniciar com posição, vida e placar próprios daquela partida.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [scoutHtml, scoutScript, scoutCss, effects, download],
  },
  {
    month: 10,
    title: "Revisão e organização dos projetos",
    subtitle: "Refatore e teste o portfólio e os jogos",
    objective:
      "Organizar arquivos e melhorar a leitura de um trecho de código preservando seu comportamento.",
    theory: [
      "Refatorar é melhorar a estrutura do código mantendo o comportamento que já funciona. Você pode extrair instruções repetidas para uma função ou trocar nomes vagos por nomes que descrevem o uso.",
      "O projeto piloto agrupa CSS, JavaScript, imagens e áudio em pastas. Ao mudar um arquivo de lugar, revise os caminhos relativos e teste a navegação e a reprodução de recursos.",
      "Escolha uma transformação pequena e compare o comportamento antes e depois. Mover o código repetido para uma função com nome claro ajuda a verificar o efeito da mudança.",
      "O README serve como mapa do projeto. Explique como abrir o portfólio, onde encontrar os jogos e quais testes ajudam outra pessoa a repetir sua conferência.",
    ],
    codeExample: "# Meu portfólio\n\n## Testes\n- Kaa: iniciar, coletar uma maçã e reiniciar.\n- Scout Plat: pular, pousar e coletar uma moeda.",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Documente no README um teste de cada jogo e a melhoria de código que implementou.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie README.md se ele ainda não existir.",
          "Revise o portfólio e os dois jogos. Escolha um trecho para renomear, extrair ou organizar.",
          "Organize arquivos por tipo, se for útil. Refaça o teste usado antes da mudança e confira os links do portfólio e os recursos dos jogos.",
          "Use a seção ## Testes e identifique os resultados de Kaa e Scout Plat.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "README.md"],
          markers: ["## Testes", "Kaa", "Scout Plat"],
        },
      },
      quiz(
        "O que indica que uma refatoração preservou a funcionalidade?",
        [
          "O arquivo ficou maior.",
          "O teste do mesmo comportamento continua passando.",
          "O nome de todas as variáveis mudou.",
        ],
        1,
        "Repita o mesmo teste antes e depois para conferir se a funcionalidade foi mantida.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [
      download,
      { title: "Repositório do projeto piloto", url: repository },
    ],
  },
  {
    month: 10,
    title: "Introdução ao Git e ao GitHub",
    subtitle: "Faça seu primeiro commit",
    objective:
      "Inicializar um repositório Git e registrar a primeira versão de um arquivo.",
    theory: [
      "Git registra versões dos arquivos do projeto no computador. Um commit guarda uma versão com uma mensagem. GitHub hospeda repositórios que podem ser compartilhados e sincronizados.",
      "git init cria o repositório local. git status mostra as mudanças, git add seleciona o que vai entrar no commit e git commit grava essa seleção. Faça o primeiro treino em uma pasta de teste.",
      "O Git trabalha com a pasta atual, os arquivos preparados e o histórico de versões. git status ajuda a decidir o que vai para o próximo commit.",
      "Faça o treino com o Git no computador após baixar os arquivos. Use uma mensagem de commit que descreva o que foi criado ou corrigido.",
    ],
    codeExample: "git init\ngit add README.md\ngit status\ngit commit -m \"Documenta os testes dos jogos\"",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Registre os comandos do primeiro commit e seu resultado no README do projeto.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie README.md se ele ainda não existir.",
          "Com o Git instalado, crie uma pasta de teste e execute git init. Adicione um README.md com uma descrição curta.",
          "Execute git status, git add README.md e git commit -m \"Primeiro commit\". Veja o resultado com git log --oneline.",
          "Abra o GitHub e explore a tela de criação de um repositório vazio.",
          "Na seção ## Versionamento, anote git init, git commit e o que apareceu no histórico.",
          "Use Baixar portfólio para testar esses passos no computador e registre o resultado no README da Área de trabalho.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "README.md"],
          markers: ["## Versionamento", "git init", "git commit"],
        },
      },
      quiz(
        "Qual comando grava a versão que você preparou com git add?",
        ["git init", "git status", "git commit"],
        2,
        "git commit registra os arquivos que foram selecionados para a próxima versão.",
      ),
    ],
    guide: programmingJournalPrompt,
  },
  {
    month: 10,
    title: "Enviando o projeto para o GitHub",
    subtitle: "Configure um remoto e faça o primeiro push",
    objective:
      "Vincular o projeto local ao repositório escolhido e enviar seus commits.",
    theory: [
      "Um remoto é um endereço de outro repositório. origin é um nome comum para o remoto principal. git remote -v mostra os endereços configurados.",
      "Depois de revisar o conteúdo a publicar e criar os commits, git push -u origin main envia a branch main e registra a associação para próximos envios. Compare os arquivos e os commits no GitHub com sua versão local.",
      "Remoto e branch resolvem questões diferentes. O remoto identifica o destino e a branch identifica qual linha do histórico você vai enviar.",
      "Antes do push, confira o endereço e reveja os arquivos preparados. Após enviar, compare o último commit local com o que aparece no GitHub.",
    ],
    codeExample: "git remote -v\ngit log --oneline -1\ngit push -u origin main",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Registre o endereço do repositório usado para o portfólio.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie README.md se ele ainda não existir.",
          "Revise o portfólio e os jogos. Confirme que os arquivos escolhidos para publicação podem ser compartilhados e crie um repositório vazio no GitHub.",
          "Adicione o remoto com git remote add origin ENDERECO. Use git branch -M main se precisar padronizar o nome e envie com git push -u origin main.",
          "Confira a estrutura das pastas e o último commit no GitHub.",
          "Na seção ## Repositório, coloque o endereço completo do GitHub que você usou.",
          "Use Baixar portfólio para testar esses passos no computador e registre o resultado no README da Área de trabalho.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "README.md"],
          markers: ["## Repositório", "github.com"],
        },
      },
      quiz(
        "Qual comando lista os endereços dos remotos configurados?",
        ["git remote -v", "git init", "git log --oneline"],
        0,
        "git remote -v permite conferir o endereço antes de enviar a branch.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [
      { title: "Estrutura do repositório piloto no GitHub", url: repository },
    ],
  },
  {
    month: 10,
    title: "Publicando o portfólio e apresentando os jogos",
    subtitle: "GitHub Pages e apresentação final",
    objective:
      "Publicar a página estática do portfólio, testar a versão online e apresentar os projetos concluídos.",
    theory: [
      "O GitHub Pages publica um site estático a partir da fonte configurada no repositório. Se a opção de publicar a partir de uma branch estiver disponível, selecione a branch e a pasta que contém index.html.",
      "Teste a versão publicada no endereço do Pages. Confira os links para os jogos e se imagens, estilos, sons e scripts carregam. Caminhos relativos ajudam a manter os recursos dentro do endereço do seu projeto.",
      "GitHub Pages precisa encontrar o index.html no diretório que você configurar. Confirme que os caminhos dos jogos e dos recursos são relativos à localização do HTML e respeitam maiúsculas e minúsculas.",
      "Abra o endereço publicado em outra janela e execute a demonstração inteira. Na apresentação, descreva uma decisão que tomou no código e o que aprendeu ao corrigi-la.",
    ],
    codeExample: "## Publicação\nEndereço: https://exemplo.github.io/meu-portfolio/\n\n## Apresentação\n- O que cada jogo faz\n- Um desafio que resolvi\n- Um teste que executei",
    tool: "arquivos",
    practice: [
      {
        id: "escrever-codigo",
        action: "Registre o endereço publicado e o resultado dos testes dos dois jogos.",
        hint: [
          "Na Área de trabalho, abra meu_portifólio e crie README.md se ele ainda não existir.",
          "Nas configurações do repositório, abra Pages e selecione a origem do site com index.html. Aguarde a publicação e abra o endereço exibido.",
          "Teste o portfólio e os dois jogos na versão online. Abra pelo menos um link em uma tela pequena.",
          "Prepare uma apresentação curta com o que construiu, uma decisão técnica e algo que aprendeu durante os testes.",
          "Crie a seção ## Publicação e inclua o endereço HTTPS e o resultado do teste de Kaa e Scout Plat.",
          "Use Baixar portfólio para testar esses passos no computador e registre o resultado no README da Área de trabalho.",
        ].join("\n"),
        check: {
          kind: "code",
          file: [programmingPortfolio, "README.md"],
          markers: ["## Publicação", "https://", "Kaa", "Scout Plat"],
        },
      },
      quiz(
        "Qual teste confirma que os jogos podem ser abertos por quem visita seu portfólio?",
        [
          "Abrir apenas o index.html no editor.",
          "Abrir o site publicado, seguir os links e iniciar os dois jogos.",
          "Ver a lista de arquivos do repositório sem abrir o site.",
        ],
        1,
        "O teste na versão publicada verifica se os links e os arquivos funcionam para o visitante.",
      ),
    ],
    guide: programmingJournalPrompt,
    resources: [portfolioHtml, kaaHtml, scoutHtml],
  },
];

export const programacaoBasicaVersion = 3;

export const programacaoBasicaAulas = content.map((lesson) => ({ ...lesson, icon: "?" }));
