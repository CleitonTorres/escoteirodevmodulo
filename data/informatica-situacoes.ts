type Step = {
  prompt: string;
  options: readonly string[];
  answer: number;
  feedback: string;
  guidance?: { pista: string; explicar: string };
};
const step = (prompt: string, options: string[], answer: number, feedback: string, guidance?: Step["guidance"]): Step =>
  ({ prompt, options, answer, feedback, guidance });

export const energyExercise = {
  action: "Leia três situações e escolha entre Bloquear, Reiniciar e Desligar em cada uma.",
  hint: "Responda usando os botões de cada situação. Quando acertar, a próxima aparece.",
};

export const situations = {
  hardware: { title: "Peças do computador", steps: [
    step("Na mesa há um monitor, um teclado e um mouse. Escolha a peça em que aparece o que você faz.", ["Teclado", "Monitor", "Mouse"], 1, "O monitor mostra a imagem. Pense em qual peça tem uma tela."),
    step("Agora encontre a peça que você usaria para escrever seu nome.", ["Teclado", "Monitor", "Mouse"], 0, "Procure a peça com letras, números e a barra de espaço."),
    step("Escolha a peça que move a setinha na tela.", ["Monitor", "Teclado", "Mouse"], 2, "Quando você move o mouse na mesa, a setinha acompanha."),
  ] },
  energia: { title: "Quando bloquear, reiniciar ou desligar", steps: [
    step("Você vai beber água e volta em poucos minutos. Quer impedir que alguém use sua sessão e encontrar seus aplicativos ainda abertos quando voltar. Qual botão escolher?", ["Desligar", "Bloquear", "Reiniciar"], 1,
      "Você quer sair só por alguns minutos. Procure a opção que conserva os aplicativos abertos.", {
        pista: "Pense em qual botão protege a sessão sem fechar os aplicativos que você está usando.",
        explicar: "Imagine que sua sessão tem uma porta com chave. Você quer trancar a porta por alguns minutos e encontrar tudo do mesmo jeito quando voltar.",
      }),
    step("Uma atualização pediu que o computador comece de novo. Você já salvou o trabalho e quer que ele volte a ligar sozinho. Qual botão escolher?", ["Reiniciar", "Bloquear", "Desligar"], 0,
      "Procure o botão que faz o computador começar de novo e voltar sozinho à tela de entrada.", {
        pista: "Procure a opção em que o computador se apaga por um momento e volta a ligar sozinho.",
        explicar: "A atualização precisa que o sistema comece de novo. Você já salvou o trabalho. Qual opção faz a sequência completa sem precisar apertar Ligar?",
      }),
    step("Você salvou o trabalho e terminou de usar o computador por hoje. Quer que ele fique desligado até amanhã. Qual botão escolher?", ["Bloquear", "Reiniciar", "Desligar"], 2,
      "Neste caso, o computador deve ficar desligado até alguém apertar Ligar.", {
        pista: "Procure a opção que encerra o uso e deixa o computador desligado até alguém apertar Ligar.",
        explicar: "Você só vai voltar amanhã. Pense em qual opção deixa o computador desligado, sem voltar sozinho à tela de entrada.",
      }),
  ] },
  acessibilidade: { title: "Leitura e navegação confortáveis", steps: [
    step("Os botões ficaram pequenos na página. Qual ajuste você pode procurar?", ["Volume", "Zoom", "Lixeira"], 1, "O zoom aumenta ou diminui a apresentação da página."),
    step("Você quer passar para o próximo controle com o teclado. Qual tecla usar?", ["Tab", "Backspace", "Espaço"], 0, "Tab move o foco. A borda em destaque mostra onde ele está."),
    step("O botão desejado está em destaque. Como ativá-lo pelo teclado?", ["Ctrl", "Shift", "Enter"], 2, "Enter ativa um botão com foco."),
  ] },
  conexao: { title: "Conexão e endereço", steps: [
    step("A tela avisa: «Sem conexão». Nenhuma página abre. Qual é a primeira coisa a conferir?", ["Conexão de rede", "Tamanho das letras", "Nome do arquivo"], 0, "Se nenhuma página abre e o aviso fala de conexão, comece pela rede."),
    step("A rede voltou. As outras páginas abrem, mas uma delas diz «Endereço inválido». O que conferir?", ["O volume", "As letras e os pontos do endereço", "A bateria do mouse"], 1, "Compare o endereço com aquele que você queria digitar."),
  ] },
  abas: { title: "Abas, histórico e favoritos", steps: [
    step("O texto está aberto e você quer abrir outro para comparar. O que usar?", ["Limpar o histórico", "Fechar o navegador", "Nova aba"], 2, "Uma nova aba permite abrir outra página e manter a primeira."),
    step("Você fechou a página de ontem e quer encontrá-la. Onde procurar?", ["Histórico", "Downloads", "Lixeira"], 0, "O histórico lista páginas que você visitou."),
    step("Quer guardar a página para consultar outra vez. Qual opção usar?", ["Apagar histórico", "Adicionar aos favoritos", "Fechar a página"], 1, "Os favoritos guardam endereços que você escolheu."),
  ] },
  fontes: { title: "Comparar resultados de pesquisa", steps: [
    step("Você quer saber o horário de uma biblioteca. Qual busca é mais clara?", ["coisas legais", "biblioteca horário bairro", "quero saber"], 1, "Use palavras que indiquem o lugar e a informação que você procura."),
    step("Um anúncio e a página da própria biblioteca aparecem. Onde começar a conferir o horário?", ["Na página da biblioteca", "No primeiro anúncio", "Na imagem mais bonita"], 0, "Comece pela organização que publica o próprio horário."),
    step("Dois horários são diferentes. O que fazer?", ["Escolher o maior", "Copiar a primeira resposta", "Conferir as datas e confirmar com a biblioteca"], 2, "Compare as datas e confirme com o local antes de usar a informação."),
  ] },
  formulario: { title: "Formulário de inscrição", steps: [
    step("O formulário de treino pede um apelido para o evento. Qual opção usar?", ["Seu endereço completo", "Lia do grupo Azul", "A senha do seu e-mail"], 1, "Um apelido fictício basta para este campo."),
    step("Um campo opcional pede seu documento, sem explicar para quê. O que fazer?", ["Deixar em branco e pedir orientação se precisar", "Digitar o número de um amigo", "Publicar o documento num comentário"], 0, "Campos opcionais podem ficar em branco. Peça ajuda se não entender a finalidade."),
    step("Antes de enviar, qual conferência ajuda?", ["A cor do botão", "A foto de fundo", "O endereço da página e os dados preenchidos"], 2, "Confira a página e revise o que você está prestes a enviar."),
  ] },
  email: { title: "Compor e conferir um e-mail de treino", steps: [
    step("Você vai enviar um aviso à equipe fictícia. O que entra no campo Para?", ["Aviso da reunião", "equipe@trilha.example", "Materiais.docx"], 1, "O campo Para recebe o endereço de quem vai ler a mensagem."),
    step("Qual assunto ajuda a equipe a entender a mensagem?", ["Materiais para a reunião de sábado", "Oi", "Sem assunto"], 0, "Um assunto curto que diz do que se trata ajuda quem recebe."),
    step("Agora junte a lista ao e-mail. Qual controle usar?", ["Responder", "Excluir", "Anexar arquivo"], 2, "Anexar é juntar uma cópia de um arquivo à mensagem."),
    step("O anexo aparece como Materiais.docx. O que fazer antes de enviar?", ["Revisar destinatário, mensagem e anexo", "Enviar logo para todo mundo", "Apagar o assunto"], 0, "A última conferência ajuda a perceber um destinatário ou arquivo errado."),
  ] },
  contas: { title: "Proteger uma conta fictícia", steps: [
    step("Qual opção é melhor para uma conta nova?", ["A mesma senha de outra conta", "Uma senha longa e exclusiva", "Seu nome e sua data de nascimento"], 1, "Uma senha longa e diferente protege melhor cada conta de treino."),
    step("Depois da senha, o serviço pede um segundo passo. Onde colocar o código?", ["Na própria tela oficial da conta", "Numa conversa com alguém que diz ser do suporte", "No seu perfil público"], 0, "Use o código no serviço que você abriu e conferiu."),
    step("Alguém pede seu código por mensagem. O que fazer?", ["Compartilhar só uma vez", "Mandar uma captura de tela", "Recusar e procurar ajuda por um canal conhecido"], 2, "Os códigos protegem a conta. Guarde-os para você e confira por outro caminho."),
  ] },
  mensagens: { title: "Mensagem urgente e suspeita", steps: [
    step("Uma mensagem diz «Sua conta vai fechar em 5 minutos. Abra este link». Qual é o primeiro passo?", ["Parar e verificar a mensagem", "Clicar logo", "Encaminhar para todo mundo"], 0, "A urgência serve para forçar uma decisão. Faça uma pausa."),
    step("A mensagem parece ter vindo da escola. Como conferir?", ["Respondendo com sua senha", "Usando um contato da escola que você já conhece", "Lendo só a foto de perfil"], 1, "Verifique pelo contato que você já usava antes de receber a mensagem."),
    step("Chegou um anexo que você não esperava. O que fazer?", ["Abrir para descobrir", "Mandar para um amigo abrir", "Deixar fechado e pedir ajuda se tiver dúvida"], 2, "Um arquivo inesperado pode esperar até você confirmar quem enviou."),
  ] },
  pdf: { title: "Preparar um documento para entregar", steps: [
    step("A última linha do aviso ficou sozinha na página seguinte. Onde você percebe isso antes da entrega?", ["Lixeira", "Prévia do documento", "Barra de endereço"], 1, "A prévia ajuda a conferir a separação das páginas."),
    step("Você quer que outra pessoa leia o aviso como ele ficou na página. Qual cópia preparar?", ["PDF", "Atalho", "Pasta vazia"], 0, "O PDF é uma boa cópia para leitura ou impressão."),
    step("Ainda será preciso mudar o horário amanhã. O que guardar também?", ["Só uma captura de tela", "Só o atalho", "O arquivo editável"], 2, "Mantenha a versão editável para poder corrigir o documento."),
  ] },
  atualizacao: { title: "Atualizar o computador de treino", steps: [
    step("Um anúncio na internet diz «Instale sua atualização aqui». Onde verificar a atualização do sistema?", ["No anúncio", "Nas Configurações do computador", "Em qualquer link recebido"], 1, "As Configurações do computador são o lugar de conferir as atualizações do sistema."),
    step("A tela oficial mostra uma atualização disponível e você tem um documento aberto. O que fazer primeiro?", ["Salvar o documento", "Fechar a janela sem salvar", "Desligar tirando da tomada"], 0, "Salve o trabalho antes de uma operação que pode reiniciar o computador."),
    step("A tela agora informa «Reinicialização necessária». Qual opção conclui o processo?", ["Minimizar", "Bloquear", "Reiniciar pelo menu"], 2, "Reiniciar deixa o sistema terminar a atualização e abrir de novo."),
  ] },
  programas: { title: "Escolher de onde baixar", steps: [
    step("Você precisa de um programa de desenho. Qual página escolher?", ["Anúncio com botão piscando", "Página oficial do programa ou loja confiável", "Link de uma cópia desbloqueada"], 1, "Confira quem oferece o programa e o endereço antes de baixar."),
    step("O programa pede pagamento e você não pode pagar. Qual saída usar?", ["Procurar uma alternativa gratuita autorizada", "Baixar uma cópia pirata", "Desativar a proteção para instalar"], 0, "Existem ferramentas gratuitas ou livres que podem atender à mesma necessidade."),
    step("Na instalação de um editor, aparece um pedido inesperado para instalar outro programa. O que fazer?", ["Aceitar tudo", "Compartilhar sua senha", "Parar e conferir o que está sendo oferecido"], 2, "Leia o nome e as opções antes de confirmar. Peça ajuda se tiver dúvida."),
  ] },
  antivirus: { title: "Lidar com um alerta de proteção", steps: [
    step("O navegador mostra um anúncio avisando «Seu PC está cheio de vírus». Onde verificar o estado da proteção?", ["Na área de segurança do próprio sistema", "No botão do anúncio", "No primeiro site que surgir"], 0, "Use o painel de segurança do computador que você conhece."),
    step("O painel de segurança diz que um arquivo foi bloqueado. Qual atitude é adequada?", ["Permitir e abrir", "Manter bloqueado e pedir ajuda se precisar", "Desativar a proteção"], 1, "Manter o bloqueio evita abrir o arquivo enquanto você verifica a situação."),
    step("Depois do alerta, o que ainda vale fazer com os downloads?", ["Abrir tudo que chegou hoje", "Confiar em qualquer página", "Conferir a origem antes de abrir"], 2, "A origem do arquivo importa mesmo com a proteção ativada."),
  ] },
  copia: { title: "Fazer e conferir um backup", steps: [
    step("Você tem uma foto importante. Onde guardar uma segunda cópia para recuperá-la se perder a original?", ["Em um local de backup separado", "Na Lixeira", "No mesmo arquivo com um nome novo"], 0, "Uma segunda cópia em outro local ajuda se a original sumir."),
    step("Terminou a cópia. Como saber se ficou tudo certo?", ["Conferir apenas a cor da pasta", "Abrir a cópia e conferir o conteúdo", "Apagar logo a original"], 1, "Abra a cópia para conferir se ela está disponível e funciona."),
  ] },
  ajuda: { title: "Investigar problemas simples", steps: [
    step("A janela sumiu depois de apertar o traço. Onde olhar primeiro?", ["Lixeira", "Barra de tarefas", "Histórico do navegador"], 1, "O traço minimiza. A barra de tarefas ajuda a voltar à janela."),
    step("Você apagou um arquivo por engano. Onde procurar antes de refazer?", ["Lixeira", "Barra de endereço", "Menu de fontes"], 0, "A Lixeira pode guardar o arquivo. Procure pelo nome e restaure."),
    step("Você conferiu o endereço e a conexão e a página ainda não abre. Como explicar ao pedir ajuda?", ["Dizer só que o computador está ruim", "Insistir no mesmo clique", "Mostrar a mensagem e dizer o que você já conferiu"], 2, "A mensagem e os passos que você tentou ajudam outra pessoa a investigar."),
  ] },
} satisfies Record<string, { title: string; steps: Step[] }>;

export type Situation = keyof typeof situations;
export const situationOptions = Object.fromEntries(Object.entries(situations).map(([id, { title }]) => [id, title]));
