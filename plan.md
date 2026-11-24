# Plano — Trilha Digital Coqueiral

## Escopo e implementação
Portal web em Next.js/TypeScript responsivo, conteúdo e estado inicial em `localStorage`, com camada de repositório isolando persistência para permitir substituição posterior por MongoDB sem acoplar os componentes. A experiência inicial será um painel de aprendizagem com as 12 aulas identificadas no índice da apostila, agrupadas por mês. Todas as aulas seguirão a mesma estrutura: treino de digitação com teclado virtual e níveis progressivos; teoria com vídeo associado ao canal EscoteiroDev; prática com atividades guiadas; e editor de guia próprio com salvamento local.

A aplicação terá simuladores didáticos integrados: área de trabalho/gerenciador de arquivos (pastas, arquivos, renomear, mover, excluir e restaurar via lixeira), editor de texto inspirado em Word, planilha inspirada em Excel e navegador simulado com páginas didáticas e pesquisa segura. Serão experiências pedagógicas locais, sem pretensão de substituir os produtos comerciais nem apagar arquivos do computador real. Progresso, precisão/velocidade da digitação, conclusão de exercícios e guia ficarão no navegador. Dados ficarão atrás de uma interface de repositório para futura implementação MongoDB.

O conteúdo-base do cronograma corresponde às 12 aulas do índice da apostila: 1 introdução digital; 2 teclado/digitação; 3 mouse; 4 hardware; 5 sistema operacional; 6 atalhos; 7 personalização; 8 internet/navegadores; 9 editor de texto básico; 10 recursos avançados; 11 segurança digital; 12 revisão/apresentação. O índice e títulos serão refletidos em dados estruturados, prontos para complementação com o texto integral de cada aula. Para a fase inicial, cada aula terá objetivos, texto teórico conciso, prática concreta e proposta de seção para o guia.

## Estrutura do projeto
- `app/`: shell visual, rotas e páginas Next.js.
- `components/`: cartões de aula, teclado, simuladores, editor do guia e navegação.
- `data/`: cronograma, conteúdos e níveis de digitação.
- `lib/storage/`: contrato de persistência local e adaptador, com futura implementação MongoDB separável.
- `public/`: manifesto de rotas e ativos estáticos.

Stack: Next.js App Router, React, TypeScript, CSS responsivo e ícones SVG. O projeto é inicializado sem banco provisionado; o estado inicial é local no navegador, conforme pedido.

## Design
Referência aplicada: identidade institucional do 19º Grupo Escoteiro Coqueiral, com linguagem de painel educacional escoteiro, sem imitar logotipos oficiais não fornecidos.

- **Movimento:** editorial institucional contemporâneo com sinalização de campo escoteiro.
- **Princípios:** clareza para iniciantes; progresso visível; simplicidade acolhedora; simulações seguras e reversíveis.
- **Cores:** verde-floresta como assinatura institucional e confiança; amarelo-ouro para marcos de progresso; fundo marfim para leitura; azul suave em ações tecnológicas.
- **Layout:** navegação lateral persistente no desktop, área principal de aprendizagem e painel contextual de próxima etapa; no celular navegação recolhida e cartões empilhados.
- **Assinaturas:** marcadores numerados de aula; anéis/barras de progresso; cartões com pequenos acentos em ouro e verde.
- **Interação/animação:** feedback imediato e calmo; estados concluídos claros; transições curtas; sem movimento decorativo constante.
- **Tipografia:** Geist Sans para interface e leitura, mono para teclas/atalhos; títulos compactos e corpo confortável.
- **Essência:** “Aprender informática fazendo, com a trilha do Coqueiral.” Personalidade: acolhedora, prática, exploradora.
- **Voz:** frases diretas e encorajadoras. Exemplos: “Sua próxima descoberta começa aqui.” “Pratique sem medo: este computador é de treino.”
- **Marca:** wordmark tipográfico “Trilha Digital” com bússola/rosa dos ventos simples em SVG e referência textual discreta ao 19º Grupo Escoteiro Coqueiral.
- **Cor própria:** verde-floresta.

## Organização de conteúdo e dados
Aulas como objetos tipados com id, módulo/mês, título, objetivos, teoria, URL de vídeo, atividade prática e tarefa do guia. Progresso por usuário local (progresso de aula, lições de digitação, atividades marcadas e conteúdo do guia). O vídeo do canal informado será referenciado como destino de canal até que sejam cadastradas URLs específicas por aula; não inventar vídeos. Teclas e simuladores operarão dentro do site, nunca sobre o computador real.
