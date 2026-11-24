import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const parameters = { N: 2 ** 15, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
const hashLength = 64;
const hashVersion = "scrypt-v1";
const fallbackHash = `${hashVersion}$${"0".repeat(32)}$${"0".repeat(hashLength * 2)}`;

function deriveKey(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, hashLength, parameters, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt);
  return `${hashVersion}$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash?: string) {
  const [version, salt, key, extra] = (storedHash ?? fallbackHash).split("$");
  if (version !== hashVersion || !/^[0-9a-f]{32}$/.test(salt) ||
      !/^[0-9a-f]{128}$/.test(key) || extra !== undefined) return false;

  const derived = await deriveKey(password, Buffer.from(salt, "hex"));
  return timingSafeEqual(derived, Buffer.from(key, "hex")) && storedHash !== undefined;
}
