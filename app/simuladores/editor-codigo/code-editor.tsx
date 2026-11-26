"use client";

import { useEffect, useRef, useState } from "react";
import { Code2, Download, Eye, Play, Square } from "lucide-react";
import { desktopEntryAt, isAvailable, isCodeFile, programmingPortfolio, subtree, type DesktopEntry, type DesktopFile } from "@/lib/desktop-files";
import CodeInput from "./code-input";
import { previewPage, sandboxSource } from "./code-sandbox";
import "./code-editor.css";

type LogLine = { level: "log" | "warn" | "error"; text: string };
const htmlFile = (name: string) => /\.html?$/i.test(name);

export default function CodeEditor({ file, items, open, change }: {
  file: DesktopFile;
  items: DesktopEntry[];
  open: (file: DesktopFile) => void;
  change: (text: string) => void;
}) {
  const text = file.text ?? "";
  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<LogLine[] | null>(null);
  const [preview, setPreview] = useState<{ title: string; html: string } | null>(null);
  const [exportError, setExportError] = useState("");
  const runner = useRef<HTMLIFrameElement>(null);
  const runId = useRef(0);
  const watchdog = useRef<number | undefined>(undefined);

  const siblings = items.filter((entry): entry is DesktopFile => entry.kind === "file" &&
    entry.parent === file.parent && isCodeFile(entry.name) && isAvailable(items, entry.id));
  const pages = siblings.filter((entry) => htmlFile(entry.name));
  const page = htmlFile(file.name) ? file : pages.find((entry) => entry.name.toLowerCase() === "index.html") ?? pages[0];
  const javascript = /\.js$/i.test(file.name);
  const portfolio = desktopEntryAt(items, [programmingPortfolio]);
  const insidePortfolio = portfolio?.kind === "folder" && subtree(items, portfolio.id).has(file.id);

  useEffect(() => {
    function receive(event: MessageEvent) {
      const data = event.data;
      if (event.source !== runner.current?.contentWindow || event.origin !== "null" ||
          data?.source !== "trilha-console" || data.id !== runId.current) return;
      if (data.kind === "line" && typeof data.text === "string" && ["log", "warn", "error"].includes(data.level)) {
        setOutput((current) => (current?.length ?? 0) >= 101 ? current
          : [...(current ?? []), { level: data.level, text: data.text.slice(0, 2000) }]);
      }
      if (data.kind === "done") {
        window.clearTimeout(watchdog.current);
        setRunning(false);
      }
    }
    window.addEventListener("message", receive);
    return () => {
      window.clearTimeout(watchdog.current);
      window.removeEventListener("message", receive);
    };
  }, []);

  function run() {
    if (!ready || !runner.current?.contentWindow) return;
    setPreview(null);
    setOutput([]);
    setRunning(true);
    runner.current.contentWindow.postMessage({ target: "trilha-console", kind: "run", id: ++runId.current, source: text }, "*");
    watchdog.current = window.setTimeout(() => {
      ++runId.current;
      runner.current?.contentWindow?.postMessage({ target: "trilha-console", kind: "stop" }, "*");
      setRunning(false);
      setOutput((current) => [...(current ?? []), { level: "error", text: "O console não respondeu. Tente executar novamente." }]);
    }, 4000);
  }

  function stop() {
    window.clearTimeout(watchdog.current);
    ++runId.current;
    runner.current?.contentWindow?.postMessage({ target: "trilha-console", kind: "stop" }, "*");
    setRunning(false);
    setOutput((current) => [...(current ?? []), { level: "warn", text: "Execução interrompida." }]);
  }

  function saveFile(content: Blob, name: string) {
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function downloadProject() {
    if (!portfolio || !insidePortfolio) return;
    setExportError("");
    try {
      const { zipSync, strToU8 } = await import("fflate");
      const files: Record<string, Uint8Array> = Object.create(null);
      function collect(parent: string, prefix: string) {
        for (const entry of items) {
          if (entry.parent !== parent || entry.deleted) continue;
          const path = `${prefix}${entry.name}`;
          if (entry.kind === "folder") collect(entry.id, `${path}/`);
          if (entry.kind === "file" && isCodeFile(entry.name)) files[path] = strToU8(entry.text ?? "");
        }
      }
      collect(portfolio.id, `${portfolio.name}/`);
      saveFile(new Blob([Uint8Array.from(zipSync(files))], { type: "application/zip" }), `${portfolio.name}.zip`);
    } catch {
      setExportError("Não foi possível gerar o ZIP. Tente novamente.");
    }
  }

  return <section className="code-workbench" aria-label="Editor de código">
    <div className="code-actions">
      <strong><Code2 size={21} aria-hidden="true" /> {file.name}</strong>
      <div>
        {javascript && (running
          ? <button type="button" className="secondary-btn" onClick={stop}><Square size={18} /> Parar</button>
          : <button type="button" className="primary-btn" disabled={!ready || !text.trim()} onClick={run}><Play size={18} /> Executar JavaScript</button>)}
        {page && <button type="button" className="secondary-btn" onClick={() => {
          setPreview({ title: page.name, html: previewPage(page, items) });
        }}><Eye size={18} /> Prévia HTML e CSS</button>}
        <button type="button" className="secondary-btn" onClick={() => saveFile(new Blob([text], { type: "text/plain;charset=utf-8" }), file.name)}>
          <Download size={18} /> Baixar arquivo
        </button>
        {insidePortfolio && <button type="button" className="secondary-btn" onClick={() => void downloadProject()}>
          <Download size={18} /> Baixar portfólio
        </button>}
      </div>
    </div>
    {exportError && <p role="alert">{exportError}</p>}
    {siblings.length > 1 && <nav className="code-file-list" aria-label="Arquivos da pasta">
      {siblings.map((entry) => <button key={entry.id} type="button" aria-current={entry.id === file.id ? "true" : undefined}
        className="secondary-btn" onClick={() => open(entry)}>{entry.name}</button>)}
    </nav>}
    <CodeInput filename={file.name} text={text} change={change} />
    {javascript && <iframe hidden title="Ambiente isolado do console" ref={runner} onLoad={() => setReady(true)}
      sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={sandboxSource} />}
    {output && <section className="code-console" aria-label="Console JavaScript">
      <h2>Console</h2>
      <p role="status">{running ? "Executando." : output.length ? "Execução encerrada." : "Execução encerrada. Use console.log() para exibir valores."}</p>
      {output.length > 0 && <ol aria-label="Saída do console">
        {output.map(({ level, text: line }, index) => <li data-level={level} key={index}>{line}</li>)}
      </ol>}
    </section>}
    {preview && <section className="code-preview">
      <h2>Prévia de {preview.title}</h2>
      <p>A prévia mostra o HTML e o CSS da pasta. Para testar interações e jogos, baixe o portfólio e abra a página no navegador do seu computador.</p>
      <iframe sandbox="" referrerPolicy="no-referrer" title={`Prévia de ${preview.title}`} srcDoc={preview.html} />
    </section>}
  </section>;
}
