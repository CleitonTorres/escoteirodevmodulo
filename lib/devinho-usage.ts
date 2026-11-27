import "server-only";
import { getDb, isDuplicateKey } from "@/lib/mongodb";

export const devinhoModel = "gpt-6.2-sol";
export const nanoUsd = 1_000_000_000;

type Usage = {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  costNanoUsd: number;
};

type MonthlyUsage = Usage & { _id: string };

function tokenCount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function readUsage(value: unknown): Usage | undefined {
  if (!value || typeof value !== "object") return;
  const usage = value as { input_tokens?: unknown; output_tokens?: unknown; input_tokens_details?: {
    cached_tokens?: unknown; cache_write_tokens?: unknown;
  } };
  const inputTokens = usage.input_tokens;
  const outputTokens = usage.output_tokens;
  if (!tokenCount(inputTokens) || !tokenCount(outputTokens)) return;
  const cached = usage.input_tokens_details?.cached_tokens ?? 0;
  const written = usage.input_tokens_details?.cache_write_tokens ?? 0;
  if (!tokenCount(cached) || !tokenCount(written) || cached + written > inputTokens) return;

  // Standard, short-context GPT-6.2 Sol rates, expressed as nanodollars per token.
  const costNanoUsd = (inputTokens - cached - written) * 2000 + cached * 100 + written * 2500 + outputTokens * 10000;
  if (!Number.isSafeInteger(costNanoUsd)) return;
  return { requests: 1, inputTokens, outputTokens, costNanoUsd };
}

export function devinhoMonth(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

async function usageCollection() {
  return (await getDb()).collection<MonthlyUsage>("devinho_consumo");
}

export async function recordDevinhoUsage(responseUsage: unknown, requestedAt: Date) {
  const usage = readUsage(responseUsage);
  if (!usage) return;
  const collection = await usageCollection();
  const filter = { _id: devinhoMonth(requestedAt) };
  const update = { $inc: usage };
  try {
    await collection.updateOne(filter, update, { upsert: true });
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
    await collection.updateOne(filter, update);
  }
}

export async function loadDevinhoUsage(month: string) {
  const collection = await usageCollection();
  const [selected, accumulated] = await Promise.all([
    collection.findOne({ _id: month }),
    collection.aggregate<Usage>([{ $group: {
      _id: null,
      requests: { $sum: "$requests" },
      inputTokens: { $sum: "$inputTokens" },
      outputTokens: { $sum: "$outputTokens" },
      costNanoUsd: { $sum: "$costNanoUsd" },
    } }]).next(),
  ]);
  return { selected, accumulated };
}
