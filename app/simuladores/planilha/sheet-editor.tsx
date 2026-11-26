"use client";

import { BaseFunction, ErrorType, ErrorValueObject, UniverSheetsCorePreset } from "@univerjs/preset-sheets-core";
import sheetsPtBR from "@univerjs/preset-sheets-core/locales/pt-BR";
import { CommandType, createUniver, LocaleType, mergeLocales } from "@univerjs/presets";
import { Save, Table2 } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { readSheetWorkbook, type SheetWorkbook } from "@/lib/sheet-workbook";
import "@univerjs/preset-sheets-core/lib/index.css";
import "./sheet-editor.css";

type SheetEditorProps = {
  name: string;
  initial: SheetWorkbook;
  onChange: (workbook: SheetWorkbook) => string | undefined;
  onSave?: () => Promise<boolean>;
  onReset?: () => void;
  busy?: boolean;
  finishEditing: RefObject<(() => Promise<boolean>) | null>;
};

class OfflineFormula extends BaseFunction {
  minParams = 0;
  maxParams = 255;
  calculate() { return ErrorValueObject.create(ErrorType.NAME); }
}

export default function SheetEditor(props: SheetEditorProps) {
  const { name, onSave, onReset, busy, finishEditing } = props;
  const host = useRef<HTMLDivElement>(null);
  const first = useRef(props.initial);
  const latest = useRef(props);
  latest.current = props;
  const saveCurrent = useRef<() => Promise<void>>(undefined);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!host.current) return;
    const container = document.createElement("div");
    container.className = "training-sheet-mount";
    host.current.append(container);
    let dispose: (() => void) | undefined;
    let active = true;

    try {
      const { univer, univerAPI } = createUniver({
        locale: LocaleType.PT_BR,
        locales: { [LocaleType.PT_BR]: mergeLocales(sheetsPtBR) },
        presets: [UniverSheetsCorePreset({
          container, header: true, toolbar: true, formulaBar: true,
          formula: { function: [[OfflineFormula, "IMAGE"], [OfflineFormula, "HYPERLINK"], [OfflineFormula, "WEBSERVICE"]] },
        })],
      });
      dispose = () => univer.dispose();
      const workbook = univerAPI.createWorkbook(structuredClone(first.current));
      let previous = JSON.stringify(readSheetWorkbook(workbook.save()));
      const publish = () => {
        try {
          const next = readSheetWorkbook(workbook.save());
          if (!next) {
            setError("A planilha excedeu o limite de salvamento. Desfaça a última alteração ou reduza o conteúdo.");
            return false;
          }
          const serialized = JSON.stringify(next);
          if (serialized === previous) { setError(""); return true; }
          const issue = latest.current.onChange(next);
          setError(issue ?? "");
          if (issue) return false;
          previous = serialized;
          return true;
        } catch {
          setError("Não foi possível preparar a planilha para salvar.");
          return false;
        }
      };
      let queued = false;
      const subscription = univerAPI.addEvent(univerAPI.Event.CommandExecuted, (command) => {
        if (command.type !== CommandType.MUTATION || queued) return;
        queued = true;
        queueMicrotask(() => {
          queued = false;
          if (active) publish();
        });
      });
      dispose = () => {
        subscription.dispose();
        univer.dispose();
      };
      const finish = async () => {
        try {
          if (workbook.isCellEditing()) await workbook.endEditingAsync(true);
          return active && publish();
        } catch {
          if (active) setError("Não foi possível concluir a edição da célula.");
          return false;
        }
      };
      finishEditing.current = finish;
      saveCurrent.current = async () => {
        setSaving(true);
        try {
          if (await finish()) await latest.current.onSave?.();
        } finally {
          if (active) setSaving(false);
        }
      };
      setReady(true);
    } catch {
      setError("Não foi possível abrir a planilha. Volte ao desktop e abra o arquivo novamente.");
    }

    return () => {
      active = false;
      finishEditing.current = null;
      saveCurrent.current = undefined;
      container.remove();
      queueMicrotask(() => dispose?.());
    };
  }, [finishEditing]);

  return (
    <section className="training-sheet" aria-label="Simulador de planilha">
      <header className="training-sheet-heading">
        <strong><Table2 size={22} aria-hidden="true" /> {name}</strong>
        {onSave && <button type="button" className="secondary-btn" disabled={!ready || saving || busy} onClick={() => void saveCurrent.current?.()}>
          <Save size={18} aria-hidden="true" /> {saving || busy ? "Salvando…" : "Salvar planilha"}
        </button>}
        {onReset && <button type="button" className="secondary-btn" onClick={onReset}>Restaurar exemplo</button>}
      </header>
      {error && <p className="training-sheet-error" role="alert">{error}</p>}
      {!ready && !error && <p className="training-sheet-message" role="status">Carregando a planilha…</p>}
      <div className="training-sheet-host" ref={host} aria-label="Área de edição de células" />
    </section>
  );
}
