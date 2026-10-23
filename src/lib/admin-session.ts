import "server-only";
import { createHash, createHmac, scryptSync, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "painel_sessao";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function sameBytes(a: Buffer, b: Buffer) {
  return a.length === b.length && timingSafeEqual(a, b);
}

// Hash both sides so the comparison is constant-time regardless of length.
export function passwordMatches(input: string, password: string) {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return sameBytes(digest(input), digest(password));
}

// The signing key is derived from the password with scrypt, so a leaked
// cookie cannot be used to brute-force the password offline cheaply.
// Changing ADMIN_PASSWORD changes the key and logs everyone out.
let cachedKey: { password: string; key: Buffer } | undefined;

function signingKey(password: string) {
  if (cachedKey?.password !== password) {
    const key = scryptSync(password, "sua-plaquinha-nfc:painel-sessao", 32, { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
    cachedKey = { password, key };
  }
  return cachedKey.key;
}

function sign(expiresAt: number, password: string) {
  return createHmac("sha256", signingKey(password)).update(`painel:${expiresAt}`).digest("base64url");
}

export function createSessionToken(password: string, now = Date.now()) {
  const expiresAt = now + SESSION_MAX_AGE_SECONDS * 1000;
  return `${expiresAt}.${sign(expiresAt, password)}`;
}

export function isValidSessionToken(token: string | undefined, password: string, now = Date.now()) {
  const [rawExpiresAt, signature, ...rest] = (token ?? "").split(".");
  const expiresAt = Number(rawExpiresAt);
  if (rest.length > 0 || !signature || !Number.isSafeInteger(expiresAt) || expiresAt <= now) return false;
  return sameBytes(Buffer.from(signature), Buffer.from(sign(expiresAt, password)));
}
