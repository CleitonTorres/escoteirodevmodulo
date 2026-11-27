# Aprender · Trilha Digital Coqueiral

Plataforma de aprendizagem do 19º Grupo Escoteiro Coqueiral. As trilhas de Informática Básica e Programação Básica combinam teoria ilustrada, digitação, simuladores, atividades avaliadas e registros no guia ou diário do aluno.

## Executar localmente

Use Node.js 20.9 ou posterior e pnpm. Configure o `.env` a partir de [`.env.example`](.env.example), com `DB_NAME`, `URL_DB` e as variáveis de e-mail da seção de integrações. A URI do MongoDB deve conter as credenciais. Use um cluster Atlas ou um replica set com suporte a transações. A conta de banco da aplicação precisa de acesso de leitura e escrita e permissão para criar coleções e índices.

```sh
pnpm install
pnpm dev
```

Abra `http://localhost:3000`. Use `pnpm build` para gerar a versão de produção e `pnpm start` para executá-la. Na Vercel, configure as mesmas variáveis no projeto e use o endereço HTTPS público em `APP_URL`.

## Arquitetura

A aplicação usa **Next.js App Router, React, TypeScript e MongoDB**. Os componentes interativos rodam no navegador. As Server Actions validam permissões, dados enviados e evidências de prática antes de gravar no banco.

| Local | Responsabilidade |
| --- | --- |
| [`app/(conta)/`](app/(conta)) | Cadastro, login, confirmações por e-mail e Minha conta. |
| [`app/trilha/`](app/trilha) | Área do aluno, leitura das aulas, atividades, guia, diário e ajuda contextual do Devinho. |
| [`app/gestao/`](app/gestao) | Catálogo, edição de aulas e ilustrações, relatórios, contas e painel de uso do Devinho. A rota `/gestao/visualizar` abre a aula com progresso de teste separado. |
| [`app/simuladores/`](app/simuladores) | Digitação com teclado ABNT2, área de trabalho com arquivos virtuais, navegador de treino, editor de texto com Tiptap, planilha com Univer e editor de código. A prévia HTML/CSS é estática. O JavaScript usa um console isolado. |
| [`data/`](data) | Conteúdo-base das disciplinas, tipos de aula, configurações de prática e catálogo de peças SVG. `informatica-basica-legado.ts` é a referência para migrar aulas antigas. |
| [`lib/`](lib) e [`public/teoria/`](public/teoria) | Autenticação, persistência, regras de avaliação e integrações em `lib/`. Recursos visuais da teoria em `public/teoria/`. |

O catálogo-base de Informática Básica vem de `data/informatica-basica.ts`. A apostila de Programação Básica pode ser importada de `data/programacao-basica.ts` pela Gestão. Disciplinas criadas e aulas editadas no painel são salvas em `catalogo_trilha`. A coleção `progresso_alunos` guarda, por conta e disciplina, aulas concluídas, práticas, digitação, arquivos virtuais e conteúdo do guia ou diário. `progresso_visualizacao` guarda o progresso de teste da Gestão.

## Gestão de conteúdo

O cadastro público cria contas com perfil **aluno**. Para habilitar o primeiro administrador, cadastre e confirme a conta, localize seu documento em `alunos` e defina `role` como `administrador`. Ao entrar novamente, a conta abre `/gestao`. Na seção **Contas e acessos**, administradores promovem contas para professor ou administrador. Professores podem consultar relatórios, criar e editar aulas. Administradores também podem gerenciar disciplinas e excluir aulas.

### Cadastrar uma disciplina

Em **Gestão → Aulas e disciplinas → Nova disciplina**, informe o nome e um identificador único, como `informatica-avancada`, usando letras minúsculas, números e hífens. Clique em **Cadastrar disciplina**. O identificador vincula a disciplina ao progresso dos alunos. Se for Programação Básica, abra a disciplina e use **Importar aulas da apostila** para incluir as 40 aulas de referência. A importação preserva as aulas com títulos já cadastrados.

### Cadastrar uma aula

Selecione a disciplina e clique em **Nova aula**. Preencha título, subtítulo, mês, objetivo, parágrafos da teoria e a orientação de **Meu guia**. Configure a ferramenta da prática, os vídeos e os recursos conforme a aula. Cadastre as atividades e clique em **Cadastrar aula**. Use **Visualizar aula** para conferir a versão que o aluno verá. Excluir uma aula ou disciplina pelo catálogo preserva os registros de progresso.

### Configurar tarefas práticas e quizzes

- Em **Tarefas práticas → Adicionar tarefa**, escreva uma instrução objetiva, inclua uma dica se precisar e selecione **Tipo de verificação**. Configure o caminho de uma pasta ou arquivo, o controle do simulador, o nível de digitação, o critério de código, a formatação do documento ou a etapa de planilha, conforme o exercício.
- Em **Quiz da aula → Adicionar pergunta**, escreva o enunciado, informe de 2 a 8 alternativas distintas, marque uma como correta e preencha o feedback. Para uma prática com perguntas em sequência, use **Exercício com perguntas em etapas** e escolha um roteiro da lista.
- O servidor valida as ações e respostas com base nas regras e no progresso salvo. A conclusão exige todas as práticas e os quizzes previstos. Em Informática Básica, o aluno também precisa editar e salvar o guia. Em Programação Básica, a aba **Diário** serve para registrar o aprendizado.

### Cadastrar e usar um SVG

1. Salve a peça em `public/teoria/`, com um nome como `menu-iniciar.svg`.
2. Para disponibilizá-la na **Biblioteca de peças SVG**, registre uma entrada em `sceneAssets`, no arquivo [`data/lesson-theory.ts`](data/lesson-theory.ts). Use o nome do arquivo sem a extensão como chave e mantenha as dimensões proporcionais ao `viewBox`, por exemplo `"menu-iniciar": { label: "Menu Iniciar", width: 640, height: 360 }`.
3. Depois de publicar a atualização, o professor encontra a peça em **Teoria da aula → Adicionar ilustração → Montar cena SVG**. Posicione as peças, ajuste a ordem em **Camadas**, escreva a descrição acessível e salve a aula.

Para exibir o SVG pronto em um parágrafo, escolha **Link de imagem ou SVG** e informe `/teoria/menu-iniciar.svg`. Essa opção usa o arquivo publicado diretamente. Para links HTTPS externos, configure as origens em `THEORY_IMAGE_ORIGINS`. O bucket definido em `BUCKET_NAME` também é aceito nas URLs de `storage.googleapis.com`.

## Integrações

| Serviço | Configuração e uso |
| --- | --- |
| **MongoDB** | `DB_NAME` e `URL_DB` configuram o banco de contas, sessões, catálogo, progresso e uso do Devinho. |
| **E-mail transacional** | Configure `APP_URL` e `SMTP_FROM`. Use a API HTTPS do Resend com `SMTP_HOST=smtp.resend.com`, `SMTP_USER=resend` e a chave em `SMTP_PASS`. Para outro provedor, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` e `SMTP_PASS`. O envio usa TLS direto na porta 465 ou STARTTLS nas demais portas. |
| **OpenAI · Devinho** | `OPENAI_API_KEY` habilita a seleção de dicas de Informática Básica no servidor. O pedido contém o contexto didático e opções de dicas predefinidas. `DEVINHO_MONTHLY_REQUESTS` limita o uso global mensal. O painel administrativo pode consultar o faturamento com `OPENAI_ADMIN_KEY` e `OPENAI_PROJECT_ID`. A cotação manual é configurada em `DEVINHO_USD_BRL`. |
| **Upload · Railway e Cloud Storage** | O utilitário de servidor [`uploadFiles`](lib/file-upload.ts) usa `BUCKET_NAME`, `DESTINATION_FOLDER`, `URL_FILES_APLOAD` e `AUTORIZATION_TOKEN_COQUEIRAL`. Aceita até 10 PDFs ou imagens JPG, PNG e WebP, com até 10 MB por arquivo e 30 MB por envio. O retorno inclui `message` e `urlsImagens`. Reserve o bucket público para recursos didáticos que possam ser compartilhados. |
| **Vídeos** | Cadastre os endereços HTTPS no editor da aula. Links reconhecidos do YouTube são incorporados à aula, e os demais são exibidos como links externos. |

## Autenticação e privacidade

- Senhas são armazenadas com hash scrypt e salt aleatório. Tokens de sessão e de confirmação são registrados como hashes SHA-256. A sessão dura até sete dias e usa cookie `HttpOnly`, `SameSite=Lax` e `Secure` em produção. A aplicação limita tentativas de login e operações sensíveis. As permissões são conferidas no servidor. Se usar `AUTH_CLIENT_IP_HEADER`, indique um cabeçalho que o proxy reverso sobrescreve.
- Novos cadastros ficam pendentes até a confirmação do e-mail por link de uso único válido por 24 horas. Recuperação de senha e confirmação de troca de e-mail usam links de 30 minutos. A troca de e-mail exige a senha atual e confirma o novo endereço. Alterar a senha, confirmar a troca de e-mail ou promover o perfil invalida as sessões anteriores.
- O cadastro solicita nome e e-mail. Data de nascimento, bairro, município e UF são opcionais. Esses campos são dados pessoais. As categorias sensíveis do art. 5º, II, da LGPD, como dados de saúde, biometria, origem racial ou étnica e convicção religiosa, ficam fora da coleta cadastral. Use informações fictícias nos exercícios e mantenha informações pessoais fora dos arquivos de treino. [Classificação de dados pessoais pela ANPD](https://www.gov.br/anpd/pt-br/acesso-a-informacao/perguntas-frequentes).

### Correção de dados e exclusão de conta · LGPD

Em **Minha conta**, o aluno pode corrigir os dados cadastrados e solicitar a exclusão. Em **Excluir conta**, informe a senha atual, solicite o link enviado ao e-mail cadastrado e confirme a exclusão na página aberta pelo link. O link dura 30 minutos e permite uma única confirmação.

A exclusão remove, em uma transação do MongoDB, a conta, as sessões e os registros de progresso vinculados, incluindo guia, diário e arquivos virtuais. O alcance é o banco ativo da plataforma. Preferências do navegador de treino ficam no dispositivo. Backups, arquivos públicos já enviados e registros de serviços externos seguem seus respectivos ciclos de retenção. Contadores operacionais de limite expiram conforme a configuração da plataforma.

A LGPD prevê o direito de correção e hipóteses de eliminação de dados pessoais, com as ressalvas legais aplicáveis. [Lei nº 13.709/2018, arts. 16 e 18](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm).
