import "server-only";
import { createTransport } from "nodemailer";

export function resetMailConfig() {
  const { APP_URL, SMTP_HOST, SMTP_PORT = "587", SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!APP_URL || !SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) return null;
  const port = Number(SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) return null;
  let url: URL;
  try {
    url = new URL(APP_URL);
  } catch {
    return null;
  }
  if (!(url.protocol === "https:" ||
      (process.env.NODE_ENV !== "production" && url.protocol === "http:" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)))) return null;

  return { url, from: SMTP_FROM, transport: {
    host: SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 7500,
    socketTimeout: 10_000,
  } };
}

export async function sendResetMail(config: NonNullable<ReturnType<typeof resetMailConfig>>, email: string, token: string) {
  const link = new URL("/redefinir-senha", config.url);
  link.hash = token;

  await createTransport(config.transport).sendMail({
    from: config.from,
    to: email,
    subject: "Redefina sua senha da Trilha Digital",
    text: `Use este link para definir uma nova senha na Trilha Digital. O link vale por 30 minutos.\n\n${link.href}\n\nSe você não pediu a redefinição, ignore esta mensagem.`,
  });
}
