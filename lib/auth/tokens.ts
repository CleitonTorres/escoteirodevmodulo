import "server-only";
import { createHash, randomBytes } from "node:crypto";

export function randomToken() {
  return randomBytes(32).toString("hex");
}

export function isToken(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{64}$/.test(value);
}

export function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
