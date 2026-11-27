import "server-only";
import { devinhoMonth } from "./devinho-usage";

type Costs = { status: "available"; usd: number } | { status: "not-configured" | "unavailable" };
type CostsPage = { data?: { results?: { project_id?: string; amount?: { currency?: string; value?: number } }[] }[]; has_more?: boolean };
type Quote = { rate: number; source: "PTAX"; date: string } | { rate: number; source: "manual" };

export function billingMonth(input: unknown, now = new Date()) {
  const current = devinhoMonth(now);
  return typeof input === "string" && /^[2-9]\d{3}-(0[1-9]|1[0-2])$/.test(input) && input <= current ? input : current;
}

export async function loadOpenAICosts(month: string, now = new Date()): Promise<Costs> {
  const key = process.env.OPENAI_ADMIN_KEY?.trim();
  const project = process.env.OPENAI_PROJECT_ID?.trim();
  if (!key || !project) return { status: "not-configured" };

  const [year, calendarMonth] = month.split("-").map(Number);
  const start = Date.UTC(year, calendarMonth - 1, 1) / 1000;
  const end = Math.floor(Math.min(now.getTime(), Date.UTC(year, calendarMonth, 1)) / 1000);
  if (end <= start) return { status: "available", usd: 0 };
  const url = new URL("https://api.openai.com/v1/organization/costs");
  url.search = new URLSearchParams({
    start_time: String(start), end_time: String(end),
    "project_ids[]": project, "group_by[]": "project_id", limit: "32",
  }).toString();

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
      signal: AbortSignal.timeout(4500),
    });
    if (!response.ok) return { status: "unavailable" };
    const page = (await response.json()) as CostsPage;
    if (!Array.isArray(page.data) || page.has_more !== false) return { status: "unavailable" };
    let usd = 0;
    for (const bucket of page.data) {
      if (!Array.isArray(bucket.results)) return { status: "unavailable" };
      for (const result of bucket.results) {
        const value = result.amount?.value;
        if (result.project_id !== project || result.amount?.currency?.toLowerCase() !== "usd" ||
          typeof value !== "number" || !Number.isFinite(value)) return { status: "unavailable" };
        usd += value;
      }
    }
    return { status: "available", usd };
  } catch {
    return { status: "unavailable" };
  }
}

function ptaxDate(date: Date) {
  const [year, month, day] = date.toISOString().slice(0, 10).split("-");
  return `'${month}-${day}-${year}'`;
}

export async function loadDollarQuote(now = new Date()): Promise<Quote | undefined> {
  const manual = Number(process.env.DEVINHO_USD_BRL?.trim().replace(",", "."));
  if (Number.isFinite(manual) && manual > 0) return { rate: manual, source: "manual" };

  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - 10);
  const url = new URL("https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)");
  url.search = new URLSearchParams({
    "@dataInicial": ptaxDate(start), "@dataFinalCotacao": ptaxDate(now),
    $orderby: "dataHoraCotacao desc", $top: "1", $format: "json",
  }).toString();

  try {
    const response = await fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(3500) });
    if (!response.ok) return;
    const data = (await response.json()) as { value?: { cotacaoVenda?: number; dataHoraCotacao?: string }[] };
    const rate = data.value?.[0]?.cotacaoVenda;
    const date = data.value?.[0]?.dataHoraCotacao?.slice(0, 10);
    if (typeof rate === "number" && Number.isFinite(rate) && rate > 0 && date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { rate, source: "PTAX", date };
    }
  } catch {
    return;
  }
}
