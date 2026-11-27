import "server-only";
import { createTransport } from "nodemailer";

export const confirmationHours = 24;
export const accountLinkMinutes = 30;

export function authMailConfig() {
  const { APP_URL, SMTP_HOST, SMTP_PORT = "587", SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!APP_URL || !SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) return null;
  let url: URL;
  try {
    url = new URL(APP_URL);
  } catch {
    return null;
  }
  if (!(url.protocol === "https:" ||
      (process.env.NODE_ENV !== "production" && url.protocol === "http:" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)))) return null;

  if (SMTP_HOST.trim().toLowerCase() === "smtp.resend.com" && SMTP_USER.trim() === "resend") {
    return { url, from: SMTP_FROM, provider: "resend" as const, apiKey: SMTP_PASS.trim() };
  }

  const port = Number(SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) return null;
  return { url, from: SMTP_FROM, provider: "smtp" as const, transport: {
    host: SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 7500,
    dnsTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10_000,
  } };
}

export function logMailError(message: string, error: unknown) {
  const mailError = error instanceof Error
    ? error as Error & { code?: unknown; responseCode?: unknown; providerCode?: unknown }
    : undefined;
  const { code, responseCode, providerCode } = mailError ?? {};
  console.error(message, {
    code: safeCode(code),
    responseCode: typeof responseCode === "number" && Number.isInteger(responseCode) ? responseCode : undefined,
    providerCode: safeCode(providerCode),
  });
}

function safeCode(value: unknown) {
  return typeof value === "string" && /^[a-z0-9_]{1,48}$/i.test(value) ? value : undefined;
}

type MailConfig = NonNullable<ReturnType<typeof authMailConfig>>;
type LinkEmail = { path: string; subject: string; intro: string; closing: string };

async function sendLinkMail(config: MailConfig, email: string, token: string, template: LinkEmail) {
  const link = new URL(template.path, config.url);
  link.hash = token;

  return sendAuthMail(config, email, template.subject, `${template.intro}\n\n${link.href}\n\n${template.closing}`);
}

async function sendAuthMail(config: MailConfig, email: string, subject: string, text: string) {
  const message = {
    from: config.from,
    to: [email],
    subject,
    text,
  };
  if (config.provider === "smtp") {
    await createTransport(config.transport).sendMail(message);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(message),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  }).catch((error: unknown) => {
    const code = error instanceof Error && error.name === "TimeoutError" ? "RESEND_TIMEOUT" : "RESEND_NETWORK";
    throw Object.assign(new Error("Falha na conexão HTTPS com o Resend."), { code });
  });
  const result: { id?: unknown; name?: unknown } | null = await response.json().catch(() => null);
  if (!response.ok) {
    throw Object.assign(new Error("O Resend recusou o envio."), {
      code: "RESEND_HTTP", responseCode: response.status, providerCode: safeCode(result?.name),
    });
  }
  if (typeof result?.id !== "string" || !result.id) {
    throw Object.assign(new Error("O Resend não retornou o identificador do e-mail."), {
      code: "RESEND_RESPONSE", responseCode: response.status,
    });
  }
}

export function sendResetMail(config: MailConfig, email: string, token: string) {
  return sendLinkMail(config, email, token, {
    path: "/redefinir-senha",
    subject: "Redefina sua senha da Trilha Digital",
    intro: "Use este link para definir uma nova senha na Trilha Digital. O link vale por 30 minutos.",
    closing: "Se você não pediu a redefinição, ignore esta mensagem.",
  });
}

export function sendConfirmationMail(config: MailConfig, email: string, token: string) {
  return sendLinkMail(config, email, token, {
    path: "/confirmar-email",
    subject: "Confirme seu cadastro na Trilha Digital",
    intro: `Se você criou uma conta na Trilha Digital, clique no link para ativá-la. O link vale por ${confirmationHours} horas.`,
    closing: "Se você não criou essa conta, ignore esta mensagem.",
  });
}

export function sendEmailChangeMail(config: MailConfig, email: string, token: string) {
  return sendLinkMail(config, email, token, {
    path: "/confirmar-novo-email",
    subject: "Confirme seu novo e-mail na Trilha Digital",
    intro: `Abra o link para confirmar o novo e-mail da sua conta. Ele vale por ${accountLinkMinutes} minutos.`,
    closing: "Se você não solicitou a mudança, ignore esta mensagem.",
  });
}

export function sendEmailChangeNotice(config: MailConfig, email: string) {
  return sendAuthMail(config, email, "Solicitação de troca de e-mail na Trilha Digital",
    "Recebemos um pedido para alterar o e-mail da sua conta. Seu endereço atual continua valendo até que o novo seja confirmado. Se você não fez o pedido, redefina sua senha para cancelar a solicitação.");
}

export function sendAccountDeletionMail(config: MailConfig, email: string, token: string) {
  return sendLinkMail(config, email, token, {
    path: "/confirmar-exclusao",
    subject: "Confirme a exclusão da sua conta na Trilha Digital",
    intro: `Abra o link para revisar e confirmar a exclusão da sua conta e do seu progresso. Ele vale por ${accountLinkMinutes} minutos.`,
    closing: "Se você não pediu a exclusão, ignore esta mensagem.",
  });
}
