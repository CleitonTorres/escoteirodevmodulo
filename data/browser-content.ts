export const engines = {
  google: { name: "Google", host: "google.com", theme: "blue" },
  bing: { name: "Bing", host: "bing.com", theme: "teal" },
  duckduckgo: { name: "DuckDuckGo", host: "duckduckgo.com", theme: "orange" },
} as const;
export type Engine = keyof typeof engines;

export const articles = [
  { id: "senhas", host: "trilha.example", title: "Como criar senhas fortes", summary: "Aprenda a escolher senhas longas e únicas e usar um gerenciador de senhas.", tags: "senha password segurança digital autenticação",
    paragraphs: ["Use uma senha longa e diferente em cada conta. Um gerenciador confiável pode gerar senhas aleatórias e preenchê-las no site correspondente.", "Ative a verificação em duas etapas sempre que disponível. Em um computador compartilhado, recuse o salvamento da senha e saia da conta ao terminar."] },
  { id: "mensagens", host: "trilha.example", title: "Segurança digital e mensagens suspeitas", summary: "Reconheça pedidos urgentes, links inesperados e tentativas de obter dados pessoais.", tags: "phishing golpe fraude privacidade segurança digital",
    paragraphs: ["Mensagens que exigem ação imediata merecem uma pausa. Confira o remetente e procure a organização por um canal que você já conhece.", "O HTTPS protege a conexão com o domínio exibido. Confira também o endereço e a identidade do site antes de compartilhar informações."] },
  { id: "fontes", host: "biblioteca.example", title: "Como comparar fontes em uma pesquisa", summary: "Confira autoria, data e evidências antes de usar um resultado.", tags: "google bing duckduckgo busca internet pesquisa informação",
    paragraphs: ["Comece com uma pergunta específica e compare pelo menos duas fontes independentes.", "Confira quem publicou, quando a página foi atualizada e quais evidências ela apresenta. Um anúncio pode aparecer antes dos demais resultados."] },
  { id: "arquivos", host: "biblioteca.example", title: "Organize os arquivos do computador", summary: "Use pastas e nomes claros para localizar documentos de estudo.", tags: "informática básica documentos downloads área de trabalho",
    paragraphs: ["Agrupe documentos por assunto e escolha nomes que indiquem seu conteúdo.", "Revise a pasta de downloads e mantenha cópias dos arquivos importantes. Antes de abrir um arquivo recebido, confirme sua origem."] },
  { id: "navegador", host: "trilha.example", title: "O que é um navegador de internet?", summary: "Entenda para que servem a barra de endereços, o histórico e os favoritos.", tags: "chrome firefox edge informática navegador browser internet",
    paragraphs: ["O navegador exibe páginas. Um buscador, como Google ou Bing, ajuda a encontrar páginas a partir de palavras-chave.", "Você pode digitar um endereço na barra superior, voltar às páginas anteriores e guardar endereços visitados nos favoritos."] },
] as const;

export type BrowserPage = { kind: "start" } | { kind: "tips" } | { kind: "security" } | { kind: "login" }
  | { kind: "search"; term: string; engine: Engine }
  | { kind: "article"; id: string };

export const homePage: BrowserPage = { kind: "start" };
const homeUrl = "https://trilha.example";
export const demoAccount = { name: "estudante@trilha.example", password: "Treino!Farol-28-Lua", site: "portal.trilha.example" };

export function getEngine(value: unknown): Engine | undefined {
  return typeof value === "string" && Object.hasOwn(engines, value) ? value as Engine : undefined;
}

export function pageTitle(page: BrowserPage) {
  switch (page.kind) {
    case "start": return "Nova página";
    case "tips": return "Pesquisa guiada";
    case "security": return "Central de segurança";
    case "login": return "Portal de treino";
    case "search": return page.term + " · " + engines[page.engine].name;
    case "article": return articles.find((article) => article.id === page.id)?.title ?? "Página de treino";
  }
}

export function pageAddress(page: BrowserPage) {
  switch (page.kind) {
    case "start": return homeUrl;
    case "tips": return homeUrl + "/pesquisa";
    case "security": return homeUrl + "/seguranca";
    case "login": return "https://" + demoAccount.site;
    case "search": return `https://busca.trilha.example/${page.engine}?${new URLSearchParams({ q: page.term })}`;
    case "article": return "https://" + articles.find((article) => article.id === page.id)?.host + "/" + page.id;
  }
}

export function resolveAddress(address: string) {
  try {
    const url = new URL(address.includes("://") ? address : "https://" + address);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return undefined;
    const host = url.hostname.replace(/^www\./, "");
    const engine = Object.keys(engines).map(getEngine).find((key) => key && engines[key].host === host)
      ?? (host === "busca.trilha.example" ? getEngine(url.pathname.slice(1)) : undefined);
    if (engine) {
      const term = url.searchParams.get("q")?.trim().slice(0, 180);
      const page: BrowserPage = term ? { kind: "search", term, engine } : homePage;
      return { page, engine };
    }
    const routes: BrowserPage[] = [homePage, { kind: "tips" }, { kind: "security" }, { kind: "login" },
      ...articles.map((article): BrowserPage => ({ kind: "article", id: article.id }))];
    const canonical = url.origin + (url.pathname === "/" ? "" : url.pathname.replace(/\/$/, ""));
    const page = routes.find((route) => pageAddress(route) === canonical);
    if (page) return { page };
  } catch {
    return undefined;
  }
}

const normalize = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
const ignored = new Set(["a", "o", "as", "os", "de", "do", "da", "em", "um", "uma", "e", "com", "para", "como"]);

export function searchArticles(term: string) {
  const tokens = normalize(term).match(/-?"[^"]+"|[^\s"]+/g) ?? [];
  const sites = tokens.filter((token) => token.startsWith("site:")).map((token) => token.slice(5).replace(/^www\./, ""));
  const excluded = tokens.filter((token) => token.startsWith("-")).map((token) => token.slice(1).replaceAll('"', "")).filter(Boolean);
  const required = tokens.filter((token) => !token.startsWith("site:") && !token.startsWith("-") && !ignored.has(token))
    .map((token) => token.replaceAll('"', ""));
  return articles.filter((article) => {
    const text = normalize([article.title, article.summary, article.tags].join(" "));
    return (!sites.length || sites.some((site) => article.host === site || article.host.endsWith("." + site)))
      && required.every((token) => text.includes(token))
      && !excluded.some((token) => text.includes(token));
  });
}

export const searchTips = [
  { title: "Escolha palavras-chave", detail: "Comece pelo assunto e acrescente um detalhe para diminuir o número de resultados.", query: "segurança digital" },
  { title: "Procure uma expressão exata", detail: "Use aspas para buscar as palavras juntas e na mesma ordem.", query: '"segurança digital"' },
  { title: "Limite a busca a um site", detail: "Use site: seguido do domínio, sem espaço depois dos dois pontos.", query: "site:trilha.example internet" },
  { title: "Exclua um termo", detail: "Use o sinal de menos antes da palavra que você quer excluir.", query: "segurança -mensagens" },
];

export const challenges = [
  { question: "Uma mensagem inesperada diz que sua conta será bloqueada hoje. O que você faz?",
    options: ["Abro o link enviado para conferir.", "Acesso a conta pelo endereço que já conheço.", "Encaminho a mensagem para outras pessoas."],
    answer: 1, feedback: "Acesse o serviço por um endereço conhecido. Pedidos urgentes e inesperados podem ser tentativas de phishing." },
  { question: "O endereço de uma página começa com HTTPS. O que isso indica?",
    options: ["A conexão com o domínio exibido é criptografada.", "O site pertence à marca que aparece na página.", "Todos os arquivos do site são seguros."],
    answer: 0, feedback: "HTTPS protege a conexão. Confira também o domínio, a origem da página e o motivo do pedido." },
  { question: "Você terminou de usar sua conta em um computador compartilhado. Qual é o próximo passo?",
    options: ["Salvar a senha para entrar mais rápido.", "Fechar a aba e deixar a sessão aberta.", "Sair da conta e recusar o salvamento da senha."],
    answer: 2, feedback: "Em computadores compartilhados, encerre a sessão e guarde suas senhas apenas em um ambiente pessoal e protegido." },
];
