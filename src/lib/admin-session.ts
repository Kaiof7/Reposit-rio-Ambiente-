import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

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

// The password is the signing key: changing ADMIN_PASSWORD logs everyone out.
function sign(expiresAt: number, password: string) {
  return createHmac("sha256", password).update(`painel:${expiresAt}`).digest("base64url");
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
