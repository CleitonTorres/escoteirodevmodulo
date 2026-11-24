"use client";

import { useCallback, useEffect, useRef, useState, type SetStateAction } from "react";
import { desktopSizeError, initialDesktopItems, type DesktopEntry, type DesktopProgress } from "@/lib/desktop-files";
import { salvarDesktop } from "./progresso-actions";

type SaveState = { status: "ready" | "pending" | "saved" } | { status: "error"; message: string };

export function useDesktopProgress(initial?: DesktopProgress) {
  const [items, setItems] = useState(initial?.items ?? initialDesktopItems);
  const [state, setState] = useState<SaveState>({ status: initial ? "saved" : "ready" });
  const latest = useRef(items);
  const saved = useRef(items);
  const revision = useRef(initial?.revision ?? 0);
  const attempted = useRef<DesktopEntry[] | null>(null);
  const inFlight = useRef<Promise<boolean> | null>(null);

  const flush = useCallback(() => {
    if (inFlight.current) return inFlight.current;
    if (saved.current === latest.current) return Promise.resolve(true);
    setState({ status: "pending" });

    async function save() {
      while (saved.current !== latest.current) {
        const draft = attempted.current ?? latest.current;
        attempted.current = draft;
        const result = await salvarDesktop(draft, revision.current);
        if (!result.ok) {
          setState({ status: "error", message: result.error });
          return false;
        }
        attempted.current = null;
        revision.current = result.revision;
        saved.current = draft;
      }
      setState({ status: "saved" });
      return true;
    }

    inFlight.current = save().catch(() => {
      setState({ status: "error", message: "Não foi possível salvar o desktop. Tente novamente." });
      return false;
    }).finally(() => { inFlight.current = null; });
    return inFlight.current;
  }, []);

  function changeItems(update: SetStateAction<DesktopEntry[]>) {
    const next = typeof update === "function" ? update(latest.current) : update;
    if (next === latest.current) return;
    const error = desktopSizeError(next);
    if (error) return error;
    latest.current = next;
    setItems(next);
    setState({ status: "pending" });
  }

  useEffect(() => {
    if (saved.current === items) return;
    const timeout = window.setTimeout(() => void flush(), 400);
    return () => window.clearTimeout(timeout);
  }, [items, flush]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (saved.current !== latest.current) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  return { items, changeItems, flush, state };
}
