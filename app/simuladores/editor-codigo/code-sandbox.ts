import { desktopEntryAt, desktopPath, type DesktopEntry, type DesktopFile } from "@/lib/desktop-files";

const workerBootstrap = String.raw`
const send = self.postMessage.bind(self);
const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
const listen = self.addEventListener.bind(self);
let lines = 0;
const display = (value) => {
  if (typeof value === 'string') return value.slice(0, 1200);
  try { return (JSON.stringify(value) ?? String(value)).slice(0, 1200); }
  catch { return '[valor sem representação]'; }
};
const push = (level) => (...values) => {
  if (lines++ < 100) send({ kind: 'line', level, text: values.slice(0, 20).map(display).join(' ').slice(0, 2000) });
};
const output = Object.freeze({ log: push('log'), info: push('log'), warn: push('warn'), error: push('error'), table: push('log') });
listen('message', async ({ data }) => {
  try { await new AsyncFunction('console', '"use strict";\n' + data)(output); }
  catch (error) { push('error')(error?.name + ': ' + error?.message); }
  finally { send({ kind: 'done' }); }
}, { once: true });
// The CSP also blocks network requests and loads from the worker.
for (const name of ['postMessage', 'Worker', 'SharedWorker', 'BroadcastChannel', 'importScripts']) {
  Object.defineProperty(self, name, { value: undefined, writable: false, configurable: false });
}
`;

// Learner code is sent as a message and is only evaluated in the worker on the frame's opaque origin.
export const sandboxSource = `<!doctype html><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-trilha-console' 'unsafe-eval'; worker-src blob:; connect-src 'none'; base-uri 'none'; form-action 'none'">
<script nonce="trilha-console">
const workerSource = ${JSON.stringify(workerBootstrap)};
let current;
const reply = (id, data) => parent.postMessage({ source: 'trilha-console', id, ...data }, '*');
function stop() {
  if (!current) return;
  clearTimeout(current.timeout);
  current.worker.terminate();
  URL.revokeObjectURL(current.url);
  current = undefined;
}
addEventListener('message', ({ source, data }) => {
  if (source !== parent || !data || data.target !== 'trilha-console') return;
  stop();
  if (data.kind !== 'run' || typeof data.source !== 'string' || data.source.length > 50000) return;
  const id = data.id;
  const url = URL.createObjectURL(new Blob([workerSource], { type: 'text/javascript' }));
  try {
    const worker = new Worker(url, { name: 'trilha-console' });
    const timeout = setTimeout(() => {
      reply(id, { kind: 'line', level: 'error', text: 'Tempo esgotado. Confira se as repetições do seu código terminam.' });
      reply(id, { kind: 'done' });
      stop();
    }, 2500);
    current = { worker, timeout, url };
    worker.onmessage = ({ data: result }) => {
      if (current?.worker !== worker) return;
      reply(id, result);
      if (result.kind === 'done') stop();
    };
    worker.onerror = () => {
      reply(id, { kind: 'line', level: 'error', text: 'O navegador não conseguiu iniciar o console de treino.' });
      reply(id, { kind: 'done' });
      stop();
    };
    worker.postMessage(data.source);
  } catch {
    URL.revokeObjectURL(url);
    reply(id, { kind: 'line', level: 'error', text: 'O console de treino não está disponível neste navegador.' });
    reply(id, { kind: 'done' });
  }
});
</script>`;

const tags = new Set("a article aside audio b blockquote br button canvas caption code dd div dl dt em figcaption figure footer h1 h2 h3 h4 h5 h6 header hr i img label li main nav ol p pre section small span strong sub sup table tbody td th thead tr ul".split(" "));
const attributes = new Set("alt class colspan dir height id lang role rowspan style title width".split(" "));

function stylesheetAt(reference: string, page: DesktopFile, items: DesktopEntry[]) {
  if (!reference || /^(?:[a-z][a-z0-9+.-]*:|[\\/])/i.test(reference)) return;
  try {
    const pagePath = desktopPath(page, items);
    const base = new URL(pagePath.map(encodeURIComponent).join("/"), "https://portfolio.invalid/");
    const url = new URL(reference, base);
    if (url.origin !== base.origin || !/\.css$/i.test(url.pathname)) return;
    const path = url.pathname.split("/").slice(1).map(decodeURIComponent);
    if (path[0] !== pagePath[0]) return;
    const entry = desktopEntryAt(items, path);
    return entry?.kind === "file" ? entry.text : undefined;
  } catch {
    return;
  }
}

export function previewPage(page: DesktopFile, items: DesktopEntry[]) {
  const template = document.createElement("template");
  template.innerHTML = page.text ?? "";
  const styles: string[] = [];
  for (const element of template.content.querySelectorAll("*")) {
    if (element.namespaceURI !== "http://www.w3.org/1999/xhtml") { element.remove(); continue; }
    if (element.localName === "style") styles.push(element.textContent ?? "");
    if (element.localName === "link" && element.getAttribute("rel")?.toLowerCase() === "stylesheet") {
      styles.push(stylesheetAt(element.getAttribute("href") ?? "", page, items) ?? "");
    }
    if (!tags.has(element.localName)) { element.remove(); continue; }
    for (const attribute of Array.from(element.attributes)) {
      const accessibility = attribute.name.startsWith("aria-");
      const fragment = element.localName === "a" && attribute.name === "href" && attribute.value.startsWith("#");
      const image = element.localName === "img" && attribute.name === "src" && /^data:image\/(?:png|jpeg|webp|gif);base64,[a-z0-9+/=]+$/i.test(attribute.value);
      if (fragment) element.setAttribute("href", `about:srcdoc${attribute.value}`);
      else if (!attributes.has(attribute.name) && !accessibility && !image) element.removeAttribute(attribute.name);
    }
  }
  const css = styles.join("\n").replace(/<\/style/gi, "<\\/style");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'none'; img-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
    <style>body { margin: 1rem; font: 1rem/1.6 system-ui, sans-serif; overflow-wrap: anywhere; }</style><style>${css}</style>
    </head><body>${template.innerHTML}</body></html>`;
}
