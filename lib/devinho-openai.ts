import "server-only";
import type { DevinhoContext, DevinhoMode } from "@/data/devinho";
import { getDb, isDuplicateKey } from "@/lib/mongodb";
import { devinhoModel, recordDevinhoUsage } from "@/lib/devinho-usage";

const defaultMonthlyRequests = 400;
const hintsPerLesson = 3;
let expiryIndex: Promise<string> | undefined;

async function reserve(id: string, limit: number, expiresAt: Date) {
  const counters = (await getDb()).collection<{
    _id: string;
    count: number;
    expiresAt: Date;
  }>("devinho_uso");
  expiryIndex ??= counters
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    .catch((error) => {
      expiryIndex = undefined;
      throw error;
    });
  await expiryIndex;
  const available = { _id: id, count: { $lt: limit } };
  const increment = { $inc: { count: 1 }, $setOnInsert: { expiresAt } };
  try {
    const result = await counters.updateOne(available, increment, {
      upsert: true,
    });
    return result.matchedCount > 0 || result.upsertedCount > 0;
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
    return (await counters.updateOne(available, increment)).matchedCount > 0;
  }
}

export async function reserveDevinhoRequest(
  accountId: string,
  lessonId: number,
) {
  const now = new Date();
  const period = now.toISOString().slice(0, 7);
  const expiresAt = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );
  const configured = Number(
    process.env.DEVINHO_MONTHLY_REQUESTS ?? defaultMonthlyRequests,
  );
  const monthlyLimit =
    Number.isSafeInteger(configured) && configured > 0
      ? configured
      : defaultMonthlyRequests;
  return (
    (await reserve(
      `aula:${period}:${accountId}:${lessonId}`,
      hintsPerLesson,
      expiresAt,
    )) && (await reserve(`total:${period}`, monthlyLimit, expiresAt))
  );
}

type ResponseOutput = {
  status?: string;
  usage?: unknown;
  output?: { type?: string; content?: { type?: string; text?: string }[] }[];
};

export async function selectDevinhoHint(
  key: string,
  goal: string,
  hints: { text: string; when: DevinhoContext; mode: DevinhoMode }[],
  mode: DevinhoMode,
  context: DevinhoContext,
) {
  const indices = hints.map((_, index) => index);
  const requestedAt = new Date();
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(6000),
    body: JSON.stringify({
      model: devinhoModel,
      reasoning: { effort: "low" },
      store: false,
      max_output_tokens: 700,
      instructions:
        "Você seleciona uma dica editorial de informática básica. Escolha pelo contexto e pelo tipo de ajuda. Retorne somente o índice de uma das opções. Prefira uma pista curta e aplicável ao estado atual.",
      input: JSON.stringify({
        objetivo: goal,
        modo: mode,
        estado: context,
        opcoes: hints.map((item, index) => ({ index, ...item })),
      }),
      text: {
        format: {
          type: "json_schema",
          name: "devinho_dica",
          strict: true,
          schema: {
            type: "object",
            properties: { index: { type: "integer", enum: indices } },
            required: ["index"],
            additionalProperties: false,
          },
        },
      },
    }),
  });
  if (!response.ok) return;
  const result = (await response.json()) as ResponseOutput;
  await recordDevinhoUsage(result.usage, requestedAt).catch(() => {
    console.error("Falha ao registrar o consumo do Devinho.");
  });
  if (result.status !== "completed" || !Array.isArray(result.output)) return;
  const text = result.output
    .find((item) => item.type === "message")
    ?.content?.find((item) => item.type === "output_text")?.text;
  if (!text) return;
  const selection = JSON.parse(text) as { index?: number };
  if (typeof selection.index === "number" && Number.isInteger(selection.index))
    return hints[selection.index]?.text;
}
