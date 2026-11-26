# escoteirodevmodulo

## Executar localmente

Use Node.js 20.9 ou posterior. Preencha o `.env` com `DB_NAME` e `URL_DB`, conforme o exemplo em `.env.example`. A URI contém o usuário e a senha do MongoDB. Use `pnpm install` e `pnpm dev` e abra `http://localhost:3000`.

A rota `/cadastro` permite que cada aluno crie sua própria conta. O cadastro usa a coleção existente `alunos`. Na primeira utilização, a aplicação cria os índices de autenticação e as coleções auxiliares de sessões e limites de tentativas. O usuário do MongoDB precisa de acesso de leitura e escrita no banco da aplicação, incluindo criação de coleções e índices.

### Área de gestão

Para habilitar o primeiro administrador, cadastre e confirme a conta escolhida. Depois, selecione essa conta pelo `_id` na coleção `alunos` e defina o campo `role` como a string `administrador`. Ao entrar novamente, essa conta abre o painel `/gestao`. O cadastro público atribui o perfil `aluno`.

Em **Contas e acessos**, um administrador pode promover contas já cadastradas. Cada promoção encerra o acesso das sessões anteriores. Professores podem cadastrar e editar aulas e consultar relatórios de alunos. Administradores também podem excluir aulas e gerenciar disciplinas.

O catálogo inicial vem de `data/disciplinas.ts` e `data/lessons.ts`. Alterações do painel são gravadas em `catalogo_trilha` e passam a valer na área do aluno. A remoção de aulas ou disciplinas retira o conteúdo do catálogo e preserva os registros de progresso existentes no MongoDB.

Para enviar e-mails, configure `APP_URL` com o endereço público HTTPS e preencha `SMTP_FROM` com o remetente. Em desenvolvimento, a URL local indicada no exemplo também é aceita. Com `SMTP_HOST=smtp.resend.com` e `SMTP_USER=resend`, o aplicativo envia pela API HTTPS do Resend usando a chave em `SMTP_PASS`. Outros provedores usam `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` e `SMTP_PASS` com TLS direto na porta 465 ou STARTTLS nas demais portas.

Novos cadastros ficam pendentes até a confirmação pelo link enviado por e-mail. O link tem uso único e expira após 24 horas. Na tela de login, o aluno pode solicitar um novo link. Contas cadastradas antes da confirmação continuam com acesso. O link de recuperação de senha expira em 30 minutos, aceita um uso e a troca de senha encerra as sessões abertas da conta.

A coleção `progresso_alunos` mantém as aulas concluídas, o melhor nível de digitação e o guia para cada combinação de aluno e disciplina. A disciplina atual é Informática básica.

## Upload de arquivos de treino

Configure `BUCKET_NAME` e `DESTINATION_FOLDER` com os valores exatos do Railway. Use o endereço HTTPS da API em `URL_FILES_APLOAD` e o token da integração em `AUTORIZATION_TOKEN_COQUEIRAL`, enviado pelo cabeçalho `Authorization: Bearer`.

Em código de servidor, importe `uploadFiles` de `lib/file-upload.ts` e passe uma lista de `File`. A função aceita PDF, JPG, PNG e WebP, com até 10 arquivos, 10 MB por arquivo e 30 MB somando os arquivos. Ela retorna `message` e `urlsImagens`, inclusive para PDFs. O Railway aplica os limites de frequência e concorrência. `FileUploadError` oferece um código e, quando disponível, o status HTTP do serviço.

As URLs do bucket público são usadas diretamente. Envie somente arquivos de treino que possam ser públicos.
