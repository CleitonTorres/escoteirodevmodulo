import type { ICellData, IWorkbookData, IWorksheetData } from "@univerjs/presets";

export type SheetWorkbook = Pick<IWorkbookData, "id" | "name" | "appVersion" | "locale" | "sheetOrder" | "sheets" | "styles">;

const dimensionLimit = { rowCount: 1_000, columnCount: 100 };
const maxCells = 12_000;
const maxBytes = 370_000;
const sheetKeys = [
  "name", "tabColor", "hidden", "freeze", "rowCount", "columnCount", "defaultColumnWidth",
  "defaultRowHeight", "mergeData", "rowData", "columnData", "defaultStyle", "rowHeader",
  "columnHeader", "showGridlines", "gridlinesColor", "rightToLeft",
] as const;
const styleId = /^[\w-]{1,80}$/;
const worksheetName = /^[^\x00-\x1f]{1,120}$/;
const locale = "ptBR" as IWorkbookData["locale"];

function record(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}

function safeKey(key: string) {
  return styleId.test(key) && !["constructor", "__proto__", "prototype"].includes(key);
}

function safeData(value: unknown, depth = 0, budget = { remaining: 90_000 }): boolean {
  if (--budget.remaining < 0 || depth > 14) return false;
  if (value === null || typeof value === "boolean") return true;
  if (typeof value === "string") return value.length <= 10_000;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.length <= maxCells && value.every((child) => safeData(child, depth + 1, budget));
  return record(value) && Object.entries(value).every(([key, child]) =>
    safeKey(key) && (child === undefined || safeData(child, depth + 1, budget)));
}

function indexWithin(index: string, size: number) {
  return /^(0|[1-9]\d{0,4})$/.test(index) && Number(index) < size;
}

function validDimension(value: unknown, maximum: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0 && value <= maximum;
}

function validIndex(value: unknown, size: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < size;
}

function validSheetMetadata(sheet: Record<string, unknown>, rows: number, columns: number) {
  for (const [key, size] of [["rowData", rows], ["columnData", columns]] as const) {
    const data = sheet[key];
    if (data !== undefined && (!record(data) || Object.entries(data).some(([index, value]) =>
      !indexWithin(index, size) || (value !== null && !record(value))))) return false;
  }
  const merges = sheet.mergeData;
  if (merges !== undefined && (!Array.isArray(merges) || merges.length > 1_000 || merges.some((range) =>
    !record(range) || !validIndex(range.startRow, rows) || !validIndex(range.endRow, rows) ||
    !validIndex(range.startColumn, columns) || !validIndex(range.endColumn, columns) ||
    range.startRow > range.endRow || range.startColumn > range.endColumn))) return false;
  return true;
}

function readCell(value: unknown) {
  if (!record(value)) return null;
  const cell: Record<string, unknown> = {};
  for (const key of ["v", "t", "f", "si", "s"] as const) {
    if (value[key] !== undefined && value[key] !== null) cell[key] = value[key];
  }
  if (cell.v !== undefined && typeof cell.v !== "string" && typeof cell.v !== "boolean" &&
    !(typeof cell.v === "number" && Number.isFinite(cell.v))) return null;
  if (typeof cell.v === "string" && cell.v.length > 10_000) return null;
  if (cell.t !== undefined && ![1, 2, 3, 4].includes(cell.t as number)) return null;
  if (cell.s !== undefined && (typeof cell.s === "string" ? !safeKey(cell.s) : !record(cell.s))) return null;
  if (cell.si !== undefined && (typeof cell.si !== "string" || !safeKey(cell.si))) return null;
  if (cell.f !== undefined && (typeof cell.f !== "string" || cell.f.length > 2_000 || !cell.f.startsWith("="))) return null;
  if (record(value.p) && record(value.p.body) && typeof value.p.body.dataStream === "string" && cell.f === undefined) {
    const text = value.p.body.dataStream.replace(/\r\n$/, "");
    if (text.length > 10_000) return null;
    cell.v = text;
    cell.t = 1;
  }
  return cell;
}

export function readSheetWorkbook(value: unknown): SheetWorkbook | null {
  if (!record(value)) return null;
  const { id, name, appVersion, sheetOrder, sheets, styles } = value;
  if (typeof id !== "string" || !safeKey(id) || typeof name !== "string" || !worksheetName.test(name) ||
    typeof appVersion !== "string" || appVersion.length > 30 || !Array.isArray(sheetOrder) || !sheetOrder.length ||
    sheetOrder.length > 12 || new Set(sheetOrder).size !== sheetOrder.length || !record(sheets) || !record(styles)) return null;

  let cellCount = 0;
  const selectedSheets: Record<string, unknown> = {};
  for (const sheetId of sheetOrder) {
    if (typeof sheetId !== "string" || !safeKey(sheetId) || !Object.hasOwn(sheets, sheetId)) return null;
    const sheet = sheets[sheetId];
    if (!record(sheet) || typeof sheet.name !== "string" || !worksheetName.test(sheet.name) ||
      !validDimension(sheet.rowCount, dimensionLimit.rowCount) || !validDimension(sheet.columnCount, dimensionLimit.columnCount) ||
      !validSheetMetadata(sheet, sheet.rowCount, sheet.columnCount)) return null;

    const cellData: Record<string, Record<string, unknown>> = {};
    if (sheet.cellData !== undefined && !record(sheet.cellData)) return null;
    for (const [row, line] of Object.entries(sheet.cellData ?? {})) {
      if (!indexWithin(row, sheet.rowCount) || !record(line)) return null;
      for (const [column, entry] of Object.entries(line)) {
        if (++cellCount > maxCells || !indexWithin(column, sheet.columnCount)) return null;
        const cell = readCell(entry);
        if (!cell) return null;
        if (Object.keys(cell).length) (cellData[row] ??= {})[column] = cell;
      }
    }

    const result: Record<string, unknown> = { id: sheetId, cellData };
    for (const key of sheetKeys) {
      if (sheet[key] !== undefined) result[key] = sheet[key];
    }
    // Workbook resources, custom data and rich document objects never cross the save boundary.
    selectedSheets[sheetId] = result;
  }
  const workbook = { id, name, appVersion, locale, sheetOrder, sheets: selectedSheets, styles };
  if (!safeData(workbook)) return null;
  const serialized = JSON.stringify(workbook);
  if (new TextEncoder().encode(serialized).length > maxBytes) return null;
  return JSON.parse(serialized) as SheetWorkbook;
}

export function sheetFromRows(id: string, name: string, rows: string[][]): SheetWorkbook {
  const sheetId = "folha-1";
  const cellData: NonNullable<IWorksheetData["cellData"]> = {};
  rows.forEach((row, rowIndex) => row.forEach((text, columnIndex) => {
    if (!text) return;
    const value = /^-?(?:0|[1-9]\d*)(\.\d+)?$/.test(text) && text.length <= 15 ? Number(text) : text;
    (cellData[rowIndex] ??= {})[columnIndex] = { v: value, t: typeof value === "number" ? 2 : 1 };
  }));
  return {
    id, name, appVersion: "1.6.2", locale, styles: {}, sheetOrder: [sheetId],
    sheets: {
      [sheetId]: {
        id: sheetId, name: "Planilha1", rowCount: 200, columnCount: 26,
        defaultColumnWidth: 100, defaultRowHeight: 24, cellData,
      },
    },
  };
}

export function sheetPlainText(workbook: SheetWorkbook) {
  const cells: Record<number, Record<number, ICellData>> = workbook.sheets[workbook.sheetOrder[0]]?.cellData ?? {};
  const rows: string[] = [];
  for (const [row, cellsInRow] of Object.entries(cells)) {
    const values: string[] = [];
    for (const [column, cell] of Object.entries(cellsInRow)) {
      const value = String(cell.f ?? cell.v ?? "");
      values[Number(column)] = /[",\n\r]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
    }
    rows[Number(row)] = values.join(",");
  }
  return rows.join("\n");
}

export function sheetTextRows(text: string, delimiter: string, limits: { rows: number; columns: number; characters: number }) {
  const result: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  function endCell() {
    if (row.length < limits.columns) row.push(value.slice(0, limits.characters));
    value = "";
  }
  for (let index = 0; index < text.length && result.length < limits.rows; index++) {
    const character = text[index];
    if (character === '"' && quoted && text[index + 1] === '"') { value += '"'; index++; }
    else if (character === '"' && (quoted || !value)) quoted = !quoted;
    else if (!quoted && character === delimiter) endCell();
    else if (!quoted && (character === "\n" || character === "\r")) {
      if (character === "\r" && text[index + 1] === "\n") index++;
      endCell();
      result.push(row);
      row = [];
    } else value += character;
  }
  if (result.length < limits.rows && (row.length || value)) { endCell(); result.push(row); }
  return result;
}
