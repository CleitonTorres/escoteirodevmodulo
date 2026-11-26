"use client";

import { ArrowLeft, ArrowRight, BookOpen, Compass, Eye, EyeOff, Globe2, House, KeyRound, LockKeyhole, RotateCw, Search, ShieldCheck, Star, Trash2, X } from "lucide-react";
import { useEffect, useId, useState, type FormEvent } from "react";
import { articles, challenges, demoAccount, engines, getEngine, homePage, pageAddress, pageTitle, resolveAddress, searchArticles, searchTips, type BrowserPage, type Engine } from "@/data/browser-content";
import "./browser-simulator.css";

type Preferences = { favorites: string[]; demoPasswordSaved: boolean; engine: Engine };
type Navigate = (page: BrowserPage) => void;
const defaults: Preferences = { favorites: [], demoPasswordSaved: false, engine: "google" };

import type { PracticeEvent } from "@/lib/practice";

export default function BrowserSimulator({ studentId, observe }: { studentId: string; observe: (event: PracticeEvent) => void }) {
  const [preferences, setPreferences] = useState(defaults);
  const [history, setHistory] = useState({ pages: [homePage], index: 0 });
  const [address, setAddress] = useState(pageAddress(homePage));
  const [panel, setPanel] = useState<"favorites" | "passwords" | null>(null);
  const [notice, setNotice] = useState("");
  const [addressError, setAddressError] = useState("");
  const [reload, setReload] = useState(0);
  const [ready, setReady] = useState(false);
  const panelId = useId();
  const key = "aprender/browser/" + studentId;
  const page = history.pages[history.index];
  const currentAddress = pageAddress(page);
  const favorite = preferences.favorites.includes(currentAddress);
  const engine = page.kind === "search" ? page.engine : preferences.engine;

  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(key) ?? "null");
      if (cached && typeof cached === "object") {
        const favorites = Array.isArray(cached.favorites) ? cached.favorites.slice(0, 40).flatMap((item: unknown) => {
          const target = typeof item === "string" && item.length <= 750 ? resolveAddress(item) : undefined;
          return target ? [pageAddress(target.page)] : [];
        }) : [];
        setPreferences({ favorites: [...new Set<string>(favorites)], demoPasswordSaved: cached.demoPasswordSaved === true,
          engine: getEngine(cached.engine) ?? "google" });
      }
    } catch {
      setNotice("As preferências de treino serão mantidas nesta sessão.");
    }
    setReady(true);
  }, [key]);

  function updatePreferences(update: Partial<Preferences>, message: string) {
    const next = { ...preferences, ...update };
    setPreferences(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setNotice(message);
    } catch {
      setNotice((message ? message + " " : "") + "A alteração vale para esta sessão.");
    }
  }

  function navigate(next: BrowserPage) {
    if (next.kind === "search") observe({ kind: "search", engine: next.engine, term: next.term });
    const nextAddress = pageAddress(next);
    setAddress(nextAddress);
    setAddressError("");
    setHistory((state) => {
      if (pageAddress(state.pages[state.index]) === nextAddress) return state;
      const pages = [...state.pages.slice(0, state.index + 1), next].slice(-80);
      return { pages, index: pages.length - 1 };
    });
  }

  function step(offset: number) {
    const index = history.index + offset;
    const target = history.pages[index];
    if (!target) return;
    setHistory({ ...history, index });
    setAddress(pageAddress(target));
    setAddressError("");
  }

  function search(term: string, at = engine) {
    const text = term.trim().slice(0, 180);
    if (text) navigate({ kind: "search", engine: at, term: text });
  }

  function submitAddress(event: FormEvent) {
    event.preventDefault();
    const text = address.trim();
    if (!text) return;
    const target = resolveAddress(text);
    if (target) {
      if (target.engine) updatePreferences({ engine: target.engine }, "");
      navigate(target.page);
    } else if (!/^site:/i.test(text) && (/^[a-z][a-z\d+.-]*:/i.test(text) || /^[^\s/]+\.[^\s/]+(?:[/\s]|$)/.test(text))) {
      setAddressError("Endereço fora do treino. Tente trilha.example, google.com, bing.com ou uma pesquisa.");
    } else search(text);
  }

  function toggleFavorite(url: string) {
    const saved = preferences.favorites.includes(url);
    if (!saved && preferences.favorites.length >= 40) {
      setNotice("Remova um favorito antes de adicionar outro.");
      return;
    }
    updatePreferences({ favorites: saved ? preferences.favorites.filter((item) => item !== url) : [...preferences.favorites, url] },
      saved ? "Favorito removido." : "Página adicionada aos favoritos.");
    if (!saved) observe({ kind: "favorite", url });
  }

  function changeEngine(next: Engine) {
    updatePreferences({ engine: next }, "");
    if (page.kind === "search") search(page.term, next);
  }

  const article = page.kind === "article" ? articles.find((item) => item.id === page.id) : undefined;
  const results = page.kind === "search" ? searchArticles(page.term) : [];
  return (
    <section className="training-browser" aria-label="Navegador de treino" data-engine={engines[engine].theme}>
      <div className="training-browser-tabs">
        <span className="training-browser-tab"><Globe2 size={17} aria-hidden="true" /> <span>{pageTitle(page)}</span></span>
        <span className="training-browser-mode"><ShieldCheck size={16} aria-hidden="true" /> Ambiente de treino</span>
      </div>
      <div className="training-browser-toolbar">
        <div className="training-browser-actions" aria-label="Controles de navegação" role="group">
          <button type="button" className="training-icon" title="Voltar" aria-label="Voltar" disabled={history.index === 0} onClick={() => step(-1)}><ArrowLeft size={20} /></button>
          <button type="button" className="training-icon" title="Avançar" aria-label="Avançar" disabled={history.index >= history.pages.length - 1} onClick={() => step(1)}><ArrowRight size={20} /></button>
          <button type="button" className="training-icon" title="Recarregar" aria-label="Recarregar" onClick={() => { setAddress(currentAddress); setAddressError(""); setReload((count) => count + 1); }}><RotateCw size={18} /></button>
          <button type="button" className="training-icon" title="Página inicial" aria-label="Página inicial" onClick={() => navigate(homePage)}><House size={19} /></button>
        </div>
        <form className="training-address" aria-label="Navegar por endereço" onSubmit={submitAddress}>
          <LockKeyhole size={17} aria-hidden="true" />
          <input aria-label="Endereço ou pesquisa" aria-invalid={!!addressError} type="text" inputMode="url" autoComplete="off" spellCheck={false}
            maxLength={750} value={address} onChange={(event) => { setAddress(event.target.value); setAddressError(""); }} />
          <button type="button" className="training-icon" disabled={!ready} aria-pressed={favorite}
            title={favorite ? "Remover dos favoritos" : "Salvar nos favoritos"} aria-label={favorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
            onClick={() => toggleFavorite(currentAddress)}><Star size={18} fill={favorite ? "currentColor" : "none"} /></button>
        </form>
        <div className="training-browser-actions">
          <button type="button" className="training-icon" title="Favoritos" aria-label="Favoritos" aria-expanded={panel === "favorites"}
            aria-controls={panel === "favorites" ? panelId : undefined} onClick={() => setPanel(panel === "favorites" ? null : "favorites")}><BookOpen size={20} /></button>
          <button type="button" className="training-icon" title="Senhas de treino" aria-label="Senhas de treino" aria-expanded={panel === "passwords"}
            aria-controls={panel === "passwords" ? panelId : undefined} onClick={() => setPanel(panel === "passwords" ? null : "passwords")}><KeyRound size={20} /></button>
        </div>
      </div>
      {addressError && <p role="alert" className="training-browser-notice">{addressError}</p>}
      <div className="training-browser-layout" data-panel={!!panel}>
        <div className="training-browser-page" key={currentAddress + ":" + reload}>
          {(page.kind === "start" || page.kind === "search") && <>
            {page.kind === "start" && <div className="training-browser-welcome"><Compass size={37} aria-hidden="true" /><h2>Busca de treino</h2>
              <p>Escolha um buscador e encontre páginas dentro do simulador.</p></div>}
            <SearchBox key={page.kind === "search" ? page.term : "start"} value={page.kind === "search" ? page.term : ""} engine={engine} search={search} changeEngine={changeEngine} ready={ready} />
            {page.kind === "start" ? <div className="training-shortcuts">
              <Shortcut icon={<Search size={22} />} title="Pesquisa guiada" detail="Aprenda a refinar resultados" open={() => navigate({ kind: "tips" })} />
              <Shortcut icon={<ShieldCheck size={22} />} title="Central de segurança" detail="Resolva situações de navegação" open={() => navigate({ kind: "security" })} />
              <Shortcut icon={<KeyRound size={22} />} title="Portal de treino" detail="Pratique o salvamento de senhas" open={() => navigate({ kind: "login" })} />
            </div> : <div className="training-results" aria-live="polite">
              <p>{results.length} {results.length === 1 ? "resultado" : "resultados"} de treino para <strong>{page.term}</strong></p>
              {results.map((result) => <article key={result.id}>
                <small>{result.host}</small>
                <h3><button type="button" onClick={() => navigate({ kind: "article", id: result.id })}>{result.title}</button></h3>
                <p>{result.summary}</p>
              </article>)}
              {!results.length && <p>Tente “senhas”, “navegador” ou “segurança digital”.</p>}
              <button type="button" className="training-link" onClick={() => navigate({ kind: "tips" })}>Ver dicas de pesquisa</button>
            </div>}
          </>}
          {page.kind === "tips" && <div className="training-lesson">
            <h2>Pesquisa guiada</h2><p>Compare os resultados e confira autoria, data e evidências antes de usar uma informação.</p>
            <ul className="training-tips">{searchTips.map((tip) => <li key={tip.title}><h3>{tip.title}</h3><p>{tip.detail}</p>
              <button type="button" className="training-query" onClick={() => search(tip.query)}>{tip.query} <Search size={15} aria-hidden="true" /></button>
            </li>)}</ul>
          </div>}
          {page.kind === "security" && <SecurityQuiz />}
          {page.kind === "login" && <DemoLogin ready={ready} saved={preferences.demoPasswordSaved}
            save={() => updatePreferences({ demoPasswordSaved: true }, "Senha fictícia salva. Abra Senhas de treino para gerenciá-la.")} />}
          {article && <article className="training-lesson"><p className="training-source">{article.host}</p><h2>{article.title}</h2>
            {article.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article>}
        </div>
        {panel && <aside id={panelId} className="training-panel" aria-label={panel === "favorites" ? "Páginas favoritas" : "Gerenciador de senhas de treino"}>
          <header><h2>{panel === "favorites" ? "Favoritos" : "Senhas de treino"}</h2>
            <button type="button" className="training-icon" aria-label="Fechar painel" onClick={() => setPanel(null)}><X size={20} /></button></header>
          {panel === "favorites" ? (preferences.favorites.length ? <ul className="training-favorites">
            {preferences.favorites.map((url) => {
              const target = resolveAddress(url);
              return target && <li key={url}><button type="button" className="training-link"
                onClick={() => { navigate(target.page); setPanel(null); }}>{pageTitle(target.page)}</button>
                <button type="button" className="training-icon" aria-label={`Remover favorito ${pageTitle(target.page)}`} onClick={() => toggleFavorite(url)}><Trash2 size={17} /></button>
              </li>;
            })}</ul> : <p>Use a estrela da barra de endereços para guardar a página atual.</p>)
            : <PasswordPanel saved={preferences.demoPasswordSaved} navigate={(target) => { navigate(target); setPanel(null); }}
              remove={() => updatePreferences({ demoPasswordSaved: false }, "Senha fictícia removida.")} />}
        </aside>}
      </div>
      <footer className="training-browser-footer"><ShieldCheck size={17} aria-hidden="true" /> Páginas e credenciais fictícias
        <span role="status">{notice}</span></footer>
    </section>
  );
}

function SearchBox({ value, engine, search, changeEngine, ready }: {
  value: string; engine: Engine; search: (value: string) => void; changeEngine: (value: Engine) => void; ready: boolean;
}) {
  const [term, setTerm] = useState(value);
  return <div className="training-search">
    <div role="group" aria-label="Buscador" className="training-engines">
      {(Object.keys(engines) as Engine[]).map((id) => <button key={id} type="button" disabled={!ready}
        aria-pressed={id === engine} onClick={() => changeEngine(id)}>{engines[id].name}</button>)}
    </div>
    <form aria-label="Pesquisar páginas de treino" onSubmit={(event) => { event.preventDefault(); search(term); }}>
      <Search size={21} aria-hidden="true" />
      <input aria-label="Termos da pesquisa" type="search" value={term} maxLength={180}
        placeholder="O que você quer pesquisar?" onChange={(event) => setTerm(event.target.value)} />
      <button type="submit" className="training-primary" disabled={!term.trim()}>Pesquisar</button>
    </form>
  </div>;
}

function Shortcut({ icon, title, detail, open }: { icon: React.ReactNode; title: string; detail: string; open: () => void }) {
  return <button type="button" onClick={open}><span aria-hidden="true">{icon}</span><strong>{title}</strong><small>{detail}</small></button>;
}

function SecurityQuiz() {
  const [question, setQuestion] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const challenge = challenges[question];
  return <div className="training-lesson">
    <h2>Central de segurança</h2>
    {challenge ? <>
      <p className="training-source">Situação {question + 1} de {challenges.length}</p>
      <h3>{challenge.question}</h3>
      <div className="training-answers">{challenge.options.map((option, index) =>
        <button key={option} type="button" disabled={answer !== null}
          data-answer={answer === null ? undefined : index === challenge.answer ? "correct" : index === answer ? "incorrect" : undefined}
          onClick={() => { setAnswer(index); if (index === challenge.answer) setScore((total) => total + 1); }}>{option}</button>)}</div>
      {answer !== null && <><p role="status"><strong>{answer === challenge.answer ? "Correto. " : "Vale revisar. "}</strong>{challenge.feedback}</p>
        <button type="button" className="training-primary" onClick={() => { setQuestion((index) => index + 1); setAnswer(null); }}>
          {question + 1 < challenges.length ? "Próxima situação" : "Ver resultado"}</button></>}
    </> : <><p role="status">Você acertou {score} de {challenges.length} situações.</p>
      <button type="button" className="training-primary" onClick={() => { setQuestion(0); setScore(0); }}>Refazer desafio</button></>}
  </div>;
}

function DemoLogin({ saved, save, ready }: { saved: boolean; save: () => void; ready: boolean }) {
  const [filled, setFilled] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  return <div className="training-lesson training-login">
    <h2>Portal de treino</h2>
    <p>Use a conta fictícia para praticar o preenchimento e o salvamento de senhas.</p>
    {!signedIn ? <>
      <button type="button" className="training-secondary" onClick={() => setFilled(true)}>{saved ? "Usar senha salva" : "Preencher conta fictícia"}</button>
      <form onSubmit={(event) => { event.preventDefault(); if (filled) setSignedIn(true); }} autoComplete="off">
        <label>Conta fictícia<input type="text" value={filled ? demoAccount.name : ""} readOnly autoComplete="off" /></label>
        <label>Senha fictícia<input type="password" value={filled ? demoAccount.password : ""} readOnly autoComplete="off" /></label>
        <button type="submit" className="training-primary" disabled={!filled}>Entrar na conta de treino</button>
      </form>
    </> : <div className="training-login-result"><p role="status">Você entrou no portal fictício.</p>
      {!saved && <button type="button" className="training-primary" disabled={!ready} onClick={save}>Salvar senha de treino</button>}
      <button type="button" className="training-secondary" onClick={() => { setSignedIn(false); setFilled(false); }}>Sair da conta de treino</button></div>}
  </div>;
}

function PasswordPanel({ saved, navigate, remove }: { saved: boolean; navigate: Navigate; remove: () => void }) {
  const [visible, setVisible] = useState(false);
  return saved ? <div className="training-password">
    <strong>{demoAccount.site}</strong><small>{demoAccount.name}</small>
    <div><code>{visible ? demoAccount.password : "••••••••••••"}</code>
      <button type="button" className="training-icon" aria-label={visible ? "Ocultar senha fictícia" : "Mostrar senha fictícia"}
        onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
    <button type="button" className="training-link" onClick={() => { setVisible(false); remove(); }}>Remover senha de treino</button>
  </div> : <><p>Salve uma senha fictícia no portal para praticar.</p>
    <button type="button" className="training-link" onClick={() => navigate({ kind: "login" })}>Abrir portal de treino</button></>;
}
