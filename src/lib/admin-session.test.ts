import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { createSessionToken, isValidSessionToken, passwordMatches, SESSION_MAX_AGE_SECONDS } from "./admin-session";

vi.mock("server-only", () => ({}));

const password = "senha-de-teste-123";
const now = 1_800_000_000_000;

describe("admin session", () => {
  it("accepts only the exact password", () => {
    expect(passwordMatches(password, password)).toBe(true);
    expect(passwordMatches("senha-de-teste-12", password)).toBe(false);
    expect(passwordMatches("", password)).toBe(false);
  });

  it("validates its own token until it expires", () => {
    const token = createSessionToken(password, now);
    expect(isValidSessionToken(token, password, now + 1000)).toBe(true);
    expect(isValidSessionToken(token, password, now + SESSION_MAX_AGE_SECONDS * 1000)).toBe(false);
  });

  it("does not sign with the raw password, so a leaked cookie is costly to crack", () => {
    const [expiresAt, signature] = createSessionToken(password, now).split(".");
    const rawKeySignature = createHmac("sha256", password).update(`painel:${expiresAt}`).digest("base64url");
    expect(signature).not.toBe(rawKeySignature);
  });

  it("rejects tokens signed with another password or tampered", () => {
    const token = createSessionToken(password, now);
    expect(isValidSessionToken(token, "outra-senha-qualquer", now)).toBe(false);
    const [expiresAt, signature] = token.split(".");
    expect(isValidSessionToken(`${Number(expiresAt) + 1}.${signature}`, password, now)).toBe(false);
    for (const bad of [undefined, "", "abc", `${expiresAt}.`, `${token}.extra`]) {
      expect(isValidSessionToken(bad, password, now)).toBe(false);
    }
  });
});
