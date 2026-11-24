import "server-only";
import { isIP } from "node:net";
import { headers } from "next/headers";
import { isDuplicateKey } from "@/lib/mongodb";
import { authStore } from "./store";
import { digest } from "./tokens";

export async function allowAttempt(scope: string, subject: string, limit: number, minutes: number) {
  const { attempts } = await authStore();
  const window = minutes * 60_000;
  const start = Math.floor(Date.now() / window) * window;
  const _id = `${scope}:${start}:${digest(subject)}`;
  const update = { $inc: { attempts: 1 }, $setOnInsert: { expiresAt: new Date(start + window) } };

  const attempt = await attempts.findOneAndUpdate({ _id }, update, { upsert: true, returnDocument: "after" })
    .catch((error) => {
      if (!isDuplicateKey(error)) throw error;
      return attempts.findOneAndUpdate({ _id }, update, { returnDocument: "after" });
    });
  return attempt !== null && attempt.attempts <= limit;
}

export async function allowClientAttempt(scope: string, limit: number, minutes: number) {
  const trustedHeader = process.env.AUTH_CLIENT_IP_HEADER || (process.env.VERCEL ? "x-vercel-forwarded-for" : "");
  const ip = trustedHeader ? (await headers()).get(trustedHeader)?.trim() : undefined;
  return ip && isIP(ip)
    ? allowAttempt(`${scope}-ip`, ip, limit, minutes)
    : allowAttempt(`${scope}-shared`, "unknown", limit * 10, minutes);
}
