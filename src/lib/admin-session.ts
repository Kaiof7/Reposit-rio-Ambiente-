import "server-only";
import { createHash, createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import type { AdminCredentials } from "./env";

export const SESSION_COOKIE = "painel_sessao";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function sameBytes(a: Buffer, b: Buffer) {
  return a.length === b.length && timingSafeEqual(a, b);
}

const digest = (value: string) => createHash("sha256").update(value).digest();

// Hashes both sides so each comparison is constant-time regardless of length,
// and always checks both fields so timing does not reveal which one failed.
export function credentialsMatch(input: AdminCredentials, admin: AdminCredentials) {
  const emailOk = sameBytes(digest(input.email.trim().toLowerCase()), digest(admin.email));
  const passwordOk = sameBytes(digest(input.password), digest(admin.password));
  return emailOk && passwordOk;
}

// The signing key is derived from the password with scrypt, so a leaked
// cookie cannot be used to brute-force the password offline cheaply.
// Changing ADMIN_PASSWORD or ADMIN_EMAIL logs everyone out.
let cachedKey: { password: string; key: Buffer } | undefined;

function signingKey(password: string) {
  if (cachedKey?.password !== password) {
    const key = scryptSync(password, "sua-plaquinha-nfc:painel-sessao", 32, { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
    cachedKey = { password, key };
  }
  return cachedKey.key;
}

function sign(expiresAt: number, admin: AdminCredentials) {
  return createHmac("sha256", signingKey(admin.password)).update(`painel:${admin.email}:${expiresAt}`).digest("base64url");
}

export function createSessionToken(admin: AdminCredentials, now = Date.now()) {
  const expiresAt = now + SESSION_MAX_AGE_SECONDS * 1000;
  return `${expiresAt}.${sign(expiresAt, admin)}`;
}

export function isValidSessionToken(token: string | undefined, admin: AdminCredentials, now = Date.now()) {
  const [rawExpiresAt, signature, ...rest] = (token ?? "").split(".");
  const expiresAt = Number(rawExpiresAt);
  if (rest.length > 0 || !signature || !Number.isSafeInteger(expiresAt) || expiresAt <= now) return false;
  return sameBytes(Buffer.from(signature), Buffer.from(sign(expiresAt, admin)));
}
