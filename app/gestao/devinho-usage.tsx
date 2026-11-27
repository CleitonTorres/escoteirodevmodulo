import {
  billingMonth,
  loadDollarQuote,
  loadOpenAICosts,
} from "@/lib/devinho-billing";
import { devinhoMonth, loadDevinhoUsage, nanoUsd } from "@/lib/devinho-usage";

function money(value: number | undefined, currency: "BRL" | "USD") {
  if (value === undefined) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    maximumFractionDigits: value && Math.abs(value) < 0.01 ? 6 : 2,
  }).format(value);
}

const integer = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const exchange = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});
const shortDate = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeZone: "UTC",
});

export default async function DevinhoUsage({
  month: rawMonth,
}: {
  month?: string;
}) {
  const now = new Date();
  const month = billingMonth(rawMonth, now);
  const [local, official, quote] = await Promise.all([
    loadDevinhoUsage(month).catch(() => null),
    loadOpenAICosts(month, now),
    loadDollarQuote(now),
  ]);
  const recorded = local?.selected;
  const usd =
    official.status === "available"
      ? official.usd
      : recorded
        ? recorded.costNanoUsd / nanoUsd
        : undefined;
  const accumulated = local?.accumulated
    ? local.accumulated.costNanoUsd / nanoUsd
    : undefined;
  const brl = (value: number | undefined) =>
    value === 0
      ? 0
      : value !== undefined && quote
        ? value * quote.rate
        : undefined;

  return (
    <section
      className="management-card devinho-usage"
      aria-labelledby="devinho-month-title"
    >
      <form action="/gestao" method="get" className="devinho-month-filter">
        <input type="hidden" name="secao" value="devinho" />
        <label>
          Mês de referência
          <input
            type="month"
            name="mes"
            defaultValue={month}
            max={devinhoMonth(now)}
            required
          />
        </label>
        <button type="submit" className="secondary-btn">
          Consultar
        </button>
      </form>

      <h2 id="devinho-month-title">
        {official.status === "available"
          ? "Custo do projeto na OpenAI"
          : "Custo estimado pelo Aprender"}
      </h2>
      <dl className="devinho-usage-totals">
        <div>
          <dt>Dólar americano</dt>
          <dd>{money(usd, "USD")}</dd>
        </div>
        <div>
          <dt>Reais</dt>
          <dd>{money(brl(usd), "BRL")}</dd>
        </div>
      </dl>
      {official.status === "not-configured" && (
        <p>
          Para consultar o faturamento do projeto, configure{" "}
          <code>OPENAI_ADMIN_KEY</code> e <code>OPENAI_PROJECT_ID</code> no
          servidor.
        </p>
      )}
      {official.status === "unavailable" && (
        <p>O faturamento da OpenAI está indisponível no momento.</p>
      )}
      {official.status !== "available" && !recorded && local && (
        <p>O Aprender ainda não registrou respostas com consumo neste mês.</p>
      )}
      {quote?.source === "PTAX" && (
        <p className="devinho-usage-note">
          Conversão pela PTAX de venda de{" "}
          {shortDate.format(new Date(quote.date + "T00:00:00Z"))}. US$ 1
          equivale a R$ {exchange.format(quote.rate)}.
        </p>
      )}
      {quote?.source === "manual" && (
        <p className="devinho-usage-note">
          Cotação configurada no servidor. US$ 1 equivale a R${" "}
          {exchange.format(quote.rate)}.
        </p>
      )}
      {!quote && (
        <p className="devinho-usage-note">
          Cotação indisponível. A conversão volta quando a PTAX estiver
          disponível ou após configurar <code>DEVINHO_USD_BRL</code>.
        </p>
      )}

      <h2>Uso registrado pelo Devinho</h2>
      {local ? (
        <>
          <dl className="devinho-usage-totals">
            <div>
              <dt>Respostas no mês</dt>
              <dd>{integer.format(recorded?.requests ?? 0)}</dd>
            </div>
            <div>
              <dt>Tokens de entrada</dt>
              <dd>{integer.format(recorded?.inputTokens ?? 0)}</dd>
            </div>
            <div>
              <dt>Tokens de saída</dt>
              <dd>{integer.format(recorded?.outputTokens ?? 0)}</dd>
            </div>
          </dl>
          {accumulated !== undefined && (
            <p>
              Desde o início do registro pelo Aprender, o consumo estimado é de{" "}
              <strong>{money(accumulated, "USD")}</strong>
              {brl(accumulated) !== undefined && (
                <>
                  {" "}
                  · <strong>{money(brl(accumulated), "BRL")}</strong>
                </>
              )}
            </p>
          )}
        </>
      ) : (
        <p role="status">
          Os registros de consumo do Aprender estão indisponíveis no momento.
        </p>
      )}
      <p className="devinho-usage-note">
        Os períodos mensais seguem UTC. A conversão em reais é uma referência
        cambial.
      </p>
    </section>
  );
}
